function Table({ columns, rows, getRowKey, renderCell, emptyText = 'Нет данных', className = '' }) {
  const classes = ['ui-table', className].filter(Boolean).join(' ')

  if (!rows?.length) {
    return <div className="ui-table-empty">{emptyText}</div>
  }

  return (
    <table className={classes}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={getRowKey ? getRowKey(row) : rowIndex}>
            {columns.map((column) => (
              <td key={column.key}>{renderCell ? renderCell(row, column) : row[column.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
