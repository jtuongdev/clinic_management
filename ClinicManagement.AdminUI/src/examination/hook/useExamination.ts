import { useContext } from 'react';
import { ExaminationContext } from '../context/ExaminationContext';

export const useExamination = () => {
  const context = useContext(ExaminationContext);
  if (!context) {
    throw new Error('useExamination must be used within ExaminationProvider');
  }
  return context;
};