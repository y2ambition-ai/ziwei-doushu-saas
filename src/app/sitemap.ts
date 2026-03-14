import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ziwei-doushu-saas.vercel.app';
  const now = new Date();

  return [
    {
      url: `${baseUrl}/en`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
