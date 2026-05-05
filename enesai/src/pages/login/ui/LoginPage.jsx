import { useState } from 'react'
import { useAuth } from '../../../features/auth/context/AuthProvider.jsx'
import './login-page.css'

function LoginPage() {
  const { login, error, isSubmitting, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [localError, setLocalError] = useState('')

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    clearError()
    setLocalError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setLocalError('Заполните email и пароль')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setLocalError('Введите корректный email')
      return
    }

    await login({
      email: trimmedEmail,
      password,
      remember,
    })
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
    if (localError || error) {
      setLocalError('')
      clearError()
    }
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    if (localError || error) {
      setLocalError('')
      clearError()
    }
  }

  const formError = localError || error

  return (
    <main className="login-page">
      <section className="login-card" aria-label="ENESAI Admin login form">
        <div className="brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" focusable="false">
            <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h5a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H6a2.5 2.5 0 0 0-2.5 2.5Zm17 0A2.5 2.5 0 0 0 18 3h-5a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h5a2.5 2.5 0 0 1 2.5 2.5Z" />
          </svg>
        </div>

        <h1>ENESAI</h1>
        <p className="subtitle">Вход в панель администратора</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <div className="field-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5Zm2.2-.5L12 12.2 18.8 7Zm13.8 1.3-6.3 4.7a1.2 1.2 0 0 1-1.4 0L5 8.3v8.2c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5Z" />
            </svg>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="admin@enesai.kg"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="email"
              spellCheck={false}
              aria-invalid={Boolean(formError)}
            />
          </div>

          <label htmlFor="password">Пароль</label>
          <div className="field-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2a5 5 0 0 0-5 5v2H6a2.5 2.5 0 0 0-2.5 2.5v7A2.5 2.5 0 0 0 6 21h12a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 18 9h-1V7a5 5 0 0 0-5-5Zm-3 7V7a3 3 0 0 1 6 0v2Zm-3 2h12a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-7A.5.5 0 0 1 6 11Z" />
            </svg>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              aria-invalid={Boolean(formError)}
            />
          </div>

          <label className="checkbox-row" htmlFor="remember">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Запомнить меня</span>
          </label>

          {formError ? <p className="form-error">{formError}</p> : null}
          <button className="submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <footer className="card-footer">© 2026 ENESAI. Все права защищены.</footer>
      </section>
    </main>
  )
}

export default LoginPage
