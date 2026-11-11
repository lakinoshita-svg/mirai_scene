# batch-007 原稿案内

20職種・20体験・60シーン・180案の確認用下書きです。職業名だけの追加ではなく、各職種の対象物・関係者・成果物を持つ3シーンを用意しています。

[原稿一覧](manuscript.html) ／ [制作・確認記録](REVIEW.md) ／ [収録範囲](review/coverage.md) ／ [根拠対照表](review/sourceEvidence.md) ／ [画像一覧](review/imageAssets.md) ／ [職種確認表](review/occupationChecks.md) ／ [180案の回答確認表](review/answerChecks.md)

| 原稿 | 題材 | カテゴリー | 学びID |
|---|---|---|---|
| [医師（内科医）](physician-consultation-story.json) | 「なんとなく不調」を、診察の手がかりに。 | 医療 | medicine |
| [看護師](nurse-rest-environment.json) | 「休めない」の理由を、一緒に探す。 | 医療 | nursing |
| [薬剤師](pharmacist-medication-conversation.json) | 薬の説明を、その人の言葉へ。 | 医療 | pharmacy |
| [介護福祉士](care-worker-daily-choice.json) | 手伝う前に、「どうしたい？」。 | 福祉 | welfare |
| [医療事務](medical-clerk-visit-guidance.json) | 初めての受診を、迷わず進める。 | 医療事務 | medical-administration |
| [材料研究者（高分子）](materials-research-test-conditions.json) | その違いは、材料のせい？ | 研究 | materials |
| [機械設計技術者](mechanical-designer-cart-handle.json) | 運びやすさを、形から考える。 | 機械・製造 | mechanical |
| [自動車整備士](auto-mechanic-sound-inspection.json) | 「いつもと違う音」を、点検につなぐ。 | 自動車 | automotive |
| [食品メーカー営業](food-sales-store-proposal.json) | 売りたい商品を、お店の提案へ。 | 営業 | business |
| [IT営業](it-sales-workflow-proposal.json) | 「便利にしたい」を、提案にする。 | 営業 | business・it |
| [不動産営業](real-estate-sales-home-priorities.json) | 「駅近がいい」の、その先を聞く。 | 営業 | real-estate |
| [経理担当者](accountant-payment-reconciliation.json) | 同じ金額なら、同じ取引？ | 事務 | accounting |
| [人事担当者](hr-new-employee-orientation.json) | 初めて働く人の、「聞けない」を減らす。 | 事務 | business |
| [銀行窓口担当者](bank-teller-procedure-guidance.json) | お金の手続きを、確かに案内する。 | 金融 | finance |
| [弁護士](lawyer-consultation-facts.json) | 言い分の中から、事実をたどる。 | 法律 | law |
| [航空整備士](aircraft-mechanic-maintenance-handover.json) | 次の整備へ、確かな記録を渡す。 | 航空 | aviation |
| [ファッションデザイナー](fashion-designer-apron-pockets.json) | 着る人の動きから、服の形へ。 | 服飾 | fashion |
| [小学校教諭](primary-teacher-fraction-explanation.json) | 答えの前に、考え方を聞いてみる。 | 教育 | education |
| [地方公務員（市区町村の行政事務）](municipal-officer-waste-guidance.json) | 同じ案内を、いろいろな暮らしへ。 | 公務 | public-service |
| [スポーツインストラクター](sports-instructor-beginner-session.json) | 「やってみたい」を、続けやすい体験へ。 | スポーツ | sports |

## 内容を確認する方へ

1. 原稿一覧をブラウザで開き、読みたい職業を選びます。画像も原稿内に表示します。
2. 状況・問い・3案・共通解説・各案の説明／良い点／懸念点・振り返りを読みます。
3. 指摘は「職業・シーン番号・案A/B/C・該当文・理由・確認者」を添えて制作担当に返してください。JSONを直接操作する必要はありません。

職種照合と原稿通読は同一担当の二段階の自己確認です。独立レビュー、実務経験者の確認、高校生の試読、公開承認は未実施。reviewStatusは全件editorial-draftです。

## 制作担当の確認と取り込み

原稿JSONが正本です。閲覧用HTMLはJSONから生成します。

```powershell
npm run content:verify-review -- batch-007
npm run content:verify-drafts -- batch-007
npm run content:export-drafts -- batch-007
```

この20件は17件の学び定義を使用します。取り込み先にはsrc/data/learningLinks.jsonの該当定義と、src/data/schoolAds.jsonの15カテゴリー定義が必要です。広告枠は空配列で、広告の掲載はありません。画像は[画像一覧](review/imageAssets.md)の参照先を一緒に扱います。

原稿と画像だけの差分配布は、共通設定が導入先と一致することが前提です。[連携仕様](../../LEARNING-LINKS.md)・[担当別手順](../../docs/DELIVERY-AND-CONTENT.md)に従い、共通設定を先に取り込み・検証してください。下書きを置いただけでは公開されません。公開元19体験、GitHub表示用設定61体験、初期導入固定版は別管理です。
