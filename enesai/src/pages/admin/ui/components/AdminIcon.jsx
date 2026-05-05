function AdminIcon({ name, className = '' }) {
  switch (name) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'book':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 5.25c-2.28-1.39-5.09-1.82-8-1.2v12.77c2.86-.71 5.67-.3 8 1.2v-12.77z" />
          <path d="M12 5.25c2.28-1.39 5.09-1.82 8-1.2v12.77c-2.86-.71-5.67-.3-8 1.2v-12.77z" />
        </svg>
      )
    case 'cap':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m3 10 9-4 9 4-9 4-9-4z" />
          <path d="M6.5 12.2v3.2c1.8 1.4 3.58 2.1 5.5 2.1s3.7-.7 5.5-2.1v-3.2" />
        </svg>
      )
    case 'quiz':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M7 2.75h8l4 4v14.5H5V2.75h2z" />
          <path d="M15 2.75v4h4" />
          <path d="M9.2 11.15a2.45 2.45 0 1 1 4.8.83c-.21.72-.78 1.14-1.33 1.55-.55.42-1.08.82-1.17 1.47" />
          <circle cx="11.5" cy="18" r=".9" />
        </svg>
      )
    case 'article':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M7 2.75h8l4 4v14.5H5V2.75h2z" />
          <path d="M15 2.75v4h4" />
          <path d="M8 11.25h8M8 15h8M8 18.75h5" />
        </svg>
      )
    case 'dictionary':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m3.25 6.5 8.75 11 8.75-11" />
          <path d="M12 17.5V6.5" />
          <path d="M19.5 4.5h-3M7.5 4.5h-3" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="9.5" cy="8.5" r="3.2" />
          <path d="M4.5 18.5c.4-2.9 2.2-4.6 5-4.6s4.6 1.7 5 4.6" />
          <path d="M16.75 7.25a2.75 2.75 0 1 1 .02 5.5" />
          <path d="M16.5 14.35c1.87.43 3.02 1.68 3.4 3.65" />
        </svg>
      )
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 3.5 19 6v5.45c0 4.43-2.6 7.28-7 9.05-4.4-1.77-7-4.62-7-9.05V6l7-2.5z" />
        </svg>
      )
    case 'certificate':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="9.2" r="4.6" />
          <path d="M9.8 13.5 8.4 20l3.6-2.05L15.6 20l-1.4-6.5" />
        </svg>
      )
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 6.5h16M4 12h16M4 17.5h16" />
        </svg>
      )
    case 'logout':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M14.5 5.5h-7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7" />
          <path d="m11.5 12 7 0" />
          <path d="m15.75 8.25 3.75 3.75-3.75 3.75" />
        </svg>
      )
    case 'trend':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m4 15.75 5.2-5.2 3.3 3.3 6.5-6.5" />
          <path d="M15.5 7.35h3.5v3.5" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m12 4.7 2.16 4.36 4.82.71-3.49 3.4.82 4.8L12 15.66l-4.31 2.27.83-4.8-3.5-3.4 4.84-.71L12 4.7z" />
        </svg>
      )
    case 'plus':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'search':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      )
    case 'volume':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 10.2h4l5-4v11.6l-5-4H4z" />
          <path d="M16 9.2c1.2 1.2 1.2 4.4 0 5.6" />
          <path d="M18.4 7.2c2.2 2.2 2.2 8.4 0 10.6" />
        </svg>
      )
    case 'eye':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12s-3.5 5.5-9.5 5.5S2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      )
    case 'edit':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m14.8 4.4 4.8 4.8M5 19l3.6-.7 10-10a1.7 1.7 0 0 0 0-2.4l-.5-.5a1.7 1.7 0 0 0-2.4 0l-10 10z" />
        </svg>
      )
    case 'ban':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="7.8" />
          <path d="m7.1 7.1 9.8 9.8" />
        </svg>
      )
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
        </svg>
      )
    case 'unlock':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M16 10V7.5a4 4 0 1 0-8 0" />
        </svg>
      )
    case 'download':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 4.5v10.2" />
          <path d="m8.5 11.8 3.5 3.5 3.5-3.5" />
          <path d="M5 18.5h14" />
        </svg>
      )
    case 'trash':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4.5 6.5h15M9.5 6.5v-2h5v2M8 9.5V18M12 9.5V18M16 9.5V18M6.5 6.5 7.2 19a1.5 1.5 0 0 0 1.5 1.4h6.6a1.5 1.5 0 0 0 1.5-1.4l.7-12.5" />
        </svg>
      )
    default:
      return null
  }
}

export default AdminIcon
