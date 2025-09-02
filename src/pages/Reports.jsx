import React from 'react';
import { FileText } from 'lucide-react';

function Reports() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText size={24} />
        Отчеты
      </h2>
      <div className="card">
        <p className="text-gray">Модуль отчетов в разработке</p>
      </div>
    </div>
  );
}

export default Reports;