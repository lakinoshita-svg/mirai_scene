<?php
// ローカル検証専用。配布物には含めない。DB・本番認証・本番ヘッダーは起動しない。
define('EXTENSION', '.tpl');
function h($value) { return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8'); }
class Controller {
    public $_request = [];
    public $controller_name;
    public $layout;
    public $contents_for_layout;
    public $title;
    public $description_str;
    public $canonical;
    public $h1_str;
    public $pnkz_paths;
    public function __construct($controller_name = '', $action_name = '') { $this->controller_name = $controller_name; }
    public function get_css_added_only($name, $directory) { return ''; }
}
$root = realpath($_SERVER['DOCUMENT_ROOT']);
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('~\A/mirai_scene/(_astro|assets|catalog|integration)/(.*)\z~', $path, $match)) {
    $relative = $match[1] === '_astro' ? '/new/_app/_webroot/js/page/miraiscene/' . $match[2] : '/new/_app/_webroot/miraiscene/' . $match[1] . '/' . $match[2];
    $static = realpath($root . $relative);
    if ($static && str_starts_with($static, $root . DIRECTORY_SEPARATOR)) {
        if (is_dir($static)) $static .= '/index.html';
        if (is_file($static)) {
            $types = ['js'=>'text/javascript','css'=>'text/css','html'=>'text/html','json'=>'application/json','png'=>'image/png','svg'=>'image/svg+xml','webp'=>'image/webp'];
            header('Content-Type: ' . ($types[pathinfo($static, PATHINFO_EXTENSION)] ?? 'application/octet-stream'));
            readfile($static); return;
        }
    }
    http_response_code(404); return;
}
$file = realpath($root . $path);
if ($file && strpos($file, $root . DIRECTORY_SEPARATOR) === 0 && is_file($file)) return false;
if ($file && is_dir($file) && strpos($path, '/mirai_scene/catalog/') === 0 && is_file($file . '/index.html')) { header('Content-Type: text/html'); readfile($file . '/index.html'); return; }
if (!str_starts_with($path, '/mirai_scene/')) { http_response_code(404); exit; }
chdir($root . '/new/_app/_webroot');
require '../_controller/MiraisceneController.php';
$controller = new MiraisceneController('miraiscene', 'index');
$controller->_request = ['mirai_path' => substr($path, strlen('/mirai_scene/'))];
$controller->index();
