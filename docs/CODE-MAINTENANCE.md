# 命名・コード管理ガイド

2026-10-06更新。チャットを読まずに編集箇所と変更の影響を判断するためのガイド。

## 命名規則

- 内部のファイル名・変数・関数はlowerCamelCaseを基本にする。例：`cardThemes.ts`、`schoolAds.json`、`buildShinronavi.mjs`。
- Astroのファイル名は`careerCard.astro`、import時の識別子は`CareerCard`とする。型名・クラス名・コンポーネント識別子はPascalCaseで区別する。
- ファイル名は用途を表す。`trimmed`、`new`、`final2`などの作業履歴を現行ファイル名にしない。履歴はGit、配布版は配布先で管理する。
- CSSの既存クラス・ID・data属性はHTMLとJavaScriptの接続契約。機械的に一括変更しない。新しい内部名はキャメルケースにし、既存名を変える場合はセレクターも同時に修正する。
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
| 色・角丸・影・状態の統一 | [デザインシステム](DESIGN-SYSTEM.md) |

CSSは基本→ブランド→操作状態→共通配置→ロゴの順で読み込む。既存CSSには上書き関係がある。同じセレクターがあるだけで重複と判断して削除しない。部品固有のスタイルは各Astro内にもある。

生成済みHTML、`dist/`、`integrations/shinronavi/output/`、過去のExcelは編集元ではない。ルートにあるWeb公開用HTMLもビルド成果物。修正はsrc・scripts・templatesへ行い、必要な配布物を再生成する。固定ZIPは上書きしない。

## 保守の共通ルール

- 似た機能は既存のコンポーネント・ライブラリ・スクリプトへ集約する。ページ固有の差はデータまたはページルート内の設定で表現する。
- UIの色、角丸、影、操作状態は [デザインシステム](DESIGN-SYSTEM.md) に従う。色コードや状態スタイルを画面へ直接追加しない。
- CSSの読み込み順とHTML・JavaScript間のクラス、ID、`data-*` 属性を接続契約として扱う。変更時は参照先を同時に確認する。
- 内部名はlowerCamelCaseを基本にし、公開URL・データID・外部連携仕様は互換性を確認せずに変えない。
- 編集対象の場所は [ファイル案内](internalFileRenames.md) を参照する。
- 内容の正確さ、編集レビュー、実務経験者の確認、公開判断は別の確認事項として記録する。

## 確認手順

`npm run content:verify`で原稿構造・型・ビルド・既存テスト・教材連携データを確認する。導入用は`npm run build:shinronavi`で別ディレクトリへ生成する。`npm run release:verify-initial`で固定ZIPが保存時のままであることを確認する。

大文字・小文字だけの改名はWindowsでは見落としやすい。Gitへ登録する際は新しいファイル名が記録されていることを確認する。過去版のファイルに新しいファイルを混在させず、導入先では変更前後のファイル一覧を確認する。

GitHub Pages用の生成物を更新するときは、HTMLが参照する`_astro/`のファイル名とGitに登録された名前を、大文字・小文字まで一致させる。Windowsと公開先では大文字・小文字の扱いが異なる場合があるため、生成物の参照と実ファイルの両方を確認する。生成済みHTMLの参照だけを手で書き換えず、ビルド結果を正本にする。

## 資料の記述

現行の目的・仕様・手順・未設定項目を直接説明する。対応履歴や「AからBに変更した」という比較を説明資料へ載せない。版番号・配布物のハッシュ・確認者・確認範囲は照合情報として保持する。履歴はGitで管理する。

マニュアルの編集元は `docs/operationsManual.html`、配布設定は `config/delivery.json`。`npm run manual:build` で閲覧用HTMLを生成する。`npm run build:shinronavi` は同じ生成処理を含む。ZIPは `npm run release:package` で全ファイルの照合まで行う。
