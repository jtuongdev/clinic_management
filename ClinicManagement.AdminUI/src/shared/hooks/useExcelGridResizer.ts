import { useState, useCallback } from 'react';

export function useExcelGridResizer(initialColWidths: Record<string, number> = {}, defaultRowHeight = 36) {
  const [colWidths, setColWidths] = useState<Record<string, number>>(initialColWidths);
  const [rowHeights, setRowHeights] = useState<Record<string | number, number>>({});

  const startColResize = useCallback(
    (colKey: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = colWidths[colKey] || 120;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(48, startWidth + delta);
        setColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [colWidths]
  );

  const startRowResize = useCallback(
    (rowKey: string | number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startY = e.clientY;
      const startHeight = rowHeights[rowKey] || defaultRowHeight;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY;
        const newHeight = Math.max(28, startHeight + delta);
        setRowHeights((prev) => ({ ...prev, [rowKey]: newHeight }));
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [rowHeights, defaultRowHeight]
  );

  return {
    colWidths,
    setColWidths,
    rowHeights,
    startColResize,
    startRowResize,
  };
}
