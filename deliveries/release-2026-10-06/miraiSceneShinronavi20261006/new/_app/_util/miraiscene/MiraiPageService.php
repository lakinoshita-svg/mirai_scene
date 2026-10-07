<?php
/** ビルド済みの許可リストから本文を取得する、読み取り専用サービス。 */
class MiraiPageService
{
    private $directory;

    public function __construct($directory)
    {
        $this->directory = $directory;
    }

    public function find_page($path)
    {
        if (!is_string($path) || strlen($path) > 200 ||
            !preg_match('~\A(?:[a-z0-9-]+/)*[a-z0-9-]*/?\z~D', $path)) {
            return null;
        }
        $manifest_path = $this->directory . '/manifest.json';
        if (!is_file($manifest_path)) throw new RuntimeException('Missing manifest');
        $manifest = json_decode(file_get_contents($manifest_path), true);
        if (!is_array($manifest)) throw new RuntimeException('Invalid manifest');
        $key = trim($path, '/');
        if (!array_key_exists($key, $manifest)) return null;
        $page = $manifest[$key];
        // ファイル名も生成時の固定形式に限定する（リクエスト値をパスに連結しない）。
        if (!is_array($page) || !preg_match('/\A[a-f0-9]{64}\.html\z/D', $page['file'] ?? '')) {
            throw new RuntimeException('Invalid page');
        }
        $filename = $this->directory . '/' . $page['file'];
        if (!is_file($filename)) throw new RuntimeException('Missing page');
        $page['html'] = file_get_contents($filename);
        return $page;
    }
}
