"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./page.module.css";

type Item = {
  id: number;
  name: string;
  description: string | null;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadItems() {
    const response = await fetch("/api/items", { cache: "no-store" });
    if (!response.ok) {
      setMessage("Gagal memuat data");
      return;
    }
    setItems(await response.json());
  }

  useEffect(() => {
    let active = true;

    async function fetchItems() {
      const response = await fetch("/api/items", { cache: "no-store" });
      if (!response.ok) {
        if (active) setMessage("Gagal memuat data");
        return;
      }
      const data = await response.json();
      if (active) setItems(data);
    }

    fetchItems();
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setEditingId(null);
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const endpoint = editingId ? `/api/items/${editingId}` : "/api/items";
    const response = await fetch(endpoint, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.message ?? "Operasi gagal");
      return;
    }

    setMessage(editingId ? "Item berhasil diperbarui" : "Item berhasil ditambahkan");
    resetForm();
    await loadItems();
  }

  function editItem(item: Item) {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description ?? "");
    setMessage("");
  }

  async function deleteItem(id: number) {
    if (!window.confirm("Hapus item ini?")) return;

    const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("Item gagal dihapus");
      return;
    }
    setMessage("Item berhasil dihapus");
    await loadItems();
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Next.js + Prisma</p>
          <h1>Manajemen Item</h1>
          <p>Tambah, ubah, lihat, dan hapus data menggunakan SQLite.</p>
        </header>

        <form className={styles.form} onSubmit={submitItem}>
          <label>
            Nama item
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Buku"
              required
            />
          </label>
          <label>
            Deskripsi
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Keterangan item"
              rows={3}
            />
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} type="submit">
              {editingId ? "Simpan Perubahan" : "Tambah Item"}
            </button>
            {editingId && (
              <button className={styles.secondary} type="button" onClick={resetForm}>
                Batal
              </button>
            )}
          </div>
        </form>

        {message && <p className={styles.message}>{message}</p>}

        <section className={styles.list} aria-label="Daftar item">
          {items.length === 0 ? (
            <p className={styles.empty}>Belum ada item.</p>
          ) : (
            items.map((item) => (
              <article className={styles.card} key={item.id}>
                <div>
                  <h2>{item.name}</h2>
                  {item.description && <p>{item.description}</p>}
                </div>
                <div className={styles.cardActions}>
                  <button type="button" onClick={() => editItem(item)}>Edit</button>
                  <button
                    className={styles.danger}
                    type="button"
                    onClick={() => deleteItem(item.id)}
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
