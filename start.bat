@echo off
TITLE Clinic Management HIS - Dual Workstations
echo ==================================================================
echo   CLINIC MANAGEMENT HIS - DUAL WORKSTATIONS LAUNCHER
echo ==================================================================
echo   * ADMIN UI:   http://localhost:3000
echo   * DOCTOR UI:  http://localhost:3001
echo ==================================================================

start "Clinic AdminUI" cmd /k "cd ClinicManagement.AdminUI && npm run dev"
start "Clinic DoctorUI" cmd /k "cd ClinicManagement.DoctorUI && npm run dev"

timeout /t 2 >nul
start http://localhost:3000
start http://localhost:3001
