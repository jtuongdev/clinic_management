import React from 'react';
import '../../styles/components/EmptyPanel.css'

const EmptyPanel: React.FC = () => {
  return (
    <div className="panel-empty active">
      <i className="fa-solid fa-construction"></i>
      <h3>Đang phát triển</h3>
      <p style={{color: '#94a2ad', marginTop: '4px'}}>Nội dung của tab này sẽ sớm được cập nhật.</p>
    </div>
  );
};

export default EmptyPanel;