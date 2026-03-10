import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './articles-page.css'

const articleRows = [
  {
    title: 'История кыргызского языка',
    author: 'Админ',
    views: '1 234',
    status: 'Опубликована',
    date: '1 Март 2026',
  },
  {
    title: '10 советов для изучения языка',
    author: 'Админ',
    views: '856',
    status: 'Опубликована',
    date: '28 Фев 2026',
  },
  {
    title: 'Кыргызская культура и традиции',
    author: 'Админ',
    views: '543',
    status: 'Черновик',
    date: '25 Фев 2026',
  },
]

function ArticlesPage() {
  return (
    <section className="admin-page articles-page">
      <header className="articles-page-header">
        <div>
          <h1>Управление статьями</h1>
          <p>Создавайте и публикуйте статьи</p>
        </div>

        <button type="button" className="articles-create-btn">
          <AdminIcon name="plus" className="admin-icon" />
          Создать статью
        </button>
      </header>

      <section className="articles-table-card">
        <table className="articles-table">
          <thead>
            <tr>
              <th>Название статьи</th>
              <th>Автор</th>
              <th>Просмотров</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {articleRows.map((article) => (
              <tr key={article.title}>
                <td className="article-name-cell">{article.title}</td>
                <td>{article.author}</td>
                <td>{article.views}</td>
                <td>
                  <span
                    className={`article-status-badge ${
                      article.status === 'Опубликована' ? 'is-published' : 'is-draft'
                    }`}
                  >
                    {article.status}
                  </span>
                </td>
                <td>{article.date}</td>
                <td>
                  <div className="article-actions">
                    <button type="button" aria-label={`Просмотреть статью ${article.title}`}>
                      <AdminIcon name="eye" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Редактировать статью ${article.title}`}>
                      <AdminIcon name="edit" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Удалить статью ${article.title}`} className="is-danger">
                      <AdminIcon name="trash" className="admin-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}

export default ArticlesPage
