# 広告用の地域推定API

## 現在の状態

実装・ローカルテスト済み。Cloudflareへの公開とフロントの公開URL設定は未実施です。API未設定でも全国表示と手動選択は動作します。

## 公開と接続

1. 自社管理のCloudflareアカウントで、このフォルダーの `wrangler.toml` と `worker.mjs` を使ってWorkerを公開します。Wrangler CLIを使用する場合、このフォルダーで `npx wrangler deploy` を実行します（初回はCloudflareのログインが必要）。
2. `wrangler.toml` の `ALLOWED_ORIGINS` にフロントのOriginを指定します。GitHub Pagesの場合は `https://lakinoshita-svg.github.io` です。`/mirai_scene/` は含めません。ローカル確認時のみ `http://127.0.0.1:4321` を追加します。変更後はWorkerを再公開してください。
3. プロジェクトルートの `.env.example` を `.env` にコピーし、`PUBLIC_REGION_API_URL` にWorkerの公開HTTPS URLを設定します。例のURLではなく、実際に発行されたURLを使用してください。
4. プロジェクトルートで `npm run build` を実行し、生成したサイトを公開します。CIでビルドする場合もビルド環境に同じ変数を設定してください。環境変数はビルド時に埋め込まれるため、URL変更時は再ビルドが必要です。
5. 対象カテゴリーに有効な広告を登録し、公開ページの広告欄で「IPアドレスからの目安」の表示と手動変更を確認します。現在の広告データは空のため、そのままでは広告欄もAPI通信も発生しません。

自社の既存APIに接続する場合も、GETで `{"region":"kanto"}` のようなJSONを返し、フロントのOriginへのCORSを許可すれば利用できます。認証情報をフロントに埋め込まない構成にしてください。

## 動作と保守

- Cloudflareの `request.cf.country` と `regionCode` を使い、47都道府県を8地方に丸めます。海外・不明の場合は `all` を返します。
- 応答は地域IDだけです。アプリではIPアドレスや緯度経度を返却・保存しません。Workerのアプリログも無効にしています。配信基盤自体のデータ取扱いとは別です。
- 取得上限は2.5秒。全国広告を先に表示し、推定後に対象エリアの広告に切り替えます。地域広告がなければ全国広告を継続します。
- 推定結果はタブ内で30分再利用。手動指定はタブ内で維持し、通信中に変更した場合も本人の指定を優先します。
- CORSはブラウザからの接続制限であり認証ではありません。公開APIとして運用します。応答の共有キャッシュは無効です。
- 自動推定を止める場合は `PUBLIC_REGION_API_URL` を空にして再ビルドしてください。
- テストはプロジェクトルートで `node --test tests/ad-region.test.mjs`。Cloudflareのプレビューでは `request.cf` がない場合があるため、実地域の推定は公開環境で確認します。

仕様参照：[Cloudflare Request](https://developers.cloudflare.com/workers/runtime-apis/request/)
