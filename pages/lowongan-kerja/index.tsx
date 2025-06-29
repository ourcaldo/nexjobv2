import { GetStaticProps } from 'next';
import Head from 'next/head';
import { WordPressService, FilterData } from '@/services/wpService';
import { adminService } from '@/services/adminService';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobSearchPage from '@/components/pages/JobSearchPage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateJobListingSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';

interface JobsPageProps {
  settings: any;
}

export default function Jobs({ settings }: JobsPageProps) {
  const breadcrumbItems = [{ label: 'Lowongan Kerja' }];

  // Get current URL dynamically
  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech';
  };

  const currentUrl = getCurrentUrl();

  return (
    <>
      <Head>
        <title>{settings.jobsTitle}</title>
        <meta name="description" content={settings.jobsDescription} />
        <meta property="og:title" content={settings.jobsTitle} />
        <meta property="og:description" content={settings.jobsDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${currentUrl}/lowongan-kerja/`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={settings.jobsTitle} />
        <meta name="twitter:description" content={settings.jobsDescription} />
        <link rel="canonical" href={`${currentUrl}/lowongan-kerja/`} />
      </Head>
      
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />
      
      <Header />
      <main>
        <JobSearchPage settings={settings} />
      </main>
      <Footer />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const settings = adminService.getSettings();
  
  return {
    props: {
      settings
    },
    revalidate: 3600, // Revalidate every hour
  };
};