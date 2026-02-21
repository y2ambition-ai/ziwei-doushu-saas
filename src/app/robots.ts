import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://ziwei-doushu-saas.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/chart/', '/result/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
