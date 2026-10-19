import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// GET /api/products/:id -> get one product
export async function GET(request, { params }) {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.category_id,
              c.name AS category_name, p.created_at
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/products/:id -> update a product
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, description, price } = body;
    const categoryId = Number(body.category_id);

    if (!name || price === undefined || price === '') {
      return NextResponse.json(
        { error: 'Field "name" dan "price" wajib diisi' },
        { status: 400 }
      );
    }

    if (!Number.isSafeInteger(categoryId) || categoryId < 1) {
      return NextResponse.json(
        { error: 'Kategori wajib dipilih' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [categories] = await pool.query(
      'SELECT id FROM categories WHERE id = ?',
      [categoryId]
    );
    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'Kategori yang dipilih tidak ditemukan' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ?',
      [name, description || null, price, categoryId, params.id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.query('SELECT id FROM products WHERE id = ?', [
        params.id,
      ]);
      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'Produk tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      id: Number(params.id),
      name,
      description,
      price,
      category_id: categoryId,
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json(
        { error: 'Kategori yang dipilih tidak ditemukan' },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/products/:id -> delete a product
export async function DELETE(request, { params }) {
  try {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [
      params.id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
