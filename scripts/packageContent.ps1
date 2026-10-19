param([Parameter(Mandatory=$true)][string]$Baseline)
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
node scripts/buildContentDelivery.mjs --baseline $Baseline
if ($LASTEXITCODE -ne 0) { throw 'コンテンツ配布の検証が完了していません。' }
$config = Get-Content -LiteralPath 'config/delivery.json' -Raw | ConvertFrom-Json
if ($config.release -notmatch '^release-\d{4}-\d{2}-\d{2}(-[a-z0-9]+)?$' -or $config.zip -notmatch '^[a-zA-Z0-9]+\.zip$') { throw '配布名の形式が不正です。' }
$latest = Get-Content -LiteralPath 'integrations/shinronavi/output/contentLatest.json' -Raw | ConvertFrom-Json
$source = (Resolve-Path -LiteralPath $latest.directory).Path
$root = (Resolve-Path -LiteralPath 'integrations/shinronavi/output').Path + [IO.Path]::DirectorySeparatorChar
if (-not $source.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) { throw '配布元が出力フォルダ外です。' }
$destination = Join-Path (Get-Location) ('deliveries/' + $config.release + '-content')
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$zipPath = Join-Path $destination ($config.zip.Replace('.zip', 'Content.zip'))
if (Test-Path -LiteralPath $zipPath) { throw '同名ZIPは上書きできません。別の配布版を指定してください。' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($source, $zipPath)
$archive = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  $files = @(Get-ChildItem -LiteralPath $source -Recurse -File -Force)
  if (@($archive.Entries | Where-Object { $_.Name -ne '' }).Count -ne $files.Count) { throw 'ZIPの件数が一致しません。' }
  foreach ($file in $files) {
    $name = $file.FullName.Substring($source.Length + 1).Replace('\','/')
    $entry = $archive.GetEntry($name)
    if ($null -eq $entry) { throw "ZIPにありません: $name" }
    $stream = $entry.Open()
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { $hash = [BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-','') }
    finally { $stream.Dispose(); $hasher.Dispose() }
    if ($hash -ne (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash) { throw "ZIP内容不一致: $name" }
  }
} finally { $archive.Dispose() }
[ordered]@{kind='content';baseId=$latest.baseId;targetId=$latest.targetId;sha256=(Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant();zip=(Split-Path $zipPath -Leaf);archiveFilesMatched=$files.Count} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'manifest.json') -Encoding UTF8
Write-Output $zipPath
