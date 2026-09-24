param(
    [string]$message = "Update site"
)

Write-Host "distから公開ファイルをコピーしています..."

Copy-Item dist\* . -Recurse -Force

git add .

$changes = git status --porcelain

if ($changes) {
    Write-Host "GitHubへアップロードしています..."

    git commit -m $message
    git push

    Write-Host "GitHub Pagesへの更新が完了しました。"
}
else {
    Write-Host "変更はありません。"
}