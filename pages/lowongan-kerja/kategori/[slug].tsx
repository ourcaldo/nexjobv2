import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { WordPressService, FilterData } from '@/services/wpService';
import { adminService } from '@/services/adminService';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import JobSearchPage from '@/components/pages/JobSearchPage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateBreadcrumbSchema } from '@/utils/schemaUtils';

interface CategoryJobsPageProps {
  category: string;
  categorySlug: string;
  location?: string;
  settings: any;
  currentUrl: string;
}

export default function CategoryJobs({ category, categorySlug, location, settings, currentUrl }: CategoryJobsPageProps) {
  // Generate dynamic title
  const getPageTitle = () => {
    let title = `Lowongan Kerja ${category}`;
    if (location) {
      title += ` di ${location}`;
    }
    title += ' - Nexjob';
    return title;
  };

  // Generate dynamic description
  const getPageDescription = () => {
    let description = `Temukan lowongan kerja ${category}`;
    if (location) {
      description += ` di ${location}`;
    }
    description += '. Dapatkan pekerjaan impian Anda dengan gaji terbaik di Nexjob.';
    return description;
  };

  const breadcrumbItems = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: `Kategori: ${category}` }
  ];

  return (
    <>
      <Head>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${currentUrl}/lowongan-kerja/kategori/${categorySlug}/`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getPageTitle()} />
        <meta name="twitter:description" content={getPageDescription()} />
        <link rel="canonical" href={`${currentUrl}/lowongan-kerja/`} />
      </Head>
      
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />
      
      <Header />
      <main>
        <JobSearchPage 
          settings={settings} 
          initialCategory={category}
          initialLocation={location}
        />
      </main>
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query, req }) => {
  const categorySlug = params?.slug as string;
  const location = query?.location as string;
  const settings = adminService.getSettings();
  
  // Get current URL from request headers
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const currentUrl = `${protocol}://${host}`;
  
  if (!categorySlug) {
    return { notFound: true };
  }

  try {
    // Get filter data to find the actual category name
    const currentWpService = new WordPressService();
    currentWpService.setBaseUrl(settings.apiUrl);
    currentWpService.setFiltersApiUrl(settings.filtersApiUrl);
    currentWpService.setAuthToken(settings.authToken);
    
    const filterData = await currentWpService.getFiltersData();
    
    // Find matching category by converting slug back to category name
    let matchedCategory = '';
    if (filterData.nexjob_kategori_pekerjaan) {
      matchedCategory = filterData.nexjob_kategori_pekerjaan.find(cat => {
        const catSlug = cat
          .toLowerCase()
          .replace(/[&]/g, '')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        return catSlug === categorySlug;
      }) || '';
    }

    if (!matchedCategory) {
      return { notFound: true };
    }

    return {
      props: {
        category: matchedCategory,
        categorySlug,
        location: location || null,
        settings,
        currentUrl
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};