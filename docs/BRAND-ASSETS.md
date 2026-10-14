# ブランド素材の管理

## ミライシーンの文字ロゴ

フッターのデザイン方針は、サービス名と短い説明を載せた現在のシンプルな構成。進路ナビ本体の大型フッターに合わせる必要はありません。現行の組み込み用共通レイアウトは本体フッターを出力するため、組み込み側でこの方針を反映する処理は別途必要です。

画面上のロゴは、Figmaの丸い文字形をアウトライン化した共通SVGで表示します。青紫の文字、オレンジの長音、右上の小さな光が構成要素です。ファビコンの図柄はページ内のロゴには含めません。

- デザイン正本：[Figmaの共通ロゴ](https://www.figma.com/design/Qs575HHeLxhbfPWFZrBw5D?node-id=36-264)
- 共通素材：`public/assets/brand/miraiSceneWordmark.svg`。文字はパスのため、閲覧端末にフォントを用意する必要はありません。
- 大きく掲載する場合の案：[コピー付きロゴ](https://www.figma.com/design/Qs575HHeLxhbfPWFZrBw5D?node-id=98-527)。コピーは「“好き”から始まる、仕事体験」。サイトの通常表示ではコピーを含めません。

- 共通HTML：`src/components/brandLogo.astro`
- 共通の表示サイズ：`src/styles/brandLogo.css`
- ヘッダーの配置：`src/styles/brandNavigation.css`
- 進路ナビ組み込み画面：`integrations/shinronavi/templates/index.tpl` は独自ヘッダーを出さず、進路ナビ本体の共通ヘッダーを使います。
- 進路ナビ導線バナー：`integrations/shinronavi/templates/banner.tpl` と `banner.css`。文字ロゴとして表示し、ホスト側CSSとの衝突を避けるため専用トークンを使います。
- ファビコン：`public/assets/brand/miraiSceneFavicon.png`。ブラウザタブ用のほか、導線バナーのイメージ内で装飾として単独表示します。文字ロゴと組み合わせてロゴ表示には使いません。

表示幅は共通CSSで管理し、縦横比を保ちます。ロゴ内部の色と形はSVGで管理します。画面ごとに別のロゴ画像や独自のサイズを足さず、素材の反映時はAstro共通部品と進路ナビ組み込みの表示を確認します。

`public/assets/brand/miraiSceneLogo.png` は現在の画面ロゴ表示には使いません。ロゴの形を編集するときはFigmaから文字をアウトライン化したSVGを書き出し、共通素材へ反映してください。配置や幅の調整は共通部品とCSSで行います。

## FV画像

FVの配置は `src/components/hero.astro`、画像は `public/assets/hero/` で管理します。カード画像は説明用の素材です。実際に移動する導線はCTAリンクとして別に実装します。

画像の差し替え時はPC・SPの表示、代替テキスト、リンクの有無、画像内の矢印や文字が実際の機能と一致しているかを確認してください。

## ファイル名

ロゴ関連の内部ファイル名はlowerCamelCaseを基本にします。例：`brandLogo.astro`、`brandLogo.css`、`.miraiLogo`。フレームワークや外部連携で固定されている名前は機械的に変更しません。全体ルールは[コード管理ガイド](CODE-MAINTENANCE.md)を参照してください。
