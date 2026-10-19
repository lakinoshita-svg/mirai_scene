# ミライシーンの制作・配布運用

## 担当者の作業

1. `npm run content:inventory` を実行し、`outputs/operations/contentInventory.html` で題材・テーマの件数・担当・再確認予定を確認する。同じ職業でも、相手・目的・制約が異なる体験を扱える。通常は2〜5件ずつ確認に回す。
2. `config/contentOperations.json` の `contents` に体験IDをキーとして `owner`（担当者）、`reviewDueAt`（再確認予定日）、`deployedRelease`（実際に配置した版）を記録する。未確認の値は記入しない。`ads` は広告IDごとの `owner` と `endsAt`（掲載終了日）を持つ。日付はYYYY-MM-DD。
3. 下書きは `npm run content:verify-drafts -- batch-001` で監査とビルドを確認する。
4. 部署確認には `npm run content:export-review -- --batch batch-001` を使う。公開元から一部を出す場合は `npm run content:export-review -- --ids designer,engineer`。指定を省略すると公開元全件。`--check` を加えるとファイルを生成せず対象件数だけを確認できる。連携設定は同じExcelに含む。
5. 記入済みExcelとmanifestを保管する。manifestのSHA-256が現行原稿と異なる場合は確認対象を照合する。確認済み欄の自動移行、ExcelからJSONへの自動取り込みは行わない。
6. 公開元へ入れる原稿の公開判断を担当者が行う。編集レビュー、業務の実務確認、公開承認は別の確認として扱う。

運営一覧は一覧生成時点の情報。定期実行・通知・広告の時刻指定配信は含まない。広告期限前に `enabled` を設定し、ビルド・配布・配置する。掲載比率や新着順は自動で決めず、制作担当がテーマ配分と掲載順を確認する。

## 公開承認の記録

`config/publicationApprovals.json` は体験IDをキーにした公開承認記録。対象原稿のSHA-256、`approvedBy`（実際の承認者）、`approvedAt`（承認日）、`scope`（確認範囲）を記入する。原稿ハッシュは運営一覧JSON、確認Excelのmanifest、または `Get-FileHash src/content/careers/designer.json -Algorithm SHA256` で確認する。ハッシュは小文字で記入する。

```json
{
  "対象の体験ID": {
    "sha256": "対象原稿のSHA-256",
    "approvedBy": "実際の承認者",
    "approvedAt": "YYYY-MM-DD",
    "scope": "確認した範囲と公開判断"
  }
}
```

この例をそのまま登録しない。AIが承認者を推測したり、構造検証の成功だけで承認を付けたりしない。`reviewStatus` は編集確認の状態で、公開フラグではない。プレビュー用ビルドは公開承認なしでも可能。ZIP作成は公開元の全体験と承認ハッシュの一致を必須とする。GitHubの手動公開では自動でこのゲートを通らないため、公開担当は `release:check` の成功を確認する。

## 配布の順序

1. `config/delivery.json` で未使用の版・日付・ZIP名を指定する。固定版は上書きしない。
2. 原稿の公開承認と、導入先で使用する環境変数を確認する。
3. `npm run content:verify` を実行する。全検証成功時に、入力ファイルのハッシュを `tmp/contentVerification.json` へ記録する。
4. `npm run build:shinronavi` を実行する。本文、画像、CSS、JS、PHP、手順書と `buildManifest.json` が同じフォルダーに生成される。
5. `npm run release:check` で入力・検証・承認・生成物を照合する。入力を編集した場合は3から実行する。
6. `npm run release:package` で固定ZIPとmanifestを生成する。同コマンドも配布前照合を実施する。
7. ZIPとmanifestをGitLab側の担当者へ渡し、検証ブランチへ配置する。実際の配置完了後に運営一覧の `deployedRelease` を記録する。

配布検証は手順の取り違えを検出するための仕組みで、署名や承認者の認証基盤ではない。ZIP作成中はソース・生成フォルダーを編集しない。

## 進路ナビ側での配置

一式のZIPは `install.mjs` を使う。原稿・シーン画像だけを配布する場合は [コンテンツの差分配布](CONTENT-DELIVERY.md) の条件を確認し、`release:content-zip` と `installContent.mjs` を使う。以下は一式の手順。

```text
node install.mjs "進路ナビのプロジェクトルート" --dry-run
node install.mjs "進路ナビのプロジェクトルート"
```

初期配置は既存ファイルとの衝突を拒否する。配置記録のある環境では、導入済みハッシュと異なる独自調整を検出すると書き込み前に停止する。対象一覧・追加・削除を `--dry-run` で確認する。導入記録のない固定版を配置済みの場合は、その配置時に受け取ったmanifestを `--baseline "manifest.json"` で両コマンドに指定する。現行ファイルから基準ハッシュを作って競合を隠さない。

共有レイアウト・rewrite・サイトマップは既知の接続箇所だけを扱う。配置記録のある共有ファイルも独自調整があれば停止する。GitLab担当者が差分を確認して結合する。自動マージはしない。

処理中に例外が発生すると書き込み済みファイルを復元する。プロセス強制終了やサーバー停止を含む完全なトランザクションではないため、本番は保守時間帯に実施し、GitLabの復旧手段を用意する。公開ルート外の `miraiBackup-…` に既存ファイルと `restoreManifest.json` を保存する。手動復旧は同manifestの `existed:true` を退避元から復元し、`existed:false` の追加ファイルを配置先から除く。配置記録 `installState.php` も復元対象。

## 閲覧と計測

一覧はPC9件・SP8件ずつ表示する。同じタブ内のsessionStorageへ分類・検索語・表示件数を保存し、「体験一覧に戻る」から一覧と対象カードへ復帰する。回答や感想は保存しない。保存領域が使えないブラウザでは通常の一覧を表示する。

取得できないカードがある場合も、成功分を表示し、不足分は再試行できる。ページタイトルは職業名と題材で区別する。同分野へのリンクは「○○の仕事体験を見る」とする。

FVの原本は `public/assets/hero/`。AstroがWebPと240・480・720pxのカード候補を生成する。原本を直接縮小・上書きしない。

計測は標準で無効。ホスト側で同意管理・GTM設定を確認し、モジュール実行前に `window.miraiSceneAnalyticsEnabled = true` を設定すると既存dataLayerへ次を送る。

| イベント | 意味 | パラメーター |
| --- | --- | --- |
| miraiScene_start | 初めて解説を開く | experienceId |
| miraiScene_sceneComplete | 各シーンの解説を初めて開く | experienceId、sceneNumber |
| miraiScene_complete | 完了画面へ初めて進む | experienceId |
| miraiScene_linkClick | 学校検索・教材・学校広告へのクリック | experienceId、destination、destinationId（教材・広告のみ） |

戻って読み返しても完了を二重計上しない。ページ再読み込みは別の体験として扱う。回答・自由入力・地域・個人IDはイベントに含めない。学校検索クリックは資料請求完了ではなく、資料請求の成果は進路ナビ本体で別に計測する。GTMタグ・送信先・同意管理の設定は導入先の担当範囲。

## 導入先での確認

共通ヘッダー・サービス用のシンプルなフッター・Tailwind・PHP・DB・Apacheとの結合、学校検索の分野条件、教材側の戻りリンク、地域API、広告実データ、実機端末、計測設定を確認する。ビルド・単体テストだけでは本番結合の成功とは扱わない。
