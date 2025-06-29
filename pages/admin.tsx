import { GetServerSideProps } from 'next';
import Head from 'next/head';
import AdminPage from '@/components/pages/AdminPage';

export default function Admin() {
  return (
    <>
      <Head>
        <title>Admin Panel - Nexjob</title>
        <meta name="description" content="Admin panel untuk mengelola website Nexjob" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <AdminPage />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}
  };
};