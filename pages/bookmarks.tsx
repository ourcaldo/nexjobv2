import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { adminService } from '@/services/adminService';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import BookmarkPage from '@/components/pages/BookmarkPage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateBreadcrumbSchema } from '@/utils/schemaUtils';

interface BookmarksPageProps {
  settings: any;
  currentUrl: string;
}

export default function Bookmarks({ settings, currentUrl }: BookmarksPageProps) {
  const breadcrumbItems = [{ label: 'Lowongan Tersimpan' }];

  return (
    <>
      <Head>
        <title>Lowongan Tersimpan - Nexjob</title>
        <meta name="description" content="Kelola lowongan kerja yang telah Anda simpan di Nexjob" />
        <meta property="og:title" content="Lowongan Tersimpan - Nexjob" />
        <meta property="og:description" content="Kelola lowongan kerja yang telah Anda simpan di Nexjob" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${currentUrl}/bookmark/`} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${currentUrl}/bookmark/`} />
      </Head>
      
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />
      
      <Header />
      <main>
        <BookmarkPage />
      </main>
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const settings = adminService.getSettings();
  
  // Get current URL from request headers
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const currentUrl = `${protocol}://${host}`;
  
  return {
    props: {
      settings,
      currentUrl
    }
  };
};