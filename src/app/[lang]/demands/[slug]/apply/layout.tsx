import { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: "Apply for Demand | Seven Seas Intercontinental",
  path: "", // Path doesn't matter for canonical if noindex
  noIndex: true
});

import { notFound } from 'next/navigation';

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.PUBLIC_APPLICATIONS_ENABLED !== 'true') {
    notFound();
  }
  return children;
}
