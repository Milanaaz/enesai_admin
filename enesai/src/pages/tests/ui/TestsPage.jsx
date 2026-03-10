import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './tests-page.css'

const testRows = [
  {
    title: 'Итоговый тест - Модуль 1',
    course: 'Основы',
    questions: 10,
    attempts: 245,
    score: '85%',
  },
  {
    title: 'Грамматика: Настоящее время',
    course: 'Основы',
    questions: 15,
    attempts: 189,
    score: '78%',
  },
  {
    title: 'Словарный тест',
    course: 'Разговорная практика',
    questions: 20,
    attempts: 156,
    score: '92%',
  },
]

function TestsPage() {
  return (
    <section className="admin-page tests-page">
      <header className="tests-page-header">
        <div>
          <h1>Управление тестами</h1>
          <p>Создавайте и редактируйте тесты</p>
        </div>

        <button type="button" className="tests-create-btn">
          <AdminIcon name="plus" className="admin-icon" />
          Создать тест
        </button>
      </header>

      <section className="tests-table-card">
        <table className="tests-table">
          <thead>
            <tr>
              <th>Название теста</th>
              <th>Курс</th>
              <th>Вопросов</th>
              <th>Попыток</th>
              <th>Средний балл</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {testRows.map((test) => (
              <tr key={test.title}>
                <td className="test-name-cell">{test.title}</td>
                <td>{test.course}</td>
                <td>{test.questions}</td>
                <td>{test.attempts}</td>
                <td>
                  <span className="test-score-badge">{test.score}</span>
                </td>
                <td>
                  <div className="test-actions">
                    <button type="button" aria-label={`Просмотреть тест ${test.title}`}>
                      <AdminIcon name="eye" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Редактировать тест ${test.title}`}>
                      <AdminIcon name="edit" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Удалить тест ${test.title}`} className="is-danger">
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

export default TestsPage
