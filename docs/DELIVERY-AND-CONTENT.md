# 初期導入とコンテンツ制作を分ける

## リポジトリの境界

ミライシーンの制作元はGitHub、進路ナビ本体は別サービスのGitLabで管理する。GitHub側のコミットをGitLabへ直接マージする運用を前提にしない。初期導入は固定ZIPを受け渡し、GitLab側の作業ブランチで配置・差分確認する。

今後はコンテンツ更新専用のパッケージ、追加・変更・削除一覧、対応する導入仕様版、取り込み先の独自変更の検出を整える方針。ただしこれらの更新専用処理は未実装。現在の `build:shinronavi` はPHP・テンプレート等を含む一式を出力するため、「コンテンツだけを安全に自動更新できる」と案内しない。機能・接続設定の変更は原稿更新と区別して受け渡す。

## 導入担当

現在の導入指定版は `deliveries/release-2026-10-06/miraiSceneShinronavi20261006.zip`。19体験・57シーンと2026-10-06時点の共通実装を収録する。ZIP内のINSTALL.md・VALIDATION.md・運用マニュアル・RELEASE-NOTES.mdと、隣のmanifest.jsonを渡す。旧 `deliveries/initial-2026-10-02/` は復元・比較用に保持する。

通常の `build:shinronavi` が更新する `integrations/shinronavi/output/latest.json` は制作側の最新ビルドを示す。配布対象は日付・版を明記したdeliveries内のZIPで指定する。旧固定ZIPは変更せず、修正版を別名で作成した。

ZIPは大容量の生成物のためGit対象外。manifestと手順はGitで管理する。別PCで導入作業する際は固定ZIPを別途共有し、manifestのSHA-256と照合する。Gitをcloneしただけでは固定ZIPは付属しない。

PowerShellで `Get-FileHash deliveries/release-2026-10-06/miraiSceneShinronavi20261006.zip -Algorithm SHA256` を実行してmanifest.jsonと照合する。ハッシュが違う場合はそのまま導入せず、対象版を確認する。

初期導入中に修正が必要になった場合も、このZIPへ上書きせず修正版を別名で作成し、変更点を明記する。本番配置・rewrite・実際の進路ナビとの併存確認はINSTALL.mdに従う。

## コンテンツ制作担当

仕様書は [CONTENT-SPEC.md](CONTENT-SPEC.md)。進行状況は [CONTENT-BATCHES.md](CONTENT-BATCHES.md)。当面は1回2〜5体験で、内容と仕様を確認してから次のバッチへ進む。

1. `drafts/batch-001/` などに原稿を作る。各体験を完成したJSONとして保存し、コピー元の説明や出典が残っていないか確認。
2. `npm run content:verify-drafts -- batch-001` で公開元とは別の一時プロジェクトに下書きを加えてビルドする。結果の場所はコマンド出力を参照。元のsrc・dist・導入ZIPは変更しない。
3. 文章・SP画面・学びのつながりを確認する。機械チェックの成功を内容承認や監修と扱わない。
4. 内容確認済みの原稿だけを `src/content/careers/` へ移す。同名ファイルに上書きしない。台帳を更新し、`npm run content:verify` を実行。
5. 更新を配布するタイミングで `npm run build:shinronavi` を実行し、新しい日付・版のZIPを作る。初期導入の固定ZIPは変更しない。JSON単独の差し替えではなく、生成された一式で更新する。

現行Excel出力はsrc/content/careersと連携設定が対象で、draftsを直接は含まない。下書き確認はJSON・隔離プレビューで行う。別部署へExcelで確認を回す場合は、隔離プロジェクトへexportスクリプトをコピーして出力するなど、公開元へ未確認原稿を混ぜない手順を選ぶ。

自動で定期生成・公開する設定はしていない。制作を続ける際は台帳から次の少量バッチを進める。

## 2026年10月7日の未配布変更

名詞としての「探究」を画面と現行資料から置き換えた。10月6日付の固定ZIPは当時の内容を保持し、この用語変更を含まない。次回配布時に最新コードから別版を生成する。

