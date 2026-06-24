export const ADMIN_PAGE_KEYS = {
  dashboard: 'dashboard',
  courses: 'courses',
  lessons: 'lessons',
  tests: 'tests',
  articles: 'articles',
  dictionary: 'dictionary',
  users: 'users',
  admins: 'admins',
  certificates: 'certificates',
}

export const ADMIN_ROUTES = {
  [ADMIN_PAGE_KEYS.dashboard]: '/dashboard',
  [ADMIN_PAGE_KEYS.courses]: '/courses',
  [ADMIN_PAGE_KEYS.lessons]: '/lessons',
  [ADMIN_PAGE_KEYS.tests]: '/tests',
  [ADMIN_PAGE_KEYS.articles]: '/library',
  [ADMIN_PAGE_KEYS.dictionary]: '/dictionary',
  [ADMIN_PAGE_KEYS.users]: '/users',
  [ADMIN_PAGE_KEYS.admins]: '/admins',
  [ADMIN_PAGE_KEYS.certificates]: '/certificates',
}

export const SUPER_ADMIN_MENU = [
  { key: ADMIN_PAGE_KEYS.dashboard, label: 'Дашборд', icon: 'dashboard' },
  { key: ADMIN_PAGE_KEYS.courses, label: 'Курсы', icon: 'book' },
  { key: ADMIN_PAGE_KEYS.lessons, label: 'Уроки', icon: 'cap' },
  { key: ADMIN_PAGE_KEYS.tests, label: 'Тесты', icon: 'quiz' },
  { key: ADMIN_PAGE_KEYS.articles, label: 'Библиотека', icon: 'article' },
  { key: ADMIN_PAGE_KEYS.dictionary, label: 'Словарь', icon: 'dictionary' },
  { key: ADMIN_PAGE_KEYS.users, label: 'Пользователи', icon: 'users' },
  { key: ADMIN_PAGE_KEYS.admins, label: 'Администраторы', icon: 'shield' },
  { key: ADMIN_PAGE_KEYS.certificates, label: 'Сертификаты', icon: 'certificate' },
]

export const CONTENT_ADMIN_MENU = [
  { key: ADMIN_PAGE_KEYS.dashboard, label: 'Дашборд', icon: 'dashboard' },
  { key: ADMIN_PAGE_KEYS.courses, label: 'Курсы', icon: 'book' },
  { key: ADMIN_PAGE_KEYS.lessons, label: 'Уроки', icon: 'cap' },
  { key: ADMIN_PAGE_KEYS.tests, label: 'Тесты', icon: 'quiz' },
  { key: ADMIN_PAGE_KEYS.articles, label: 'Библиотека', icon: 'article' },
  { key: ADMIN_PAGE_KEYS.dictionary, label: 'Словарь', icon: 'dictionary' },
]

export function getAdminMenuByRole(roleCode) {
  if (roleCode === 'CONTENT_ADMIN') return CONTENT_ADMIN_MENU
  return SUPER_ADMIN_MENU
}

export function getAdminRoleLabel(roleCode) {
  if (roleCode === 'SUPER_ADMIN') return 'Супер админ'
  if (roleCode === 'CONTENT_ADMIN') return 'Контент-админ'
  if (roleCode === 'ADMIN') return 'Админ'
  if (roleCode === 'USER') return 'Пользователь'
  return 'Без роли'
}

export function getAdminRouteByKey(pageKey) {
  return ADMIN_ROUTES[pageKey] ?? ADMIN_ROUTES[ADMIN_PAGE_KEYS.dashboard]
}

export function getAdminKeyByPath(pathname) {
  const routeEntry = Object.entries(ADMIN_ROUTES).find(([, route]) => pathname.endsWith(route))
  return routeEntry?.[0] ?? ADMIN_PAGE_KEYS.dashboard
}
