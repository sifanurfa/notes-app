const STORAGE_KEY = 'notes'

export function createStore(storage = window.localStorage) {
  function list() {
    const storedNotes = storage.getItem(STORAGE_KEY)
    if (storedNotes === null) {
      return []
    }

    const notes = JSON.parse(storedNotes)
    if (!Array.isArray(notes)) {
      throw new Error('Stored notes must be an array')
    }

    return notes
  }

  function save(note) {
    const notes = list()
    const now = new Date().toISOString()

    if (note.id) {
      const noteIndex = notes.findIndex((storedNote) => storedNote.id === note.id)
      if (noteIndex === -1) {
        throw new Error(`Cannot update missing note: ${note.id}`)
      }

      const updatedNote = {
        ...notes[noteIndex],
        ...note,
        createdAt: notes[noteIndex].createdAt,
        updatedAt: now,
      }
      notes[noteIndex] = updatedNote
      storage.setItem(STORAGE_KEY, JSON.stringify(notes))
      return updatedNote
    }

    const newNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    notes.push(newNote)
    storage.setItem(STORAGE_KEY, JSON.stringify(notes))
    return newNote
  }

  function remove(id) {
    const notes = list()
    const remainingNotes = notes.filter((note) => note.id !== id)
    storage.setItem(STORAGE_KEY, JSON.stringify(remainingNotes))
  }

  function search(text) {
    const query = text.trim().toLowerCase()
    if (!query) {
      return list()
    }

    return list().filter((note) =>
      `${note.title} ${note.body}`.toLowerCase().includes(query),
    )
  }

  return { list, save, remove, search }
}
