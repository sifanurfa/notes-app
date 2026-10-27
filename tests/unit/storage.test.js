import { describe, it, expect, beforeEach } from "vitest";
import { createStore } from "../../src/storage.js";

// Pengganti localStorage untuk tes (tes berjalan di Node.js)
function fakeStorage() {
 const data = {}; return {
 getItem: (key) => (key in data ? data[key] : null),
 setItem: (key, value) => { data[key] = String(value); },
 };
}

describe("storage (WO-1)", () => {
 let store; beforeEach(() => {
 store = createStore(fakeStorage());
 });

 it("menyimpan catatan baru dengan id", () => {
 const note = store.save({ title: "Belanja", body: "Susu, roti" }); 
 expect(note.id).toBeTruthy();
 expect(store.list()).toHaveLength(1); });

 it("memperbarui catatan yang sudah ada", () => { const note = store.save({ title: "Belanja", body: "Susu" });
 store.save({ ...note, body: "Susu, telur" })
 expect(store.list()).toHaveLength(1); 
 expect(store.list()[0].body).toBe("Susu, telur");
 });
 it("menghapus catatan", () => { const note = store.save({ title: "Sementara", body: "" });
 store.remove(note.id);
 expect(store.list()).toHaveLength(0);
 });
});
// // Tambahkan blok ini saat mengerjakan WO-3
// describe("search (WO-3)", () => {
//  it("mencari di judul dan isi, tanpa beda huruf besar/kecil", () => { const store = createStore(fakeStorage());
//  store.save({ title: "Belanja", body: "Susu" }); store.save({ title: "Kerja", body: "Rapat jam 9" });
//  expect(store.search("RAPAT")).toHaveLength(1);
//  expect(store.search("")).toHaveLength(2);
//  });
// });