import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// GET /api/products -> list all products
export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.category_id,
              c.name AS category_name, p.created_at
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.id DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/products -> create a new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price } = body;
    const categoryId = Number(body.category_id);

    if (!name || price === undefined || price === '') {
      return NextResponse.json(
        { error: 'Field "name" and "price" wajib diisi' },
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
      'INSERT INTO products (name, description, price, category_id) VALUES (?, ?, ?, ?)',
      [name, description || null, price, categoryId]
    );

    return NextResponse.json(
      { id: result.insertId, name, description, price, category_id: categoryId },
      { status: 201 }
    );
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
