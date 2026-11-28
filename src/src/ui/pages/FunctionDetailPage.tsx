import { useState } from 'react';
import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { FunctionEntry } from '@/types';
import { get } from '@/data';
import { SAMPLE_TABLES } from '@/data/sampleTables';
import type { TableLike, TableResolver } from '@/core/ref';
import { buildSingle, offlineFileName } from '@/core/exportHtml';
import { downloadText } from '@/storage/fileIo';
import { useFunctionEntry } from '@/ui/hooks/useFunctionEntry';
import { useEditDraft } from '@/ui/hooks/useEditDraft';
import { useCopy } from '@/ui/clipboard/useCopy';
import { showToast } from '@/ui/hooks/useToast';
import EmptyState from '@/ui/components/EmptyState';
import DataTable from '@/ui/components/DataTable';
import SectionTitle from '@/ui/components/SectionTitle';
import VersionNotice from '@/ui/components/VersionNotice';
import { CategoryBadge, DifficultyBadge, StatusBadge, VersionBadge } from '@/ui/components/Badge';
import SectionOneLiner from '@/ui/detail/SectionOneLiner';
import SectionSyntax from '@/ui/detail/SectionSyntax';
import SectionArgs from '@/ui/detail/SectionArgs';
import SectionExamples from '@/ui/detail/SectionExamples';
import SectionPitfalls from '@/ui/detail/SectionPitfalls';
import SectionRelated from '@/ui/detail/SectionRelated';
import Playground from '@/ui/detail/Playground';
import { EditNoticeBar } from '@/ui/detail/EditBar';
import EditBar from '@/ui/detail/EditBar';

/** 试算用的示例数据解析器：直接复用三张统一业务样表 */
const resolver: TableResolver = (id): TableLike | null => SAMPLE_TABLES[id];

/** 今天的日期，YYYY-MM-DD，用于离线导出文件里的「导出时间」 */
function today(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 函数详情页（核心页面，P0）。
 * 组合 6 大板块 + 在线试算 + 相关函数 + 附加板块 + 版本说明。
 * 顶部操作条：编辑 / 复制分享链接 / 导出离线网页。
 */
export default function FunctionDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const { entry, loading, error, reload } = useFunctionEntry(id);
  const [editing, setEditing] = useState<boolean>(false);
  const api = useEditDraft(entry);
  const { copy } = useCopy();

  // 编辑态下显示草稿，非编辑态显示加载出来的最终内容
  const display: FunctionEntry | null = editing ? api.draft ?? entry : entry;

  const [activeKey, setActiveKey] = useState<string>('');

  if (loading) {
    return (
      <div className="mx-auto max-w-content">
        <p className="py-12 text-sm text-ink-3">加载中…</p>
      </div>
    );
  }

  // 加载失败（如文件夹版内容包缺失）与「压根没有这个函数」要分开说，别都报成「没找到」
  if (error !== null) {
    return (
      <div className="mx-auto max-w-content">
        <div className="py-12">
          <p className="text-h4 text-ink">{error}</p>
          <p className="mt-2 text-sm text-ink-2">
            如果你用的是文件夹版，请确认解压的是完整文件夹：index.html 与 packs 目录在同一层。
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={reload}
              className="rounded-btn border border-line px-3 py-1.5 text-sm text-ink hover:bg-bg-sub"
            >
              重新加载
            </button>
            <Link to="/" className="text-sm text-accent hover:text-accent-hover">
              回到首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (entry === null || display === null) {
    return (
      <div className="mx-auto max-w-content">
        <EmptyState
          keyword={id ?? '这个函数'}
          description="没找到这个函数，回到首页重新搜索，或者直接看下面几个最常用的函数。"
          suggestions={['vlookup', 'sumifs', 'if', 'xlookup', 'text']
            .map((fid) => get(fid))
            .filter((e): e is NonNullable<typeof e> => e !== null)
            .slice(0, 3)
            .map((e) => ({
              id: e.id,
              title: e.zhName === null ? e.enName : `${e.zhName} ${e.enName}`,
              oneLiner: e.oneLiner,
            }))}
        />
        <div className="mt-4">
          <Link to="/" className="text-sm text-accent hover:text-accent-hover">
            回到首页
          </Link>
        </div>
      </div>
    );
  }

  const title =
    display.zhName === null ? display.enName : `${display.zhName} ${display.enName}`;

  /** 复制当前页面的分享链接（hash 路由，静态托管刷新也不 404，见 F26） */
  const shareLink = (): void => {
    const base = `${window.location.origin}${window.location.pathname}`;
    void copy(`${base}#/f/${display.id}`, '已复制分享链接，发给同事即可');
  };

  /** 导出为单文件离线网页（零 JS、零外链，微信发过去双击就能看，见 F24） */
  const exportOffline = (): void => {
    const html = buildSingle(display, resolver, today());
    downloadText(offlineFileName(display), html, 'text/html');
    showToast('已导出离线网页，可在微信里发给同事', 'success');
  };

  const exitEdit = (): void => {
    setEditing(false);
    reload();
  };

  /** 点击「编辑内容」先弹确认框，避免误入编辑态（退出编辑仍按原切换逻辑） */
  const onRequestEdit = (): void => {
    if (editing) {
      setEditing(false);
      return;
    }
    if (window.confirm('确认要进行编辑操作吗？\n编辑后的内容仅保存在本机浏览器。')) {
      setEditing(true);
    }
  };

  return (
    <div className="mx-auto max-w-content">
      <nav className="mb-4 text-xs text-ink-3">
        <Link to="/" className="hover:text-ink">
          首页
        </Link>
        <span className="mx-1">/</span>
        <span>{title}</span>
      </nav>

      {/* 页头：名称 + 徽章 + 操作条 */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-h2 text-ink">{display.zhName ?? ''}</h1>
          <span className="font-mono text-h3 text-ink-2">{display.enName}</span>
          <CategoryBadge id={display.category} />
          <DifficultyBadge level={display.difficulty} />
          <VersionBadge label={`最低 ${display.version.label}`} />
          {display.meta.status === 'draft' ? <StatusBadge status="draft" /> : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRequestEdit}
            className="inline-flex h-9 items-center rounded-btn border border-line px-4 text-sm text-ink-2 hover:text-ink"
          >
            {editing ? '退出编辑' : '编辑内容'}
          </button>
          <button
            type="button"
            onClick={shareLink}
            className="inline-flex h-9 items-center rounded-btn border border-line px-4 text-sm text-ink-2 hover:text-ink"
          >
            复制分享链接
          </button>
          <button
            type="button"
            onClick={exportOffline}
            className="inline-flex h-9 items-center rounded-btn border border-line px-4 text-sm text-ink-2 hover:text-ink"
          >
            导出离线网页
          </button>
        </div>
      </header>

      {editing ? <EditNoticeBar dirty={api.dirty} /> : null}

      <div className="flex flex-col gap-8 pb-24">
        <VersionNotice
          version={display.version}
          hiddenFunction={display.hiddenFunction}
          dynamicArray={display.dynamicArray}
        />

        <SectionOneLiner
          entry={display}
          editing={editing}
          onChange={api.setOneLiner}
          onSummaryChange={api.setSummary}
        />

        <SectionSyntax
          entry={display}
          editing={editing}
          activeKey={activeKey}
          onActiveKeyChange={setActiveKey}
          onPatternCnChange={api.setPatternCn}
          onPatternEnChange={api.setPatternEn}
        />

        <SectionArgs
          entry={display}
          editing={editing}
          activeKey={activeKey}
          onArgFieldChange={api.setArgField}
        />

        <SectionExamples
          entry={display}
          editing={editing}
          onExampleFieldChange={api.setExampleField}
        />

        <SectionPitfalls
          entry={display}
          editing={editing}
          onPitfallFieldChange={api.setPitfallField}
        />

        <SectionRelated
          entry={display}
          editing={editing}
          onRelatedFieldChange={api.setRelatedField}
        />

        {/* 附加板块（TEXT 的格式代码速查表等） */}
        {display.extraBlocks === undefined
          ? null
          : display.extraBlocks.map((block, index) => (
              <section key={`extra-${index}`}>
                <h2 className="mb-4 text-h3 text-ink">{block.title}</h2>
                <div className="mt-3">
                  <DataTable header={block.header} rows={block.rows} />
                </div>
                {block.note === undefined ? null : (
                  <p className="mt-2 text-xs text-ink-3">{block.note}</p>
                )}
              </section>
            ))}

        <Playground entry={display} />
      </div>

      {editing ? <EditBar draft={api.draft} api={api} onExit={exitEdit} /> : null}
    </div>
  );
}
