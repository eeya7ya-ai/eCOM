import Link from 'next/link';

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-rose-500 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/en"
          className="btn-primary inline-block px-8 py-3 rounded-full text-white font-semibold"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
