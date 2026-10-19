'use client';

import { useEffect, useState } from 'react';

const emptyForm = { name: '', description: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memuat kategori');
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch(
        editingId ? `/api/categories/${editingId}` : '/api/categories',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan kategori');

      setForm(emptyForm);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    if (!confirm(`Hapus kategori "${category.name}"?`)) return;
    setError('');
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menghapus kategori');
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <header className="page-header">
        <div>
          <p className="eyebrow">KATALOG</p>
          <h1>Kategori</h1>
          <p className="subtitle">Kelola kategori untuk mengatur katalog produk.</p>
        </div>
        <nav className="page-nav" aria-label="Navigasi utama">
          <a href="/">Produk</a>
          <a href="/categories" aria-current="page">Kategori</a>
        </nav>
      </header>

      {error && <div className="error-box" role="alert">{error}</div>}

      <section className="card">
        <h2>{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Nama kategori</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Misal: Minuman"
              maxLength={100}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Deskripsi singkat kategori (opsional)"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="category-list" aria-labelledby="category-list-title">
        <div className="list-heading">
          <div>
            <h2 id="category-list-title">Semua kategori</h2>
            <p className="status">
              {loading ? 'Memuat kategori...' : `${categories.length} kategori`}
            </p>
          </div>
        </div>
        {categories.length > 0 && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Deskripsi</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="category-name">{category.name}</td>
                    <td>{category.description || <span className="muted">Belum ada deskripsi</span>}</td>
                    <td>
                      {category.created_at
                        ? new Date(category.created_at).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td className="actions-cell">
                      <button className="btn-edit" onClick={() => startEdit(category)}>
                        Edit
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(category)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && categories.length === 0 && (
          <div className="empty">
            Belum ada kategori. Tambahkan kategori pertama melalui formulir di atas.
          </div>
        )}
      </section>
    </main>
  );
}
