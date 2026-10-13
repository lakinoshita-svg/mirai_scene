<?php
// php integrations/shinronavi/test.php 配布フォルダー
require __DIR__ . '/templates/MiraiPageService.php';
$directory = $argv[1] . '/new/_app/_view/miraiscene/generated';
$service = new MiraiPageService($directory);
function check($condition, $message) { if (!$condition) throw new RuntimeException($message); }
$manifest = json_decode(file_get_contents($directory . '/manifest.json'), true);
foreach ($manifest as $route => $entry) {
    $page = $service->find_page($route);
    check($page !== null && strlen($page['html']) > 0, 'Missing route: ' . $route);
    check(strpos($page['html'], '<script') === false, 'Inline script');
    check(strpos($page['canonical'], 'https://shinronavi.com/mirai_scene/') === 0, 'Wrong canonical');
}
foreach (['../manifest.json', '%2e%2e', 'careers/../../x', [], null, 'missing', str_repeat('a', 201)] as $path) {
    check($service->find_page($path) === null, 'Invalid route accepted');
}
check($service->find_page('careers/designer/')['title'] === $service->find_page('careers/designer')['title'], 'Trailing slash mismatch');
try { (new MiraiPageService(__DIR__ . '/not-present'))->find_page(''); throw new LogicException('Missing manifest accepted'); }
catch (RuntimeException $e) { /* 期待する読み込み失敗 */ }
echo count($manifest) . " routes / invalid paths / missing manifest: OK\n";

$urls = require $argv[1] . '/new/_app/_util/miraiscene/sitemapUrls.php';
check(count($urls) === count($manifest), 'Sitemap count mismatch');
foreach ($urls as $entry) {
    check(in_array('https://shinronavi.com/' . $entry['loc'], array_column($manifest, 'canonical'), true), 'Unknown sitemap URL');
    check(!isset($entry['lastmod']), 'Invented lastmod');
    check(strpos($entry['loc'], 'catalog') === false, 'Catalog indexed');
}
check(count(array_unique(array_column($urls, 'loc'))) === count($urls), 'Duplicate sitemap URL');
echo count($urls) . " sitemap URLs / canonical match / catalog excluded: OK\n";
