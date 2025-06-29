# Nexjob - Job Portal Platform

A modern job portal platform built with Next.js, TypeScript, and Tailwind CSS, designed for optimal performance and SEO.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **SEO Optimized**: Dynamic meta tags, structured data, canonical URLs
- **Responsive Design**: Mobile-first approach with beautiful UI
- **Performance**: Optimized for Core Web Vitals
- **Dynamic Routing**: Pretty URLs for categories and locations
- **WordPress Integration**: Seamless API integration
- **Vercel Ready**: Optimized for Vercel deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel
- **CMS**: WordPress (Headless)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nexjob-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   NEXT_PUBLIC_WP_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
   NEXT_PUBLIC_WP_FILTERS_API_URL=https://your-wordpress-site.com/wp-json/nex/v1/filters-data
   NEXT_PUBLIC_WP_AUTH_TOKEN=your-auth-token
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import your project in Vercel dashboard
   - Configure environment variables

2. **Environment Variables**
   Set these in your Vercel project settings:
   ```
   NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
   NEXT_PUBLIC_WP_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
   NEXT_PUBLIC_WP_FILTERS_API_URL=https://your-wordpress-site.com/wp-json/nex/v1/filters-data
   NEXT_PUBLIC_WP_AUTH_TOKEN=your-auth-token
   ```

3. **Deploy**
   ```bash
   npm run build
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Layout/         # Header, Footer components
│   ├── pages/          # Page-specific components
│   └── SEO/            # SEO-related components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

pages/                  # Next.js pages
├── api/               # API routes
├── artikel/           # Article pages
├── lowongan-kerja/    # Job pages
│   ├── kategori/      # Category pages
│   └── lokasi/        # Location pages
└── ...

public/                # Static assets
```

## 🔧 Configuration

### WordPress Integration

The application integrates with WordPress via REST API. Ensure your WordPress site has:

1. **REST API enabled**
2. **Custom post types**: `lowongan-kerja` (jobs)
3. **Custom fields**: Job-related meta fields
4. **Custom endpoint**: `/wp-json/nex/v1/filters-data` for filter data

### SEO Configuration

- **Dynamic meta tags**: Automatically generated based on content
- **Structured data**: JSON-LD schema markup for jobs and articles
- **Canonical URLs**: Proper canonical URL handling
- **Open Graph**: Social media optimization

## 🎯 Key Features

### Dynamic Routing

- **Job Categories**: `/lowongan-kerja/kategori/[slug]/`
- **Job Locations**: `/lowongan-kerja/lokasi/[slug]/`
- **Job Details**: `/lowongan-kerja/[slug]/`
- **Articles**: `/artikel/[slug]/`

### Performance Optimizations

- **Image optimization**: Next.js Image component
- **Code splitting**: Automatic route-based splitting
- **Static generation**: ISR for better performance
- **Lazy loading**: Components and images

### SEO Features

- **Dynamic titles**: Based on content and filters
- **Meta descriptions**: Auto-generated from content
- **Structured data**: Rich snippets for search engines
- **Canonical URLs**: Prevent duplicate content issues

## 🚀 Performance

- **Core Web Vitals**: Optimized for Google's performance metrics
- **Lighthouse Score**: 90+ across all metrics
- **Bundle Size**: Optimized with tree shaking
- **Caching**: Efficient caching strategies

## 🔒 Security

- **Environment Variables**: Sensitive data protection
- **CORS Headers**: Proper cross-origin handling
- **Security Headers**: XSS, CSRF protection
- **Input Validation**: Client and server-side validation

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch Friendly**: Optimized for touch interactions
- **Progressive Enhancement**: Works without JavaScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ using Next.js and TypeScript