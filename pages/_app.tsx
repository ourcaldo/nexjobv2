import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { adminService } from '@/services/adminService';
import GoogleAnalytics from '@/components/Analytics/GoogleAnalytics';
import GoogleTagManager, { GoogleTagManagerNoScript } from '@/components/Analytics/GoogleTagManager';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize admin settings on app start
    const settings = adminService.getSettings();
    
    // Apply settings to wpService
    import('@/services/wpService').then(({ wpService }) => {
      wpService.setBaseUrl(settings.apiUrl);
      wpService.setFiltersApiUrl(settings.filtersApiUrl);
      wpService.setAuthToken(settings.authToken);
    });
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      
      {/* Google Tag Manager */}
      <GoogleTagManager />
      
      {/* Google Tag Manager (noscript) */}
      <GoogleTagManagerNoScript />
      
      {/* Google Analytics */}
      <GoogleAnalytics />
      
      <div className="min-h-screen bg-gray-50 font-inter">
        <Component {...pageProps} />
      </div>
    </>
  );
}