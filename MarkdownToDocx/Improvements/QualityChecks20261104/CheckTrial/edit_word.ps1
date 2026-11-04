$ErrorActionPreference = 'Stop'
$exampleRoot = Join-Path (Split-Path -Parent $PSScriptRoot) 'Examples'
$copyRoot = Join-Path $PSScriptRoot 'copies'
New-Item -ItemType Directory -Path $copyRoot -Force | Out-Null
$records = @()
$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $word.AutomationSecurity = 3
    foreach ($file in Get-ChildItem -LiteralPath $exampleRoot -Filter '*.docx' | Sort-Object Name) {
        $timer = [Diagnostics.Stopwatch]::StartNew()
        $record = [ordered]@{ file=$file.Name; execution_status='completed'; status='unverified'; opened=$false; paragraph_found=$false; cell_found=$false; paragraph_persisted=$null; cell_persisted=$null; error=$null }
        try {
            $copy = Join-Path $copyRoot $file.Name
            if (Test-Path -LiteralPath $copy) { throw 'Attempt copy already exists; refusing a silent rerun' }
            Copy-Item -LiteralPath $file.FullName -Destination $copy
            $doc = $word.Documents.Open($copy, $false, $false, $false)
            $record.opened = $true
            $range = $doc.Content.Duplicate
            $range.Find.ClearFormatting()
            $range.Find.Text = 'This fictional library example'
            $range.Find.Forward = $true
            $range.Find.Wrap = 0
            $record.paragraph_found = [bool]$range.Find.Execute()
            if ($record.paragraph_found) { $range.Text = 'This sample library example' }
            if ($doc.Tables.Count -gt 0) {
                $table = $doc.Tables.Item(1)
                for ($rowIndex=2; $rowIndex -le $table.Rows.Count; $rowIndex++) {
                    $label = $table.Cell($rowIndex,1).Range.Text.Trim([char]13,[char]7)
                    if ($label -eq 'North desk') {
                        $cellRange = $table.Cell($rowIndex,2).Range.Duplicate
                        $cellRange.End = $cellRange.End - 1
                        $cellRange.Text = 'EDIT CHECK'
                        $record.cell_found = $true
                        break
                    }
                }
            }
            if ($record.paragraph_found -and $record.cell_found) {
                $doc.Save()
                $doc.Close(0)
                [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc)
                $doc = $word.Documents.Open($copy, $false, $true, $false)
                $record.paragraph_persisted = $doc.Content.Text.Contains('This sample library example')
                $record.cell_persisted = $doc.Tables.Item(1).Range.Text.Contains('EDIT CHECK')
                $record.status = if ($record.paragraph_persisted -and $record.cell_persisted) { 'pass' } else { 'fail' }
            } else {
                $record.status = 'fail'
            }
        } catch {
            $record.execution_status = 'error'
            $record.status = 'unverified'
            $record.error = $_.Exception.Message
        } finally {
            if ($null -ne $doc) { $doc.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc); $doc=$null }
            $timer.Stop()
            $record.seconds = $timer.Elapsed.TotalSeconds
            $records += [pscustomobject]$record
            $records | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'word-observations.json')
            Write-Output ($file.Name + ': ' + $record.status)
        }
    }
} finally {
    if ($null -ne $doc) { $doc.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($doc) }
    if ($null -ne $word) { $word.Quit(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
}
