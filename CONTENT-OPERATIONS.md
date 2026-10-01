# コンテンツ運用

## 別部署確認用Excel

運用担当向けの手順は `outputs/operations/運用マニュアル.html` を参照してください。

- `npm run content:export-review`：最新JSONからExcelと原稿照合用manifestを出力します。Codex同梱のartifact-toolが必要です。別端末で依存の場所が異なる場合は `CODEX_ARTIFACT_MODULE_ROOT` に同梱node_modulesの絶対パスを指定します。
- `npm run content:export-review -- --check`：Excel用依存なしで原稿の読み込みと件数を確認します。
- 出力先は `outputs/operations/<UTC日時>/`。Excel内の日付は日本時間です。プレビューは `tmp/review-export/<UTC日時>/` に保存します。
- 記入済みのExcelは上書きせず保管してください。確認欄は再出力ごとに未確認となり、旧版のコメントは自動移行しません。Codexへ記入済みExcelを渡し、manifestと現行原稿の差分を確認したうえでJSONへ修正を反映します。

出力処理の修正箇所：`scripts/lib/review-data.mjs` がJSON展開・出典ハッシュ、`scripts/lib/review-workbook.mjs` が列・書式、`scripts/export-review.mjs` が依存読込・保存を担当します。新しいJSON項目は自動で出力されます。日本語の項目名はreview-dataの辞書へ追加してください。

## 編集元と生成物

- 職業体験：`src/content/careers/<slug>.json`。TOP・学び別一覧・詳細は同じ原稿を使います。
- カード画像・テーマ名：`src/data/interests.json`。テーマの追加はこの定義と画像の追加で対応します。
- 探究・学校検索の対応：`src/data/learning-links.json`。職業JSONの `learningIds` に登録済みIDを指定します。
- 広告：`src/data/school-ads.json`。同じcategoryなら異なる体験でも共通の広告候補を使います。
- `dist/`、探究側の `mirai-links.json` は生成物です。直接編集しません。

## 追加・更新の手順

1. `npm run content:new -- engineer new-slug` のように既存原稿から下書きを作成します。`drafts/` 内は公開されません。既存ファイルは上書きしません。
2. 職業名・見出し・説明・学び・3シーンの全選択肢・出典を編集します。コピー元の資料確認日を流用せず、実際に確認してください。各設問には状況整理の共通解説、各選択肢には説明・良い点・懸念点を記載します。
3. `cardTheme` は一覧の表示・絞り込みに使います。`interests` は関連性のための補助情報です。`learningIds` は探究・学校検索・学び別一覧に使います。`category` を新設したら広告設定の `categoryAds` にも空配列または広告IDを追加します。
4. 確認した下書きを `src/content/careers/` に移動します。ファイル名と `slug` は一致させます。公開済みslugは共有URLなので、安易に変更しません。同じ職業名の別体験は異なるslug・見出しで登録できます。`order` は小さい順、同値はslug順です。
5. `npm run content:verify` を実行します。一覧監査・型チェック・ビルド・テスト・探究連携の生成をまとめて実行します。失敗時は公開せず修正してください。
6. PC/SPで初期件数・もっとみる・検索・3シーン・完了後のリンクを確認します。探究側の更新は、別途 `integrations/inquiry` でビルド・公開が必要です。
7. `dist/` のサイト全体をまとめて公開します。JSONだけを本番にコピーしても反映されません。新旧の索引・カード・詳細が混在しないよう、同一ビルドを配信してください。

## 300件規模の一覧

TOPと学び別ページは `CareerCatalog.astro` を共用。初期HTMLは最大9カードで、PCは9件、650px以下は8件ずつ表示します。検索用索引は全件取得しますが、設問本文を含めません。追加カードは静的HTMLを必要時に取得し、同一ページ内で再利用します。サーバーでの動的処理は不要です。

検索は職業名・分野・見出し・説明を対象とし、空白区切りでAND検索します。全角英数字と大小文字を吸収します。興味と分野は排他的、キーワードは分類と併用できます。分類・検索・画面幅の区分変更では初期件数に戻ります。

通信失敗時は既存カードを維持し、再試行できます。JavaScript無効時は全件へのテキストリンクから移動できます。300件の詳細ページそのものはビルド時に生成します。実際の配信速度は自社サーバーで確認してください。

`npm run content:benchmark` は `tmp/` に独立した検証用コピーを作り、300件の実ビルドと初期カード数を確認します。本番原稿・本番distは変更しません。測定結果は端末環境や原稿の長さに依存します。
