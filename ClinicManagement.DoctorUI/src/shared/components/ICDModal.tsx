import React, { useState, useEffect } from 'react';
import '../../styles/components/ICDModal.css';
import { examinationApi } from '../../examination/api/examination.api';
import type { ICDOption } from '../../examination/types/examination/diagnosis.types';

const ICDModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [icds, setIcds] = useState<ICDOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await examinationApi.searchICD(search);
        setIcds(res.data?.data || []);
      } catch (err) {
        console.error('Lỗi khi tra cứu ICD-10:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, isOpen]);

  const handleSelect = (code: string, name: string) => {
    alert(`Đã chọn ICD: ${code} - ${name}`);
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="btn"
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 50 }}
        onClick={() => setIsOpen(true)}
      >
        <i className="fa-solid fa-magnifying-glass"></i> Tra cứu ICD-10
      </button>

      <div className={`modal ${isOpen ? 'open' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}>
        <div className="modal-box">
          <div className="modal-head">
            <strong><i className="fa-solid fa-magnifying-glass"></i> Tra cứu danh mục ICD-10</strong>
            <button className="close" onClick={() => setIsOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body">
            <div className="search" style={{marginBottom: '12px'}}>
              <input
                placeholder="Nhập mã hoặc tên bệnh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="fa-solid fa-search"></i>
            </div>
            {isLoading ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                <i className="fa-solid fa-spinner fa-spin"></i> Đang tra cứu CSDL...
              </div>
            ) : icds.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                Không tìm thấy mã ICD phù hợp.
              </div>
            ) : (
              icds.map(item => (
                <div
                  key={item.maICD}
                  className="result"
                  onClick={() => handleSelect(item.maICD, item.tenICD)}
                >
                  <strong>{item.maICD} — {item.tenICD}</strong>
                  <small>{item.chuong || 'ICD-10'}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ICDModal;