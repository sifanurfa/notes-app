# Work Orders
## WO-1: Storage
Tujuan: menyimpan catatan di localStorage.
File: src/storage.js, mengekspor createStore(storage = window.localStorage)
dengan fungsi list(), save(note), remove(id), search(text).
- save tanpa id: buat id baru (crypto.randomUUID()) dan isi updatedAt. - save dengan id: perbarui catatan yang sudah ada.
Gate: tests/unit/storage.test.js
## WO-2: Layar daftar dan editor
Tujuan: UI notes sesuai "UI contract" di spec.md, memakai createStore().
File: index.html, src/main.js, src/style.css (hapus file contoh Vite).
Gate: tests/e2e/notes.spec.js (tes WO-2)
## WO-3: Pencarian
Tujuan: input "Cari" memfilter daftar saat mengetik (store.search).
Gate: tes WO-3 di unit test dan e2e test
## WO-4: Offline + home screen
Tujuan: aplikasi bisa dibuka offline dan di-install ke HP.
File: public/manifest.webmanifest, public/icons/ (PNG 192 dan 512 px),
public/sw.js (cache-first, skipWaiting() dan clients.claim()),
pendaftaran service worker di src/main.js.
Gate: tes WO-4 di tests/e2e/notes.spec.js
## WO-5: Polish
Tujuan: Lighthouse (Mobile) Performance dan Accessibility >= 90.
Gate: laporan Lighthouse di Chrome DevTools + semua tes tetap lulus