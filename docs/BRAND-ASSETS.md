# 共通ロゴの管理

## FVの説明用カード画像

FVの配置は `src/components/hero.astro` で管理する。2026-10-06に割合による文字・CTAの絶対配置を廃止し、PCは左に説明とCTA、右に画像群を置くグリッドへ変更。900px以下では説明→CTA→画像の順にする。文字拡大時は内容を切らずに縦へ伸ばす。画像を画面の高さに応じて極端に縮めない。TOP全体の配置意図は [TOPデザインの判断基準](homeDesign.md) を参照する。

`public/assets/hero/make.png`・`support.png`・`convey.png` はリンクのない説明用画像。2026-10-05、内蔵imagegenで右下の丸い矢印ボタンを除去した素材へ差し替えた。編集指示は「右下の紫の矢印と円を除去し、白いカード背景で補う。人物・文字・構図・透過背景を維持する」。生成編集のため画素単位で元画像と同一ではない。文字と矢印の除去を目視確認済み。実際に移動するCTAの矢印は維持する。

2026-10-02更新。

## 命名規則

ロゴ関連の画像・共通コンポーネントのファイル名・CSSファイル名・共通ロゴのクラス名はlowerCamelCase（先頭を小文字、単語の区切りを大文字）にする。例：`miraiSceneLogo.png`、`brandLogo.astro`、`brandLogo.css`、`.miraiLogo`。`trimmed`などの加工履歴ではなく用途を名前にする。Astro内のコンポーネント識別子は、HTML要素と区別するため慣例どおり`BrandLogo`を使う。プロジェクト全体の規則と例外は [命名・コード管理ガイド](CODE-MAINTENANCE.md) を参照する。

- 使用画像：`public/assets/brand/miraiSceneLogo.png`（2069×523、透過PNG）。TOP・about・詳細・フッター・進路ナビ組み込み・導線バナーから同じ画像を参照する。
- Astroの表示部品：`src/components/brandLogo.astro`。
- 配置：`src/styles/brandNavigation.css`。ヘッダーのミライシーンロゴは左右同幅のグリッドで中央揃え。進路ナビロゴは左、aboutリンクは右。フッターも中央揃え。PHP組み込みのローカルナビにも同じCSSを使う。
- 共通サイズ：`src/styles/brandLogo.css`。aboutを基準にPC180px、650px以下140px、350px以下120px。ページ固有のロゴ幅を追加しない。
- 進路ナビ用：`scripts/buildShinronavi.mjs` が同じbrandLogo.cssを取り込む。バナーは配置面積が違うため、banner.cssの専用幅を使用する。
- ファビコン：`public/assets/brand/miraiSceneFavicon.png`。ブラウザのタブに表示するアイコン。
- 進路ナビのロゴ：`public/assets/brand/shinronaviLogo.png`。ミライシーンのロゴとは別のブランド画像。

## ロゴを差し替える手順

1. 新しい画像を `public/assets/brand/miraiSceneLogo.png` に保存する。用途を表す固定名を使い、加工方法や版番号をファイル名に付けない。
2. 画像の縦横ピクセル数が変わった場合は、`src/components/brandLogo.astro` と `integrations/shinronavi/templates/` の `index.tpl`・`banner.tpl` のwidth・height属性を更新する。これは画像の比率をブラウザへ伝える値で、画面上の表示幅ではない。
3. 表示幅を変更する場合は `src/styles/brandLogo.css` を編集する。導線バナーの幅のみ `integrations/shinronavi/templates/banner.css` で管理する。
4. `npm run build` と `npm run build:shinronavi` でWeb公開用・進路ナビ組み込み用を生成し、TOP・about・フッター・バナーの表示を確認する。生成先を直接編集しない。

## 変更記録

2026-10-02：提供された `ChatGPT 画像 2026年10月2日 11_37_23.png` を加工せず採用。作業中の名前 `mirai-scene-logo-trimmed.png` は廃止し、`miraiSceneLogo.png` に統一した。旧画像も公開素材から置き換え、現行ロゴを一つにした。既存の配布版を更新するときは、画像だけでなく参照するテンプレートも同じ版へ更新する。

初期導入固定ZIPは旧版のまま保存する。新ロゴを進路ナビへ取り込むときは、新しい配布版の画像・テンプレート・CSSをまとめて確認する。固定ZIPを上書きしない。
