import Services from '@/components/sections/Services';
import Link from 'next/link';
import data from '@/public/assets/data.json';

export default function TherapiesPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          Naše Terapije
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
          Odkrijte celoten nabor naših terapevtskih storitev za optimalno zdravje in dobro počutje.
        </p>
      </div>
      <Services services={data.therapies} />
      <div className="container mx-auto px-4 mt-12 text-center">
        <Link
          href="/rezervacija"
          className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Rezervirajte termin
        </Link>
      </div>
    </div>
  );
}
