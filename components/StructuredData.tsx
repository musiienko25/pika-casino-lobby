/**
 * Structured Data Component (JSON-LD)
 * Provides structured data for SEO
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pika-casino-lobby.vercel.app';
const siteName = 'Pika Casino';

export default function StructuredData() {
  // Organization structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      // Add social media links here
      // 'https://www.facebook.com/pikacasino',
      // 'https://twitter.com/pikacasino',
    ],
  };

  // Website structured data
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: 'Browse and search through our collection of casino games',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // BreadcrumbList structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Games Lobby',
        item: `${siteUrl}/`,
      },
    ],
  };

  // CollectionPage structured data
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${siteName} - Games Lobby`,
    description: 'Browse and search through our collection of casino games',
    url: siteUrl,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Casino Games',
      description: 'Collection of casino games including slots, poker, blackjack, and roulette',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
    </>
  );
}

