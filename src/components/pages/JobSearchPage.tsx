import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Filter, X, Loader2, AlertCircle } from 'lucide-react';
import { Job } from '@/types/job';
import { wpService, FilterData, JobsResponse } from '@/services/wpService';
import { useAnalytics } from '@/hooks/useAnalytics';
import JobCard from '@/components/JobCard';
import JobSidebar from '@/components/JobSidebar';
import SearchableSelect from '@/components/SearchableSelect';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface JobSearchPageProps {
  settings: any;
  initialCategory?: string;
  initialLocation?: string;
  locationType?: 'province' | 'city';
}

const JobSearchPage: React.FC<JobSearchPageProps> = ({ 
  settings, 
  initialCategory, 
  initialLocation,
  locationType = 'province'
}) => {
  const router = useRouter();
  const { trackPageView, trackSearch, trackFilterUsage } = useAnalytics();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterData, setFilterData] = useState<FilterData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Main search filters
  const [keyword, setKeyword] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(initialLocation || '');
  
  // Sidebar filters
  const [sidebarFilters, setSidebarFilters] = useState({
    cities: initialLocation && locationType === 'city' ? [initialLocation] : [] as string[],
    jobTypes: [] as string[],
    experiences: [] as string[],
    educations: [] as string[],
    industries: [] as string[],
    workPolicies: [] as string[],
    categories: initialCategory ? [initialCategory] : [] as string[]
  });

  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize from URL params on mount
  useEffect(() => {
    const { search, location, category } = router.query;
    
    if (search) setKeyword(search as string);
    if (location && !initialLocation) setSelectedProvince(location as string);
    if (category && !initialCategory) {
      setSidebarFilters(prev => ({
        ...prev,
        categories: [category as string]
      }));
    }

    // Load initial data
    loadInitialData();
  }, [router.query, initialCategory, initialLocation]);

  // Track page view when component mounts
  useEffect(() => {
    trackPageView({
      page_title: document.title,
      content_group1: 'job_search',
      content_group2: initialCategory || '',
      content_group3: initialLocation || '',
    });
  }, [initialCategory, initialLocation]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load filter data first
      const filterDataPromise = wpService.getFiltersData();
      
      // Build initial filters from URL or props
      const { search, location, category } = router.query;
      const filters = {
        search: (search as string) || '',
        location: getLocationFilter(),
        categories: initialCategory ? [initialCategory] : (category ? [category as string] : []),
        cities: initialLocation && locationType === 'city' ? [initialLocation] : [],
        sortBy: 'newest'
      };
      
      // Load jobs with filters
      const jobsPromise = wpService.getJobs(filters, 1, 24);
      
      // Wait for both to complete
      const [filterDataResult, jobsResult] = await Promise.all([filterDataPromise, jobsPromise]);
      
      setFilterData(filterDataResult);
      setJobs(jobsResult.jobs);
      setCurrentPage(jobsResult.currentPage);
      setHasMore(jobsResult.hasMore);
      setTotalJobs(jobsResult.totalJobs);
      setDataLoaded(true);
    } catch (err) {
      setError('Gagal memuat data. Silakan coba lagi.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get location filter based on type
  const getLocationFilter = () => {
    if (initialLocation) {
      return locationType === 'province' ? initialLocation : '';
    }
    return selectedProvince;
  };

  // Load more jobs function for infinite scroll
  const loadMoreJobs = useCallback(async () => {
    if (loadingMore || !hasMore || searching || !dataLoaded) return;

    setLoadingMore(true);
    try {
      const filters = {
        search: keyword,
        location: getLocationFilter(),
        cities: sidebarFilters.cities,
        sortBy: sortBy,
        ...sidebarFilters
      };

      const response = await wpService.getJobs(filters, currentPage + 1, 24);
      
      if (response.jobs.length > 0) {
        setJobs(prevJobs => [...prevJobs, ...response.jobs]);
        setCurrentPage(response.currentPage);
        setHasMore(response.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more jobs:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [keyword, selectedProvince, sortBy, sidebarFilters, currentPage, hasMore, loadingMore, searching, dataLoaded, initialLocation, locationType]);

  // Infinite scroll hook
  const { isFetching, setTarget, resetFetching } = useInfiniteScroll(loadMoreJobs, {
    threshold: 0.8,
    rootMargin: '200px'
  });

  // Reset fetching state when loading more is complete
  useEffect(() => {
    if (!loadingMore && isFetching) {
      resetFetching();
    }
  }, [loadingMore, isFetching, resetFetching]);

  // Watch for changes in filters to trigger search
  useEffect(() => {
    if (!dataLoaded) return;

    const timeoutId = setTimeout(() => {
      handleFilterSearch();
    }, 300); // Debounce filter changes

    return () => clearTimeout(timeoutId);
  }, [keyword, selectedProvince, sidebarFilters, sortBy, dataLoaded]);

  const handleFilterSearch = async () => {
    if (searching || !dataLoaded) return;
    
    setSearching(true);
    setJobs([]);
    setCurrentPage(1);
    setHasMore(true);
    
    try {
      setError(null);
      const filters = {
        search: keyword,
        location: getLocationFilter(),
        cities: sidebarFilters.cities,
        sortBy: sortBy,
        ...sidebarFilters
      };
      
      // Track search if there's a keyword
      if (keyword) {
        trackSearch(keyword, getLocationFilter(), sidebarFilters.categories[0]);
      }
      
      // Update URL without page reload (only for non-category/location pages)
      if (!initialCategory && !initialLocation) {
        const params = new URLSearchParams();
        if (keyword) params.set('search', keyword);
        if (selectedProvince) params.set('location', selectedProvince);
        
        const newUrl = `/lowongan-kerja/${params.toString() ? '?' + params.toString() : ''}`;
        router.replace(newUrl, undefined, { shallow: true });
      }
      
      const response = await wpService.getJobs(filters, 1, 24);
      setJobs(response.jobs);
      setCurrentPage(response.currentPage);
      setHasMore(response.hasMore);
      setTotalJobs(response.totalJobs);
    } catch (err) {
      setError('Gagal memuat data pekerjaan. Silakan coba lagi.');
    } finally {
      setSearching(false);
    }
  };

  const handleMainSearch = async () => {
    if (!dataLoaded) return;
    await handleFilterSearch();
  };

  const handleSidebarFilterChange = (newFilters: any) => {
    setSidebarFilters(newFilters);
    
    // Track filter usage
    Object.entries(newFilters).forEach(([filterType, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        values.forEach(value => {
          trackFilterUsage(filterType, value);
        });
      }
    });
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleJobClick = (job: Job) => {
    // JobCard now handles navigation with Link
    return;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleMainSearch();
    }
  };

  const clearAllFilters = () => {
    setKeyword('');
    setSelectedProvince(initialLocation && locationType === 'province' ? initialLocation : '');
    setSidebarFilters({
      cities: initialLocation && locationType === 'city' ? [initialLocation] : [],
      jobTypes: [],
      experiences: [],
      educations: [],
      industries: [],
      workPolicies: [],
      categories: initialCategory ? [initialCategory] : []
    });
    setSortBy('newest');
    
    if (!initialCategory && !initialLocation) {
      router.replace('/lowongan-kerja/', undefined, { shallow: true });
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (keyword) count++;
    if (selectedProvince && selectedProvince !== (initialLocation && locationType === 'province' ? initialLocation : '')) count++;
    
    Object.entries(sidebarFilters).forEach(([key, filterArray]) => {
      if (key === 'categories' && initialCategory) {
        // Don't count initial category as active filter
        count += filterArray.filter(cat => cat !== initialCategory).length;
      } else if (key === 'cities' && initialLocation && locationType === 'city') {
        // Don't count initial city as active filter
        count += filterArray.filter(city => city !== initialLocation).length;
      } else {
        count += filterArray.length;
      }
    });
    return count;
  };

  const removeFilter = (filterType: string, value?: string) => {
    if (filterType === 'keyword') {
      setKeyword('');
    } else if (filterType === 'province') {
      setSelectedProvince(initialLocation && locationType === 'province' ? initialLocation : '');
      setSidebarFilters(prev => ({ ...prev, cities: initialLocation && locationType === 'city' ? [initialLocation] : [] }));
    } else if (value) {
      setSidebarFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType as keyof typeof prev].filter(item => item !== value)
      }));
    }
  };

  const getProvinceOptions = () => {
    if (!filterData) return [];
    return Object.keys(filterData.nexjob_lokasi_provinsi).map(province => ({
      value: province,
      label: province
    }));
  };

  // Show loading state while initial data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Search Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5">
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="lg:col-span-4">
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="lg:col-span-3">
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Memuat Data</h2>
              <p className="text-gray-600">Sedang mengambil data lowongan kerja...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Centered Search Form */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Keyword Search */}
              <div className="lg:col-span-5 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan skill, posisi, atau perusahaan..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              {/* Province Select */}
              <div className="lg:col-span-4">
                <SearchableSelect
                  options={getProvinceOptions()}
                  value={selectedProvince}
                  onChange={setSelectedProvince}
                  placeholder="Semua Provinsi"
                  disabled={initialLocation && locationType === 'province'}
                />
              </div>

              {/* Search Button */}
              <div className="lg:col-span-3">
                <button
                  onClick={handleMainSearch}
                  disabled={searching}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {searching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Cari
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mt-4 text-center">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium inline-flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter ({getActiveFiltersCount()})
            </button>
          </div>

          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center justify-center">
              <span className="text-sm text-gray-600">Filter aktif:</span>
              
              {keyword && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Keyword: {keyword}
                  <button
                    onClick={() => removeFilter('keyword')}
                    className="ml-2 hover:text-primary-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {selectedProvince && selectedProvince !== (initialLocation && locationType === 'province' ? initialLocation : '') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Provinsi: {selectedProvince}
                  <button
                    onClick={() => removeFilter('province')}
                    className="ml-2 hover:text-primary-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Sidebar filters */}
              {Object.entries(sidebarFilters).map(([filterType, values]) =>
                values
                  .filter(value => {
                    if (filterType === 'categories' && initialCategory && value === initialCategory) return false;
                    if (filterType === 'cities' && initialLocation && locationType === 'city' && value === initialLocation) return false;
                    return true;
                  })
                  .map((value) => (
                    <span key={`${filterType}-${value}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                      {value}
                      <button
                        onClick={() => removeFilter(filterType, value)}
                        className="ml-2 hover:text-primary-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
              )}
              
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Hapus Semua Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <JobSidebar
                filters={sidebarFilters}
                selectedProvince={selectedProvince}
                sortBy={sortBy}
                onFiltersChange={handleSidebarFilterChange}
                onSortChange={handleSortChange}
                isLoading={searching}
              />
            </div>
          </div>

          {/* Job Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {searching ? 'Mencari...' : `${totalJobs.toLocaleString()} Lowongan Ditemukan`}
                </h1>
                {initialCategory && (
                  <p className="text-gray-600">
                    Kategori: <span className="font-medium">{initialCategory}</span>
                  </p>
                )}
                {initialLocation && (
                  <p className="text-gray-600">
                    Lokasi: <span className="font-medium">{initialLocation}</span>
                    {locationType === 'city' && ' (Kota)'}
                    {locationType === 'province' && ' (Provinsi)'}
                  </p>
                )}
                {keyword && (
                  <p className="text-gray-600">
                    Hasil pencarian untuk "<span className="font-medium">{keyword}</span>"
                  </p>
                )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Job Grid */}
            {searching ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Memuat Data</h2>
                  <p className="text-gray-600">Sedang mencari lowongan kerja...</p>
                </div>
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job, index) => (
                    <div key={job.id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <JobCard job={job} onClick={handleJobClick} />
                    </div>
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasMore && (
                  <div 
                    ref={setTarget}
                    className="flex justify-center items-center py-8"
                  >
                    {loadingMore ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                        <span className="text-gray-600">Memuat lowongan lainnya...</span>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        Scroll untuk memuat lebih banyak lowongan
                      </div>
                    )}
                  </div>
                )}

                {/* End of Results */}
                {!hasMore && jobs.length > 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">
                      Anda telah melihat semua {totalJobs.toLocaleString()} lowongan yang tersedia
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada lowongan ditemukan</h3>
                <p className="text-gray-600 mb-4">Coba ubah kriteria pencarian Anda</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearchPage;