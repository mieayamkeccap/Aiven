'use client';

import { useEffect, useState } from 'react';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category_id: '',
};
const emptyCategoryForm = { name: '', description: '' };

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      const [productsData, categoriesData] = await Promise.all([
        productsResponse.json(),
        categoriesResponse.json(),
      ]);
      if (!productsResponse.ok) {
        throw new Error(productsData.error || 'Gagal memuat produk');
      }
      if (!categoriesResponse.ok) {
        throw new Error(categoriesData.error || 'Gagal memuat kategori');
      }
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCategoryChange(e) {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: String(product.category_id || ''),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data');

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    setError('');
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus data');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  function startCategoryEdit(category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
    });
  }

  function cancelCategoryEdit() {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  }

  async function handleCategorySubmit(e) {
    e.preventDefault();
    setSavingCategory(true);
    setError('');
    try {
      const res = await fetch(
        editingCategoryId
          ? `/api/categories/${editingCategoryId}`
          : '/api/categories',
        {
          method: editingCategoryId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kategori');

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleCategoryDelete(category) {
    if (!confirm(`Hapus kategori "${category.name}"? Produk terkait akan menjadi tanpa kategori.`)) {
      return;
    }
    setError('');
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus kategori');
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <header className="page-header">
        <div>
          <p className="eyebrow">KATALOG</p>
          <h1>Produk</h1>
          <p className="subtitle">Kelola produk dan kategori katalog di satu tempat.</p>
        </div>
      </header>

      {error && <div className="error-box" role="alert">{error}</div>}

      <div className="card">
        <h2>{editingId ? 'Edit Produk' : 'Tambah Produk'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Nama Produk</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Misal: Kopi Susu"
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
              placeholder="Deskripsi singkat produk (opsional)"
            />
          </div>

          <div className="form-row">
            <label htmlFor="price">Harga (Rp)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="category_id">Kategori</label>
            <select
              id="category_id"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              disabled={categories.length === 0}
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <span className="field-hint">Tambahkan kategori terlebih dahulu.</span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="status">
        {loading ? 'Memuat data...' : `${products.length} produk ditemukan`}
      </div>

      {products.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category_name || <span className="muted">Belum dikategorikan</span>}</td>
                  <td>{p.description}</td>
                  <td>Rp {Number(p.price).toLocaleString('id-ID')}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(p.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="empty">Belum ada produk. Tambahkan produk pertama di atas.</div>
      )}

      <section className="category-panel" aria-labelledby="categories-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PENGELOLAAN KATALOG</p>
            <h2 id="categories-title">Kategori</h2>
            <p className="section-description">
              Kategori di sini bisa langsung dipilih saat menambah atau mengedit produk.
            </p>
          </div>
          <span className="category-count">{categories.length} kategori</span>
        </div>

        <div className="category-layout">
          <div className="card category-form-card">
            <h3>{editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-row">
                <label htmlFor="category-name">Nama kategori</label>
                <input
                  id="category-name"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryChange}
                  placeholder="Misal: Minuman"
                  maxLength={100}
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="category-description">Deskripsi</label>
                <textarea
                  id="category-description"
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryChange}
                  rows={3}
                  placeholder="Deskripsi singkat (opsional)"
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingCategory}
                >
                  {savingCategory
                    ? 'Menyimpan...'
                    : editingCategoryId
                      ? 'Simpan Perubahan'
                      : 'Tambah Kategori'}
                </button>
                {editingCategoryId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cancelCategoryEdit}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="category-table">
            <div className="category-table-heading">
              <h3>Daftar Kategori</h3>
              <span>{loading ? 'Memuat...' : `${categories.length} total`}</span>
            </div>
            {categories.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Deskripsi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="category-name">{category.name}</td>
                        <td>
                          {category.description || (
                            <span className="muted">Belum ada deskripsi</span>
                          )}
                        </td>
                        <td className="actions-cell">
                          <button
                            className="btn-edit"
                            onClick={() => startCategoryEdit(category)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleCategoryDelete(category)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty category-empty">
                Belum ada kategori. Tambahkan kategori agar bisa dipilih untuk produk.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
