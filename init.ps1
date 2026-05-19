# ==========================================================================
# init.ps1
# Windows PowerShell port of init.sh.
# Bootstrap a new engagement from project-blueprint-template.
# Run: .\init.ps1
# ==========================================================================

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
Set-Location $Root

$PlaceholdersFile = Join-Path $Root ".template/placeholders.json"
$StateFile        = Join-Path $Root ".init-state"

if (-not (Test-Path $PlaceholdersFile)) {
  Write-Error "Missing $PlaceholdersFile"
  exit 2
}

function Slugify($s) {
  $s = $s.ToLower()
  $s = ($s -replace '[^a-z0-9]+', '-')
  $s = ($s -replace '-+', '-')
  $s = $s.Trim('-')
  return $s
}

$Today     = Get-Date -Format "yyyy-MM-dd"
$TodayYear = Get-Date -Format "yyyy"

Write-Host ""
Write-Host "Project Blueprint Template, init" -ForegroundColor Cyan
Write-Host "  This script bootstraps a new engagement from the template."
Write-Host "  Press Ctrl+C at any time to abort."
Write-Host ""

# Load placeholder definitions
$Defs = Get-Content $PlaceholdersFile -Raw | ConvertFrom-Json

# Stage 1: collect answers
$Vals = @{}

# Load prior state if present
if (Test-Path $StateFile) {
  Write-Host "Loading prior init values from $StateFile (re-running init)" -ForegroundColor Yellow
  Get-Content $StateFile | ForEach-Object {
    if ($_ -match '^([A-Z0-9_]+)=(.*)$') {
      $Vals[$Matches[1]] = $Matches[2]
    }
  }
}

$Vals["TODAY"]      = $Today
$Vals["TODAY_YEAR"] = $TodayYear

foreach ($p in $Defs.placeholders) {
  $name       = $p.name
  $prompt     = $p.prompt
  $default    = $p.default
  $derived    = $p.derived_from
  $validation = $p.validation
  $required   = $p.required

  # Resolve derived defaults
  if ($derived -and -not $Vals.ContainsKey($name)) {
    switch ($derived) {
      "TODAY"      { $default = $Today }
      "TODAY_YEAR" { $default = $TodayYear }
      default {
        if ($Vals.ContainsKey($derived)) {
          if ($name -like "*_SLUG") {
            $default = Slugify $Vals[$derived]
          } else {
            $default = $Vals[$derived]
          }
        }
      }
    }
  }

  if ($Vals.ContainsKey($name)) {
    $default = $Vals[$name]
  }

  while ($true) {
    $promptStr = if ($default) { "$prompt [$default]: " } else { "$prompt`: " }
    $answer    = Read-Host -Prompt $promptStr
    if (-not $answer) { $answer = $default }

    if ($required -and -not $answer) {
      Write-Host "This field is required." -ForegroundColor Red
      continue
    }
    if ($validation -and -not ($answer -match $validation)) {
      Write-Host "Value does not match validation pattern: $validation" -ForegroundColor Red
      continue
    }
    $Vals[$name] = $answer
    break
  }
}

# Save state
$lines = @()
foreach ($k in $Vals.Keys) {
  if ($k -in @("TODAY","TODAY_YEAR")) { continue }
  $lines += "$k=$($Vals[$k])"
}
Set-Content -Path $StateFile -Value $lines

# Summary
Write-Host ""
Write-Host "Collected values" -ForegroundColor White
Write-Host ""
foreach ($k in @("PROJECT_NAME","PROJECT_SLUG","CLIENT_NAME","PROJECT_TYPE","START_DATE","PROJECT_LEAD","REPO_URL","DASHBOARD_URL","LANGUAGE_PRIMARY","LANGUAGE_SECONDARY")) {
  if ($Vals.ContainsKey($k) -and $Vals[$k]) {
    Write-Host ("  {0,-22} {1}" -f $k, $Vals[$k])
  }
}
Write-Host ""

$confirm = Read-Host -Prompt "Apply these to every tracked file? [y/N]"
if ($confirm -notmatch "^[Yy]") {
  Write-Host "Aborted. State saved to $StateFile; re-run when ready." -ForegroundColor Yellow
  exit 0
}

# Stage 2: substitute
Write-Host "Substituting placeholders across the repo..." -ForegroundColor Cyan

# Determine the file list
$Files = @()
try {
  $Files = git ls-files 2>$null
} catch { }
if (-not $Files) {
  $Files = Get-ChildItem -Recurse -File `
    | Where-Object { $_.FullName -notmatch '\\\.git\\' -and $_.FullName -notmatch '\\node_modules\\' } `
    | ForEach-Object { Resolve-Path -Relative $_.FullName }
}

$Replaced = 0
$Skipped  = 0

foreach ($f in $Files) {
  if ($f -like "*placeholders.json*") { $Skipped++; continue }
  if ($f -like "init.ps1" -or $f -like "init.sh" -or $f -like ".init-state") { $Skipped++; continue }

  $content = ""
  try {
    $content = Get-Content -Raw -Encoding UTF8 $f -ErrorAction Stop
  } catch {
    $Skipped++; continue
  }

  if ($content -notmatch '\{\{[A-Z][A-Z0-9_]*\}\}') { continue }

  $orig = $content
  foreach ($k in $Vals.Keys) {
    if ($k -in @("TODAY","TODAY_YEAR")) { continue }
    $content = $content -replace ("{{" + [regex]::Escape($k) + "}}"), [regex]::Escape($Vals[$k]).Replace('\','\\').Replace('$','$$$$') -replace '\\([^\\$])', '$1'
    # The above is fragile across PowerShell versions; use simple Replace instead
  }

  # Simpler, reliable approach: a literal string replace for each placeholder
  $content = $orig
  foreach ($k in $Vals.Keys) {
    if ($k -in @("TODAY","TODAY_YEAR")) { continue }
    $content = $content.Replace("{{$k}}", $Vals[$k])
  }

  if ($content -ne $orig) {
    Set-Content -Path $f -Value $content -Encoding UTF8 -NoNewline
    $Replaced++
  }
}

Write-Host "Replaced placeholders in $Replaced file(s); skipped $Skipped (binary or excluded)." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps" -ForegroundColor White
Write-Host @"

  1. Read .template/post-init-checklist.md and work through the remaining placeholders.

  2. Pick which docs/project-types/*.md guide(s) to keep.
     The one tied to your PROJECT_TYPE: docs/project-types/$($Vals['PROJECT_TYPE']).md

  3. Customize the dashboard at blueprint-dashboard/index.html.

  4. Wire up the deploy pipeline if publishing to a VPS:
     copy blueprint-dashboard/deploy/.env.example to blueprint-dashboard/deploy/.env, then edit.

  5. Make the first real commit:
     git add . ; git commit -m "chore: initialize $($Vals['PROJECT_NAME']) from project-blueprint-template"

  6. (Optional) Delete init.sh, init.ps1, and .template/ once you're confident the init landed cleanly.

"@
Write-Host "Init complete for $($Vals['PROJECT_NAME'])." -ForegroundColor Green
