import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { WordPressService } from '@/services/wpService';
import { adminService } from '@/services/adminService';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ArticlePage from '@/components/pages/ArticlePage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateArticleListingSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';

interface ArticlesPageProps {
  settings: any;
  currentUrl: string;
}

export default function Articles({ settings, currentUrl }: ArticlesPageProps) {
  const breadcrumbItems = [{ label: 'Tips Karir' }];

  return (
    <>
      <Head>
        <title>{settings.articlesTitle}</title>
        <meta name="description" content={settings.articlesDescription} />
        <meta property="og:title" content={settings.articlesTitle} />
        <meta property="og:description" content={settings.articlesDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${currentUrl}/artikel/`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={settings.articlesTitle} />
        <meta name="twitter:description" content={settings.articlesDescription} />
        <link rel="canonical" href={`${currentUrl}/artikel/`} />
      </Head>
      
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />
      
      <Header />
      <main>
        <ArticlePage settings={settings} />
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