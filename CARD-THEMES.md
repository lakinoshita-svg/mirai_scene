# カード画像の追加・編集

## 現在の4テーマ

`src/data/interests.json` が、興味の絞り込みとカード画像の共通設定です。
職業JSONの `cardTheme` でカードに使う画像を1つ選びます。
`interests` は絞り込み用なので複数指定できます。広告用の `category` とは独立しています。

## 5つ目を追加する

1. `public/assets/interests/` に画像を追加します。原稿は480×320（3:2）推奨です。
2. `src/data/interests.json` に以下のように1件追加します。
3. 対象の職業JSONの `cardTheme` を `nurture` にし、絞り込みにも使う場合は `interests` に追加します。
4. ビルド・テスト後に再公開します。

```json
{
  "id": "nurture",
  "label": "育てる・守る",
  "image": "assets/interests/nurture.svg",
  "color": "#E7F3EB",
  "ink": "#3D7C62"
}
```

コンポーネント、CSS、絞り込み処理にテーマ数の上限やテーマ別の分岐はありません。未登録テーマ・重複ID・画像不足はビルドで検出します。

## Figma原稿

[編集用ページ](https://www.figma.com/design/Qs575HHeLxhbfPWFZrBw5D/?node-id=19-22)

| テーマ | 原稿ノード | 配置ファイル |
|---|---|---|
| つくる・表現する | 19:25 | public/assets/interests/make.svg |
| 人の役に立つ | 19:34 | public/assets/interests/support.svg |
| しくみを考える | 19:43 | public/assets/interests/solve.svg |
| 知らない世界に触れる | 19:53 | public/assets/interests/discover.svg |

背景はフレームの塗り、文字はテキストレイヤー、イラストはベクターレイヤーとして編集できます。画像原稿のフレームをSVGで書き出し、対応するファイルを差し替えて再ビルドします。Figmaの変更がサイトに自動反映される仕組みではありません。

今回統一したのは一覧カードの画像のみです。体験中に使う場面画像・比較画像、FVの3枚の写真はそれぞれの役割を保っています。
