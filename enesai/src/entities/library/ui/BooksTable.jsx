function BooksTable({ books, busy, onOpenBook }) {
  return (
    <section className="articles-table-card">
      {busy === 'load' ? <div className="library-empty">Загрузка книг...</div> : null}
      {busy !== 'load' && books.length === 0 ? <div className="library-empty">Книги не найдены</div> : null}
      {books.length > 0 ? (
        <table className="articles-table">
          <thead>
            <tr>
              <th>Книга</th>
              <th>Автор</th>
              <th>Уровень</th>
              <th>Жанр</th>
              <th>Страниц</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id} onClick={() => onOpenBook(book.id)}>
                <td className="article-name-cell">{book.title}</td>
                <td>{book.author || '-'}</td>
                <td><span className="article-status-badge is-draft">{book.level}</span></td>
                <td>{book.genre || '-'}</td>
                <td>{book.totalPages || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}

export default BooksTable
