# sessao-inicio.ps1 — Garagem Rucula
# Objetivo: continuar SEMPRE de onde paramos, em qualquer um dos 2 PCs (sincroniza via GitHub).
# Projeto vive em disco LOCAL (ex: C:\dev\garagemrucula); o GitHub e a fonte da verdade.
# 1) Sincroniza codigo com origin/main (se houver remote git), com fast-forward seguro.
# 2) Conserta o ponteiro da memoria do Claude DESTA maquina, apontando para a pasta memory/ deste projeto.
# Roda automaticamente via hook SessionStart (.claude/settings.json). Tambem da pra rodar na mao.

$ErrorActionPreference = 'Continue'

# --- localizar repo + pasta memory ---
$repo = Split-Path $PSScriptRoot -Parent     # ...\Garagem Rucula
$memDir = $null
if (Test-Path (Join-Path (Join-Path $repo 'memory') 'MEMORY.md')) {
  $memDir = (Join-Path $repo 'memory')
} else {
  # fallback: procura subindo ate 6 niveis (robusto a repo aninhado)
  $probe = $repo
  for ($i = 0; $i -lt 6; $i++) {
    $parent = Split-Path $probe -Parent
    if ([string]::IsNullOrEmpty($parent)) { break }
    if (Test-Path (Join-Path (Join-Path $parent 'memory') 'MEMORY.md')) { $memDir = (Join-Path $parent 'memory'); break }
    $probe = $parent
  }
}

# --- localizar git ---
$git = 'git'
try { & $git --version | Out-Null } catch { $git = $null }

# --- 1) sincronizar codigo (so se houver remote) ---
if ($git) {
  try {
    $hasRemote = (& $git -C $repo remote) -ne $null -and (& $git -C $repo remote) -ne ''
    if (-not $hasRemote) {
      Write-Host "[git] Sem remote configurado. Rode: git remote add origin https://github.com/Github-FelipeFelix/garagemrucula"
    } else {
      & $git -C $repo fetch origin main --quiet
      $local  = (& $git -C $repo rev-parse --short HEAD)
      $remote = (& $git -C $repo rev-parse --short origin/main)
      $base   = (& $git -C $repo rev-parse --short (& $git -C $repo merge-base HEAD origin/main))
      if ($local -eq $remote) {
        Write-Host "[git] Ja em dia com origin/main ($local)."
      } elseif ($local -eq $base) {
        & $git -C $repo merge --ff-only origin/main --quiet
        Write-Host "[git] Atualizado: $local -> $remote (fast-forward)."
      } elseif ($remote -eq $base) {
        Write-Host "[git] Voce tem commit(s) local(is) NAO enviado(s). Rode: git push origin main"
      } else {
        Write-Host "[ATENCAO] Local ($local) e origin/main ($remote) DIVERGIRAM. Resolva manualmente."
      }
    }
  } catch {
    Write-Host "[AVISO] Falha no git: $($_.Exception.Message)"
  }
} else {
  Write-Host "[AVISO] git nao encontrado no PATH."
}

# --- 2) conserta o ponteiro da memoria (unico ajuste por-maquina) ---
if (-not $memDir) {
  Write-Host "[ATENCAO] NAO achei a pasta 'memory' com MEMORY.md."
} else {
  $wantMem = $memDir
  try { $wantMem = (Resolve-Path -LiteralPath $memDir -ErrorAction Stop).Path } catch {}
  $wantMem = $wantMem -replace '\\', '/'   # barras normais para settings.json

  $cfgDir = Join-Path $HOME '.claude'
  $cfg    = Join-Path $cfgDir 'settings.json'
  try {
    if (-not (Test-Path $cfgDir)) { New-Item -ItemType Directory -Path $cfgDir -Force | Out-Null }
    if (Test-Path $cfg) { $j = Get-Content $cfg -Raw -Encoding UTF8 | ConvertFrom-Json } else { $j = [pscustomobject]@{} }

    if ($j.autoMemoryEnabled -ne $true) { $j | Add-Member -NotePropertyName autoMemoryEnabled -NotePropertyValue $true -Force }

    if ($j.autoMemoryDirectory -ne $wantMem) {
      $j | Add-Member -NotePropertyName autoMemoryDirectory -NotePropertyValue $wantMem -Force
      [System.IO.File]::WriteAllText($cfg, ($j | ConvertTo-Json -Depth 30), (New-Object System.Text.UTF8Encoding($false)))
      Write-Host "[memoria] Ponteiro AJUSTADO -> $wantMem"
      Write-Host "[memoria] (so vale a partir da PROXIMA sessao -> REINICIE o Claude pra ativar)"
    } else {
      Write-Host "[memoria] Ponteiro OK -> $wantMem"
    }
    $n = (Get-ChildItem $memDir -Filter *.md -File -ErrorAction SilentlyContinue).Count
    Write-Host "[memoria] $n arquivos .md de memoria disponiveis"
  } catch {
    Write-Host "[AVISO] Nao consegui ler/gravar $cfg : $($_.Exception.Message)"
  }
}
