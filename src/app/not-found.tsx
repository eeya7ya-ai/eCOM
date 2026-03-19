import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h1 style={{ fontSize: '5rem', fontWeight: 'bold', color: '#f43f5e', marginBottom: '1rem' }}>
              404
            </h1>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              Page Not Found
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/en"
              style={{
                background: 'linear-gradient(to right, #f43f5e, #9333ea)',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 2rem',
                borderRadius: '9999px',
                textDecoration: 'none',
                display: 'inline-block',
                fontSize: '1rem',
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
