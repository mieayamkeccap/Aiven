import './globals.css';

export const metadata = {
  title: 'Katalog - Next.js + MySQL',
  description: 'Kelola produk dan kategori dengan Next.js dan MySQL (Aiven)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
