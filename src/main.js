import './style.css'
import { createStore } from './storage.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <main class="app-shell">
    <header class="page-header">
      <h1>Catatan</h1>
      <button id="add-note" class="primary-button" type="button">Tambah catatan</button>
    </header>
    <p id="feedback" class="feedback" role="alert" aria-live="assertive" hidden></p>
    <section id="content" aria-live="polite"></section>
  </main>
`

const content = document.querySelector('#content')
const feedback = document.querySelector('#feedback')
const addButton = document.querySelector('#add-note')
let store

function showMessage(message) {
  feedback.textContent = message
  feedback.hidden = false
}

function showError(message, error) {
  console.error(message, error)
  showMessage(message)
}

function clearError() {
  feedback.textContent = ''
  feedback.hidden = true
}

function openEditor(note) {
  clearError()
  addButton.hidden = true
  content.innerHTML = `
    <section class="editor" aria-labelledby="editor-heading">
      <h2 id="editor-heading">${note ? 'Edit catatan' : 'Catatan baru'}</h2>
      <form id="note-form" novalidate>
        <div class="field">
          <label for="note-title">Judul</label>
          <input id="note-title" name="title" type="text" autocomplete="off">
        </div>
        <div class="field">
          <label for="note-body">Isi</label>
          <textarea id="note-body" name="body" rows="8"></textarea>
        </div>
        <div class="form-actions">
          <button class="primary-button" type="submit">Simpan</button>
          <button id="cancel-edit" class="secondary-button" type="button">Batal</button>
          ${note ? '<button id="delete-note" class="danger-button" type="button">Hapus</button>' : ''}
        </div>
      </form>
    </section>
  `

  const form = document.querySelector('#note-form')
  const titleInput = document.querySelector('#note-title')
  const bodyInput = document.querySelector('#note-body')

  if (note) {
    titleInput.value = note.title
    bodyInput.value = note.body
  }

  document.querySelector('#cancel-edit').addEventListener('click', renderList)

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const title = titleInput.value.trim()

    if (!title) {
      showMessage('Judul wajib diisi.')
      titleInput.focus()
      return
    }

    try {
      const savedNote = note
        ? { ...note, title, body: bodyInput.value }
        : { title, body: bodyInput.value }
      store.save(savedNote)
      renderList()
    } catch (error) {
      showError('Catatan gagal disimpan. Periksa penyimpanan browser dan coba lagi.', error)
    }
  })

  if (note) {
    document.querySelector('#delete-note').addEventListener('click', () => {
      if (!window.confirm('Hapus catatan ini?')) {
        return
      }

      try {
        store.remove(note.id)
        renderList()
      } catch (error) {
        showError('Catatan gagal dihapus. Periksa penyimpanan browser dan coba lagi.', error)
      }
    })
  }
}

function renderList() {
  clearError()
  addButton.hidden = false

  let notes
  try {
    if (!store) {
      throw new Error('Notes storage is unavailable')
    }
    notes = store.list()
  } catch (error) {
    content.replaceChildren()
    showError('Catatan gagal dimuat dari penyimpanan browser.', error)
    return
  }

  content.innerHTML = `
    <div class="field search-field">
      <label for="search">Cari</label>
      <input id="search" name="search" type="search" autocomplete="off">
    </div>
    <ul class="note-list"></ul>
  `
  const searchInput = document.querySelector('#search')
  const noteList = document.querySelector('.note-list')

  function renderNotes(notes, query = '') {
    noteList.replaceChildren()

    if (notes.length === 0) {
      const emptyState = document.createElement('li')
      emptyState.className = 'empty-state'
      emptyState.textContent = query.trim()
        ? 'Catatan tidak ditemukan.'
        : 'Belum ada catatan.'
      noteList.append(emptyState)
      return
    }

    for (const note of notes) {
      const item = document.createElement('li')
      item.className = 'note-item'

      const openButton = document.createElement('button')
      openButton.className = 'note-open'
      openButton.type = 'button'
      openButton.addEventListener('click', () => openEditor(note))

      const title = document.createElement('span')
      title.className = 'note-title'
      title.textContent = note.title

      const body = document.createElement('span')
      body.className = 'note-preview'
      body.textContent = note.body || 'Tidak ada isi'

      openButton.append(title, body)
      item.append(openButton)
      noteList.append(item)
    }
  }

  searchInput.addEventListener('input', () => {
    try {
      clearError()
      renderNotes(store.search(searchInput.value), searchInput.value)
    } catch (error) {
      noteList.replaceChildren()
      showError('Pencarian catatan gagal. Periksa penyimpanan browser dan coba lagi.', error)
    }
  })

  renderNotes(notes)
}

try {
  store = createStore()
} catch (error) {
  showError('Penyimpanan browser tidak dapat diakses.', error)
}

addButton.addEventListener('click', () => openEditor())
renderList()
