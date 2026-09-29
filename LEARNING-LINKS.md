# 探究・学校検索との接続

## 処理の分担

- `src/data/learning-links.json`：編集する対応表。
- `src/lib/learning-links.ts`：データ検証と探究・学校検索のURL生成。
- `src/lib/lesson-connections.mjs`：探究から学び・職業への逆引き生成。公開用と探究側の同期で共用。
- `src/lib/integration-links.ts`：Astroの公開URL設定を適用したリンク生成。
- `scripts/sync-inquiry-links.mjs`：探究側の教材存在確認と生成JSONの書き出し。`npm run sync:inquiry` で実行。
- `ExperienceSummary.astro`：完了画面全体。振り返りは `ExperienceReflection.astro`、学びへの案内は `ExperienceLearning.astro` に分離。

## 編集する場所

`src/data/learning-links.json` が対応表です。学びの `id` ごとに探究の `slug`・表示名・学校種と、学校検索の `schoolFields`（分野ID・表示名）を定義します。各職業JSONの `learningIds` で参照します。複数の職業や体験から同じ学びを参照でき、逆方向の関連体験はこの設定から自動抽出します。

学校検索は `https://shinronavi.com/search/result` に `fld[]` を繰り返し指定します。URLは `URLSearchParams` で生成し、分野IDの重複を除きます。地域・学校種の絞り込みは検索先で行います。表示テーマや広告のカテゴリーとは別の関連付けです。

2026-09-29に進路ナビの公開検索フォームの分野IDと、大学・短大／専門学校の探究一覧のリンクを確認。デザインの `Q-306` と `C-306` を付けた検索で、両条件が保持されることを確認しています。各リンク先の仕様変更時は対応表を更新してください。

## 利用者の導線

- 一覧 → 学びの分野一覧 `/explore/` → 分野ページ → 探究教材／関連するミライシーン。
- シーン開始画面 → 関連分野ページ。完了前でも探究へ移動可能。
- シーン完了画面 → 関連分野ページ、または分野指定済みの学校検索結果。
- 分野ページから教材は別タブで開くため、元の関連体験一覧へ戻れます。
- ガイダンス参加やログインを前提にしません。

## 進路ナビの探究ページ側への設置（本体側で反映が必要）

ミライシーンの公開後、探究の共通テンプレートの教材末尾に次のタグを設置します。対応する `slug` の場合だけ関連する分野ページへのリンクを表示します。未対応の探究では何も表示しません。

```html
<script defer src="https://lakinoshita-svg.github.io/mirai_scene/integration/explore-widget.js"></script>
```

URLに `slug` がない埋め込み先では `data-lesson="art_design"` のように指定できます。生成スクリプトは共通JSONから作られ、外部の探究本文を書き換えず、タグの直後にリンクを追加します。スタイルは設置先の `.mirai-scene-links` に適用できます。設置先のCSPで許可が必要な場合は管理者が確認してください。

JSを使わずリンクを設置する場合は、ビルドで生成される `integration/lesson-links.json` の `lessonSlug` と `miraiUrl` を利用してください。リンク先はAstroの `site` と `base` から生成されます。公開先を変える場合は両設定を変更して再ビルドします。

進路ナビ本体のソースはこのプロジェクトにないため、本体へのタグ設置や公開作業は未実施です。教材内へ戻りリンクを追加する工程と、ローカルに用意した導線を混同しないでください。

## 対応付けの範囲

学びとの関係は編集上の関連で、資格取得・就職を保証しません。司書・学芸員は文学・文化・歴史、物流・商品企画は経営・商学など関連する学びへ案内しています。特定の養成課程に一致するという意味ではありません。複数分野へ分ける場合は学びレコードを追加し `learningIds` を増やします。
