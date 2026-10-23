# 進路ナビ組み込み版

配布対象はZIPに隣接するmanifest.jsonのreleaseを確認してください。配置は本書、検証範囲はVALIDATION.md、照合情報はZIPに隣接するmanifest.jsonを参照してください。同一版の一式を配置してください。

## 配置前の照合

`node install.mjs "進路ナビのプロジェクトルート" --dry-run` で全対象を確認してから、同じコマンドの --dry-run を外して配置します。配置記録と異なる独自調整があれば停止します。導入記録のない固定版は、その配布時のmanifest.jsonを `--baseline "manifest.json"` で指定します。本番の処理中の画面混在を避けるため保守時間帯に実施してください。例外時は書き込み済みファイルを復旧します。強制終了時はバックアップのrestoreManifest.jsonとGitLabの復旧手順を利用します。

## 配置

`npm run build:shinronavi` で `output/release-…/` に配布物を生成します。最新の場所は `output/latest.json` に記録します。

1. 配布物の `new/` を進路ナビのプロジェクトルートへディレクトリ構成を保って追加します。共通レイアウトや既存のTailwindCSSを上書きするファイルは含みません。
2. `rewrite-addition.conf` の4行のRewriteRuleを、稼働中のルート `.htaccess` の `RewriteEngine on` より後、既存のMVCルーティング規則より前に追加します。`.htaccess.base` を配置時に利用している環境ではテンプレートにも同じ変更を反映してください。
3. `https://shinronavi.com/mirai_scene/` で確認します。職業は `/mirai_scene/careers/designer/`、学びは `/mirai_scene/explore/it/` です。

ファビコンの反映には、共通の `new/_app/_view/layout/default_new.tpl` の `</head>` 直前に次の一行を追加します（ミライシーンだけに適用）。

```php
<?php require __DIR__ . '/../miraiscene/head.tpl'; ?>
```

配置・rewrite・head・サイトマップ接続をまとめて実施するには、配布フォルダーで `node install.mjs "進路ナビのプロジェクトルート"` を実行できます。実行前に対象が開発・検証環境であることを確認してください。既存変更はプロジェクトと同階層の `miraiBackup-…` に退避します。元のダウンロードフォルダーへは自動適用していません。配置先でNode.jsを使えない場合は手動配置できます。

公開先は現在 `/mirai_scene/` 固定です。別のパスへ配置する場合は、生成スクリプト・rewrite規則を合わせて変更し再生成してください。静的ファイルは `new/_app/_webroot/miraiscene/`、JSは `new/_app/_webroot/js/page/miraiscene/`、PHP本文は `new/_app/_view/miraiscene/` に配置します。公開URLと物理配置先の対応はrewriteが担います。

手動配置で本体フッターを呼ぶ箇所は、次の条件を付けます。他ページは本体のフッターを使います。

```php
<?php if (!isset($this->mirai_page)) { require_once '../_view/layout/_footer.tpl'; } ?>
```

## TailwindCSSと共通レイアウト

配布物はHTML・JSだけではありません。専用CSS、画像、一覧・連携用JSON、既存MVCへ接続するPHP・tpl、rewrite設定も必要です。HTML内には独自クラスとAstroのスコープ属性があるため、既存Tailwindだけでは専用の見た目を再現できません。`new/`を一式で扱い、CSSやPHPを省略しないでください。

既存の `default_new.tpl` から進路ナビのヘッダー・GTMを読み込みます。ミライシーンは本文にサービス用のフッターを含み、本体フッターはこのページで省きます。ミライシーン本文側に追加ヘッダーを置かず、進路ナビのヘッダーの下から本文を表示します。Tailwindの再インストールやCDN追加、新しいPreflightはありません。既存の画面デザインは専用CSSで維持し、生成時に全セレクターを `#mirai-scene` の内側へ限定します。全スタイルをTailwindユーティリティへ書き換えたものではありません。

パンくずは本文内のミライシーン専用表示だけを残し、レイアウト側では空配列にして重複を防ぎます。既存の `main` 内へ差し込むため、生成HTMLの `main` は `div` に変換します。ページのtitle・description・canonicalはControllerから既存レイアウトへ渡します。

## 導線バナーの設置

TOPなどの本文内には、次の一行を追加します。リンク先は `/mirai_scene/` です。既存の共通ヘッダー・フッターは変更しません。

```php
<?php require __DIR__ . '/../miraiscene/banner.tpl'; ?>
```

教材記事などの狭い本文欄では、コンパクト版を使用します。

```php
<?php $mirai_banner_variant = 'compact'; require __DIR__ . '/../miraiscene/banner.tpl'; ?>
```

上記の相対パスは `_view/default/` や `_view/forteacher/` からの例です。テンプレートの場所が異なる場合はパスを合わせてください。バナーはHTML・CSSなので文言を編集でき、スマートフォンでは説明とボタンを縦に表示します。Tailwindの再ビルドや画像の再生成は不要です。まだ進路ナビのTOP・教材テンプレートへ自動挿入はしていません。

## 更新手順

原稿は `src/content/careers/*.json`。`npm run content:verify` 後に `npm run build:shinronavi` を実行します。Node.jsは生成する端末にだけ必要です。本番ではPHPとApacheが動作すれば表示できます。

古い公開ファイルと混在しないよう同一リリースのファイルをまとめて反映してください。既存ページを上書きせず、ミライシーン専用の配置先だけを更新します。配布物を削除する前に直前のリリースを保存してください。

## 連携の範囲

- 教材へのリンクは本番の `/forteacher/lesson?slug=…` を使います。教材側から戻る導線は別途組み込みが必要です。
- 学校検索は既存の `fld[]` パラメーターを使用します。
- 広告は現在のJSON方式のままで、既存広告DBへの接続は含みません。登録済み広告がない場合は非表示です。
- IP地域APIは `PUBLIC_REGION_API_URL` の指定がある場合のみ接続します。自社IP推定APIは別途必要です。
- 既存GTMの読み込みは共通レイアウトに委ねます。ホストが window.miraiSceneAnalyticsEnabled = true を設定した場合、start・sceneComplete・complete・linkClickをdataLayerへ渡します。GTM・同意管理・送信先の設定はホストの担当です。

## 確認

ミライシーンのロゴは共通SVG `assets/brand/miraiSceneWordmark.svg`（viewBox：175×27）で表示します。ファビコン画像はブラウザタブ用です。組み込み画面の表示幅は`brandLogo.css`、導線バナーは`banner.css`を使います。SVG・CSS・テンプレートを同じビルド版で配置し、必要に応じてブラウザ/CDNのキャッシュを確認してください。

完了画面は学校検索→「分野探究する」→資料請求の説明→同分野の仕事体験→別の興味の順です。学校検索のfld[]と教材slugの遷移を検証環境で確認してください。

サイトマップとOGPは下記の共通処理へ接続します。確認用サイトのnoindex・構造化データ・Search Consoleでの登録状況は導入先で確認してください。カード取得用catalogはサイトマップの対象外です。

PHP 8.3想定（提供されたDockerfileに合わせています）。開発環境でPHPファイルの構文確認、TOP・体験完了・学び・検索・PC9件/SP8件の追加表示、存在しないURLの404、CSSのヘッダーへの漏れを確認してください。DB接続を含む進路ナビ本体の起動環境は別途必要です。配置だけでIP推定や広告DB連携まで有効になるものではありません。

## SEOの組み込み

サイトマップは進路ナビの sitemap_second.php に統合します。robots.txt は既存の同ファイルの指定を使います。専用XMLの新規登録は不要です。公開ページ一覧は生成manifestと共通なので、コンテンツ追加時は一式の再生成・配置で反映されます。

手動導入の場合は sitemap_second.php の `header('Content-Type: application/xml');` の直前に次を追加します。

```php
$urls = array_merge($urls, require __DIR__ . '/new/_app/_util/miraiscene/sitemapUrls.php');
```

共通OGPは default_new.tpl が出力し、Controller がブランド画像・summaryカードを指定します。Twitterアカウントは未指定です。共有画像は /mirai_scene/assets/brand/miraiSceneFavicon.png です。手動配置時は共通テンプレートの $_SERVER[" REQUEST_URI"] を htmlspecialchars($_SERVER["REQUEST_URI"], ENT_QUOTES, 'UTF-8') としてください（キー先頭の空白を含めない）。install.mjs はこの既知の表記も処理します。

共通ファイルは丸ごと配布せず、インストーラーで必要箇所を編集します。既存ファイルは公開ルート外へバックアップします。サイトマップの出力位置が想定と異なる場合は配置前に停止します。手動導入でもGitLabの差分で追記位置を確認してください。

公開後は sitemap_second.php のXMLにミライシーンの全公開URLが含まれること、catalog・確認用ドメインが含まれないこと、各ページのcanonical・OGPが1組であること、画像URLが200で返ることを確認してください。Search Consoleの既存サイトマップの取得結果とページ登録状況を確認します。元の学校データを含めたXML全体の検証には本番相当DBが必要です。

共有コードの sitemap_first.php / sitemap_second.php は名前空間が https://www.sitemaps.org/schemas/sitemap/0.9 になっています。サイトマップ規格の http://www.sitemaps.org/schemas/sitemap/0.9 に合わせる確認が必要です。また sitemap_first.php は urlset 直下へ件数を出力します。インストーラーは接続対象のsitemap_second.phpの名前空間を規格に合わせます。手動導入でもこのファイルの名前空間を合わせてください。学校側sitemap_first.phpの名前空間・件数出力は本体担当者による確認項目であり、今回の自動編集対象ではありません。
