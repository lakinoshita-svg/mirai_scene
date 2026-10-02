# batch-001：追加体験の初回確認

仕様v1に沿った2体験（6シーン・18選択肢）。どちらも追加題材で、初期導入の19体験には含めていません。既存の学び・カテゴリー・共通画像を使い、導入コードや設定の追加は不要です。

| ファイル | 体験 | 区別したい仕事の視点 |
|---|---|---|
| engineer-reservation-capacity.json | 最後の1席、どう受け付ける？ | 同時予約の調査、満席時の案内、公開前の確認 |
| librarian-local-research.json | まちの「昔」を、資料からたどる。 | 調べる問い、資料の時期と範囲、根拠の記録 |

背景資料：[Webサービス開発](https://shigoto.mhlw.go.jp/User/Occupation/Detail/314)、[図書館司書](https://shigoto.mhlw.go.jp/User/Occupation/Detail/182)。仕事の背景を参考にした独自の場面であり、掲載事例の転載や監修済み原稿ではありません。

検証：`npm run content:verify-drafts -- batch-001`。このコマンドは本番原稿と同じスキーマで、既存19件＋下書き2件を一時コピー上でビルドします。本文の妥当性は別途確認してください。

プレビューする場合は、コマンドが表示した一時プロジェクトへ移動し、元リポジトリの `node_modules/astro/bin/astro.mjs` をNodeで実行します（`preview --host 127.0.0.1 --port 4327`）。Astroが表示したURLから各 `/careers/<slug>/` を確認できます。通常の画面と混同しないよう別ポートを使います。
