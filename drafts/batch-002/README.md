# batch-002：10体験の下書き

[原稿一覧](manuscript.html)は文章を読むためのHTMLです。[職種と内容の二段階チェック](review/occupationChecks.md)と[90案の回答確認表](review/answerChecks.md)では、全30シーンの判断理由を確認できます。[資料・確認範囲](REVIEW.md)も併読してください。

全10体験・30シーン・90選択肢。資料と業務範囲の照合、原稿全体の整合の二段階を同一Codexが確認しています。実務経験者の確認・公開承認は未実施です。JSONが原稿の正本です。

| 職業 | 原稿 | シーン |
|---|---|---|
| Webエンジニア | [「探したのに、出てこない」をほどく。](engineer-search-language.json) | 「水筒」では、見つからない。 ／ 本体と部品を、どう見分ける？ ／ 想定した商品が、ちゃんと出る？ |
| Webエンジニア | [必要なお知らせだけ、届けたい。](engineer-event-notifications.json) | 毎日届くと、読まなくなる？ ／ 設定を保存した、そのあと。 ／ 設定の保存と、配信準備が重なったら。 |
| Webエンジニア | [途中で閉じても、続きから。](engineer-save-progress.json) | 書きかけの文章を残したい。 ／ スマホとパソコン、どちらの文？ ／ 保存と応募を、取り違えないために。 |
| ゲームプランナー | [ふたりで遊ぶ意味を、つくる。](game-planner-cooperative-roles.json) | 一人だけが、全部決めている。 ／ 片方が止まると、もう片方は？ ／ 二人とも楽しめたか、知りたい。 |
| ゲームプランナー | [物語の選択に、手応えを。](game-planner-story-choices.json) | 届け先は同じ。でも途中は？ ／ 何を選ぶか、想像できる？ ／ プログラマーへ、分岐を伝える。 |
| 保育士 | [雨の日の「聞こえた！」を遊びに。](childcare-rain-sounds.json) | 「雨が太鼓みたい」と言った。 ／ 楽しい音と、静かにしたい気持ち。 ／ 翌日の遊びへ、何を残す？ |
| 保育士 | [「自分でやりたい」を支える。](childcare-getting-ready.json) | 袖が通らない。でも自分で。 ／ 帰ってきたら、上着はどこへ？ ／ 今日は「手伝って」と言った。 |
| 映像ディレクター | [話した人の思いを、短い映像へ。](video-producer-interview.json) | 十分の話を、一分に。 ／ 「使えます」だけを残してよい？ ／ 本人に、何を確かめてもらう？ |
| 映像ディレクター | [手仕事の「なるほど」を届ける。](video-producer-craft-process.json) | 完成品はきれい。でも何が工夫？ ／ 一日の撮影で、全部は撮れない。 ／ 初めて見る人には、何が残った？ |
| 美容師 | [大切な日に、安心して出かけられるように。](beauty-event-preparation.json) | 本番は午後。今はどう過ごす？ ／ 別の美容師へ、どう引き継ぐ？ ／ 「大丈夫です」のあとに、もう一つ。 |

## 原稿を渡す手順

1. 制作引き継ぎガイドに従い、全件の職種・業務範囲と原稿全体の整合を二巡確認します。
2. review/occupationChecks.jsonへシーン別の根拠・判定と対象原稿のSHA-256を記録します。確認せずにハッシュだけを合わせないでください。
3. 次のコマンドを順に実行します。

```text
npm run content:verify-review -- batch-002
npm run content:verify-drafts -- batch-002
npm run content:export-drafts -- batch-002
```

確認記録が不足している、未確認の判定がある、原稿と確認対象が異なる場合はHTMLを書き出せません。失敗時には既存のHTMLが残るため、そのファイルを今回の原稿として渡さないでください。

構造検証・記録照合は内容の正確性を自動保証しません。公開元への移動と配布ZIPは別工程です。

## 確認資料をZIPで渡す

Windowsで `npm run content:package-drafts -- batch-002` を実行します。原稿一覧と確認表を生成し、10件のJSON・確認記録・自社原文をZIPへまとめます。出力は `outputs/contentReview/batch-002/<UTC日時>/`。ZIPとmanifest.jsonを一緒に渡してください。

編集元は職業JSONと `review/occupationChecks.json` です。`manuscript.html`、`review/answerChecks.md`、`review/occupationChecks.md` は生成物。資料の出典・未確認事項は `REVIEW.md` に記録します。
