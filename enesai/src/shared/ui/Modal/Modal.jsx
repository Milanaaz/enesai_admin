function Modal({ title, children, footer, onClose, className = '' }) {
  const classes = ['ui-modal', className].filter(Boolean).join(' ')

  return (
    <div className="ui-modal-overlay" role="dialog" aria-modal="true">
      <section className={classes}>
        <header className="ui-modal__header">
          <h2>{title}</h2>
          {onClose ? <button type="button" onClick={onClose}>x</button> : null}
        </header>
        <div className="ui-modal__body">{children}</div>
        {footer ? <footer className="ui-modal__footer">{footer}</footer> : null}
      </section>
    </div>
  )
}

export default Modal
