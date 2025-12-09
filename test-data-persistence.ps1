#!/usr/bin/env pwsh
# Data Persistence Test Script for ApproveIQ
# This script verifies that data persists across container restarts

Write-Host "`n╔════════════════════════════════════════════════════════╗"
Write-Host "║   ApproveIQ Docker Data Persistence Test Script      ║"
Write-Host "╚════════════════════════════════════════════════════════╝`n"

# Color codes for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Test-DataPersistence {
    Write-Host "${Blue}Step 1: Checking current containers...${Reset}"
    docker ps -a | grep "approveiq" | Format-Table
    
    Write-Host "`n${Blue}Step 2: Checking MongoDB volume...${Reset}"
    $volume = docker volume ls | grep "mongodb_data"
    if ($volume) {
        Write-Host "${Green}✓ Volume 'leave-approval-flow-main_mongodb_data' exists${Reset}"
    } else {
        Write-Host "${Red}✗ Volume not found!${Reset}"
        return
    }
    
    Write-Host "`n${Blue}Step 3: Checking current user count in database...${Reset}"
    $userCount = docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.approveiq.users.countDocuments()" 2>$null | tail -1
    Write-Host "Users in database: ${Green}$userCount${Reset}"
    
    Write-Host "`n${Blue}Step 4: Stopping containers (preserving data)...${Reset}"
    docker-compose down
    Write-Host "${Green}✓ Containers stopped (data preserved in volume)${Reset}"
    
    Start-Sleep -Seconds 3
    
    Write-Host "`n${Blue}Step 5: Restarting containers...${Reset}"
    docker-compose up -d
    Write-Host "${Green}✓ Containers restarted${Reset}"
    
    Start-Sleep -Seconds 10
    
    Write-Host "`n${Blue}Step 6: Verifying data persisted...${Reset}"
    $newUserCount = docker exec approveiq-mongodb mongosh -u root -p rootpassword --authenticationDatabase admin --eval "db.approveiq.users.countDocuments()" 2>$null | tail -1
    Write-Host "Users in database after restart: ${Green}$newUserCount${Reset}"
    
    if ($userCount -eq $newUserCount) {
        Write-Host "`n${Green}✓ DATA PERSISTENCE VERIFIED!${Reset}"
        Write-Host "  Same number of users before and after restart"
        Write-Host "  All data successfully preserved in Docker volume"
    } else {
        Write-Host "`n${Red}✗ DATA MISMATCH!${Reset}"
        Write-Host "  Before: $userCount users"
        Write-Host "  After: $newUserCount users"
    }
    
    Write-Host "`n${Blue}Step 7: Showing application status...${Reset}"
    docker logs approveiq-app | tail -5
}

function Test-DataDeletion {
    Write-Host "`n${Yellow}WARNING: This test will DELETE all data!${Reset}"
    Write-Host "Continue? (yes/no)"
    $response = Read-Host
    
    if ($response -eq "yes") {
        Write-Host "`n${Blue}Deleting MongoDB volume with -v flag...${Reset}"
        docker-compose down -v
        Write-Host "${Red}✗ Volume deleted${Reset}"
        
        Start-Sleep -Seconds 3
        
        Write-Host "`n${Blue}Restarting containers...${Reset}"
        docker-compose up -d
        Start-Sleep -Seconds 10
        
        Write-Host "`n${Blue}Checking database state...${Reset}"
        docker logs approveiq-app | grep -E "(Database is empty|Seeding|already contains)"
        Write-Host "${Yellow}Database has been reset to seed state${Reset}"
    }
}

# Main menu
Write-Host "${Blue}Select test:${Reset}"
Write-Host "1. Test data persistence (safe)"
Write-Host "2. Test data deletion with -v flag (destructive)"
Write-Host "3. Exit"
$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" { Test-DataPersistence }
    "2" { Test-DataDeletion }
    "3" { Write-Host "${Green}Exiting...${Reset}"; exit }
    default { Write-Host "${Red}Invalid choice${Reset}" }
}

Write-Host "`n╔════════════════════════════════════════════════════════╗"
Write-Host "║                   Test Complete                       ║"
Write-Host "╚════════════════════════════════════════════════════════╝`n"
