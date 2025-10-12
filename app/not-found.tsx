import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#00B5AD] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-black mb-4">Stran ni najdena</h2>
        <p className="text-gray-600 mb-8">
          Opravičujemo se, vendar strani, ki jo iščete, ne moremo najti.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#00B5AD] text-white font-semibold rounded-lg hover:bg-[#009891] transition-colors"
        >
          Nazaj na domačo stran
        </Link>
      </div>
    </div>
  );
}
