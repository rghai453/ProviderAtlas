/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://provideratlas.com',
  generateRobotsTxt: false,
  sitemapSize: 50000,
  exclude: ['/dashboard/*', '/api/*', '/auth/*'],
};
