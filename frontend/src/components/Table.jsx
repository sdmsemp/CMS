import React from 'react';

const Table = ({ data, columns }) => (
  <table className="min-w-full bg-white border">
    <thead>
      <tr>
        {columns.map(col => (
          <th key={col} className="py-2 px-4 border-b font-bold">{col}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {data.map((row, idx) => (
        <tr key={idx}>
          {columns.map(col => (
            <td key={col} className="py-2 px-4 border-b">{row[col.toLowerCase()]}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
