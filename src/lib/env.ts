// Environment variables helper for Vercel deployment
export const env = {
  // Site Configuration
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://nexjob.tech',
  
  // WordPress API
  WP_API_URL: process.env.NEXT_PUBLIC_WP_API_URL || 'https://staging.nexjob.tech/wp-json/wp/v2',
  WP_FILTERS_API_URL: process.env.NEXT_PUBLIC_WP_FILTERS_API_URL || 'https://staging.nexjob.tech/wp-json/nex/v1/filters-data',
  WP_AUTH_TOKEN: process.env.NEXT_PUBLIC_WP_AUTH_TOKEN || '',
  
  // SEO
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Nexjob',
  SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Platform pencarian kerja terpercaya di Indonesia',
  
  // Analytics
  GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Validate required environment variables
export const validateEnv = () => {
  const required = ['SITE_URL', 'WP_API_URL', 'WP_FILTERS_API_URL'] as const;
  
  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: NEXT_PUBLIC_${key}`);
    }
  }
};

// Get current domain dynamically
export const getCurrentDomain = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For server-side rendering, use environment variable
  return env.SITE_URL;
};