import React from 'react';
import './Table.css';

const Table = ({ 
  columns = [],
  data = [],
  onRowClick,
  className = '',
  striped = true,
  hoverable = true
}) => {
  const tableClasses = [
    'table',
    striped && 'table-striped',
    hoverable && 'table-hoverable',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="table-wrapper">
      <table className={tableClasses}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                style={{ 
                  width: column.width,
                  textAlign: column.align || 'left' 
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex}
                    style={{ textAlign: column.align || 'left' }}
                  >
                    {column.render 
                      ? column.render(row[column.accessor], row, rowIndex)
                      : row[column.accessor]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
