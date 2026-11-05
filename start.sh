#!/usr/bin/env bash
# ==============================================================================
# HỆ THỐNG QUẢN LÝ PHÒNG KHÁM / BỆNH VIỆN - CLINIC MANAGEMENT HIS
# TỰ ĐỘNG KHỞI CHẠY ĐỒNG THỜI CẢ ADMIN UI VÀ DOCTOR UI CHỈ VỚI 1 LỆNH
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$PROJECT_DIR"

echo "=================================================================="
echo "  🩺 CLINIC MANAGEMENT HIS - DUAL WORKSTATIONS LAUNCHER"
echo "=================================================================="
echo "  • ADMIN UI (Quản trị & Viện phí):   http://localhost:3000"
echo "  • DOCTOR UI (Bàn khám Bác sĩ EMR):   http://localhost:3001"
echo "------------------------------------------------------------------"
echo "  * Nhấn Ctrl+C để dừng đồng thời cả 2 hệ thống."
echo "=================================================================="
echo ""

# Dọn dẹp các tiến trình con khi bấm Ctrl+C
cleanup() {
  echo ""
  echo "🛑 Đang tắt toàn bộ hệ thống..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Kiểm tra thư mục node_modules
if [ ! -d "ClinicManagement.AdminUI/node_modules" ]; then
  echo "📦 Đang cài đặt thư viện cho AdminUI..."
  (cd ClinicManagement.AdminUI && npm install)
fi

if [ ! -d "ClinicManagement.DoctorUI/node_modules" ]; then
  echo "📦 Đang cài đặt thư viện cho DoctorUI..."
  (cd ClinicManagement.DoctorUI && npm install)
fi

# Khởi chạy AdminUI trên Port 3000
(cd ClinicManagement.AdminUI && npm run dev) &
PID_ADMIN=$!

# Khởi chạy DoctorUI trên Port 3001
(cd ClinicManagement.DoctorUI && npm run dev) &
PID_DOCTOR=$!

# Mở trình duyệt tự động trên macOS nếu có lệnh open
if command -v open >/dev/null 2>&1; then
  sleep 2
  open "http://localhost:3000" || true
  open "http://localhost:3001" || true
fi

# Chờ cả 2 tiến trình
wait $PID_ADMIN $PID_DOCTOR
