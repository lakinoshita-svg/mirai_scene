# 初期導入とコンテンツ制作を分ける

## リポジトリの境界

ミライシーンの制作元はGitHub、進路ナビ本体は別サービスのGitLabで管理する。GitHub側のコミットをGitLabへ直接マージする運用を前提にしない。初期導入は固定ZIPを受け渡し、GitLab側の作業ブランチで配置・差分確認する。

初期導入・共通実装の配布はPHP・テンプレートを含む一式。原稿・シーン画像だけの配布は [差分配布手順](CONTENT-DELIVERY.md) に従う。一式の導入処理はdry-run・導入済みハッシュとの照合・競合停止・削除対象の表示に対応する。公開承認、配布前検証、取り込み手順は [制作・配布運用](OPERATIONS.md) を参照する。

## 導入担当

現在の導入指定版は `deliveries/release-2026-10-16/miraiSceneShinronavi20261016.zip`。19体験・57シーンと2026-10-16時点の共通実装を収録する。ZIP内のINSTALL.md・VALIDATION.md・運用マニュアルと、隣のmanifest.jsonを渡す。固定配布物は指定版で保管する。

通常の `build:shinronavi` が更新する `integrations/shinronavi/output/latest.json` は制作側の最新ビルドを示す。配布対象は日付・版を明記したdeliveries内のZIPで指定する。配布設定は `config/delivery.json`。`npm run release:package` でZIPと照合manifestを生成する。

ZIPは大容量の生成物のためGit対象外。manifestと手順はGitで管理する。別PCで導入作業する際は固定ZIPを別途共有し、manifestのSHA-256と照合する。Gitをcloneしただけでは固定ZIPは付属しない。

PowerShellで `Get-FileHash deliveries/release-2026-10-16/miraiSceneShinronavi20261016.zip -Algorithm SHA256` を実行してmanifest.jsonと照合する。ハッシュが違う場合はそのまま導入せず、対象版を確認する。

初期導入中に修正が必要になった場合も、このZIPへ上書きせず別の版を指定し、収録内容と適用手順を明記する。本番配置・rewrite・実際の進路ナビとの併存確認はINSTALL.mdに従う。

## コンテンツ制作担当

仕様書は [CONTENT-SPEC.md](CONTENT-SPEC.md)。進行状況は [CONTENT-BATCHES.md](CONTENT-BATCHES.md)。当面は1回2〜5体験で、内容と仕様を確認してから次のバッチへ進む。

1. `drafts/batch-001/` などに原稿を作る。各体験を完成したJSONとして保存し、コピー元の説明や出典が残っていないか確認。
2. `npm run content:verify-drafts -- batch-001` で公開元とは別の一時プロジェクトに下書きを加えてビルドする。結果の場所はコマンド出力を参照。元のsrc・dist・導入ZIPは変更しない。
3. 文章・SP画面・学びのつながりを確認する。機械チェックの成功を内容承認や監修と扱わない。
4. 内容確認済みの原稿だけを `src/content/careers/` へ移す。同名ファイルに上書きしない。台帳を更新し、`npm run content:verify` を実行。
5. config/delivery.jsonに未使用の配布版を設定し、公開承認と検証を完了してから `npm run build:shinronavi` を実行し、新しい日付・版のZIPを作る。初期導入の固定ZIPは変更しない。JSON単独では配置しない。共通実装が一致する場合は差分パッケージ、それ以外は一式を配置する。

確認用Excelは `npm run content:export-review -- --batch batch-001` で下書き、`--ids designer,engineer` で指定原稿を対象にできる。引数なしは公開元全件。連携設定も含む。記入済み確認結果の自動移行・自動取り込みはない。

自動で定期生成・公開する設定はしていない。制作を続ける際は台帳から次の少量バッチを進める。

## 原稿・確認資料のZIP

制作内容を部署間で確認するときは、全件の二段階確認を記録し、`content:verify-review` と `content:verify-drafts` を実行した後、次を実行する。

```text
npm run content:package-drafts -- batch-002
```

確認記録と原稿を照合して原稿一覧・回答確認表・職種確認表を生成し、原稿JSON・自社資料の原文とともにZIPへ収録する。Windows PowerShellが必要。出力は `outputs/contentReview/<batch-id>/<UTC日時>/`。ZIP内全ファイルとmanifestを照合し、既存ZIPは上書きしない。展開後は `drafts/<batch-id>/manuscript.html` を開く。確認記録は `review/occupationChecks.json` が正本で、Markdownの確認表は生成物。

このZIPは原稿と確認資料の受け渡し用。進路ナビへ配置する生成HTML・一覧・接続部品の配布は、一式またはコンテンツ差分の手順を使う。

