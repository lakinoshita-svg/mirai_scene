# ブランド素材の管理

## ミライシーンの文字ロゴ

画面上のロゴは画像を使わず、「ミライシーン」の文字で表示します。ファビコンの図柄はタブ用のアイコンとして使い、ページ内のロゴには含めません。

- 共通HTML：`src/components/brandLogo.astro`
- 共通のサイズ・色：`src/styles/brandLogo.css`
- ヘッダーの配置：`src/styles/brandNavigation.css`
- 進路ナビ組み込み画面：`integrations/shinronavi/templates/index.tpl` は独自ヘッダーを出さず、進路ナビ本体の共通ヘッダーを使います。
- 進路ナビ導線バナー：`integrations/shinronavi/templates/banner.tpl` と `banner.css`。文字ロゴとして表示し、ホスト側CSSとの衝突を避けるため専用トークンを使います。
- ファビコン：`public/assets/brand/miraiSceneFavicon.png`。ブラウザタブ用のほか、導線バナーのイメージ内で装飾として単独表示します。文字ロゴと組み合わせてロゴ表示には使いません。

表示サイズとブランド色は共通CSSで管理します。画面ごとに別のロゴ画像や独自のサイズを足さず、変更時はAstro共通部品と進路ナビ組み込みの表示を確認します。

`public/assets/brand/miraiSceneLogo.png` は現在の画面ロゴ表示には使いません。文字ロゴの表示を変更するときは、画像素材ではなく上記のHTMLとCSSを編集してください。

## FV画像

FVの配置は `src/components/hero.astro`、画像は `public/assets/hero/` で管理します。カード画像は説明用の素材です。実際に移動する導線はCTAリンクとして別に実装します。

画像の差し替え時はPC・SPの表示、代替テキスト、リンクの有無、画像内の矢印や文字が実際の機能と一致しているかを確認してください。

## ファイル名

ロゴ関連の内部ファイル名はlowerCamelCaseを基本にします。例：`brandLogo.astro`、`brandLogo.css`、`.miraiLogo`。フレームワークや外部連携で固定されている名前は機械的に変更しません。全体ルールは[コード管理ガイド](CODE-MAINTENANCE.md)を参照してください。
