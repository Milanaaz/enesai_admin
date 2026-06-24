import { useEffect } from 'react'
import { createPortal } from 'react-dom'

function Toast({ message, tone = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message || !onClose) return undefined

    const timerId = window.setTimeout(onClose, duration)
    return () => window.clearTimeout(timerId)
  }, [duration, message, onClose])

  if (!message) return null

  return createPortal(
    <div className={`app-toast app-toast--${tone}`} role="status">
      {message}
    </div>,
    document.body,
  )
}

export default Toast
