# ミライシーン

「好き・興味」を入口に、仕事の3つの場面で考え、学びや学校を調べるきっかけをつくるサービスです。ガイダンス参加者と一般の訪問者の両方が対象です。正解の採点や適性判定は行いません。

## まず開く資料

| やりたいこと | 開く資料 |
|---|---|
| 全体の状況を把握する | このREADMEと[運営一覧](outputs/operations/contentInventory.html) |
| サービスの目的・確認方法を理解する | [作業者向け仕様書](docs/CONTENT-SPEC.md)、[運用マニュアル](outputs/operations/運用マニュアル.html) |
| 原稿を読む・部署で確認する | 下の[バッチ別の原稿一覧](#原稿を読む) |
| AIへ制作を依頼する | [AGENTS.md](AGENTS.md)、[制作引き継ぎガイド](docs/editorial/HANDBOOK.md)、[AI向け仕様書](docs/CONTENT-SPEC-AI.md) |
| 職種・出典・未収録分野を調べる | [職種の収録範囲](docs/editorial/occupationCoverage.md)、[資料対応表](docs/editorial/source-mapping.md) |
| 進路ナビへ導入する | [担当別手順](docs/DELIVERY-AND-CONTENT.md)、[配布・公開承認](docs/OPERATIONS.md)、[差分配布](docs/CONTENT-DELIVERY.md) |
| 共通コード・見た目を扱う | [コード管理](docs/CODE-MAINTENANCE.md)、[デザインシステム](docs/DESIGN-SYSTEM.md) |

作業者は原稿一覧HTMLを開いて読めます。JSONやコマンドの操作は制作・開発担当者が行います。

## 現在の状況

2026-11-10の原稿・設定の集計です。実際の配信・導入完了を表す数字ではありません。最新件数の確認先は[運営一覧](outputs/operations/contentInventory.html)、制作担当の再集計は `npm run content:inventory` です。

| 区分 | 件数 | 意味 |
|---|---:|---|
| 原稿の合計 | 111体験 | 公開元19件＋下書き92件。40職種・29カテゴリー |
| 公開元 | 19体験 | `src/content/careers/`。通常ビルド・導入ビルドの対象 |
| 下書き | 92体験 | `drafts/batch-001〜007/`。公開判断と別に管理 |
| GitHub確認サイトの設定対象 | 61体験 | 公開元19件＋batch-001〜005の42件。合計111件の内数 |
| 確認サイトの設定対象外 | 50体験 | batch-006の30件＋batch-007の20件。原稿一覧で確認可能 |
| 制作目標 | 約300体験 | 現在の111件をすべて採用する場合、残り189件。300職種ではない |

自社資料の18大分類それぞれに、下書きを含めて関連する職種があります。全職種の網羅ではありません。[大分類の対応と未収録の候補](drafts/batch-007/review/coverage.md)で確認してください。

「制作済み」「資料との照合」「自己確認」「実務経験者の確認」「公開承認」「本番配置」は別の状態です。下書きの二段階確認記録は原稿と一致していますが、独立レビュー・実務経験者の確認・高校生の試読・公開承認の完了を意味しません。`config/publicationApprovals.json` に公開承認の登録はなく、`config/contentOperations.json` に担当・期限・配置済み版の登録もありません。

## 原稿を読む

バッチは原稿をまとめて確認する単位です。HTMLが閲覧用、JSONが編集元、`REVIEW.md` が確認範囲の説明です。

| 対象 | 体験数 | 原稿一覧 | 確認記録 | 確認サイト設定 |
|---|---:|---|---|---|
| batch-001 | 2 | [読む](drafts/batch-001/manuscript.html) | [確認範囲](drafts/batch-001/REVIEW.md) | 含む |
| batch-002 | 10 | [読む](drafts/batch-002/manuscript.html) | [確認範囲](drafts/batch-002/REVIEW.md) | 含む |
| batch-003 | 10 | [読む](drafts/batch-003/manuscript.html) | [確認範囲](drafts/batch-003/REVIEW.md) | 含む |
| batch-004 | 10 | [読む](drafts/batch-004/manuscript.html) | [確認範囲](drafts/batch-004/REVIEW.md) | 含む |
| batch-005 | 10 | [読む](drafts/batch-005/manuscript.html) | [確認範囲](drafts/batch-005/REVIEW.md) | 含む |
| batch-006 | 30 | [読む](drafts/batch-006/manuscript.html) | [確認範囲](drafts/batch-006/REVIEW.md) | 含まない |
| batch-007 | 20 | [読む](drafts/batch-007/manuscript.html) | [確認範囲](drafts/batch-007/REVIEW.md) | 含まない |

職業・題材の一覧は[制作台帳](docs/CONTENT-BATCHES.md)。batch-007は未収録職種を優先する20件です。[シーン画像一覧](drafts/batch-007/review/imageAssets.md)に、batch-006・007で使う7点と使用箇所をまとめています。すべての画像資産の総数ではありません。

## 導入用データの扱い

制作元はGitHub、進路ナビ本体はGitLabです。原稿を作ること、GitHubの確認サイトへ載せること、進路ナビ本番へ配置することはそれぞれ別工程です。

配布設定は `config/delivery.json`。現在は `release-2026-10-20` を指します。同版のmanifestは「導入確認用一式・19体験・本番公開承認未登録」です。**設定されている版と、担当者へ渡した版・実際に配置した版は同一と決め付けません。** ZIPの用途・版・承認状況・照合方法は[担当別手順](docs/DELIVERY-AND-CONTENT.md#配布版と配置済み版の確認)で確認してください。

batch-007には17件の学び定義と15件の広告カテゴリー定義が必要です。取り込み先に設定がない場合、原稿・画像だけでは接続できません。[教材・学校検索の接続](LEARNING-LINKS.md)に従い、共通設定を含む一式を先に整えます。広告の空配列は掲載なしです。

## 次に確認すること

| 項目 | 担当する役割 | 完了の判断 |
|---|---|---|
| 原稿の実務内容 | 対象分野を確認できる部署・実務経験者 | 職務・選択肢・解説の確認者、範囲、未確認事項が記録されている |
| 高校生の読みやすさ | 企画・運営担当 | 問いの理解、選択肢の違い、所要時間を試読で確認している |
| 公開対象の決定 | 公開責任者 | 対象原稿に実際の公開承認を記録している |
| 学校検索・教材への接続 | 制作担当・進路ナビ開発担当 | 本番の分野条件、教材リンク、戻りリンクが意図どおり動く |
| 導入先との一致 | 進路ナビ開発担当 | 受領版・配置済み版・共通設定を照合し、検証環境で結合確認している |
| 運営の担当・期限 | 運営責任者 | 担当者、再確認予定、配置完了後の版を記録している |

担当者名・期限・本番配置状況は推測で補いません。広告・地域API・計測など導入先の設定範囲は[運用マニュアル](outputs/operations/運用マニュアル.html#settings)を参照してください。

## 開発・制作担当者向け

Astro＋職業別JSONで構成した、進路ナビ向けの選択型仕事体験です。静的HTMLと保存済み画像を配信し、閲覧時にAIやデータベースを呼び出しません。

## 起動・ビルド

制作依頼には [依頼テンプレート](docs/editorial/REQUEST-TEMPLATE.md) を使えます。コードを扱う前に [命名・コード管理ガイド](docs/CODE-MAINTENANCE.md)を確認してください。

初期導入用の固定ZIPと追加原稿の制作を分けています。[担当別の手順](docs/DELIVERY-AND-CONTENT.md)、[コンテンツ仕様v1](docs/CONTENT-SPEC.md)、[制作台帳](docs/CONTENT-BATCHES.md)を参照してください。追加原稿は `drafts/` で確認し、現在の導入用ZIPへ混ぜません。

Node.js 22.12以上（24推奨）、pnpmを使用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm build
pnpm test
pnpm preview
```

`pnpm test` はビルド後のページ・解説・画像やリンクを検証します。`dist/` は生成物なので直接編集しません。

## 主な編集場所

| 場所 | 内容 |
|---|---|
| `src/content/careers/*.json` | 職業ごとの文章・選択肢・解説・画像参照 |
| `src/data/interests.json` | 興味タグ・共通カード画像（[追加・編集方法](CARD-THEMES.md)） |
| `src/data/schoolAds.json` | カテゴリー共通の大学・専門学校広告（[設定方法](SCHOOL-ADS.md)） |
| `src/content.config.ts` | JSONの必須項目・形式・画像の検証 |
| `src/pages/` | トップ、職業別ページ、サービス説明 |
| `src/components/` | カード、場面、振り返りの共通部品 |
| `src/scripts/` | 絞り込み・選択・解説の操作 |
| `src/styles/` | デザインと配色 |
| `public/assets/` | 事前に制作した画像 |

## 職業を追加する

1. 既存の職業JSONを参考に、`drafts/<batch-id>/` へ新しい体験のJSONを作成します。内容確認前に公開コレクションへ入れません。
2. `slug` を重複しない半角英小文字・数字・ハイフンにし、`order` で表示順を指定します。
3. `interests` に興味タグ定義のIDを指定します。
4. `scenes` に3場面、各 `options` に3選択肢を用意します。
5. 画像を `public/assets/` に置き、JSONには `assets/ファイル名.png` と代替テキストを記載します。
6. `npm run content:verify-drafts -- batch-001` などで隔離ビルドし、内容確認後に `src/content/careers/` へ移します。チェック・ビルド・テストを実行し、初期導入版とは別の更新版として公開します。

画像（`image`）、依頼（`mission` と `brief`）、比較画像（`comparison`）は必要に応じて追加できます。比較画像もJSONで管理し、画面側に職業固有の画像を埋め込みません。

各シーンに共通解説（`contextExplanation`）、各選択肢に説明（`explanation`）、期待できること（`benefit`）、懸念点（`caution`）が必須です。共通解説では状況・制約・問いの意図を整理し、特定の選択を正解にしません。利点と懸念点は、その行動が今回の場面にどう影響するかを具体的に書きます。解説は選択後に表示し、ほかの選択肢も同じ構成で比較できます。

必須項目、選択肢数、未定義の興味タグ、画像ファイルの不足、重複slugをビルド時に検出します。文章の妥当性は人による確認が必要です。

`reviewStatus` は確認状態の記録です。試作は `editorial-draft` も表示します。公開承認やアクセス制御の機能ではありません。

## 進路ナビ内への配置

初期設定はGitHub Pages向けの `/mirai_scene/` です。ドメイン直下では `ASTRO_BASE=/` を指定します。例えば `/mirai-scene/` に配置する場合：

```powershell
$env:ASTRO_BASE='/mirai-scene/'
pnpm build
pnpm test
```

`dist/` の中身を配置先へ配信します。職業別URLの `/careers/designer/` は該当ディレクトリの `index.html` を返す設定にします。404ページはサーバー側で `404.html` に設定してください。Node.jsはビルド時だけ必要です。

`#career/designer` と `#about` は該当ページへ案内します。回答はページ内のみで保持し、再読み込みで最初からになります。

## GitHub Pagesで下書きを確認する

`npm run build:preview` は `config/preview.json` に指定したバッチと公開元を一時プロジェクトで合わせてビルドします。下書きJSONは `drafts/` が正本です。`src/content/careers/`、通常の `dist/`、導入用ZIPには下書きを入れません。確認サイトは検索エンジン向けに `noindex, nofollow` を設定しますが、URLを知っている人は閲覧できます。

出力先は `tmp/previewBuild.json` の `output`。この出力で体験ページ・一覧・リンクを検証し、生成物をリポジトリ直下の対応する公開ファイルへ配置してコミット・pushします。`publish.ps1` は通常の `dist/` 用のため、このプレビューには使いません。掲載対象を増やす際は `config/preview.json` のバッチを明示します。確認サイトへの掲載は、実務監修や進路ナビ本番への公開承認を意味しません。

学校検索は分野パラメーター付きの進路ナビ検索結果です。興味・分野の絞り込み、画像比較、選択ごとの解説、振り返りを実装しています。学校DBとの自動接続、運営用管理画面、閲覧時のAI生成は実装していません。実務監修は機能の有無とは別の確認工程です。企画方針は [PRODUCT.md](PRODUCT.md)、FVなどの画像生成記録は [ASSET-PROMPTS.md](ASSET-PROMPTS.md) を参照してください。

運営・公開承認・配布の照合は [制作・配布運用](docs/OPERATIONS.md) を参照してください。
