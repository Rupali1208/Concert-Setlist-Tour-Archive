$ErrorActionPreference = 'Stop'
$apiBase = 'http://localhost:5000/api'

function Post-Json($endpoint, $body) {
    $url = "$apiBase$endpoint"
    $json = $body | ConvertTo-Json -Depth 5
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType 'application/json' -Body $json
    return $response
}

# 1. Add Indian artist
$artist = Post-Json '/artists' @{Artist_Name='A.R. Rahman'; Genre='Film Score'; Country='India'}
$artistId = $artist.data.Artist_ID
Write-Host "Created artist ID: $artistId"

# 2. Add tour for the artist
$tour = Post-Json '/tours' @{Artist_ID=$artistId; Tour_Name='India Tour 2026'; Start_Date='2026-09-20'; End_Date='2026-10-20'}
$tourId = $tour.data.Tour_ID
Write-Host "Created tour ID: $tourId"

# 3. Add concerts in major Indian cities
$concerts = @(
    @{Tour_ID=$tourId; Concert_Date='2026-09-25'; Venue='Indira Gandhi Arena'; City='Delhi'}
    @{Tour_ID=$tourId; Concert_Date='2026-09-30'; Venue='NSCI Dome'; City='Mumbai'}
    @{Tour_ID=$tourId; Concert_Date='2026-10-05'; Venue='Bangalore Palace'; City='Bangalore'}
    @{Tour_ID=$tourId; Concert_Date='2026-10-10'; Venue='Nicco Park'; City='Kolkata'}
    @{Tour_ID=$tourId; Concert_Date='2026-10-15'; Venue='Hyderabad International Convention Center'; City='Hyderabad'}
)
foreach ($c in $concerts) {
    $resp = Post-Json '/concerts' $c
    Write-Host "Added concert ID: $($resp.data.Concert_ID)"
}
