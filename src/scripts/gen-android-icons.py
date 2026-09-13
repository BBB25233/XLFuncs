"""生成 Android 图标与启动屏（方案 A：fx 字标，Excel 绿 #217346）。

图标是二进制资源，本脚本是可 review、可复现的唯一事实源。
运行（venv）：python scripts/gen-android-icons.py

产物：
  1) assets/                 —— 母版（供 @capacitor/assets 之类工具复用的源图）
  2) android/.../res/**      —— 直接覆盖 Android 资源（按现有尺寸精确替换）
  3) res/values/ic_launcher_background.xml —— 自适应图标背景色改为 #217346
"""

import os
import re
from PIL import Image, ImageDraw, ImageFont

GREEN = (0x21, 0x73, 0x46, 255)
WHITE = (0xFF, 0xFF, 0xFF, 255)
WHITE_RGB = (0xFF, 0xFF, 0xFF)

# 斜体衬线字体（与设计稿 "fx" 一致）；找不到时按序兜底
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\georgiai.ttf",  # Georgia Italic
    r"C:\Windows\Fonts\timesi.ttf",    # Times New Roman Italic
    r"C:\Windows\Fonts\constani.ttf",  # Constantia Italic
]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # -> <npm 根>/src
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")
ASSETS = os.path.join(ROOT, "assets")

SS = 4  # 超采样倍数
GLYPH = "fx"


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise RuntimeError("找不到可用的斜体衬线字体（georgiai/timesi/constani）")


def draw_glyph(img: Image.Image, cap_ratio: float, fill) -> Image.Image:
    """在 img 正中央按 cap_ratio（相对短边）字号绘制斜体 fx（按墨迹精确居中）。"""
    w, h = img.size
    font = load_font(max(8, int(min(w, h) * cap_ratio)))
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    bbox = d.textbbox((0, 0), GLYPH, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pos = (w / 2 - (bbox[0] + tw / 2), h / 2 - (bbox[1] + th / 2))
    d.text(pos, GLYPH, font=font, fill=fill)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    img.alpha_composite(layer)
    return img


def full_icon(size: int, rounded: bool, cap_ratio: float) -> Image.Image:
    """绿底（圆角方 / 圆形）+ 白色 fx 的完整图标（供 API<26 的 ic_launcher[_round]）。"""
    s = size * SS
    base = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(base)
    if rounded:
        d.ellipse([0, 0, s - 1, s - 1], fill=GREEN)
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=GREEN)
    base = draw_glyph(base, cap_ratio, WHITE)
    return base.resize((size, size), Image.LANCZOS)


def foreground_icon(size: int, cap_ratio: float) -> Image.Image:
    """自适应图标前景：透明底 + 白色 fx（内容收在安全区内）。"""
    s = size * SS
    base = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    base = draw_glyph(base, cap_ratio, WHITE)
    return base.resize((size, size), Image.LANCZOS)


def splash_image(w: int, h: int, cap_ratio: float) -> Image.Image:
    """启动屏：白底 + 绿色 fx（与网页端浅色主题一致，避免绿色闪屏）。"""
    s = 2
    img = Image.new("RGB", (w * s, h * s), WHITE_RGB)
    img = draw_glyph(img, cap_ratio, GREEN).convert("RGB")
    return img.resize((w, h), Image.LANCZOS)


def save(img: Image.Image, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print(f"  {os.path.relpath(path, ROOT)}  {img.size}  {img.mode}")


def iter_res_pngs(dirpath: str):
    for dp, _dn, fn in os.walk(dirpath):
        for f in fn:
            if f.endswith(".png"):
                yield os.path.join(dp, f)


def main() -> None:
    print("== 1. 母版 assets/ ==")
    save(full_icon(1024, rounded=False, cap_ratio=0.50), os.path.join(ASSETS, "icon.png"))
    save(full_icon(1024, rounded=False, cap_ratio=0.50), os.path.join(ASSETS, "icon-only.png"))
    save(foreground_icon(1024, 0.40), os.path.join(ASSETS, "icon-foreground.png"))
    save(Image.new("RGBA", (1024, 1024), GREEN), os.path.join(ASSETS, "icon-background.png"))
    save(splash_image(2732, 2732, 0.16), os.path.join(ASSETS, "splash.png"))

    # 自适应图标预览（绿底 + 前景叠加），用于人工 review 安卓桌面观感
    fg = Image.open(os.path.join(ASSETS, "icon-foreground.png")).convert("RGBA")
    preview = Image.new("RGBA", fg.size, GREEN)
    preview.alpha_composite(fg)
    save(preview, os.path.join(ASSETS, "preview-adaptive.png"))

    print("== 2. 覆盖 Android res 图片（按原尺寸） ==")
    for path in sorted(iter_res_pngs(RES)):
        rel = os.path.relpath(path, RES).replace(os.sep, "/")
        with Image.open(path) as old:
            w, h = old.size
        name = os.path.basename(path)
        if name == "ic_launcher_foreground.png":
            save(foreground_icon(w, 0.40), path)
        elif name == "ic_launcher_round.png":
            save(full_icon(w, rounded=True, cap_ratio=0.50), path)
        elif name == "ic_launcher.png":
            save(full_icon(w, rounded=False, cap_ratio=0.50), path)
        elif name == "splash.png":
            save(splash_image(w, h, 0.20), path)
        else:
            print(f"  [跳过] {rel}")

    print("== 3. 自适应图标背景色 ==")
    bgxml = os.path.join(RES, "values", "ic_launcher_background.xml")
    if os.path.exists(bgxml):
        with open(bgxml, "r", encoding="utf-8") as fh:
            text = fh.read()
        new = re.sub(
            r'(name="ic_launcher_background">)#[0-9A-Fa-f]{6}(<)',
            r"\g<1>#217346\g<2>",
            text,
        )
        with open(bgxml, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(new)
        print(f"  {os.path.relpath(bgxml, ROOT)} -> #217346")

    print("== 完成 ==")


if __name__ == "__main__":
    main()
