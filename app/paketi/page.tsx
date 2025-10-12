import Packages from '@/components/sections/Packages';
import data from '@/public/assets/data.json';

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-white py-20">
      <div className="container mx-auto px-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          Celostni Terapevtski Paketi
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto">
          Naši paketi so zasnovani za dolgotrajne zdravstvene koristi in celostno transformacijo telesa, uma in duha.
        </p>
      </div>
      <Packages packages={data.packages} />
    </div>
  );
}
