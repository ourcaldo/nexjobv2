import { AdminSettings } from '@/types/job';
import { env } from '@/lib/env';

class AdminService {
  private storageKey = 'nexjob_admin_settings';
  private authKey = 'nexjob_admin_auth';

  private defaultSettings: AdminSettings = {
    apiUrl: env.WP_API_URL,
    filtersApiUrl: env.WP_FILTERS_API_URL,
    authToken: env.WP_AUTH_TOKEN,
    siteTitle: `${env.SITE_NAME} - Find Your Dream Job`,
    siteDescription: env.SITE_DESCRIPTION,
    homeTitle: `${env.SITE_NAME} - Temukan Karir Impianmu`,
    homeDescription: env.SITE_DESCRIPTION,
    jobsTitle: `Lowongan Kerja - ${env.SITE_NAME}`,
    jobsDescription: 'Temukan lowongan kerja terbaru dari berbagai perusahaan terpercaya di Indonesia',
    articlesTitle: `Tips & Panduan Karir - ${env.SITE_NAME}`,
    articlesDescription: 'Artikel dan panduan terbaru untuk membantu perjalanan karir Anda'
  };

  getSettings(): AdminSettings {
    try {
      if (typeof window === 'undefined') {
        return this.defaultSettings;
      }
      
      const settings = localStorage.getItem(this.storageKey);
      const savedSettings = settings ? JSON.parse(settings) : {};
      const mergedSettings = { ...this.defaultSettings, ...savedSettings };
      
      return mergedSettings;
    } catch (error) {
      console.error('Error getting admin settings:', error);
      return this.defaultSettings;
    }
  }

  saveSettings(settings: AdminSettings): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving admin settings:', error);
    }
  }

  isAuthenticated(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const auth = localStorage.getItem(this.authKey);
      if (!auth) return false;
      
      const { timestamp } = JSON.parse(auth);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours
      
      return (now - timestamp) < oneDay;
    } catch (error) {
      return false;
    }
  }

  authenticate(email: string, password: string): boolean {
    if (typeof window === 'undefined') return false;
    
    // Hash check for aldodkris@gmail.com and Aldo123!
    const validEmail = 'aldodkris@gmail.com';
    const validPasswordHash = this.hashPassword('Aldo123!');
    const inputPasswordHash = this.hashPassword(password);
    
    if (email === validEmail && inputPasswordHash === validPasswordHash) {
      localStorage.setItem(this.authKey, JSON.stringify({
        timestamp: Date.now(),
        email: email
      }));
      return true;
    }
    
    return false;
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.authKey);
  }

  private hashPassword(password: string): string {
    // Simple hash function for demo purposes
    // In production, use proper hashing like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

export const adminService = new AdminService();