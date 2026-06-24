export const LIBRARY_LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2']

export function createEmptyBookForm() {
  return {
    title: '',
    author: '',
    description: '',
    coverUrl: '',
    level: 'A1',
    genre: '',
    readingTimeMinutes: 0,
  }
}

export function createBookFormFromBook(book) {
  return {
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
    coverUrl: book?.coverUrl || '',
    level: book?.level || 'A1',
    genre: book?.genre || '',
    readingTimeMinutes: book?.readingTimeMinutes || 0,
  }
}

export function createEmptyPageForm(bookId = '', pageNumber = 1) {
  return {
    bookId,
    pageNumber,
    content: '',
    contentRu: '',
    audioUrl: '',
  }
}

export function createPageFormFromPage(page, bookId = '') {
  return {
    bookId,
    pageId: page?.id || '',
    pageNumber: page?.pageNumber || 1,
    content: page?.content || '',
    contentRu: page?.contentRu || '',
    audioUrl: page?.audioUrl || '',
  }
}

export function toBookPayload(form) {
  return {
    title: form.title.trim(),
    author: form.author.trim(),
    description: form.description.trim(),
    coverUrl: form.coverUrl.trim(),
    level: form.level,
    genre: form.genre.trim(),
    readingTimeMinutes: Number(form.readingTimeMinutes) || 0,
  }
}

export function toPagePayload(form) {
  return {
    bookId: form.bookId,
    pageNumber: Number(form.pageNumber) || 1,
    content: form.content.trim(),
    contentRu: form.contentRu.trim(),
    audioUrl: form.audioUrl.trim(),
  }
}

export function toPageUpdatePayload(form) {
  return {
    content: form.content.trim(),
    contentRu: form.contentRu.trim(),
    audioUrl: form.audioUrl.trim(),
  }
}
