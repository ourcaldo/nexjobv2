import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { adminService } from '@/services/adminService';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ArticleDetailPage from '@/components/pages/ArticleDetailPage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateBreadcrumbSchema } from '@/utils/schemaUtils';

interface ArticlePageProps {
  slug: string;
  settings: any;
}

export default function ArticlePage({ slug, settings }: ArticlePageProps) {
  const breadcrumbItems = [
    { label: 'Tips Karir', href: '/artikel/' },
    { label: 'Loading...' }
  ];

  return (
    <>
      <Head>
        <title>Loading Article... - Nexjob</title>
        <meta name="description" content="Loading article content..." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />
      
      <Header />
      <main>
        <ArticleDetailPage slug={slug} settings={settings} />
      </main>
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const settings = adminService.getSettings();
  
  return {
    props: {
      slug,
      settings
    }
  };
};