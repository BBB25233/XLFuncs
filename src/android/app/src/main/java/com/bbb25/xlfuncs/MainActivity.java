package com.bbb25.xlfuncs;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 忽略 Android 系统「字体大小 / 显示大小」对 WebView 的自动文字缩放，
        // 保证网页按设计稿 1:1 渲染，避免被系统放大后布局挤乱。
        if (this.bridge != null) {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                webView.getSettings().setTextZoom(100);
            }
        }
    }
}
