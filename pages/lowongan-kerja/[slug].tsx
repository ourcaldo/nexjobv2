import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { adminService } from '@/services/adminService';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobDetailPage from '@/components/pages/JobDetailPage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateBreadcrumbSchema } from '@/utils/schemaUtils';

interface JobPageProps {
  slug: string;
  settings: any;
}

export default function JobPage({ slug, settings }: JobPageProps) {
  const breadcrumbItems = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: 'Loading...' }
  ];

  return (
    <>
      <Head>
        <title>Loading Job... - Nexjob</title>
        <meta name="description" content="Loading job details..." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />
      
      <Header />
      <main>
        <JobDetailPage slug={slug} settings={settings} />
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