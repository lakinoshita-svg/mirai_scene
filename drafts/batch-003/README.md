# batch-003 原稿案内

10体験・30シーン・90案。各案に説明・良い点・懸念点があり、全シーンに共通解説と個別の振り返り文を持ちます。公開元に入れる前の確認用下書きです。

[原稿一覧を読む](manuscript.html) ／ [制作・確認記録](REVIEW.md) ／ [根拠対照表](review/sourceEvidence.md) ／ [職種確認表](review/occupationChecks.md) ／ [90案の回答確認表](review/answerChecks.md)

| JSON | 職業 | 題材 | 主テーマ |
|---|---|---|---|
| [designer-shop-card](designer-shop-card.json) | グラフィックデザイナー | 小さなカードに、お店らしさを。 | make |
| [architect-entry-storage](architect-entry-storage.json) | 建築士 | 玄関から、暮らしの動きを考える。 | solve |
| [chef-consistent-service](chef-consistent-service.json) | 料理人 | 同じ一皿を、チームで届ける。 | make |
| [web-designer-mobile-guide](web-designer-mobile-guide.json) | Webデザイナー | 小さな画面に、迷わない入口を。 | make |
| [editor-source-numbers](editor-source-numbers.json) | 編集者 | その数字、何を表している？ | make |
| [tourism-budget-breakdown](tourism-budget-breakdown.json) | 旅行プランナー | 旅の予算に、何が入っている？ | discover |
| [event-planner-participation-guide](event-planner-participation-guide.json) | イベントプランナー | 初めての人にも、参加の入口を。 | support |
| [pastry-seasonal-fruit](pastry-seasonal-fruit.json) | パティシエ | 季節の果物を、主役にする。 | make |
| [data-scientist-survey-scope](data-scientist-survey-scope.json) | データサイエンティスト | アンケートの数字を、どう読む？ | solve |
| [beauty-color-consultation](beauty-color-consultation.json) | 美容師 | 「明るい色」を、同じイメージへ。 | support |

## 確認の状態

出典本文と職種・業務の対応、設問と全回答の整合を同一Codexで二巡確認しています。独立した別担当者のレビュー、実務経験者による確認、高校生による読解・所要時間の確認、公開承認は未実施です。全件のreviewStatusはeditorial-draftです。

比較図はpublic/assets/scenesのshopCardNameFocus.svg・shopCardIllustrationFocus.svg・mobileGuideAtmosphere.svg・mobileGuideDetails.svgの四枚です。原稿一覧の画像はリポジトリ内の相対パスで参照します。

## 確認コマンド

```powershell
npm run content:verify-review -- batch-003
npm run content:verify-drafts -- batch-003
npm run content:export-drafts -- batch-003
```

公開元19体験、既存の別バッチ、初期導入の固定ZIPはこのバッチの制作対象に含みません。確認後の公開・配布は[担当別手順](../../docs/DELIVERY-AND-CONTENT.md)に従います。
