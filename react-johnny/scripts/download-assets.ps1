Set-Location "$PSScriptRoot\.."

$assetRoot = "public/assets"
$dirs = @("hero", "categories", "brands", "products", "reviews")
foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Path (Join-Path $assetRoot $dir) -Force | Out-Null
}

$files = @(
  @{Path="hero/fishing-hero.jpg"; Url="https://picsum.photos/seed/fishinghero/1800/1000"},
  @{Path="brands/lucana-banner.jpg"; Url="https://picsum.photos/seed/lucanabanner/1400/700"},
  @{Path="brands/tackleman-banner.jpg"; Url="https://picsum.photos/seed/tacklemanbanner/1400/700"},
  @{Path="products/rod-1-a.jpg"; Url="https://picsum.photos/seed/rod1a/1200/900"},
  @{Path="products/rod-1-b.jpg"; Url="https://picsum.photos/seed/rod1b/1200/900"},
  @{Path="products/rod-1-c.jpg"; Url="https://picsum.photos/seed/rod1c/1200/900"},
  @{Path="products/rod-2-a.jpg"; Url="https://picsum.photos/seed/rod2a/1200/900"},
  @{Path="products/rod-2-b.jpg"; Url="https://picsum.photos/seed/rod2b/1200/900"},
  @{Path="products/reel-1-a.jpg"; Url="https://picsum.photos/seed/reel1a/1200/900"},
  @{Path="products/reel-1-b.jpg"; Url="https://picsum.photos/seed/reel1b/1200/900"},
  @{Path="products/reel-1-c.jpg"; Url="https://picsum.photos/seed/reel1c/1200/900"},
  @{Path="products/reel-2-a.jpg"; Url="https://picsum.photos/seed/reel2a/1200/900"},
  @{Path="products/reel-2-b.jpg"; Url="https://picsum.photos/seed/reel2b/1200/900"},
  @{Path="products/lure-1-a.jpg"; Url="https://picsum.photos/seed/lure1a/1200/900"},
  @{Path="products/lure-1-b.jpg"; Url="https://picsum.photos/seed/lure1b/1200/900"},
  @{Path="products/lure-2-a.jpg"; Url="https://picsum.photos/seed/lure2a/1200/900"},
  @{Path="products/lure-2-b.jpg"; Url="https://picsum.photos/seed/lure2b/1200/900"},
  @{Path="products/fresh-1-a.jpg"; Url="https://picsum.photos/seed/fresh1a/1200/900"},
  @{Path="products/salt-1-a.jpg"; Url="https://picsum.photos/seed/salt1a/1200/900"},
  @{Path="products/accessory-1-a.jpg"; Url="https://picsum.photos/seed/accessory1a/1200/900"},
  @{Path="products/terminal-1-a.jpg"; Url="https://picsum.photos/seed/terminal1a/1200/900"},
  @{Path="products/net-1-a.jpg"; Url="https://picsum.photos/seed/net1a/1200/900"},
  @{Path="products/shirt-1-a.jpg"; Url="https://picsum.photos/seed/shirt1a/1200/900"},
  @{Path="reviews/reviewer-1.jpg"; Url="https://picsum.photos/seed/reviewer1/400/400"},
  @{Path="reviews/reviewer-2.jpg"; Url="https://picsum.photos/seed/reviewer2/400/400"},
  @{Path="reviews/reviewer-3.jpg"; Url="https://picsum.photos/seed/reviewer3/400/400"},
  @{Path="logo-placeholder.png"; Url="https://dummyimage.com/400x400/0f172a/f8fafc.png&text=Johnny+FT"},
  @{Path="brands/lucana-logo.png"; Url="https://dummyimage.com/400x400/065f46/ecfeff.png&text=Lucana"},
  @{Path="brands/tackleman-logo.png"; Url="https://dummyimage.com/400x400/7c2d12/fffbeb.png&text=Tackleman"}
)

foreach ($item in $files) {
  $target = Join-Path $assetRoot $item.Path
  if (-not (Test-Path $target)) {
    try {
      Invoke-WebRequest -Uri $item.Url -OutFile $target
      Write-Output "Downloaded: $($item.Path)"
    } catch {
      Write-Output "Failed: $($item.Path)"
    }
  }
}

Write-Output "Asset download pass complete"
