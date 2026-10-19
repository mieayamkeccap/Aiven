import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, description, created_at FROM categories ORDER BY name ASC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description =
      typeof body.description === 'string' ? body.description.trim() : '';

    if (!name) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Nama kategori maksimal 100 karakter' },
        { status: 400 }
      );
    }

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    return NextResponse.json(
      { id: result.insertId, name, description: description || null },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Nama kategori sudah digunakan' },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
