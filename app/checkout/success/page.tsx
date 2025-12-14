import Link from 'next/link';
import { CheckCircle, ArrowRight, Home, ShoppingBag } from 'lucide-react';

export const runtime = 'nodejs';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00B5AD]/10 via-white to-[#B8D52E]/10 py-14">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-black/5 overflow-hidden">
            <div className="p-10 text-center">
              <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-[#00B5AD]/10 flex items-center justify-center">
                <CheckCircle className="text-[#00B5AD]" size={34} />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Plačilo uspešno</h1>
              <p className="text-gray-600 mb-8">
                Hvala! Vaše plačilo je bilo uspešno izvedeno. Potrditev naročila boste prejeli tudi na e-pošto.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 text-left">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">1. Potrditev</div>
                  <div className="text-sm text-gray-800">Vaše naročilo je potrjeno</div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">2. Obdelava</div>
                  <div className="text-sm text-gray-800">Priprava in obveščanje</div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-1">3. Prevzem/Dostava</div>
                  <div className="text-sm text-gray-800">Po dogovoru ali po pošti</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00B5AD] text-white rounded-xl font-semibold hover:bg-[#009891] transition-colors"
                >
                  <ArrowRight size={18} />
                  Pojdi na dashboard
                </Link>
                <Link
                  href="/trgovina"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag size={18} />
                  Nadaljuj z nakupovanjem
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Home size={18} />
                  Domov
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
