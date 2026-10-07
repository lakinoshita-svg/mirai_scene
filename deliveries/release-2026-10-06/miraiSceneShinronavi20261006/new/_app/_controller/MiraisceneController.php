<?php
require_once __DIR__ . '/../_util/miraiscene/MiraiPageService.php';

/** 公開済みの静的原稿を共通Tailwindレイアウトへ差し込む。DB更新は行わない。 */
class MiraisceneController extends Controller
{
    // 親Controller・既存レイアウトのsnake_case名は進路ナビの接続仕様に合わせる。
    // このクラス名と配置先もホストのルーティング対象なので独自に変更しない。
    public $mirai_page;

    public function __construct($controller_name = '', $action_name = '')
    {
        parent::__construct($controller_name, $action_name);
        $this->layout = '../_view/layout/default_new' . EXTENSION;
        $this->contents_for_layout = '../_view/miraiscene/index' . EXTENSION;
    }

    public function index()
    {
        if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'], true)) {
            header('Allow: GET, HEAD');
            http_response_code(405);
            return;
        }
        // PATHはサービスのマニフェストで完全一致照合する。任意ファイルをincludeしない。
        $service = new MiraiPageService(__DIR__ . '/../_view/miraiscene/generated');
        try {
            $this->mirai_page = $service->find_page($this->_request['mirai_path'] ?? '');
        } catch (RuntimeException $error) {
            http_response_code(503);
            echo 'ただいま準備中です。時間をおいてアクセスしてください。';
            return;
        }
        if ($this->mirai_page === null) {
            http_response_code(404);
            echo 'ページが見つかりませんでした。';
            return;
        }
        $this->title = htmlspecialchars($this->mirai_page['title'], ENT_QUOTES, 'UTF-8');
        $this->description_str = htmlspecialchars($this->mirai_page['description'], ENT_QUOTES, 'UTF-8');
        $this->canonical = $this->mirai_page['canonical'];
        $this->h1_str = 'ミライシーン';
        // パンくずは本文内のミライシーン専用表示に一本化する。
        $this->pnkz_paths = [];
        $this->get_css_added_only('miraiscene.css', 'css/page/miraiscene');
        require $this->layout;
    }
}
