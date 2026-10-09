$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$config = Get-Content -LiteralPath 'config/delivery.json' -Raw | ConvertFrom-Json
if ($config.release -notmatch '^release-\d{4}-\d{2}-\d{2}(-[a-z0-9]+)?$' -or $config.zip -notmatch '^[a-zA-Z0-9]+\.zip$') { throw '配布名の形式が不正です。' }
$latest = Get-Content -LiteralPath 'integrations/shinronavi/output/latest.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$bundlePath = (Resolve-Path -LiteralPath $latest.directory).Path
$outputRoot = (Resolve-Path -LiteralPath 'integrations/shinronavi/output').Path + [IO.Path]::DirectorySeparatorChar
if (-not $bundlePath.StartsWith($outputRoot, [StringComparison]::OrdinalIgnoreCase)) { throw '配布元が出力フォルダ外です。' }
$releasePath = Join-Path (Get-Location) ('deliveries/' + $config.release)
$zipPath = Join-Path $releasePath $config.zip
if ((Test-Path -LiteralPath $zipPath) -and (Test-Path -LiteralPath (Join-Path $releasePath 'manifest.json'))) { throw '確定済みの同名ZIPが存在します。別の配布版を指定してください。' }
New-Item -ItemType Directory -Path $releasePath -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
# 隠しファイル.htaccessも含める。作成後に内容・件数を全件照合する。
if (-not (Test-Path -LiteralPath $zipPath)) {
  $writer = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach ($file in Get-ChildItem -LiteralPath $bundlePath -File -Recurse -Force) {
      $entryName = $file.FullName.Substring($bundlePath.Length + 1).Replace('\','/')
      [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($writer, $file.FullName, $entryName, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  } finally { $writer.Dispose() }
}
# 途中停止時は既存ZIPを全件照合して再開する。内容不一致なら確定しない。
function Get-Sha256([string]$filePath) {
  $stream = [IO.File]::OpenRead($filePath)
  $hasher = [Security.Cryptography.SHA256]::Create()
  try { return [BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-','').ToLowerInvariant() }
  finally { $stream.Dispose(); $hasher.Dispose() }
}
$archive = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  $sourceFiles = @(Get-ChildItem -LiteralPath $bundlePath -File -Recurse -Force)
  $entries = @($archive.Entries | Where-Object { $_.Name -ne '' })
  if ($entries.Count -ne $sourceFiles.Count) { throw 'ZIPのファイル数が一致しません。' }
  $files = foreach ($file in $sourceFiles) {
    $relative = $file.FullName.Substring($bundlePath.Length + 1).Replace('\','/')
    $entry = $archive.GetEntry($relative)
    if ($null -eq $entry) { throw "ZIP内にありません: $relative" }
    $stream = $entry.Open()
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { $digest = [BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-','').ToLowerInvariant() }
    finally { $stream.Dispose(); $hasher.Dispose() }
    $sourceHash = Get-Sha256 $file.FullName
    if ($digest -ne $sourceHash) { throw "ZIP内容が一致しません: $relative" }
    [ordered]@{file=$relative;sha256=$digest;bytes=$file.Length}
  }
} finally { $archive.Dispose() }
$careers = @(Get-ChildItem -LiteralPath 'src/content/careers' -Filter '*.json' | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json })
$manifest = [ordered]@{
  release=$config.release; purpose='進路ナビ導入用一式'; zip=$config.zip
  sha256=(Get-Sha256 $zipPath)
  contentCount=$careers.Count; sceneCount=($careers | ForEach-Object {$_.scenes.Count} | Measure-Object -Sum).Sum
  pageCount=$latest.pages; sourceBundle=(Split-Path $bundlePath -Leaf)
  validation=[ordered]@{archiveFilesMatched=$files.Count;productionDeployment='未実施';details='VALIDATION.md'}
  files=@($files)
}
$manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $releasePath 'manifest.json') -Encoding UTF8
Copy-Item -LiteralPath (Join-Path $bundlePath 'VALIDATION.md') -Destination (Join-Path $releasePath 'VALIDATION.md')
Write-Output "$zipPath : $($files.Count)ファイルのSHA-256一致"
