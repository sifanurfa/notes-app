import { test, expect } from "@playwright/test";
// Helper: menambah satu catatan lewat UI
async function addNote(page, title, body) {
 await page.getByRole("button", { name: "Tambah catatan" }).click();
 await page.getByLabel("Judul").fill(title);
 await page.getByLabel("Isi").fill(body);
 await page.getByRole("button", { name: "Simpan" }).click();
}
// WO-2: daftar dan editor
test("catatan tetap ada setelah reload", async ({ page }) => {
 await page.goto("/");
 await addNote(page, "Belanja", "Susu, roti");
 await page.reload(); await expect(page.getByText("Belanja")).toBeVisible();
});
test("tombol Simpan terlihat di layar 360 px", async ({ page }) => {
 await page.setViewportSize({ width: 360, height: 640 });
 await page.goto("/"); await page.getByRole("button", { name: "Tambah catatan" }).click();
 await expect(page.getByRole("button", { name: "Simpan" })).toBeInViewport();
});
// WO-3: pencarian
test("mencari catatan", async ({ page }) => {
 await page.goto("/"); await addNote(page, "Belanja", "Susu");
 await addNote(page, "Kerja", "Rapat jam 9");
 await page.getByLabel("Cari").fill("rapat");
 await expect(page.getByText("Kerja")).toBeVisible();
 await expect(page.getByText("Belanja")).toBeHidden();
});
// WO-4: offline
test("tetap bisa dibuka saat offline", async ({ page, context }) => {
 await page.goto("/");
 await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
 await context.setOffline(true);
 await page.reload();
 await expect(page.getByRole("heading", { name: "Catatan", exact: true })).toBeVisible();
});