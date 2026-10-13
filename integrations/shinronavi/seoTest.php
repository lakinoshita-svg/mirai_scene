<?php
// php -d short_open_tag=1 seoTest.php 配布フォルダー 共通head検証ファイル
define('EXTENSION', '.tpl');
#[AllowDynamicProperties]
class Controller {
    public function __construct($controller_name = '', $action_name = '') {
        $this->controller_name = $controller_name;
        $this->_request = [];
        $this->noindex = false;
    }
    public function get_css_added_only($name, $directory) {}
}
require $argv[1] . '/new/_app/_controller/MiraisceneController.php';
$manifest = json_decode(file_get_contents($argv[1] . '/new/_app/_view/miraiscene/generated/manifest.json'), true);
$_SERVER['REQUEST_METHOD'] = 'GET';
foreach ($manifest as $route => $page) {
    $_SERVER['REQUEST_URI'] = '/mirai_scene/' . ($route ? $route . '/' : '');
    $controller = new MiraisceneController('miraiscene');
    $controller->layout = $argv[2];
    $controller->_request['mirai_path'] = $route;
    ob_start();
    $controller->index();
    $html = ob_get_clean();
    foreach (['canonical', 'og:title', 'og:description', 'og:image', 'og:url', 'twitter:card'] as $tag) {
        if (substr_count($html, '"' . $tag . '"') !== 1) throw new RuntimeException('Missing/duplicate tag: ' . $tag);
    }
    if (strpos($html, 'content="' . $page['canonical'] . '"') === false) throw new RuntimeException('Wrong OGP URL');
    if (strpos($html, 'content="summary"') === false) throw new RuntimeException('Wrong card');
    if (strpos($html, 'miraiSceneFavicon.png') === false) throw new RuntimeException('Missing image');
}
echo count($manifest) . " pages / host head / OGP and canonical: OK\n";
