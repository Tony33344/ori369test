'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import CartButton from '@/components/CartButton';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import LanguageSelector from '@/components/LanguageSelector';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [banner, setBanner] = useState<any>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }: { data: { user: any } }) => {
      setUser(authUser);
    });

    supabase
      .from('site_banner')
      .select('enabled,message,link_url,updated_at')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data?.enabled || !data?.message) {
          setBanner(null);
          return;
        }
        setBanner(data);
        try {
          const key = `ori369_banner_dismissed_${data.updated_at || ''}_${data.message || ''}`;
          const dismissed = localStorage.getItem(key) === '1';
          setBannerDismissed(dismissed);
        } catch {
          setBannerDismissed(false);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const dismissBanner = () => {
    if (!banner) return;
    try {
      const key = `ori369_banner_dismissed_${banner.updated_at || ''}_${banner.message || ''}`;
      localStorage.setItem(key, '1');
    } catch {
      // ignore
    }
    setBannerDismissed(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/o-nas' },
    { name: t('nav.therapies'), href: '/terapije' },
    { name: t('nav.packages'), href: '/paketi' },
    { name: 'MotioScan', href: '/motioscan' },
    { name: 'Trgovina', href: '/trgovina' },
    { name: t('nav.booking'), href: '/rezervacija' },
    { name: 'Mediji', href: '/mediji' },
    { name: t('nav.contact'), href: '/kontakt' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      {banner?.enabled && banner?.message && !bannerDismissed && (
        <div className="bg-[#00B5AD] text-white">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <div className="text-sm font-medium">
              {banner.link_url ? (
                <Link href={banner.link_url} className="underline underline-offset-2">
                  {banner.message}
                </Link>
              ) : (
                <span>{banner.message}</span>
              )}
            </div>
            <button
              type="button"
              onClick={dismissBanner}
              className="text-white/90 hover:text-white text-sm font-semibold"
            >
              Zapri
            </button>
          </div>
        </div>
      )}
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - ORI 369 Brand Style */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image 
              src="/logo.png" 
              alt="ORI 369" 
              width={240}
              height={100}
              className="h-20 md:h-24 w-auto transition-opacity group-hover:opacity-90"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Language Selector */}
            <LanguageSelector />
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href 
                    ? 'text-[#00B5AD] border-b-2 border-[#00B5AD]' 
                    : 'text-gray-700 hover:text-[#00B5AD]'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            <CartButton />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-[#00B5AD]"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-700 hover:text-[#00B5AD]"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link
                href="/prijava"
                className="px-6 py-2 text-sm font-medium text-white bg-[#00B5AD] rounded-lg hover:bg-[#009891] transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-[#00B5AD]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-gray-200 mt-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Language Selector */}
              <div className="pb-2 border-b border-gray-200">
                <LanguageSelector />
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium transition-colors ${
                    pathname === item.href ? 'text-[#00B5AD]' : 'text-gray-700 hover:text-[#00B5AD]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-[#00B5AD]"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="text-left text-base font-medium text-gray-700 hover:text-[#00B5AD]"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link
                  href="/prijava"
                  onClick={() => setIsOpen(false)}
                  className="block px-6 py-2 text-base font-medium text-white bg-[#00B5AD] rounded-lg hover:bg-[#009891] text-center"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
