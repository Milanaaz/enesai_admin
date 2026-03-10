import { useMemo, useState } from 'react'
import AdminIcon from '../../admin/ui/components/AdminIcon.jsx'
import './certificates-page.css'

const certificateRows = [
  {
    id: '#000001',
    student: 'Айдай Асанова',
    studentInitial: 'А',
    course: 'Основы кыргызского языка',
    grade: 'A',
    issueDate: '1 Март 2026',
    status: 'Выдан',
  },
  {
    id: '#000002',
    student: 'Бекжан Тойчиев',
    studentInitial: 'Б',
    course: 'Разговорная практика',
    grade: 'B+',
    issueDate: '28 Фев 2026',
    status: 'Выдан',
  },
  {
    id: '#000003',
    student: 'Дастан Эргешов',
    studentInitial: 'Д',
    course: 'Грамматика для начинающих',
    grade: 'A+',
    issueDate: '25 Фев 2026',
    status: 'Выдан',
  },
  {
    id: '#000004',
    student: 'Гулнара Садырова',
    studentInitial: 'Г',
    course: 'Основы кыргызского языка',
    grade: 'B',
    issueDate: '20 Фев 2026',
    status: 'Отозван',
  },
]

function CertificatesPage() {
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('Все курсы')
  const [statusFilter, setStatusFilter] = useState('Все статусы')
  const [previewCertificate, setPreviewCertificate] = useState(certificateRows[0])

  const filteredCertificates = useMemo(() => {
    return certificateRows.filter((certificate) => {
      const query = search.trim().toLowerCase()
      const matchesSearch =
        certificate.student.toLowerCase().includes(query) || certificate.id.toLowerCase().includes(query)
      const matchesCourse = courseFilter === 'Все курсы' || certificate.course === courseFilter
      const matchesStatus = statusFilter === 'Все статусы' || certificate.status === statusFilter
      return matchesSearch && matchesCourse && matchesStatus
    })
  }, [search, courseFilter, statusFilter])

  return (
    <section className="admin-page certificates-page">
      <header className="certificates-page-header">
        <div>
          <h1>Управление сертификатами</h1>
          <p>Просмотр и управление выданными сертификатами</p>
        </div>
      </header>

      <div className="certificates-summary-grid">
        <article className="certificates-summary-card">
          <p>Всего выдано</p>
          <strong>4</strong>
        </article>
        <article className="certificates-summary-card">
          <p>Активных</p>
          <strong className="is-green">3</strong>
        </article>
        <article className="certificates-summary-card">
          <p>Отозванных</p>
          <strong className="is-red">1</strong>
        </article>
        <article className="certificates-summary-card">
          <p>В этом месяце</p>
          <strong className="is-violet">3</strong>
        </article>
      </div>

      <section className="certificates-filters" aria-label="Фильтрация сертификатов">
        <label className="certificates-search">
          <AdminIcon name="search" className="admin-icon" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск сертификатов..."
            aria-label="Поиск сертификатов"
          />
        </label>

        <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} aria-label="Курс">
          <option>Все курсы</option>
          <option>Основы кыргызского языка</option>
          <option>Разговорная практика</option>
          <option>Грамматика для начинающих</option>
        </select>

        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Статус">
          <option>Все статусы</option>
          <option>Выдан</option>
          <option>Отозван</option>
        </select>
      </section>

      <section className="certificates-table-card">
        <table className="certificates-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Студент</th>
              <th>Курс</th>
              <th>Оценка</th>
              <th>Дата выдачи</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertificates.map((certificate) => (
              <tr key={certificate.id}>
                <td>{certificate.id}</td>
                <td>
                  <div className="certificates-student-cell">
                    <span className="certificates-avatar">{certificate.studentInitial}</span>
                    <strong>{certificate.student}</strong>
                  </div>
                </td>
                <td>{certificate.course}</td>
                <td>
                  <span className="certificates-grade-badge">{certificate.grade}</span>
                </td>
                <td>{certificate.issueDate}</td>
                <td>
                  <span
                    className={`certificates-status-badge ${
                      certificate.status === 'Выдан' ? 'is-issued' : 'is-revoked'
                    }`}
                  >
                    {certificate.status}
                  </span>
                </td>
                <td>
                  <div className="certificates-actions">
                    <button
                      type="button"
                      aria-label={`Просмотреть сертификат ${certificate.id}`}
                      onClick={() => setPreviewCertificate(certificate)}
                    >
                      <AdminIcon name="eye" className="admin-icon" />
                    </button>
                    <button type="button" aria-label={`Скачать сертификат ${certificate.id}`}>
                      <AdminIcon name="download" className="admin-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="certificate-preview-block">
        <header className="certificates-preview-header">
          <h1>Предварительный просмотр сертификата</h1>
        </header>

        <div className="certificate-preview-wrap">
          <article className="certificate-card">
            <div className="certificate-decor top-left" aria-hidden="true" />
            <div className="certificate-decor bottom-right" aria-hidden="true" />

            <div className="certificate-icon">
              <AdminIcon name="certificate" className="admin-icon" />
            </div>

            <h2>Сертификат о прохождении</h2>
            <p className="certificate-platform">ENESAI - Образовательная платформа</p>

            <p className="certificate-label">Настоящим подтверждается, что</p>
            <p className="certificate-student">{previewCertificate.student}</p>
            <p className="certificate-label">успешно завершил(а) курс</p>
            <p className="certificate-course">{previewCertificate.course}</p>
            <p className="certificate-grade">
              с оценкой <strong>{previewCertificate.grade}</strong>
            </p>

            <div className="certificate-divider" />

            <div className="certificate-meta">
              <div>
                <span>Дата выдачи</span>
                <strong>{previewCertificate.issueDate}</strong>
              </div>
              <div className="right">
                <span>ID сертификата</span>
                <strong>{previewCertificate.id}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  )
}

export default CertificatesPage
