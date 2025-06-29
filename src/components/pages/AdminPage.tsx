import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Settings, TestTube, Save, LogOut, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { wpService } from '@/services/wpService';
import { AdminSettings } from '@/types/job';

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [settings, setSettings] = useState<AdminSettings>(adminService.getSettings());
  const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const [filtersTestResult, setFiltersTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testingFilters, setTestingFilters] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const authenticated = adminService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setShowLogin(!authenticated);
    
    if (!authenticated) {
      document.title = 'Admin Login - Nexjob';
    } else {
      document.title = 'Admin Panel - Nexjob';
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (adminService.authenticate(loginData.email, loginData.password)) {
      setIsAuthenticated(true);
      setShowLogin(false);
      document.title = 'Admin Panel - Nexjob';
    } else {
      setLoginError('Email atau password salah');
    }
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
    setShowLogin(true);
    router.push('/');
  };

  const handleSettingsChange = (field: keyof AdminSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      adminService.saveSettings(settings);
      
      // Update wpService with new settings
      wpService.setBaseUrl(settings.apiUrl);
      wpService.setFiltersApiUrl(settings.filtersApiUrl);
      wpService.setAuthToken(settings.authToken);
      
      // Show success message
      alert('Pengaturan berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAPI = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Temporarily set the API settings for testing
      wpService.setBaseUrl(settings.apiUrl);
      wpService.setAuthToken(settings.authToken);
      
      const result = await wpService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTestFiltersAPI = async () => {
    setTestingFilters(true);
    setFiltersTestResult(null);
    
    try {
      // Temporarily set the API settings for testing
      wpService.setFiltersApiUrl(settings.filtersApiUrl);
      wpService.setAuthToken(settings.authToken);
      
      const result = await wpService.testFiltersConnection();
      setFiltersTestResult(result);
    } catch (error) {
      setFiltersTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTestingFilters(false);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600">Masuk ke panel admin Nexjob</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="admin@nexjob.tech"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Kelola pengaturan website Nexjob</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pengaturan API WordPress</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL REST API WordPress
              </label>
              <input
                type="url"
                value={settings.apiUrl}
                onChange={(e) => handleSettingsChange('apiUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="https://staging.nexjob.tech/wp-json/wp/v2"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL endpoint REST API WordPress (tanpa trailing slash)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Filters API
              </label>
              <input
                type="url"
                value={settings.filtersApiUrl}
                onChange={(e) => handleSettingsChange('filtersApiUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="https://staging.nexjob.tech/wp-json/nex/v1/filters-data"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL endpoint untuk data filter (provinsi, kategori, dll)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auth Token (Opsional)
              </label>
              <input
                type="password"
                value={settings.authToken}
                onChange={(e) => handleSettingsChange('authToken', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Bearer token untuk autentikasi"
              />
              <p className="text-sm text-gray-500 mt-1">
                Token autentikasi jika diperlukan untuk mengakses API
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleTestAPI}
                disabled={testing}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test WordPress API
              </button>

              <button
                onClick={handleTestFiltersAPI}
                disabled={testingFilters}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {testingFilters ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test Filters API
              </button>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg border ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    WordPress API: {testResult.success ? 'Koneksi Berhasil!' : 'Koneksi Gagal!'}
                  </span>
                </div>
                
                {testResult.success && testResult.data && (
                  <div className="text-sm text-green-700">
                    <p><strong>Sample Data:</strong></p>
                    <p>ID: {testResult.data.id}</p>
                    <p>Title: {testResult.data.title?.rendered}</p>
                    <p>Company: {testResult.data.meta?.nexjob_nama_perusahaan}</p>
                  </div>
                )}
                
                {testResult.error && (
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {testResult.error}
                  </p>
                )}
              </div>
            )}

            {filtersTestResult && (
              <div className={`p-4 rounded-lg border ${
                filtersTestResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {filtersTestResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    filtersTestResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Filters API: {filtersTestResult.success ? 'Koneksi Berhasil!' : 'Koneksi Gagal!'}
                  </span>
                </div>
                
                {filtersTestResult.success && filtersTestResult.data && (
                  <div className="text-sm text-green-700">
                    <p><strong>Sample Data:</strong></p>
                    <p>Provinces: {Object.keys(filtersTestResult.data.nexjob_lokasi_provinsi || {}).length}</p>
                    <p>Categories: {filtersTestResult.data.nexjob_kategori_pekerjaan?.length || 0}</p>
                    <p>Job Types: {filtersTestResult.data.nexjob_tipe_pekerjaan?.length || 0}</p>
                  </div>
                )}
                
                {filtersTestResult.error && (
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {filtersTestResult.error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Pengaturan SEO</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Website
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => handleSettingsChange('siteTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Website
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleSettingsChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Halaman Beranda
              </label>
              <input
                type="text"
                value={settings.homeTitle}
                onChange={(e) => handleSettingsChange('homeTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description Halaman Beranda
              </label>
              <textarea
                value={settings.homeDescription}
                onChange={(e) => handleSettingsChange('homeDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Halaman Lowongan Kerja
              </label>
              <input
                type="text"
                value={settings.jobsTitle}
                onChange={(e) => handleSettingsChange('jobsTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description Halaman Lowongan Kerja
              </label>
              <textarea
                value={settings.jobsDescription}
                onChange={(e) => handleSettingsChange('jobsDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Halaman Artikel
              </label>
              <input
                type="text"
                value={settings.articlesTitle}
                onChange={(e) => handleSettingsChange('articlesTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description Halaman Artikel
              </label>
              <textarea
                value={settings.articlesDescription}
                onChange={(e) => handleSettingsChange('articlesDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;