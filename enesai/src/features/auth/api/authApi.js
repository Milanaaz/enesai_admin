const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'azimbaeva.milana2004@gmail.com'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function loginRequest({ email, password }) {
  await delay(450)

  const normalizedEmail = email.trim().toLowerCase()
  const isValid =
    normalizedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD

  if (!isValid) {
    throw new Error('Неверный email или пароль')
  }

  return {
    token: `adm-${Date.now()}`,
    user: {
      email: normalizedEmail,
      role: 'admin',
      name: 'ENESAI Admin',
    },
  }
}

export async function requestPasswordReset({ email }) {
  await delay(600)

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Введите email для восстановления пароля')
  }

  return {
    ok: true,
    message:
      'Если аккаунт с таким email существует, инструкция по восстановлению уже отправлена.',
  }
}
