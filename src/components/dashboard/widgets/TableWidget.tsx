import React from 'react';
import { WidgetContainer } from '../WidgetContainer';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface TableWidgetProps {
  id: string;
  title: string;
  columns: Column[];
  data: Record<string, unknown>[];
  size?: 'small' | 'medium' | 'large' | 'full';
}

export const TableWidget: React.FC<TableWidgetProps> = ({
  id,
  title,
  columns,
  data,
  size = 'large',
}) => {
  return (
    <WidgetContainer id={id} title={title} size={size}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-6 py-3">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={`${rowIndex}-${col.key}`} className="px-6 py-4">
                    {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </WidgetContainer>
  );
};
