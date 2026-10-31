export default function Table({ columns, data, loading, emptyMessage = 'No records found' }) {
  if (loading) {
    return (
      <div className="w-full rounded-3xl bg-white border border-[#ebdcc9] p-12 flex flex-col items-center justify-center gap-3 shadow-xs">
        <div className="w-7 h-7 border-3 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-neutral-400">Loading catalog data…</span>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white border border-[#ebdcc9] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ebdcc9] bg-[#fbf7ee]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-4 px-6 text-[11px] font-black text-neutral-600 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1e6d8] text-xs font-semibold text-neutral-800">
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-neutral-400 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx}
                  className="hover:bg-[#fbf7ee]/60 transition-colors duration-150"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-4 px-6 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
