# シーン画像

7ファイル・6シーン。batch-007に5ファイル・4シーン、batch-006に2ファイル・2シーン。共通カード画像は既存4テーマを使います。

形・配置・比率が判断材料になる場面に画像を使います。会話や手順を選ぶ場面には飾りの写真を増やしません。SVGは数値や図の比率を制御するためにコードで作図し、洗濯板は画像生成を使用しています。

| 画像 | 使用箇所 | 伝えること | 作成方法 |
|---|---|---|---|
| [materialsTestConditions.svg](../../../public/assets/scenes/materialsTestConditions.svg) | batch-007／材料研究者／scene-1 | 厚さ1mmと2mmという比較条件の違い | SVG |
| [cartHandleConcepts.svg](../../../public/assets/scenes/cartHandleConcepts.svg) | batch-007／機械設計／scene-2 | 横棒と左右の縦棒という持ち手の形 | SVG |
| [fractionPaperStrips.svg](../../../public/assets/scenes/fractionPaperStrips.svg) | batch-007／小学校教諭／scene-1 | 同じ長さを2等分・3等分した図 | SVG |
| [apronPocketCenter.svg](../../../public/assets/scenes/apronPocketCenter.svg) | batch-007／服飾／scene-2 | 中央のポケット案 | SVG |
| [apronPocketSides.svg](../../../public/assets/scenes/apronPocketSides.svg) | batch-007／服飾／scene-2 | 左右のポケット案 | SVG |
| [leafletFoldLayout.svg](../../../public/assets/scenes/leafletFoldLayout.svg) | batch-006／デザイナー／scene-2 | 文字と折り目が重なる内側の配置 | SVG |
| [museumReplicaWashboard.png](../../../public/assets/scenes/museumReplicaWashboard.png) | batch-006／博物館／scene-1 | 木枠と溝を観察する複製洗濯板のイメージ | 画像生成 |

確認日：2026-11-10。7点すべてを画像として表示し、切れ・図と本文の対応を目視確認しています。比較図は設計・製作図ではありません。分数図の全体の長さは同じで、1/2と1/3を正しい比率で表示します。洗濯板は生成した教材用イメージで、実物の資料写真とは表示しません。画像だけで機能・安全性や性能を断定する問いにはしません。

## 洗濯板画像の生成指示

Use case: scientific-educational. Asset type: one illustration for a Japanese high-school career-experience exercise about a museum educator helping visitors observe a replica, not a decorative hero. Primary request: a single very clear realistic studio photograph-style illustration of a teaching replica of a traditional wooden washboard (rectangular wooden frame, a panel of many evenly spaced horizontal rounded ridges, two short feet at bottom), lying at a slight diagonal on a clean light ivory museum classroom table. The entire one object visible, close-up, natural pale wood, soft daylight, simple neutral background. Its ridged washing surface and frame must be legible on a smartphone. No people, no hands, no other tools, no historical claims, no signs, no Japanese or English letters, no logos, no arrows, no dimensions, no graphic overlay. Landscape 3:2. This is a fictional educational replica illustration, not a historical artifact photograph. Tight useful composition with only modest margins. Do not include a tub or water.
