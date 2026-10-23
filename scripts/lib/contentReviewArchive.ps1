param([Parameter(Mandatory=$true)][string]$Plan)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$archivePlan = [System.IO.File]::ReadAllText($Plan, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$zipStream = [System.IO.File]::Open($archivePlan.zipPath, [System.IO.FileMode]::CreateNew)
$archive = [System.IO.Compression.ZipArchive]::new($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in $archivePlan.files) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.sourcePath, $file.path, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $archive.Dispose(); $zipStream.Dispose() }

$archive = [System.IO.Compression.ZipFile]::OpenRead($archivePlan.zipPath)
try {
    if ($archive.Entries.Count -ne $archivePlan.files.Count) { throw 'Archive file count mismatch.' }
    foreach ($file in $archivePlan.files) {
        $entry = $archive.GetEntry($file.path)
        if ($null -eq $entry) { throw "Missing archive entry: $($file.path)" }
        $stream = $entry.Open()
        $hasher = [System.Security.Cryptography.SHA256]::Create()
        try { $hash = [BitConverter]::ToString($hasher.ComputeHash($stream)).Replace('-', '').ToLowerInvariant() }
        finally { $stream.Dispose(); $hasher.Dispose() }
        if ($hash -ne $file.sha256) { throw "Archive content mismatch: $($file.path)" }
    }
} finally { $archive.Dispose() }
