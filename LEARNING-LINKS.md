# 教材・学校検索との接続

## 処理の分担

- `src/data/learningLinks.json`：編集する対応表。
- `src/lib/learningLinks.ts`：データ検証と教材・学校検索のURL生成。
- `src/lib/lessonConnections.mjs`：教材から学び・職業への逆引き生成。公開用と教材側の同期で共用。
- `src/lib/integrationLinks.ts`：Astroの公開URL設定を適用したリンク生成。
- `scripts/syncInquiryLinks.mjs`：教材側の教材存在確認と生成JSONの書き出し。`npm run sync:inquiry` で実行。
- `src/components/experienceSummary.astro`：完了画面全体。振り返りは `experienceReflection.astro`、学びへの案内は `experienceLearning.astro` が担当。

## 編集する場所

`src/data/learningLinks.json` が対応表です。学びの `id` ごとに教材の `slug`・表示名・学校種と、学校検索の `schoolFields`（分野ID・表示名）を定義します。各職業JSONの `learningIds` で参照します。複数の職業や体験から同じ学びを参照でき、逆方向の関連体験はこの設定から自動抽出します。

学校検索は `https://shinronavi.com/search/result` に `fld[]` を繰り返し指定します。URLは `URLSearchParams` で生成し、分野IDの重複を除きます。地域・学校種の絞り込みは検索先で行います。表示テーマや広告のカテゴリーとは別の関連付けです。

外部サービスの分野ID・教材slugは推測で作りません。デザインの `Q-306`・`C-306` は公開検索で条件保持の確認記録があります。batch-007が参照する17件の学び定義は、提供された本体の `295_master_smallfields.sql` と教材データに照合しています。[照合記録](drafts/batch-007/review/schoolFieldEvidence.json)は2026-11-10時点の対象と根拠を保持します。この17件の本番検索での選択状態は未確認で、公開前に確認が必要です。

共通の学び定義は33件です。学び定義があるだけで職業原稿が公開済みになるわけではありません。公開元と表示用バッチの選択は別に管理します。

## 利用者の導線

- 一覧 → 学びの分野一覧 `/explore/` → 分野ページ → 学習教材／関連するミライシーン。
- シーン開始画面 → 関連分野ページ。完了前でも教材へ移動可能。
- シーン完了画面 → 関連分野ページ、または分野指定済みの学校検索結果。
- 分野ページから教材は別タブで開くため、元の関連体験一覧へ戻れます。
- ガイダンス参加やログインを前提にしません。

## 進路ナビの教材ページ側への設置（本体側で反映が必要）

ミライシーンの公開後、教材の共通テンプレートの教材末尾に次のタグを設置します。対応する `slug` の場合だけ関連する分野ページへのリンクを表示します。未対応の教材では何も表示しません。

```html
<script defer src="https://lakinoshita-svg.github.io/mirai_scene/integration/explore-widget.js"></script>
```

URLに `slug` がない埋め込み先では `data-lesson="art_design"` のように指定できます。生成スクリプトは共通JSONから作られ、外部の教材本文を書き換えず、タグの直後にリンクを追加します。スタイルは設置先の `.mirai-scene-links` に適用できます。設置先のCSPで許可が必要な場合は管理者が確認してください。

JSを使わずリンクを設置する場合は、ビルドで生成される `integration/lesson-links.json` の `lessonSlug` と `miraiUrl` を利用してください。リンク先はAstroの `site` と `base` から生成されます。公開先を変える場合は両設定を変更して再ビルドします。

進路ナビ本体の提供コードは、このリポジトリとは別のフォルダーで参照します。教材の連携用コードは `integrations/inquiry/` にあります。ローカルの連携データ生成と、進路ナビ本番へのタグ設置・公開作業は別工程です。導入先のURL・CSP・共通テンプレートに合わせて設置してください。

## 新しい分野を持つ原稿の取り込み

原稿の `learningIds` が取り込み先の対応表に存在することを先に確認します。存在しない場合は共通設定を取り込み、教材slugと学校分野IDを照合してからビルドします。広告カテゴリーも共通設定の `src/data/schoolAds.json` に定義します。空配列は広告掲載なしを意味します。

batch-007は17件の学び定義と15件の広告カテゴリー定義を使用します。既存導入先への「原稿JSON・シーン画像だけ」の配布では、この依存設定を取り込めません。[担当別手順](docs/DELIVERY-AND-CONTENT.md)と[コンテンツ配布](docs/CONTENT-DELIVERY.md)に従い、共通設定を含む一式の導入を先に行い、基準を一致させてください。初期導入固定版は独立して保持します。

## 対応付けの範囲

学びとの関係は編集上の関連で、資格取得・就職を保証しません。司書・学芸員は文学・文化・歴史、物流・商品企画は経営・商学など関連する学びへ案内しています。特定の養成課程に一致するという意味ではありません。複数分野へ分ける場合は学びレコードを追加し `learningIds` を増やします。
