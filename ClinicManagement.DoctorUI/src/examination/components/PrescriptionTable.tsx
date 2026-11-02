import React from 'react';
import type { PrescriptionItemRequest } from '../types/examination/index';

export interface PrescriptionTableProps {
  items: PrescriptionItemRequest[];
  onRemoveItem: (index: number) => void;
  readOnly?: boolean;
}

export const PrescriptionTable: React.FC<PrescriptionTableProps> = ({
  items,
  onRemoveItem,
  readOnly = false,
}) => {
  // Tính tổng tiền dự kiến
  const estimatedTotal = items.reduce((sum, item) => {
    const price = item.donGia ?? 0;
    return sum + price * item.soLuong;
  }, 0);

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#64748b',
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: 6,
        }}
      >
        <i
          className="fa-solid fa-prescription-bottle-medical"
          style={{
            display: 'block',
            fontSize: '28px',
            marginBottom: '10px',
            color: '#94a3b8',
          }}
        ></i>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
          Chưa có thuốc nào trong đơn
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: 4 }}>
          Sử dụng ô tìm kiếm phía trên để thêm thuốc vào đơn thuốc của bệnh nhân.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <th
                style={{
                  padding: '9px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  width: 44,
                  textAlign: 'center',
                }}
              >
                STT
              </th>
              <th
                style={{
                  padding: '9px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  minWidth: 220,
                }}
              >
                Tên thuốc / Hoạt chất
              </th>
              <th
                style={{
                  padding: '9px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  width: 100,
                }}
              >
                Số lượng
              </th>
              <th
                style={{
                  padding: '9px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  width: 90,
                }}
              >
                Đường dùng
              </th>
              <th
                style={{
                  padding: '9px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  width: 80,
                  textAlign: 'center',
                }}
              >
                Số ngày
              </th>
              <th
                style={{
                  padding: '9px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  minWidth: 240,
                }}
              >
                Hướng dẫn sử dụng / Liều dùng
              </th>
              {estimatedTotal > 0 && (
                <th
                  style={{
                    padding: '9px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                    width: 110,
                  }}
                >
                  Thành tiền
                </th>
              )}
              {!readOnly && (
                <th
                  style={{
                    padding: '9px 12px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    width: 50,
                    textAlign: 'center',
                  }}
                ></th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const lineTotal = (item.donGia ?? 0) * item.soLuong;

              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: index % 2 === 1 ? '#fafafa' : '#ffffff',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#f0f9ff')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      index % 2 === 1 ? '#fafafa' : '#ffffff')
                  }
                >
                  {/* Cột STT */}
                  <td
                    style={{
                      padding: '9px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#64748b',
                      textAlign: 'center',
                    }}
                  >
                    {index + 1}
                  </td>

                  {/* Cột Tên thuốc (Typography 14px - 15px tương phản cao) */}
                  <td style={{ padding: '9px 12px' }}>
                    <div
                      style={{
                        fontSize: '14.5px',
                        fontWeight: 600,
                        color: '#111827',
                        lineHeight: 1.35,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {item.tenThuoc}
                    </div>
                    {item.hoatChat && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#4b5563',
                          marginTop: 2,
                        }}
                      >
                        Hoạt chất: <strong>{item.hoatChat}</strong>
                      </div>
                    )}
                  </td>

                  {/* Cột Số lượng & ĐVT */}
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        padding: '3px 8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      <span>{item.soLuong}</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {item.donViTinh}
                      </span>
                    </span>
                  </td>

                  {/* Cột Đường dùng */}
                  <td style={{ padding: '9px 12px' }}>
                    <span
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.duongDung || 'Uống'}
                    </span>
                  </td>

                  {/* Cột Số ngày */}
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334151' }}>
                      {item.soNgay} ngày
                    </span>
                  </td>

                  {/* Cột Hướng dẫn sử dụng (Typography 13px rõ nét) */}
                  <td style={{ padding: '9px 12px' }}>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#1f2937',
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.huongDanSuDung || item.lieuDung || 'Theo chỉ dẫn của bác sĩ'}
                    </div>
                  </td>

                  {/* Cột Thành tiền (nếu có) */}
                  {estimatedTotal > 0 && (
                    <td
                      style={{
                        padding: '9px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#0f172a',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                      }}
                    >
                      {lineTotal > 0 ? `${lineTotal.toLocaleString('vi-VN')} ₫` : '---'}
                    </td>
                  )}

                  {/* Cột Thao tác */}
                  {!readOnly && (
                    <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        title="Xóa thuốc khỏi đơn"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          border: '1px solid #fecaca',
                          background: '#fff',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = '#fef2f2')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = '#ffffff')
                        }
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Thanh chân bảng (Summary Footer) */}
      <div
        style={{
          padding: '10px 14px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
        }}
      >
        <div style={{ color: '#475569' }}>
          Tổng số thuốc trong đơn:{' '}
          <strong style={{ color: '#0f172a', fontSize: '14px' }}>
            {items.length}
          </strong>{' '}
          khoản
        </div>
        {estimatedTotal > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#475569' }}>Tổng tiền ước tính:</span>
            <strong
              style={{
                fontSize: '15px',
                color: '#0284c7',
                fontFamily: 'monospace',
              }}
            >
              {estimatedTotal.toLocaleString('vi-VN')} ₫
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionTable;
