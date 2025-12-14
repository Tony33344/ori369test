'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, UserPlus, Phone, MapPin } from 'lucide-react';

function RegisterForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [addDetails, setAddDetails] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gdprConsent) {
      toast.error('Za registracijo morate potrditi soglasje (GDPR/pogoji).');
      return;
    }

    setLoading(true);

    const { data, error } = await signUp(email, password, fullName, {
      phone: addDetails ? phone : undefined,
      address: addDetails ? address : undefined,
      city: addDetails ? city : undefined,
      postal: addDetails ? postal : undefined,
      gdprConsentAt: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      toast.error(t('auth.register.error'));
    } else {
      toast.success(t('auth.register.success'));
      window.location.href = '/prijava';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            ORI 369
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('auth.register.title')}</h2>
          <p className="text-gray-600">{t('auth.register.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <User size={18} />
                <span>{t('auth.register.fullName')}</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ime Priimek"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Mail size={18} />
                <span>{t('auth.register.email')}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="vas.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Lock size={18} />
                <span>{t('auth.register.password')}</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-semibold text-gray-800">Dodaj kontaktne podatke (neobvezno)</span>
                <input
                  type="checkbox"
                  checked={addDetails}
                  onChange={(e) => setAddDetails(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>

              {addDetails && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Phone size={18} />
                      <span>Telefon</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+386 XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <MapPin size={18} />
                      <span>Naslov (za dostavo) </span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ulica in hišna številka"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <input
                        type="text"
                        value={postal}
                        onChange={(e) => setPostal(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Poštna številka"
                      />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mesto"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <div className="text-sm text-gray-800">
                  <div className="font-semibold">Soglašam z obdelavo osebnih podatkov (GDPR) in pogoji uporabe</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Z registracijo se strinjate, da ORI 369 obdeluje vaše podatke za izvedbo naročil/rezervacij.
                  </div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              <UserPlus size={20} />
              <span>{loading ? t('common.loading') : t('auth.register.submit')}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.register.haveAccount')}{' '}
              <Link href="/prijava" className="font-semibold text-blue-600 hover:text-blue-700">
                {t('auth.register.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
