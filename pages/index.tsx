import { GetStaticProps } from 'next';
import Head from 'next/head';
import { WordPressService, FilterData } from '@/services/wpService';
import { adminService } from '@/services/adminService';
import { getCurrentDomain } from '@/lib/env';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HomePage from '@/components/pages/HomePage';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateWebsiteSchema, generateOrganizationSchema } from '@/utils/schemaUtils';

interface HomePageProps {
  articles: any[];
  filterData: FilterData | null;
  settings: any;
}

export default function Home({ articles, filterData, settings }: HomePageProps) {
  const currentUrl = getCurrentDomain();

  return (
    <>
      <Head>
        <title>{settings.homeTitle}</title>
        <meta name="description" content={settings.homeDescription} />
        <meta property="og:title" content={settings.homeTitle} />
        <meta property="og:description" content={settings.homeDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${currentUrl}/`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={settings.homeTitle} />
        <meta name="twitter:description" content={settings.homeDescription} />
        <link rel="canonical" href={`${currentUrl}/`} />
      </Head>
      
      <SchemaMarkup schema={generateWebsiteSchema(settings)} />
      <SchemaMarkup schema={generateOrganizationSchema()} />
      
      <Header />
      <main>
        <HomePage 
          initialArticles={articles} 
          initialFilterData={filterData}
          settings={settings}
        />
      </main>
      <Footer />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const settings = adminService.getSettings();
    
    // Create isolated wpService instance for this request
    const currentWpService = new WordPressService();
    currentWpService.setBaseUrl(settings.apiUrl);
    currentWpService.setFiltersApiUrl(settings.filtersApiUrl);
    currentWpService.setAuthToken(settings.authToken);
    
    // Fetch data
    const [articles, filterData] = await Promise.all([
      currentWpService.getArticles(3),
      currentWpService.getFiltersData()
    ]);

    return {
      props: {
        articles,
        filterData,
        settings
      },
      revalidate: 3600, // ISR: Revalidate every hour for fresh content
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    
    return {
      props: {
        articles: [],
        filterData: null,
        settings: adminService.getSettings()
      },
      revalidate: 300, // ISR: Retry in 5 minutes on error
    };
  }
};