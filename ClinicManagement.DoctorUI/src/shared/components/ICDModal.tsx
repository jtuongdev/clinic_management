import React, { useState } from 'react';
import '../../styles/components/ICDModal.css'

interface ICDItem {
  code: string;
  name: string;
  desc: string;
}

const mockICDs: ICDItem[] = [
  { code: 'J06.9', name: 'Nhiễm trùng đường hô hấp cấp không đặc hiệu', desc: 'Bệnh lý hô hấp · ICD-10' },
  { code: 'R06.0', name: 'Khó thở', desc: 'Triệu chứng · ICD-10' },
  { code: 'J18.9', name: 'Viêm phổi, không xác định tác nhân', desc: 'Bệnh lý hô hấp · ICD-10' },
];

const ICDModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = mockICDs.filter(item =>
    item.code.includes(search) || item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: string, name: string) => {
    // TODO: Điền vào form chẩn đoán
    alert(`Chọn ICD: ${code} - ${name}`);
    setIsOpen(false);
  };

  // Có thể mở modal bằng cách gọi setIsOpen(true) từ component cha
  // Ở đây demo với nút giả, nhưng thực tế sẽ được gọi từ ExamPanel

  return (
    <>
      {/* Nút mở modal (demo) - thực tế sẽ được gọi từ ExamPanel */}
      <button
        className="btn"
        style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 50 }}
        onClick={() => setIsOpen(true)}
      >
        <i className="fa-solid fa-magnifying-glass"></i> Tra cứu ICD (demo)
      </button>

      <div className={`modal ${isOpen ? 'open' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}>
        <div className="modal-box">
          <div className="modal-head">
            <strong><i className="fa-solid fa-magnifying-glass"></i> Tra cứu ICD-10</strong>
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
            {filtered.map(item => (
              <div
                key={item.code}
                className="result"
                onClick={() => handleSelect(item.code, item.name)}
              >
                <strong>{item.code} — {item.name}</strong>
                <small>{item.desc}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ICDModal;