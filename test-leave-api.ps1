#!/usr/bin/env pwsh
# Leave Request Debugging Script
# Tests the entire leave request API workflow

Write-Host "`n╔═══════════════════════════════════════════════════════╗"
Write-Host "║   ApproveIQ Leave Request API Debugging Script       ║"
Write-Host "╚═══════════════════════════════════════════════════════╝`n"

$API_URL = "http://localhost:5000/api"
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Test-LeaveRequestAPI {
    Write-Host "${Blue}Step 1: Testing Authentication${Reset}"
    
    $loginJson = @{
        email = "bashairfan518@gmail.com"
        password = "Irfan@86101"
    } | ConvertTo-Json
    
    try {
        $loginResp = Invoke-WebRequest -Uri "$API_URL/auth/login" -Method POST -Body $loginJson -ContentType "application/json" -ErrorAction Stop
        $loginData = $loginResp.Content | ConvertFrom-Json
        $token = $loginData.token
        $userId = $loginData.user.id
        
        Write-Host "${Green}✓ Login successful${Reset}"
        Write-Host "  User: $($loginData.user.email)"
        Write-Host "  Role: $($loginData.user.role)"
        Write-Host "  Token: $($token.Substring(0,30))..."
        Write-Host "  User ID: $userId`n"
    }
    catch {
        Write-Host "${Red}✗ Login failed${Reset}"
        Write-Host "  Error: $($_.Exception.Message)`n"
        return
    }
    
    # Test Step 2: Fetch existing leave requests
    Write-Host "${Blue}Step 2: Fetching Existing Leave Requests${Reset}"
    
    try {
        $getResp = Invoke-WebRequest -Uri "$API_URL/leave/requests/my" `
            -Method GET `
            -Headers @{"Authorization" = "Bearer $token"} `
            -ErrorAction Stop
        $leaveData = $getResp.Content | ConvertFrom-Json
        
        Write-Host "${Green}✓ API call successful${Reset}"
        Write-Host "  Response status: $($getResp.StatusCode)"
        Write-Host "  Leave requests found: $($leaveData.Count)"
        
        if ($leaveData.Count -gt 0) {
            Write-Host "  Leave requests:"
            $leaveData | ForEach-Object { Write-Host "    - ID: $($_.id), Status: $($_.status)" }
        } else {
            Write-Host "  ${Yellow}(No leave requests yet)${Reset}"
        }
        Write-Host ""
    } catch {
        Write-Host "${Red}✗ Failed to fetch leave requests${Reset}"
        Write-Host "  Status: $($_.Exception.Response.StatusCode)"
        Write-Host "  Error: $($_.Exception.Message)"
        Write-Host "  Response: $($_.ErrorDetails.Message)`n"
        return
    }
    
    # Test Step 3: Create a new leave request
    Write-Host "${Blue}Step 3: Creating New Leave Request${Reset}"
    
    $fromDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    $toDate = (Get-Date).AddDays(12).ToString("yyyy-MM-dd")
    
    $leaveJson = @{
        studentName = "Irfan Basha"
        department = "Bsc Information Technology"
        fromDate = $fromDate
        toDate = $toDate
        reason = "Medical leave for health checkup"
        proofFile = $null
    } | ConvertTo-Json
    
    try {
        $createResp = Invoke-WebRequest -Uri "$API_URL/leave/requests" `
            -Method POST `
            -Body $leaveJson `
            -ContentType "application/json" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -ErrorAction Stop
        
        $createdLeave = $createResp.Content | ConvertFrom-Json
        $leaveId = $createdLeave.id
        
        Write-Host "${Green}✓ Leave request created successfully${Reset}"
        Write-Host "  Leave ID: $leaveId"
        Write-Host "  Status: $($createdLeave.status)"
        Write-Host "  Current Stage: $($createdLeave.currentStage)"
        Write-Host "  From: $fromDate To: $toDate`n"
    } catch {
        Write-Host "${Red}✗ Failed to create leave request${Reset}"
        Write-Host "  Status: $($_.Exception.Response.StatusCode)"
        Write-Host "  Error: $($_.Exception.Message)"
        Write-Host "  Details: $($_.ErrorDetails.Message)`n"
        return
    }
    
    # Test Step 4: Fetch leave requests again
    Write-Host "${Blue}Step 4: Fetching Leave Requests After Creation${Reset}"
    
    try {
        $getResp2 = Invoke-WebRequest -Uri "$API_URL/leave/requests/my" `
            -Method GET `
            -Headers @{"Authorization" = "Bearer $token"} `
            -ErrorAction Stop
        
        $leaveData2 = $getResp2.Content | ConvertFrom-Json
        
        Write-Host "${Green}✓ API call successful${Reset}"
        Write-Host "  Total leave requests: $($leaveData2.Count)"
        Write-Host "  Leave requests:"
        $leaveData2 | ForEach-Object { 
            Write-Host "    - ID: $($_.id)"
            Write-Host "      Status: $($_.status)"
            Write-Host "      Dates: $($_.fromDate) to $($_.toDate)"
        }
        Write-Host ""
    } catch {
        Write-Host "${Red}✗ Failed to fetch leave requests${Reset}"
        Write-Host "  Error: $($_.Exception.Message)`n"
        return
    }
    
    # Test Step 5: Check MongoDB directly
    Write-Host "${Blue}Step 5: Checking MongoDB Directly${Reset}"
    
    try {
        $mongoCmd = 'db.approveiq.leaverequests.find().pretty()'
        $mongoResp = docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval $mongoCmd 2>&1
        
        Write-Host "${Green}✓ MongoDB Query${Reset}"
        Write-Host "  Output:"
        $mongoResp | ForEach-Object { Write-Host "    $_" }
        Write-Host ""
    } catch {
        Write-Host "${Yellow}⚠ Could not query MongoDB directly${Reset}"
        Write-Host "  Error: $($_.Exception.Message)`n"
    }
    
    Write-Host "${Green}✓ All tests completed successfully!${Reset}`n"
}

function Show-DatabaseStatus {
    Write-Host "${Blue}Database Status Check${Reset}`n"
    
    Write-Host "Users in database:"
    docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.approveiq.users.countDocuments()" | tail -1
    
    Write-Host "Leave requests in database:"
    docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.approveiq.leaverequests.countDocuments()" | tail -1
    
    Write-Host ""
}

# Main menu
Write-Host "${Yellow}Select test:${Reset}"
Write-Host "1. Full Leave Request API Test"
Write-Host "2. Database Status"
Write-Host "3. Exit"
$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" { Test-LeaveRequestAPI }
    "2" { Show-DatabaseStatus }
    "3" { Write-Host "${Green}Exiting...${Reset}"; exit }
    default { Write-Host "${Red}Invalid choice${Reset}" }
}

Write-Host "`n╔═══════════════════════════════════════════════════════╗"
Write-Host "║                   Test Complete                      ║"
Write-Host "╚═══════════════════════════════════════════════════════╝`n"
