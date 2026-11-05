#!/usr/bin/env bash
# ==============================================================================
# HỆ THỐNG QUẢN LÝ PHÒNG KHÁM / BỆNH VIỆN - CLINIC MANAGEMENT HIS
# TỰ ĐỘNG KHỞI CHẠY ĐỒNG THỜI BACKEND API + ADMIN UI + DOCTOR UI CHỈ VỚI 1 LỆNH
# ==============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$PROJECT_DIR"

echo "=================================================================="
echo "  🩺 CLINIC MANAGEMENT HIS - FULL SYSTEM LAUNCHER"
echo "=================================================================="
echo "  • BACKEND API (.NET Core):          https://localhost:7081"
echo "  • ADMIN UI (Quản trị & Viện phí):   http://localhost:3000"
echo "  • DOCTOR UI (Bàn khám Bác sĩ EMR):   http://localhost:3001"
echo "------------------------------------------------------------------"
echo "  * Nhấn Ctrl+C để dừng đồng thời toàn bộ hệ thống."
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

# 1. Khởi chạy Backend API (.NET) nếu chưa chạy
if ! lsof -i :7081 >/dev/null 2>&1; then
  echo "🚀 Đang khởi động Backend API (.NET)..."
  (cd ClinicManagement.API && dotnet run) &
  sleep 4
else
  echo "✅ Backend API (.NET) đã đang chạy trên cổng 7081."
fi

# 2. Kiểm tra thư mục node_modules
if [ ! -d "ClinicManagement.AdminUI/node_modules" ]; then
  echo "📦 Đang cài đặt thư viện cho AdminUI..."
  (cd ClinicManagement.AdminUI && npm install)
fi

if [ ! -d "ClinicManagement.DoctorUI/node_modules" ]; then
  echo "📦 Đang cài đặt thư viện cho DoctorUI..."
  (cd ClinicManagement.DoctorUI && npm install)
fi

# 3. Khởi chạy AdminUI trên Port 3000
echo "🌐 Đang khởi động Admin UI (Port 3000)..."
(cd ClinicManagement.AdminUI && npm run dev) &

# 4. Khởi chạy DoctorUI trên Port 3001
echo "🌐 Đang khởi động Doctor UI (Port 3001)..."
(cd ClinicManagement.DoctorUI && npm run dev) &

# 5. Mở trình duyệt tự động trên macOS
if command -v open >/dev/null 2>&1; then
  sleep 2
  open "http://localhost:3000" || true
  open "http://localhost:3001" || true
fi

# Chờ các tiến trình
wait
