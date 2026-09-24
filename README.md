# ミライシーン

Astro＋職業別JSONで構成した、進路ナビ向けの選択型仕事体験です。静的HTMLと保存済み画像を配信し、閲覧時にAIやデータベースを呼び出しません。

## 起動・ビルド

Node.js 22.12以上（24推奨）、pnpmを使用します。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm build
pnpm test
pnpm preview
```

`pnpm test` はビルド後のページ・解説・画像やリンクを検証します。`dist/` は生成物なので直接編集しません。

## 主な編集場所

| 場所 | 内容 |
|---|---|
| `src/content/careers/*.json` | 職業ごとの文章・選択肢・解説・画像参照 |
| `src/data/interests.json` | 興味タグの定義 |
| `src/content.config.ts` | JSONの必須項目・形式・画像の検証 |
| `src/pages/` | トップ、職業別ページ、サービス説明 |
| `src/components/` | カード、場面、振り返りの共通部品 |
| `src/scripts/` | 絞り込み・選択・解説の操作 |
| `src/styles/` | デザインと配色 |
| `public/assets/` | 事前に制作した画像 |

## 職業を追加する

1. 既存の職業JSONをコピーし、新しい職業のJSONを作成します。
2. `slug` を重複しない半角英小文字・数字・ハイフンにし、`order` で表示順を指定します。
3. `interests` に興味タグ定義のIDを指定します。
4. `scenes` に3場面、各 `options` に3選択肢を用意します。
5. 画像を `public/assets/` に置き、JSONには `assets/ファイル名.png` と代替テキストを記載します。
6. 内容確認後、チェック・ビルド・テストを実行して公開します。

画像（`image`）、依頼（`mission` と `brief`）、比較画像（`comparison`）、選択の利点と注意点（`benefit` と `caution`）は必要に応じて追加できます。比較画像もJSONで管理し、画面側に職業固有の画像を埋め込みません。

必須項目、選択肢数、未定義の興味タグ、画像ファイルの不足、重複slugをビルド時に検出します。文章の妥当性は人による確認が必要です。

`reviewStatus` は確認状態の記録です。試作は `editorial-draft` も表示します。公開承認やアクセス制御の機能ではありません。

## 進路ナビ内への配置

初期設定はドメイン直下です。例えば `/mirai-scene/` に配置する場合：

```powershell
$env:ASTRO_BASE='/mirai-scene/'
pnpm build
pnpm test
```

`dist/` の中身を配置先へ配信します。職業別URLの `/careers/designer/` は該当ディレクトリの `index.html` を返す設定にします。404ページはサーバー側で `404.html` に設定してください。Node.jsはビルド時だけ必要です。

旧試作の `#career/designer` と `#about` はトップページから新URLへ案内します。回答はページ内のみで保持し、再読み込みで最初からになります。

## 現在の範囲

18職業・54シーン、興味・分野の絞り込み、画像比較、選択ごとの解説、振り返りを実装しています。確認用Sites設定を維持していますが、進路ナビ本体への配置は未実施です。

学校へのリンクは進路ナビトップです。学校データ連携、管理画面、AI一括生成、専門監修は未実装です。企画方針は `PRODUCT.md`、画像生成記録は `ASSET-PROMPTS.md` を参照してください。
