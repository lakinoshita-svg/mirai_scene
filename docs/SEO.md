# 検索向けのページ情報

Aboutは「高校生のオンライン仕事体験」を対象とし、固有のtitle・description・h1、利用方法・対象者・よくある質問・参考資料へのリンクを持つ。TOPと学び一覧から内部リンクで案内する。

Astro単独版のcanonicalはsiteLayout.astroでASTRO_SITEとページパスから生成する。PHP組み込み版は生成manifestのtitle・description・canonicalをController経由で共通レイアウトへ渡す。二重出力せず、導入先のheadで確認する。

## 進路ナビ本体への接続

XMLサイトマップは既存の `sitemap_second.php` に統合する。`sitemapUrls.php` が公開ページと同じ生成manifestを読み取り、ホストが持つ `$urls` 配列へ追加する。TOP・About・分野一覧・分野別ページ・仕事体験が対象。catalogの取得用HTML・JSON、draftsは含めない。コンテンツ追加時は配布一式を再生成する。更新日を根拠なくlastmodへ出力しない。

既存robots.txtには `sitemap_second.php` が指定されているため、robots.txtを配布・上書きしない。専用サイトマップを新規登録する運用ではない。Search Consoleで既存サイトマップの取得とページ登録状況を確認する。

OGPは `MiraisceneController.php` が共通レイアウトの `twitter_card` に共有画像とsummaryカードを渡す。画像は既存ブランド素材 `miraiSceneFavicon.png`。専用headにはOGPを重複出力しない。公開URLは `https://shinronavi.com/mirai_scene/` 配下。インストーラーは提供コードのOGP用REQUEST_URIキー先頭の空白も補正する。

自動・手動の設置手順は `integrations/shinronavi/README.md`。元のダウンロード済み進路ナビコードへは直接適用しない。既存サイトマップ全体のXML検証には本番相当DBが必要。共有コードの名前空間・学校側の件数出力についても同手順書の確認項目を参照する。

確認用サイトのnoindex・構造化データ・Search Consoleの操作は未実施。検索順位や掲載を保証する仕様ではない。GitHub単独版のOGP・サイトマップ追加は今回の導入用連携の対象外。

参考：[Google Search Central：タイトル](https://developers.google.com/search/docs/appearance/title-link)、[説明文](https://developers.google.com/search/docs/appearance/snippet)。説明はページの内容と一致させ、同じ語の反復ではなく対象者と用途を具体的に伝える。
