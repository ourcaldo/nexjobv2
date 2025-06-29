import React from 'react';
import { MapPin, Clock, Briefcase, GraduationCap, ExternalLink, Building, Bookmark } from 'lucide-react';
import { Job } from '@/types/job';
import { bookmarkService } from '@/services/bookmarkService';

interface JobCardProps {
  job: Job;
  onClick?: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  
  React.useEffect(() => {
    // Set initial bookmark state
    setIsBookmarked(bookmarkService.isBookmarked(job.id));

    // Listen for bookmark changes
    const handleBookmarkUpdate = (event?: CustomEvent) => {
      setIsBookmarked(bookmarkService.isBookmarked(job.id));
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'nexjob_bookmarks') {
        setIsBookmarked(bookmarkService.isBookmarked(job.id));
      }
    };

    // Listen to both custom events and storage events
    window.addEventListener('bookmarkUpdated', handleBookmarkUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [job.id]);
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Baru saja';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) {
      if (diffHours === 1) return '1 jam lalu';
      return `${diffHours} jam lalu`;
    }
    
    if (diffDays === 1) return '1 hari lalu';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu lalu`;
    return `${Math.ceil(diffDays / 30)} bulan lalu`;
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newBookmarkState = bookmarkService.toggleBookmark(job.id);
    setIsBookmarked(newBookmarkState);
  };

  const handleDetailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(job);
    } else {
      window.open(`/lowongan-kerja/${job.slug}/`, '_blank');
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening if clicking on bookmark or detail button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Open job detail in new tab
    window.open(`/lowongan-kerja/${job.slug}/`, '_blank');
  };

  const getJobTags = () => {
    if (!job.tag) return [];
    
    // Tags are already decoded in wpService, so just split them
    const tags = job.tag.split(', ').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    // Show first 3 tags, and if more than 4 total, show "+X Lainnya" for the 4th position
    if (tags.length > 4) {
      const visibleTags = tags.slice(0, 3);
      const remainingCount = tags.length - 3;
      return [...visibleTags, `+${remainingCount} Lainnya`];
    }
    
    return tags.slice(0, 4);
  };

  const tags = getJobTags();

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary-200 animate-fade-in group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {job.title}
          </h2>
          <div className="flex items-center text-primary-600 font-medium mb-2">
            <Building className="h-4 w-4 mr-2" />
            {job.company_name}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            {job.lokasi_kota}, {job.lokasi_provinsi}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-accent-600">{job.gaji}</p>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                tag.includes('Lainnya') 
                  ? 'bg-gray-100 text-gray-600' 
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Job Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
          {job.tipe_pekerjaan}
        </div>
        <div className="flex items-center">
          <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
          {job.pendidikan}
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          {job.pengalaman}
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 mr-2 text-gray-400 text-xs">🏢</span>
          {job.industry}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {formatDate(job.created_at)}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBookmarkClick}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isBookmarked 
                ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
            }`}
            title={isBookmarked ? 'Hapus dari bookmark' : 'Simpan ke bookmark'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleDetailClick}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Lihat Detail
            <ExternalLink className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;