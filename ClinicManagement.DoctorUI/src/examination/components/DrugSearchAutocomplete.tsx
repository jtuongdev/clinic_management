import React, { useState, useEffect, useRef, useCallback } from 'react';
import { examinationApi } from '../api/examination.api';
import type { DrugSearchResult } from '../types/examination/index';

export interface DrugSearchAutocompleteProps {
  onSelectDrug: (drug: DrugSearchResult) => void;
  selectedDrug: DrugSearchResult | null;
  maKho?: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  disabled?: boolean;
}

export const DrugSearchAutocomplete: React.FC<DrugSearchAutocompleteProps> = ({
  onSelectDrug,
  selectedDrug: _selectedDrug,
  maKho,
  inputRef: externalInputRef,
  placeholder = 'Gõ tên biệt dược, hoạt chất, mã thuốc (VD: Para, Amox, 500mg)...',
  disabled = false,
}) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<DrugSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchWarning, setSearchWarning] = useState<string | null>(null);

  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const internalInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = externalInputRef || internalInputRef;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tính toán vị trí dropdown (nếu bên dưới hẹp thì mở ngược lên trên dropup)
  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 280 && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen && results.length > 0) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
      };
    }
  }, [isOpen, results.length, updateDropdownPosition]);

  // Tự động cuộn theo phím mũi tên khi điều hướng danh sách
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Tìm kiếm thuốc qua API với debounce 250ms
  const executeSearch = useCallback(
    async (kw: string) => {
      const cleanKw = kw.trim();
      if (!cleanKw || cleanKw.length < 1) {
        setResults([]);
        setSelectedIndex(-1);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await examinationApi.searchDrugs(cleanKw, maKho);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const list = res.data.data;
          setResults(list);
          setIsOpen(true);
          // Tìm vị trí thuốc còn hàng đầu tiên để focus mặc định
          const firstAvailableIdx = list.findIndex(
            (d) => (d.soLuongKhaDung ?? d.tonKho ?? 0) > 0,
          );
          setSelectedIndex(firstAvailableIdx >= 0 ? firstAvailableIdx : 0);
        } else {
          setResults([]);
          setSelectedIndex(-1);
          setIsOpen(false);
        }
      } catch {
        setResults([]);
        setSelectedIndex(-1);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [maKho],
  );

  // Debounce 250ms khi gõ từ khóa
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (keyword.trim().length >= 1) {
      debounceTimerRef.current = setTimeout(() => {
        void executeSearch(keyword);
      }, 250);
    } else {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [keyword, executeSearch]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (drug: DrugSearchResult) => {
    const availableStock = drug.soLuongKhaDung ?? drug.tonKho ?? 0;
    if (availableStock <= 0) {
      setSearchWarning(
        `Thuốc "${drug.tenThuoc || drug.ten}" đã HẾT HÀNG trong kho (tồn = 0). Không thể kê!`,
      );
      setTimeout(() => setSearchWarning(null), 3500);
      return;
    }

    setSearchWarning(null);
    onSelectDrug(drug);
    setKeyword('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Keyboard navigation 100%: ArrowDown, ArrowUp, Enter, Escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && keyword.trim().length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        let next = prev < results.length - 1 ? prev + 1 : 0;
        // Bỏ qua item hết hàng nếu có
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => {
        let next = prev > 0 ? prev - 1 : results.length - 1;
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        const item = results[selectedIndex];
        handleSelect(item);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        marginBottom: 10,
        zIndex: isOpen ? 1000 : 1,
      }}
    >
      <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            className="grow"
            value={keyword}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            style={{
              width: '100%',
              height: 38,
              padding: '0 36px 0 12px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          />
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#0284c7',
                fontSize: 13,
              }}
            >
              <i className="fa-solid fa-spinner fa-spin"></i>
            </div>
          )}
          {!isLoading && keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: 13,
                padding: 4,
              }}
              title="Xóa tìm kiếm"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* Cảnh báo thuốc hết hàng khi cố chọn */}
      {searchWarning && (
        <div
          style={{
            marginTop: 6,
            padding: '6px 12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 4,
            color: '#dc2626',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <i className="fa-solid fa-circle-exclamation"></i>
          {searchWarning}
        </div>
      )}

      {isOpen && !isLoading && keyword.trim() && results.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            padding: '10px 12px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            color: '#64748b',
            fontSize: 12,
            zIndex: 9999,
          }}
        >
          Không tìm thấy thuốc đang hoạt động và được phép kê đơn.
        </div>
      )}

      {/* Danh sách gợi ý tìm kiếm 2 dòng */}
      {isOpen && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            ...(dropdownPosition === 'top'
              ? {
                  bottom: 'calc(100% + 4px)',
                  top: 'auto',
                  boxShadow:
                    '0 -10px 25px -3px rgba(0, 0, 0, 0.18), 0 -4px 6px -4px rgba(0, 0, 0, 0.1)',
                }
              : {
                  top: 'calc(100% + 4px)',
                  bottom: 'auto',
                  boxShadow:
                    '0 12px 28px -3px rgba(0, 0, 0, 0.18), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                }),
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #94a3b8',
            borderRadius: 6,
            zIndex: 9999,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {results.map((drug, index) => {
            const availableStock = drug.soLuongKhaDung ?? drug.tonKho ?? 0;
            const isOutOfStock = availableStock <= 0;
            const isLowStock = availableStock > 0 && availableStock < 10;
            const isSelected = selectedIndex === index;

            return (
              <div
                key={drug.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => handleSelect(drug)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  backgroundColor: isSelected
                    ? isOutOfStock
                      ? '#fff1f2'
                      : '#f0f9ff'
                    : isOutOfStock
                      ? '#fafafa'
                      : '#ffffff',
                  opacity: isOutOfStock ? 0.55 : 1,
                  transition: 'background-color 0.1s, opacity 0.1s',
                }}
              >
                {/* Dòng 1: [Mã] Tên biệt dược - Hàm lượng + Tag đường dùng + BHYT */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#0369a1',
                        background: '#e0f2fe',
                        padding: '1px 5px',
                        borderRadius: 3,
                      }}
                    >
                      {drug.maThuoc || drug.ma}
                    </span>
                    <strong
                      style={{
                        fontSize: 14,
                        color: isOutOfStock ? '#64748b' : '#0f172a',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {drug.tenThuoc || drug.ten}
                    </strong>
                    {drug.hamLuong && (
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#475569',
                        }}
                      >
                        - {drug.hamLuong}
                      </span>
                    )}
                    {drug.duongDung && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '1px 6px',
                          borderRadius: 3,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {drug.duongDung}
                      </span>
                    )}
                    {drug.laThuocBHYT && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '1px 6px',
                          borderRadius: 3,
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        BHYT
                      </span>
                    )}
                  </div>

                  {/* Badge Tồn kho */}
                  <div style={{ flexShrink: 0 }}>
                    {isOutOfStock ? (
                      <span
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <i className="fa-solid fa-ban"></i> HẾT HÀNG / TỒN: 0
                      </span>
                    ) : isLowStock ? (
                      <span
                        style={{
                          background: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <i className="fa-solid fa-triangle-exclamation"></i> SẮP
                        HẾT: còn {availableStock} {drug.donViTinh}
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        Tồn: {availableStock} {drug.donViTinh}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dòng 2: Hoạt chất | ĐVT | Giá niêm yết */}
                <div
                  style={{
                    fontSize: 12,
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    paddingLeft: 2,
                  }}
                >
                  <span>
                    Hoạt chất:{' '}
                    <strong style={{ color: '#334151' }}>
                      {drug.hoatChat || '---'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    ĐVT:{' '}
                    <strong style={{ color: '#334151' }}>
                      {drug.donViTinh || 'Viên'}
                    </strong>
                  </span>
                  {drug.gia ? (
                    <>
                      <span>•</span>
                      <span>
                        Giá: {Number(drug.gia).toLocaleString('vi-VN')} đ
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DrugSearchAutocomplete;
