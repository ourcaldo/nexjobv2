import React, { useState, useEffect } from 'react';
import { Search, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { bookmarkService } from '@/services/bookmarkService';

const Header: React.FC = () => {
  const router = useRouter();
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const updateBookmarkCount = () => {
      setBookmarkCount(bookmarkService.getBookmarkCount());
    };

    // Initial count
    updateBookmarkCount();

    // Listen for storage changes (bookmark updates)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'nexjob_bookmarks') {
        updateBookmarkCount();
      }
    };

    const handleBookmarkUpdate = () => {
      updateBookmarkCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarkUpdated', handleBookmarkUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate);
    };
  }, []);

  const isActive = (path: string) => {
    return router.pathname === path || router.asPath === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Search className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Nex<span className="text-primary-600">job</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
              prefetch={true}
            >
              Beranda
            </Link>
            <Link 
              href="/lowongan-kerja/" 
              className={`font-medium transition-colors ${
                isActive('/lowongan-kerja/') || isActive('/lowongan-kerja') || router.pathname.startsWith('/lowongan-kerja')
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
              prefetch={true}
            >
              Cari Lowongan
            </Link>
            <Link 
              href="/artikel/" 
              className={`font-medium transition-colors ${
                isActive('/artikel/') || isActive('/artikel') || router.pathname.startsWith('/artikel')
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
              prefetch={true}
            >
              Tips Karir
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/bookmarks/"
              className={`relative p-2 rounded-lg transition-colors ${
                isActive('/bookmarks/') || isActive('/bookmarks') || router.pathname.startsWith('/bookmarks')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
              title="Lowongan Tersimpan"
              prefetch={true}
            >
              <Bookmark className="h-5 w-5" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {bookmarkCount > 99 ? '99+' : bookmarkCount}
                </span>
              )}
            </Link>
            <Link
              href="/lowongan-kerja/"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              prefetch={true}
            >
              Cari Kerja
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;