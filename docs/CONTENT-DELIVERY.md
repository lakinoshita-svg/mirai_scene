# コンテンツの差分配布

制作元GitHubと進路ナビ本体GitLabの間で、承認済みの仕事体験を受け渡す手順。ZIPは配布物で、編集元は原稿JSONとシーン画像。

## 利用できる条件

- 原稿と `public/assets/scenes/` の画像だけが異なること。共通コード、依存パッケージ、接続設定が異なる場合は一式で導入する。
- 実際に配置済みの一式に付属する `buildManifest.json` を基準として保管していること。`runtimeHash` のないmanifestは差分配布に使えないため、一式の導入が必要。
- 公開元の全原稿に公開承認があり、ソース検証・生成物照合が成功していること。

配布対象は生成HTML、一覧JSON、連携JSON、原稿由来のJS・CSS、シーン画像の差分。PHP・共有ヘッダー・rewrite・共有サイトマップの設定は含めない。削除した原稿の生成ページも削除対象となるため、URLの移転・公開終了対応は別途確認する。

## 制作担当

1. 未使用の配布版を `config/delivery.json` に設定する。
2. 原稿の公開承認を記録し、`npm run content:verify` と `npm run build:shinronavi` を順に実行する。
3. 配置済み版のmanifestを指定し、対象を確認する。

```text
npm run release:content -- --baseline "配置済み版/buildManifest.json" --plan
```

4. 差分ZIPを作る。内部で配布前検証を行う。

```text
npm run release:content-zip -- -Baseline "配置済み版/buildManifest.json"
```

`deliveries/配布版-content/` のZIPと隣の `manifest.json` を渡す。同名ZIPは上書きしない。`--plan` は対象確認のみで、配布承認の代わりにはならない。差分がない場合はZIPを作らない。

## 進路ナビの導入担当

1. ZIPのSHA-256を隣のmanifestと照合し、公開ルート外へ展開する。Node.js 22.12以上を使用する。
2. GitLabの作業ブランチで次を実行する。

```text
node installContent.mjs "進路ナビのプロジェクトルート" --dry-run
node installContent.mjs "進路ナビのプロジェクトルート"
```

3. 表示された追加・置換・削除対象とGitLabの差分を確認する。対象原稿の一覧・体験・完了画面、画像、学校検索、教材リンクを確認する。
4. 本番配置完了後、ZIP内の `buildManifest.json` を次回の基準として保管する。運営一覧の `deployedRelease` へ実際の配置版を記入する。

導入先の管理対象ファイルを基準と照合し、独自調整・不足・追加先の衝突があれば書き込み前に停止する。基準を現行ファイルから作り直して回避しない。導入担当が差分を確認し、必要なら一式で結合する。同じパッケージの再実行は配置済みの内容と一致すれば書き込まない。

## 復旧と制約

書き込み前にプロジェクト外の `miraiContentBackup-…` へ対象ファイルと `restoreManifest.json` を退避する。処理中の例外では書き込み済みファイルを復元する。手動復旧はmanifestの `existed:true` を退避元から戻し、`existed:false` の追加ファイルを配置先から除く。`installState.php` も復旧対象。

プロセス強制終了やサーバー停止に対する一括切り替えは保証しない。本番は保守時間帯またはGitLab側のデプロイ機構で配置し、復旧手段を用意する。外部の更新処理と同時実行しない。ハッシュ照合は整合性確認で、配布元の電子署名ではない。
