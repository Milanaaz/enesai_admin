function DeleteCourseButton({ children, ...props }) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  )
}

export default DeleteCourseButton
