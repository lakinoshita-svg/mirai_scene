# カード画像の追加・編集

## 現在の4テーマ

`src/data/interests.json` が、興味の絞り込みとカード画像の共通設定です。
職業JSONの `cardTheme` でカードに使う画像を1つ選びます。
一覧の4テーマの絞り込みにも `cardTheme` を使います。選んだテーマとカード画像が必ず一致します。
`interests` は関連体験の候補選びに使う複数タグです。一覧のテーマ絞り込みには使いません。広告用の `category` とは独立しています。

## 5つ目を追加する

1. `public/assets/interests/` に画像を追加します。原稿は480×320（3:2）推奨です。
2. `src/data/interests.json` に以下のように1件追加します。
3. 対象の職業JSONの `cardTheme` を `nurture` にします。画像と一覧の絞り込みが同時に切り替わります。関連体験の候補選びにも使う場合は `interests` にも追加します。
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

一覧カードの画像はテーマで共通管理します。場面画像・比較画像、FVの3枚の写真はそれぞれの用途で管理します。
