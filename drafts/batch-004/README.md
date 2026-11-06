# batch-004 原稿案内

10体験・30シーン・90案。各シーンに共通解説と個別の振り返り文、各案に説明・良い点・懸念点を持つ確認用下書きです。

[原稿一覧を読む](manuscript.html) ／ [制作・確認記録](REVIEW.md) ／ [根拠対照表](review/sourceEvidence.md) ／ [職種確認表](review/occupationChecks.md) ／ [90案の回答確認表](review/answerChecks.md)

| JSON | 職業 | 題材 | 主テーマ |
|---|---|---|---|
| [animal-keeper-feeding-enrichment](animal-keeper-feeding-enrichment.json) | 動物園飼育員 | 餌を探す時間を、暮らしの工夫に。 | support |
| [farmer-planting-plan](farmer-planting-plan.json) | 農業生産者 | 一本の苗から、作業を組み立てる。 | discover |
| [logistics-picking-layout](logistics-picking-layout.json) | 物流プランナー | 棚から集める、その動きを考える。 | solve |
| [librarian-storytime-preparation](librarian-storytime-preparation.json) | 図書館司書 | 絵本の時間を、みんなに届く形へ。 | support |
| [museum-curator-collection-loan](museum-curator-collection-loan.json) | 博物館学芸員 | 収蔵品を、次の展示へつなぐ。 | discover |
| [product-developer-customer-use](product-developer-customer-use.json) | 商品企画担当 | 発売後の「使いにくい」を、次の企画へ。 | solve |
| [game-planner-tool-choices](game-planner-tool-choices.json) | ゲームプランナー | 道具を選ぶことも、遊びにする。 | make |
| [engineer-duplicate-submission](engineer-duplicate-submission.json) | Webエンジニア | 一度の申し込みを、一件で受け取る。 | solve |
| [childcare-block-town](childcare-block-town.json) | 保育士 | 積み木の道から、遊びが広がる。 | support |
| [video-producer-location-sound](video-producer-location-sound.json) | 映像ディレクター | まちの空気を、音と映像で。 | make |

## 確認の状態

自社原文と一次資料による職種・業務の照合、設問と全回答の整合を同一Codexで二巡確認しています。別担当者の独立レビュー、実務経験者による確認、高校生の読解・所要時間の確認、公開承認は未実施です。全件のreviewStatusはeditorial-draftです。

隔離ビルド、全10体験の完了までの操作、全90案と振り返り30文、学校検索の分野IDを確認しています。[画面確認記録](review/displayChecks.json)と[制作・確認記録](REVIEW.md)に、確認幅と対象範囲を保持します。

今回は観察・記録・ルール・構成の方針を選ぶ内容で、画像や音声そのものの差を評価する設問はありません。新しい比較画像や音声素材は使用しません。カードの画像は既存の4テーマの共通素材です。

## 確認コマンド

```powershell
npm run content:verify-review -- batch-004
npm run content:verify-drafts -- batch-004
npm run content:export-drafts -- batch-004
npm run content:package-drafts -- batch-004
```

## 別部署での確認

1. ZIPを展開し、このフォルダのmanuscript.htmlをブラウザで開きます。JSONの操作は不要です。
2. 職業の役割、状況と質問、三つの案と各解説、体験後の振り返りを読みます。資料の裏付けは根拠対照表、各案の成立条件は回答確認表で確認できます。
3. 気になる箇所は、職業名・題材・シーン番号・回答のA/B/C、該当する文章、気になる理由を添えて制作担当へ返します。表現案や参照資料があれば一緒に渡します。
4. 内容の確認者名、確認日、確認範囲、未確認の点を記録します。実務経験者の確認と、掲載してよいかの判断はそれぞれ記録します。

原稿JSONは制作元、HTMLと確認表は閲覧用です。確認結果をJSONへ自動で反映する機能はありません。公開・配布の手順は、制作元リポジトリのdocs/DELIVERY-AND-CONTENT.mdを参照します。

公開元19体験、別バッチ、初期導入の固定ZIPはこのバッチの制作対象に含みません。
