# 検索向けのページ情報

Aboutは「高校生のオンライン仕事体験」を対象とし、固有のtitle・description・h1、利用方法・対象者・よくある質問・参考資料へのリンクを持つ。TOPと学び一覧から内部リンクで案内する。

Astro単独版のcanonicalはsiteLayout.astroでASTRO_SITEとページパスから生成する。PHP組み込み版は生成manifestのtitle・description・canonicalをController経由で共通レイアウトへ渡す。二重出力せず、導入先のheadで確認する。

サイトマップ・検索対象制御・構造化データ・OGP・Search Consoleでの登録確認は別の設定項目。検索順位や掲載を保証する仕様ではない。

参考：[Google Search Central：タイトル](https://developers.google.com/search/docs/appearance/title-link)、[説明文](https://developers.google.com/search/docs/appearance/snippet)。説明はページの内容と一致させ、同じ語の反復ではなく対象者と用途を具体的に伝える。
