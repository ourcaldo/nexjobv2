import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  GraduationCap, 
  Building, 
  Users, 
  DollarSign, 
  ExternalLink,
  ArrowLeft,
  Bookmark,
  Share2,
  CalendarDays,
  Badge,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Job } from '@/types/job';
import { wpService } from '@/services/wpService';
import { bookmarkService } from '@/services/bookmarkService';
import { useAnalytics } from '@/hooks/useAnalytics';
import Breadcrumbs from '@/components/Breadcrumbs';
import JobCard from '@/components/JobCard';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import { generateJobPostingSchema, generateBreadcrumbSchema } from '@/utils/schemaUtils';

interface JobDetailPageProps {
  slug: string;
  settings: any;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ slug, settings }) => {
  const router = useRouter();
  const { trackPageView, trackJobApplication, trackBookmark } = useAnalytics();
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (slug) {
      loadJob();
    }
  }, [slug]);

  useEffect(() => {
    if (!job) return;
    setIsBookmarked(bookmarkService.isBookmarked(job.id));
  }, [job]);

  // Listen for bookmark changes
  useEffect(() => {
    if (!job) return;

    const handleBookmarkUpdate = () => {
      setIsBookmarked(bookmarkService.isBookmarked(job.id));
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'nexjob_bookmarks') {
        setIsBookmarked(bookmarkService.isBookmarked(job.id));
      }
    };

    // Listen to both custom events and storage events
    window.addEventListener('bookmarkUpdated', handleBookmarkUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [job]);

  const loadJob = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const jobData = await wpService.getJobBySlug(slug);
      
      if (!jobData) {
        setError('Lowongan tidak ditemukan');
        return;
      }

      setJob(jobData);
      
      // Load related jobs
      const relatedData = await wpService.getRelatedJobs(jobData.id, jobData.kategori_pekerjaan, 4);
      setRelatedJobs(relatedData);

      // Track page view with job details
      trackPageView({
        page_title: `${jobData.title} - ${jobData.company_name}`,
        content_group1: 'job_detail',
        content_group2: jobData.kategori_pekerjaan,
        content_group3: jobData.lokasi_kota,
      });

      // Update page title, meta, and canonical when data loads
      if (typeof window !== 'undefined') {
        const pageTitle = jobData.seo_title || `${jobData.title} - ${jobData.company_name} | Nexjob`;
        const pageDescription = jobData.seo_description || `Lowongan ${jobData.title} di ${jobData.company_name}, ${jobData.lokasi_kota}. Gaji: ${jobData.gaji}. Lamar sekarang!`;
        const currentUrl = window.location.origin;
        const canonicalUrl = `${currentUrl}/lowongan-kerja/${slug}/`;
        
        document.title = pageTitle;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', pageDescription);
        }
        
        // Update or create canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonicalLink) {
          canonicalLink = document.createElement('link');
          canonicalLink.rel = 'canonical';
          document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = canonicalUrl;
        
        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', pageTitle);
        
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute('content', pageDescription);
        
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
        
        // Update Twitter tags
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute('content', pageTitle);
        
        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription) twitterDescription.setAttribute('content', pageDescription);
        
        // Update robots meta to allow indexing
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta) {
          robotsMeta.setAttribute('content', 'index, follow');
        }
      }
    } catch (err) {
      setError('Gagal memuat lowongan. Silakan coba lagi.');
      console.error('Error loading job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = () => {
    if (!job) return;
    const newBookmarkState = bookmarkService.toggleBookmark(job.id);
    setIsBookmarked(newBookmarkState);
    
    // Track bookmark action
    trackBookmark(newBookmarkState ? 'add' : 'remove', job.title, job.id);
  };

  const handleRelatedJobClick = (relatedJob: Job) => {
    // JobCard now handles navigation internally with Link
    return;
  };

  const handleApplyClick = () => {
    if (!job) return;
    
    // Track job application click
    trackJobApplication(job.title, job.company_name, job.id);
    
    // Open application link
    window.open(job.link, '_blank');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Baru dipublikasikan';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {
      if (diffHours === 1) return 'Dipublikasikan 1 jam lalu';
      return `Dipublikasikan ${diffHours} jam lalu`;
    }
    
    if (diffDays === 1) return 'Dipublikasikan 1 hari lalu';
    if (diffDays < 7) return `Dipublikasikan ${diffDays} hari lalu`;
    if (diffDays < 30) return `Dipublikasikan ${Math.ceil(diffDays / 7)} minggu lalu`;
    return `Dipublikasikan ${Math.ceil(diffDays / 30)} bulan lalu`;
  };

  const parseJobContent = (content: string) => {
    return content
      .replace(/<h2>/g, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">')
      .replace(/<p>/g, '<p class="text-gray-700 mb-4">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside space-y-2 mb-4 text-gray-700">')
      .replace(/<ul>/g, '<ul class="list-disc list-inside space-y-2 mb-4 text-gray-700">')
      .replace(/<li>/g, '<li class="pl-2">');
  };

  const getJobTags = (tagString: string) => {
    if (!tagString) return [];
    
    // Tags are already decoded in wpService, so just split them
    return tagString.split(', ').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  const breadcrumbItems = [
    { label: 'Lowongan Kerja', href: '/lowongan-kerja/' },
    { label: loading ? 'Loading...' : (job?.title || 'Lowongan') }
  ];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs items={breadcrumbItems} />
          
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Memuat Lowongan</h2>
              <p className="text-gray-600">Sedang mengambil detail lowongan...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lowongan Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">Lowongan yang Anda cari tidak tersedia</p>
          <Link 
            href="/lowongan-kerja/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Pencarian
          </Link>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Schema Markup */}
      <SchemaMarkup schema={generateJobPostingSchema(job)} />
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbItems)} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                  <div className="flex items-center mb-4">
                    <Building className="h-5 w-5 text-primary-600 mr-2" />
                    <span className="text-xl font-medium text-primary-600">{job.company_name}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {job.lokasi_kota}, {job.lokasi_provinsi}
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {formatDate(job.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleBookmarkToggle}
                    className={`p-2 border rounded-lg transition-colors ${
                      isBookmarked 
                        ? 'text-primary-600 bg-primary-50 border-primary-200 hover:bg-primary-100' 
                        : 'text-gray-400 hover:text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                    title={isBookmarked ? 'Hapus dari bookmark' : 'Simpan ke bookmark'}
                  >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {getJobTags(job.tag).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {getJobTags(job.tag).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700"
                    >
                      <Badge className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Apply Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleBookmarkToggle}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${
                    isBookmarked 
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Tersimpan' : 'Simpan'}
                </button>
                <button
                  onClick={handleApplyClick}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-3 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Lamar Sekarang
                  <ExternalLink className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>

            {/* Mobile: Company Info and Job Info Cards */}
            <div className="lg:hidden space-y-6 mb-8">
              {/* Company Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tentang Perusahaan</h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{job.company_name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{job.industry}</p>
                  <p className="text-xs text-gray-500">
                    Informasi lebih lanjut tentang perusahaan dapat dilihat setelah melamar pekerjaan ini.
                  </p>
                </div>
              </div>

              {/* Job Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pekerjaan</h3>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-accent-600 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Gaji</p>
                        <p className="font-semibold text-accent-600">{job.gaji}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Lokasi Kerja</p>
                        <p className="font-medium">{job.lokasi_kota}</p>
                        <p className="text-sm text-gray-600">{job.lokasi_provinsi}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Tipe Pekerjaan</p>
                        <p className="font-medium">{job.tipe_pekerjaan}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Pengalaman</p>
                        <p className="font-medium">{job.pengalaman}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center mb-2">
                      <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Pendidikan</p>
                        <p className="font-medium">{job.pendidikan}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center mb-2">
                      <Building className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Industri</p>
                        <p className="font-medium">{job.industry}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Kebijakan Kerja</p>
                        <p className="font-medium">{job.kebijakan_kerja}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Deskripsi Pekerjaan</h2>
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: parseJobContent(job.content) }}
              />
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Lowongan Serupa</h2>
                <div className="grid grid-cols-1 gap-6">
                  {relatedJobs.map((relatedJob) => (
                    <JobCard 
                      key={relatedJob.id} 
                      job={relatedJob} 
                      onClick={handleRelatedJobClick} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar - Not sticky */}
          <div className="hidden lg:block space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tentang Perusahaan</h3>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{job.company_name}</h4>
                <p className="text-sm text-gray-600 mb-4">{job.industry}</p>
                <p className="text-xs text-gray-500">
                  Informasi lebih lanjut tentang perusahaan dapat dilihat setelah melamar pekerjaan ini.
                </p>
              </div>
            </div>

            {/* Job Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pekerjaan</h3>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-accent-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Gaji</p>
                      <p className="font-semibold text-accent-600">{job.gaji}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Lokasi Kerja</p>
                      <p className="font-medium">{job.lokasi_kota}</p>
                      <p className="text-sm text-gray-600">{job.lokasi_provinsi}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center mb-2">
                    <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Tipe Pekerjaan</p>
                      <p className="font-medium">{job.tipe_pekerjaan}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Pengalaman</p>
                      <p className="font-medium">{job.pengalaman}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center mb-2">
                    <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Pendidikan</p>
                      <p className="font-medium">{job.pendidikan}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Industri</p>
                      <p className="font-medium">{job.industry}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Kebijakan Kerja</p>
                      <p className="font-medium">{job.kebijakan_kerja}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;