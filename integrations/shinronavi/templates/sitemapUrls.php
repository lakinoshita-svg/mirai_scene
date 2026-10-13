<?php
/** sitemap_second.php の $urls に、配布manifestの公開ページだけを追加する。 */
$miraiManifestPath = __DIR__ . '/../../_view/miraiscene/generated/manifest.json';
$miraiManifest = json_decode(file_get_contents($miraiManifestPath), true);
if (!is_array($miraiManifest)) {
    throw new RuntimeException('Invalid Mirai Scene sitemap manifest');
}
$miraiEntries = [];
foreach ($miraiManifest as $miraiPage) {
    $miraiCanonical = $miraiPage['canonical'] ?? '';
    // ホスト側はAPP_HOSTを付加するため、外部URLやクエリを受け入れず相対パスにする。
    if (!preg_match('~\Ahttps://shinronavi\.com/(mirai_scene/(?:[a-z0-9-]+/)*)\z~D', $miraiCanonical, $miraiMatch)) {
        throw new RuntimeException('Invalid Mirai Scene sitemap URL');
    }
    $miraiEntries[$miraiMatch[1]] = ['loc' => $miraiMatch[1], 'priority' => '0.6'];
}
// ビルド日時をコンテンツの更新日時としてlastmodへ記載しない。
return array_values($miraiEntries);
