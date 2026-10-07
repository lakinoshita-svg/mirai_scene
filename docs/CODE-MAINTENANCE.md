# 命名・コード管理ガイド

2026-10-06更新。チャットを読まずに編集箇所と変更の影響を判断するためのガイド。

## 命名規則

- 内部のファイル名・変数・関数はlowerCamelCaseを基本にする。例：`cardThemes.ts`、`schoolAds.json`、`buildShinronavi.mjs`。
- Astroのファイル名は`careerCard.astro`、import時の識別子は`CareerCard`とする。型名・クラス名・コンポーネント識別子はPascalCaseで区別する。
- ファイル名は用途を表す。`trimmed`、`new`、`final2`などの作業履歴を現行ファイル名にしない。履歴はGit、配布版は配布先で管理する。
- CSSの既存クラス・ID・data属性はHTMLとJavaScriptの接続契約。今回のファイル名整理では一括変更しない。新しい内部名はキャメルケースにし、既存名を変える場合はセレクターも同時に修正する。
- `astro.config.mjs`、`content.config.ts`、`[slug].astro`などの指定名、環境変数、npmコマンドは維持する。
- 公開URL、職業slug、教材slug、分野ID、学校検索の`fld[]`、保存済みの地域選択キーは互換性のため維持する。職業JSONのファイル名はslugと一致させるためハイフンを含んでよい。
- 進路ナビのPHPクラス名・ホスト由来のメソッド／プロパティ・rewrite設定は本体の規約を優先する。教材の既存コードや固定配布版も機械的に改名しない。

## 編集する場所

| 内容 | 編集元 |
| --- | --- |
| 画面部品 | `src/components/` |
| 全ページの骨組み・CSSの読み込み順 | `src/layouts/siteLayout.astro` |
| 基本の見た目 | `src/styles/baseStyles.css` |
| ブランドの配色・装飾 | `src/styles/brandStyles.css` |
| 選択状態・非表示・キーボード操作 | `src/styles/interactionStyles.css` |
| 共通幅・余白 | `src/styles/layoutStyles.css` |
| TOP固有の一覧・教材エリア | `src/styles/homeStyles.css` |
| FVの説明・画像・配置 | `src/components/hero.astro` |
| ロゴ | [共通ロゴの管理](BRAND-ASSETS.md) |
| 分野・教材・学校検索の対応表 | `src/data/learningLinks.json` |
| カテゴリー共通広告・地域 | `src/data/schoolAds.json`、`adRegions.json` |
| 共通の判定・URL生成 | `src/lib/` |
| ブラウザ内の操作 | `src/scripts/` |
| ビルド・検証・Excel出力 | `scripts/` |
| 進路ナビ組み込み | `integrations/shinronavi/templates/` |

CSSは基本→ブランド→操作状態→共通配置→ロゴの順で読み込む。既存CSSには上書き関係がある。同じセレクターがあるだけで重複と判断して削除しない。部品固有のスタイルは各Astro内にもある。

生成済みHTML、`dist/`、`integrations/shinronavi/output/`、過去のExcelは編集元ではない。ルートにあるWeb公開用HTMLもビルド成果物。修正はsrc・scripts・templatesへ行い、必要な配布物を再生成する。固定ZIPは上書きしない。

## 今回の点検と修正

2026-10-06：TOPのCSSを宣言ごとに改行し、FV画像3枚の設定を`heroCards`へ集約。FV画像の分類は検索カテゴリーとは別のため、`interests.json`へ統合していない。SP側の重複した配置指定を除去した。一覧スクリプトはDOM参照を初期化時にまとめ、描画・検索のたびに同じ要素を検索し直す記述を整理した。表示件数、通信失敗時の再試行、古い検索応答の破棄は維持する。

内部モジュール、コンポーネント、設定JSON、スクリプト、テストの48ファイルをキャメルケース／用途が分かる名前へ整理した。import・npm実行先・現行ドキュメントの参照も更新した。公開ルートとJSON内のID・項目は維持している。

旧ファイル名から探す場合は [変更対応表](internalFileRenames.md) を参照する。過去のExcel・固定配布版は当時の名前を保持するため、この表で現行ファイルへ対応付ける。

一覧の追加取得、回答から解説への遷移、広告のカテゴリー・地域判定、教材と学校検索のリンク生成、PHPへの書き出しを読み、処理の共通化と接続箇所を確認した。旧ハッシュURLの案内は利用者の既存リンクを守る処理として残し、コメントで目的を明記した。

この点検は命名・参照・保守性と主要処理の確認。すべての不具合がないという保証や、職業原稿の事実確認、本番GitLab環境での動作確認を意味しない。PHPの本番組み込みは導入先で検証する。

## 変更後の確認

`npm run content:verify`で原稿構造・型・ビルド・既存テスト・教材連携データを確認する。導入用は`npm run build:shinronavi`で別ディレクトリへ生成する。`npm run release:verify-initial`で固定ZIPが保存時のままであることを確認する。

大文字・小文字だけの改名はWindowsでは見落としやすい。Gitへ登録する際は新しいファイル名が記録されていることを確認する。過去版のファイルに新しいファイルを混在させず、導入先では変更前後のファイル一覧を確認する。

GitHub Pages用の生成物を更新するときは、HTMLが参照する`_astro/`のファイル名と`git ls-files _astro`の名前を、大文字・小文字まで一致させる。Windows上で読み込めても、公開先では区別される。大文字・小文字だけの変更は`git mv`で一時名を経由して記録する。2026-10-05には`CareerCatalog`と`careerCatalog`の不一致によりJavaScriptが読み込めず、カテゴリー検索と「もっとみる」が非表示のままになる問題を修正した。生成済みHTMLの参照だけを手で書き換えず、生成物の名前をビルド結果に合わせる。
