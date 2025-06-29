import { Job } from '@/types/job';

interface FilterData {
  nexjob_lokasi_provinsi: Record<string, string[]>;
  nexjob_kategori_pekerjaan: string[];
  nexjob_tipe_pekerjaan: string[];
  nexjob_pengalaman_kerja: string[];
  nexjob_pendidikan: string[];
  nexjob_kebijakan_kerja: string[];
  nexjob_industri: string[];
}

interface JobsResponse {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  totalJobs: number;
  hasMore: boolean;
}

class WordPressService {
  private baseUrl = 'https://staging.nexjob.tech/wp-json/wp/v2';
  private filtersApiUrl = 'https://staging.nexjob.tech/wp-json/nex/v1/filters-data';
  private authToken = '';

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setFiltersApiUrl(url: string) {
    this.filtersApiUrl = url;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  private decodeHtmlEntities(text: string): string {
    if (typeof document === 'undefined') {
      // Server-side fallback
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    }
    
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  private stripHtmlTags(html: string): string {
    if (typeof document === 'undefined') {
      // Server-side fallback
      return html.replace(/<[^>]*>/g, '');
    }
    
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private getPreferredDescription(excerptRendered: string, rankMathDescription: string): string {
    // First try rank_math_description if it exists and is not empty
    if (rankMathDescription && rankMathDescription.trim() !== '') {
      return this.stripHtmlTags(this.decodeHtmlEntities(rankMathDescription));
    }
    
    // Fall back to excerpt if available
    if (excerptRendered && excerptRendered.trim() !== '') {
      return this.stripHtmlTags(this.decodeHtmlEntities(excerptRendered));
    }
    
    return '';
  }

  private async fetchWithFallback(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.warn(`Failed to fetch from ${url}:`, error);
      throw error;
    }
  }

  async getFiltersData(): Promise<FilterData> {
    try {
      const response = await this.fetchWithFallback(this.filtersApiUrl);
      const data = await response.json();
      
      // Decode HTML entities in filter data
      const decodedData: FilterData = {
        nexjob_lokasi_provinsi: {},
        nexjob_kategori_pekerjaan: [],
        nexjob_tipe_pekerjaan: [],
        nexjob_pengalaman_kerja: [],
        nexjob_pendidikan: [],
        nexjob_kebijakan_kerja: [],
        nexjob_industri: []
      };

      // Decode location data
      if (data.nexjob_lokasi_provinsi) {
        Object.keys(data.nexjob_lokasi_provinsi).forEach(province => {
          const decodedProvince = this.decodeHtmlEntities(province);
          decodedData.nexjob_lokasi_provinsi[decodedProvince] = 
            data.nexjob_lokasi_provinsi[province].map((city: string) => this.decodeHtmlEntities(city));
        });
      }

      // Decode other filter arrays
      const filterKeys: (keyof Omit<FilterData, 'nexjob_lokasi_provinsi'>)[] = [
        'nexjob_kategori_pekerjaan',
        'nexjob_tipe_pekerjaan', 
        'nexjob_pengalaman_kerja',
        'nexjob_pendidikan',
        'nexjob_kebijakan_kerja',
        'nexjob_industri'
      ];

      filterKeys.forEach(key => {
        if (data[key] && Array.isArray(data[key])) {
          decodedData[key] = data[key].map((item: string) => this.decodeHtmlEntities(item));
        }
      });

      return decodedData;
    } catch (error) {
      console.error('Error fetching filters data:', error);
      // Return fallback data
      return this.getFallbackFiltersData();
    }
  }

  private getFallbackFiltersData(): FilterData {
    return {
      nexjob_lokasi_provinsi: {
        'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Utara', 'Jakarta Timur'],
        'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Tangerang'],
        'Jawa Timur': ['Surabaya', 'Malang', 'Kediri', 'Sidoarjo'],
        'Jawa Tengah': ['Semarang', 'Solo', 'Yogyakarta'],
        'Bali': ['Denpasar', 'Ubud', 'Sanur'],
        'Sumatera Utara': ['Medan', 'Binjai']
      },
      nexjob_kategori_pekerjaan: [
        'Teknologi Informasi',
        'Digital Marketing',
        'Customer Service',
        'Human Resources',
        'Sales',
        'Akuntansi',
        'Healthcare',
        'Pendidikan',
        'Logistik'
      ],
      nexjob_tipe_pekerjaan: [
        'Full Time',
        'Part Time',
        'Contract',
        'Freelance',
        'Internship'
      ],
      nexjob_pengalaman_kerja: [
        'Fresh Graduate',
        '1-2 Tahun',
        '2-3 Tahun',
        '3-5 Tahun',
        '5+ Tahun'
      ],
      nexjob_pendidikan: [
        'SMA/SMK',
        'D3',
        'S1',
        'S2'
      ],
      nexjob_kebijakan_kerja: [
        'On-site Working',
        'Remote Working',
        'Hybrid Working'
      ],
      nexjob_industri: [
        'Teknologi Informasi',
        'Perbankan',
        'Healthcare',
        'Pendidikan',
        'E-commerce',
        'Otomotif',
        'Digital Marketing',
        'Human Resources',
        'Customer Service',
        'Sales',
        'Logistik',
        'Akuntansi'
      ]
    };
  }

  async testConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.fetchWithFallback(`${this.baseUrl}/lowongan-kerja?per_page=1`);
      const data = await response.json();
      return { success: true, data: data[0] || null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async testFiltersConnection(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.fetchWithFallback(this.filtersApiUrl);
      const data = await response.json();
      return { success: true, data: data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getJobs(filters?: any, page: number = 1, perPage: number = 24): Promise<JobsResponse> {
    try {
      let url = `${this.baseUrl}/lowongan-kerja?per_page=${perPage}&page=${page}&_embed`;
      
      // Add search parameter if provided
      if (filters?.search) {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }

      const response = await this.fetchWithFallback(url);
      const wpJobs = await response.json();
      
      // Get total pages from headers
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      const totalJobs = parseInt(response.headers.get('X-WP-Total') || '0');
      
      // Transform WordPress data to our Job interface
      let jobs: Job[] = wpJobs.map((wpJob: any) => {
        // Extract meta fields with nexjob_ prefix
        const meta = wpJob.meta || {};
        
        return {
          id: wpJob.id.toString(),
          slug: wpJob.slug,
          title: this.decodeHtmlEntities(wpJob.title.rendered),
          content: wpJob.content.rendered,
          company_name: this.decodeHtmlEntities(meta.nexjob_nama_perusahaan || 'Perusahaan'),
          kategori_pekerjaan: this.decodeHtmlEntities(meta.nexjob_kategori_pekerjaan || ''),
          lokasi_provinsi: this.decodeHtmlEntities(meta.nexjob_lokasi_provinsi || ''),
          lokasi_kota: this.decodeHtmlEntities(meta.nexjob_lokasi_kota || ''),
          tipe_pekerjaan: this.decodeHtmlEntities(meta.nexjob_tipe_pekerjaan || 'Full Time'),
          pendidikan: this.decodeHtmlEntities(meta.nexjob_pendidikan || ''),
          industry: this.decodeHtmlEntities(meta.nexjob_industri || ''),
          pengalaman: this.decodeHtmlEntities(meta.nexjob_pengalaman_kerja || ''),
          tag: this.decodeHtmlEntities(meta.nexjob_tag_loker || ''),
          gender: this.decodeHtmlEntities(meta.nexjob_gender || ''),
          gaji: this.decodeHtmlEntities(meta.nexjob_gaji || 'Negosiasi'),
          kebijakan_kerja: this.decodeHtmlEntities(meta.nexjob_kebijakan_kerja || ''),
          link: meta.nexjob_link_loker || wpJob.link,
          sumber_lowongan: this.decodeHtmlEntities(meta.nexjob_sumber_loker || 'Nexjob'),
          created_at: wpJob.date,
          seo_title: this.decodeHtmlEntities(meta.rank_math_title || wpJob.title.rendered),
          seo_description: this.getPreferredDescription(wpJob.excerpt?.rendered || '', meta.rank_math_description || ''),
          _id: { $oid: wpJob.id.toString() },
          id_obj: { $numberInt: wpJob.id.toString() }
        };
      });

      // Apply client-side filtering for fields not supported by WordPress search
      jobs = this.filterJobs(jobs, filters);

      // Apply sorting
      if (filters?.sortBy === 'newest') {
        jobs = jobs.sort((a, b) => {
          const dateA = new Date(a.created_at || '').getTime();
          const dateB = new Date(b.created_at || '').getTime();
          return dateB - dateA; // Newest first
        });
      }

      return {
        jobs,
        totalPages,
        currentPage: page,
        totalJobs,
        hasMore: page < totalPages
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Return mock data as fallback
      const mockJobs = this.getMockJobs(filters);
      return {
        jobs: mockJobs,
        totalPages: 1,
        currentPage: 1,
        totalJobs: mockJobs.length,
        hasMore: false
      };
    }
  }

  // Legacy method for backward compatibility
  async getAllJobs(filters?: any): Promise<Job[]> {
    const response = await this.getJobs(filters, 1, 100);
    return response.jobs;
  }

  async getJobBySlug(slug: string): Promise<Job | null> {
    try {
      const response = await this.fetchWithFallback(`${this.baseUrl}/lowongan-kerja?slug=${slug}&_embed`);
      const wpJobs = await response.json();
      
      if (!wpJobs || wpJobs.length === 0) {
        return null;
      }

      const wpJob = wpJobs[0];
      const meta = wpJob.meta || {};

      return {
        id: wpJob.id.toString(),
        slug: wpJob.slug,
        title: this.decodeHtmlEntities(wpJob.title.rendered),
        content: wpJob.content.rendered,
        company_name: this.decodeHtmlEntities(meta.nexjob_nama_perusahaan || 'Perusahaan'),
        kategori_pekerjaan: this.decodeHtmlEntities(meta.nexjob_kategori_pekerjaan || ''),
        lokasi_provinsi: this.decodeHtmlEntities(meta.nexjob_lokasi_provinsi || ''),
        lokasi_kota: this.decodeHtmlEntities(meta.nexjob_lokasi_kota || ''),
        tipe_pekerjaan: this.decodeHtmlEntities(meta.nexjob_tipe_pekerjaan || 'Full Time'),
        pendidikan: this.decodeHtmlEntities(meta.nexjob_pendidikan || ''),
        industry: this.decodeHtmlEntities(meta.nexjob_industri || ''),
        pengalaman: this.decodeHtmlEntities(meta.nexjob_pengalaman_kerja || ''),
        tag: this.decodeHtmlEntities(meta.nexjob_tag_loker || ''),
        gender: this.decodeHtmlEntities(meta.nexjob_gender || ''),
        gaji: this.decodeHtmlEntities(meta.nexjob_gaji || 'Negosiasi'),
        kebijakan_kerja: this.decodeHtmlEntities(meta.nexjob_kebijakan_kerja || ''),
        link: meta.nexjob_link_loker || wpJob.link,
        sumber_lowongan: this.decodeHtmlEntities(meta.nexjob_sumber_loker || 'Nexjob'),
        created_at: wpJob.date,
        seo_title: this.decodeHtmlEntities(meta.rank_math_title || wpJob.title.rendered),
        seo_description: this.getPreferredDescription(wpJob.excerpt?.rendered || '', meta.rank_math_description || ''),
        _id: { $oid: wpJob.id.toString() },
        id_obj: { $numberInt: wpJob.id.toString() }
      };
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      const response = await this.fetchWithFallback(`${this.baseUrl}/lowongan-kerja/${id}?_embed`);
      const wpJob = await response.json();
      const meta = wpJob.meta || {};

      return {
        id: wpJob.id.toString(),
        slug: wpJob.slug,
        title: this.decodeHtmlEntities(wpJob.title.rendered),
        content: wpJob.content.rendered,
        company_name: this.decodeHtmlEntities(meta.nexjob_nama_perusahaan || 'Perusahaan'),
        kategori_pekerjaan: this.decodeHtmlEntities(meta.nexjob_kategori_pekerjaan || ''),
        lokasi_provinsi: this.decodeHtmlEntities(meta.nexjob_lokasi_provinsi || ''),
        lokasi_kota: this.decodeHtmlEntities(meta.nexjob_lokasi_kota || ''),
        tipe_pekerjaan: this.decodeHtmlEntities(meta.nexjob_tipe_pekerjaan || 'Full Time'),
        pendidikan: this.decodeHtmlEntities(meta.nexjob_pendidikan || ''),
        industry: this.decodeHtmlEntities(meta.nexjob_industri || ''),
        pengalaman: this.decodeHtmlEntities(meta.nexjob_pengalaman_kerja || ''),
        tag: this.decodeHtmlEntities(meta.nexjob_tag_loker || ''),
        gender: this.decodeHtmlEntities(meta.nexjob_gender || ''),
        gaji: this.decodeHtmlEntities(meta.nexjob_gaji || 'Negosiasi'),
        kebijakan_kerja: this.decodeHtmlEntities(meta.nexjob_kebijakan_kerja || ''),
        link: meta.nexjob_link_loker || wpJob.link,
        sumber_lowongan: this.decodeHtmlEntities(meta.nexjob_sumber_loker || 'Nexjob'),
        created_at: wpJob.date,
        seo_title: this.decodeHtmlEntities(meta.rank_math_title || wpJob.title.rendered),
        seo_description: this.getPreferredDescription(wpJob.excerpt?.rendered || '', meta.rank_math_description || ''),
        _id: { $oid: wpJob.id.toString() },
        id_obj: { $numberInt: wpJob.id.toString() }
      };
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }

  async getRelatedJobs(currentJobId: string, category: string, limit: number = 4): Promise<Job[]> {
    try {
      const allJobs = await this.getAllJobs();
      return allJobs
        .filter(job => job.id !== currentJobId && job.kategori_pekerjaan.toLowerCase().includes(category.toLowerCase()))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching related jobs:', error);
      return [];
    }
  }

  async getArticles(limit?: number): Promise<any[]> {
    try {
      let url = `${this.baseUrl}/posts?_embed`;
      if (limit) {
        url += `&per_page=${limit}`;
      }

      const response = await this.fetchWithFallback(url);
      const articles = await response.json();
      
      // Add featured image URL and author info if available
      return articles.map((article: any) => ({
        ...article,
        title: {
          ...article.title,
          rendered: this.decodeHtmlEntities(article.title.rendered)
        },
        excerpt: {
          ...article.excerpt,
          rendered: this.decodeHtmlEntities(article.excerpt.rendered)
        },
        featured_media_url: article._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
        author_info: article._embedded?.author?.[0] || null,
        categories_info: article._embedded?.['wp:term']?.[0]?.map((cat: any) => ({
          ...cat,
          name: this.decodeHtmlEntities(cat.name)
        })) || [],
        tags_info: article._embedded?.['wp:term']?.[1]?.map((tag: any) => ({
          ...tag,
          name: this.decodeHtmlEntities(tag.name)
        })) || [],
        seo_title: this.decodeHtmlEntities(article.meta?.rank_math_title || article.title.rendered),
        seo_description: this.getPreferredDescription(article.excerpt?.rendered || '', article.meta?.rank_math_description || '')
      }));
    } catch (error) {
      console.error('Error fetching articles:', error);
      return this.getMockArticles();
    }
  }

  async getArticleBySlug(slug: string): Promise<any | null> {
    try {
      const response = await this.fetchWithFallback(`${this.baseUrl}/posts?slug=${slug}&_embed`);
      const articles = await response.json();
      
      if (!articles || articles.length === 0) {
        return null;
      }

      const article = articles[0];
      return {
        ...article,
        title: {
          ...article.title,
          rendered: this.decodeHtmlEntities(article.title.rendered)
        },
        excerpt: {
          ...article.excerpt,
          rendered: this.decodeHtmlEntities(article.excerpt.rendered)
        },
        featured_media_url: article._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
        author_info: article._embedded?.author?.[0] || null,
        categories_info: article._embedded?.['wp:term']?.[0]?.map((cat: any) => ({
          ...cat,
          name: this.decodeHtmlEntities(cat.name)
        })) || [],
        tags_info: article._embedded?.['wp:term']?.[1]?.map((tag: any) => ({
          ...tag,
          name: this.decodeHtmlEntities(tag.name)
        })) || [],
        seo_title: this.decodeHtmlEntities(article.meta?.rank_math_title || article.title.rendered),
        seo_description: this.getPreferredDescription(article.excerpt?.rendered || '', article.meta?.rank_math_description || '')
      };
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  async getArticleById(id: string): Promise<any | null> {
    try {
      const response = await this.fetchWithFallback(`${this.baseUrl}/posts/${id}?_embed`);
      const article = await response.json();
      
      return {
        ...article,
        title: {
          ...article.title,
          rendered: this.decodeHtmlEntities(article.title.rendered)
        },
        excerpt: {
          ...article.excerpt,
          rendered: this.decodeHtmlEntities(article.excerpt.rendered)
        },
        featured_media_url: article._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
        author_info: article._embedded?.author?.[0] || null,
        categories_info: article._embedded?.['wp:term']?.[0]?.map((cat: any) => ({
          ...cat,
          name: this.decodeHtmlEntities(cat.name)
        })) || [],
        tags_info: article._embedded?.['wp:term']?.[1]?.map((tag: any) => ({
          ...tag,
          name: this.decodeHtmlEntities(tag.name)
        })) || [],
        seo_title: this.decodeHtmlEntities(article.meta?.rank_math_title || article.title.rendered),
        seo_description: this.getPreferredDescription(article.excerpt?.rendered || '', article.meta?.rank_math_description || '')
      };
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }

  async getRelatedArticles(currentArticleId: string, limit: number = 3): Promise<any[]> {
    try {
      const articles = await this.getArticles();
      return articles
        .filter(article => article.id.toString() !== currentArticleId)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
  }

  private filterJobs(jobs: Job[], filters?: any): Job[] {
    if (!filters) return jobs;

    return jobs.filter(job => {
      // Location filter (province)
      if (filters.location && !job.lokasi_provinsi.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // City filter (multiple selection)
      if (filters.cities && filters.cities.length > 0) {
        const jobCityMatch = filters.cities.some((city: string) => 
          job.lokasi_kota.toLowerCase().includes(city.toLowerCase())
        );
        if (!jobCityMatch) return false;
      }

      // Job type filter (multiple selection)
      if (filters.jobTypes && filters.jobTypes.length > 0) {
        if (!filters.jobTypes.includes(job.tipe_pekerjaan)) {
          return false;
        }
      }

      // Experience filter (multiple selection)
      if (filters.experiences && filters.experiences.length > 0) {
        const experienceMatch = filters.experiences.some((exp: string) => 
          job.pengalaman.toLowerCase().includes(exp.toLowerCase())
        );
        if (!experienceMatch) return false;
      }

      // Education filter (multiple selection)
      if (filters.educations && filters.educations.length > 0) {
        if (!filters.educations.includes(job.pendidikan)) {
          return false;
        }
      }

      // Industry filter (multiple selection)
      if (filters.industries && filters.industries.length > 0) {
        const industryMatch = filters.industries.some((industry: string) => 
          job.industry.toLowerCase().includes(industry.toLowerCase())
        );
        if (!industryMatch) return false;
      }

      // Category filter (multiple selection)
      if (filters.categories && filters.categories.length > 0) {
        const categoryMatch = filters.categories.some((category: string) => 
          job.kategori_pekerjaan.toLowerCase().includes(category.toLowerCase())
        );
        if (!categoryMatch) return false;
      }

      // Work policy filter (multiple selection)
      if (filters.workPolicies && filters.workPolicies.length > 0) {
        if (!filters.workPolicies.includes(job.kebijakan_kerja)) {
          return false;
        }
      }

      // Legacy single filters for backward compatibility
      if (filters.jobType && job.tipe_pekerjaan !== filters.jobType) {
        return false;
      }

      if (filters.experience && !job.pengalaman.toLowerCase().includes(filters.experience.toLowerCase())) {
        return false;
      }

      if (filters.education && job.pendidikan !== filters.education) {
        return false;
      }

      if (filters.industry && !job.industry.toLowerCase().includes(filters.industry.toLowerCase())) {
        return false;
      }

      if (filters.category && !job.kategori_pekerjaan.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }

      if (filters.workPolicy && job.kebijakan_kerja !== filters.workPolicy) {
        return false;
      }

      return true;
    });
  }

  private getMockJobs(filters?: any): Job[] {
    // Fallback mock data
    const mockJobs: Job[] = [
      {
        id: '1',
        slug: 'frontend-developer-react-js',
        title: 'Frontend Developer React.js',
        content: '<p>Kami mencari Frontend Developer yang berpengalaman dengan React.js</p>',
        company_name: 'PT. Teknologi Digital Indonesia',
        kategori_pekerjaan: 'Software Engineer',
        lokasi_provinsi: 'DKI Jakarta',
        lokasi_kota: 'Jakarta Selatan',
        tipe_pekerjaan: 'Full Time',
        pendidikan: 'S1',
        industry: 'Teknologi Informasi',
        pengalaman: '2-4 Tahun',
        tag: 'React.js, Frontend Developer, JavaScript, TypeScript',
        gender: 'Laki-Laki atau Perempuan',
        gaji: 'Rp 8-12 Juta',
        kebijakan_kerja: 'Hybrid Working',
        link: '#',
        sumber_lowongan: 'Nexjob',
        created_at: new Date().toISOString(),
        seo_title: 'Frontend Developer React.js',
        seo_description: 'Lowongan Frontend Developer React.js di Jakarta',
        _id: { $oid: '1' },
        id_obj: { $numberInt: '1' }
      }
    ];

    return this.filterJobs(mockJobs, filters);
  }

  private getMockArticles(): any[] {
    return [
      {
        id: 1,
        slug: 'tips-interview-kerja',
        title: {
          rendered: 'Tips Sukses Interview Kerja'
        },
        excerpt: {
          rendered: 'Panduan lengkap untuk mempersiapkan diri menghadapi interview kerja dan meningkatkan peluang diterima.'
        },
        content: {
          rendered: '<p>Artikel lengkap tentang tips interview kerja...</p>'
        },
        date: new Date().toISOString(),
        featured_media_url: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg',
        author_info: {
          name: 'Admin Nexjob',
          display_name: 'Admin Nexjob'
        },
        categories_info: [
          { name: 'Tips Karir' }
        ],
        tags_info: [
          { name: 'Interview' },
          { name: 'Karir' }
        ],
        seo_title: 'Tips Sukses Interview Kerja',
        seo_description: 'Panduan lengkap untuk mempersiapkan diri menghadapi interview kerja dan meningkatkan peluang diterima.'
      }
    ];
  }
}

// Export both the class and a singleton instance
export { WordPressService };
export const wpService = new WordPressService();
export type { FilterData, JobsResponse };