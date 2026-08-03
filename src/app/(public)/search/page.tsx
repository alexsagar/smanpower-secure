import { searchGlobalData } from "@/services/search.service";
import { getPageCopy } from "@/services/page-copy.service";
import { SearchForm } from "@/components/search/SearchForm";
import Link from "next/link";
import { Briefcase, Star, GraduationCap, Building2, SearchX, ArrowRight } from "lucide-react";
import Image from "next/image";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

// Search result pages are noindex and excluded from the sitemap: unbounded
// query combinations must not create indexable URLs.
export const metadata: Metadata = buildPageMetadata({
  title: "Search",
  description: "Search jobs, success stories, training facilities and industries across Seven Seas Intercontinental.",
  path: "/search",
  noIndex: true,
});

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const copy = await getPageCopy("search");
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  const { jobs, stories, facilities, industries } = await searchGlobalData(query);

  const hasResults = jobs.length > 0 || stories.length > 0 || facilities.length > 0 || industries.length > 0;

  return (
    <div className="bg-brand-off-white min-h-screen">
      {/* Search Header Hero */}
      <section className="bg-brand-off-white pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/15 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none" />
        
        <div className="container-wide relative z-10 text-center">
          <span className="text-brand-gold text-xs md:text-sm font-semibold tracking-[0.3em] uppercase mb-4 block">
            {copy.hero.eyebrow}
          </span>
          <h1 className="text-4xl md:text-6xl font-light text-brand-black tracking-tight mb-12 max-w-3xl mx-auto">
            {copy.hero.headingLead}<span className="font-semibold text-brand-gold">{copy.hero.headingHighlight}</span>{copy.hero.headingTrail}
          </h1>
          
          <SearchForm />
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20">
        <div className="container-wide max-w-6xl mx-auto">
          {!query ? (
            <div className="text-center py-20">
              <SearchX className="w-16 h-16 text-brand-charcoal/20 mx-auto mb-6" />
              <h2 className="text-2xl font-light text-brand-black mb-2">{copy.prompt.heading}</h2>
              <p className="text-brand-muted">{copy.prompt.body}</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-20">
              <SearchX className="w-16 h-16 text-brand-charcoal/20 mx-auto mb-6" />
              <h2 className="text-2xl font-light text-brand-black mb-2">{copy.noResults.headingLead}{query}{copy.noResults.headingTrail}</h2>
              <p className="text-brand-muted mb-8">{copy.noResults.body}</p>
              <Link href="/demands" className="bg-brand-black text-brand-white px-8 py-4 uppercase tracking-widest text-sm font-semibold hover:bg-brand-gold hover:text-brand-black transition-colors inline-block">
                {copy.viewAllJobsLabel}
              </Link>
            </div>
          ) : (
            <div className="space-y-16">

              {/* Jobs Results */}
              {jobs.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-charcoal/10">
                    <Briefcase className="w-6 h-6 text-brand-gold" />
                    <h2 className="text-2xl font-semibold text-brand-black tracking-tight">{copy.sectionHeadings.jobs}</h2>
                    <span className="bg-brand-charcoal/5 px-2 py-1 text-xs font-mono text-brand-charcoal rounded-sm">{jobs.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map(job => (
                      <Link href={`/demands/${job.slug}`} key={job.id} className="group bg-white border border-brand-charcoal/5 p-6 hover:shadow-lg transition-all hover:border-brand-gold/50 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-widest bg-brand-off-white px-3 py-1 rounded-sm">
                              {job.industry.name}
                            </span>
                            {job.showEmployerName && job.employerName && (
                              <span className="text-[10px] font-semibold text-brand-charcoal uppercase tracking-widest">
                                {job.employerName}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold text-brand-black group-hover:text-brand-gold transition-colors mb-2 line-clamp-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-brand-muted mb-6">
                            <span>{job.country.name}</span>
                            <span className="w-1 h-1 bg-brand-gold rounded-full" />
                            <span>{job.vacancies} {job.vacancies === 1 ? 'Opening' : 'Openings'}</span>
                          </div>
                        </div>
                        <div className="text-sm font-semibold uppercase tracking-widest text-brand-black group-hover:text-brand-gold transition-colors flex items-center gap-2">
                          {copy.viewDetailsLabel} <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Stories Results */}
              {stories.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-charcoal/10">
                    <Star className="w-6 h-6 text-brand-gold" />
                    <h2 className="text-2xl font-semibold text-brand-black tracking-tight">{copy.sectionHeadings.stories}</h2>
                    <span className="bg-brand-charcoal/5 px-2 py-1 text-xs font-mono text-brand-charcoal rounded-sm">{stories.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stories.map(story => (
                      <Link href={`/success-stories/${story.slug}`} key={story.id} className="group bg-white border border-brand-charcoal/5 p-6 hover:shadow-lg transition-all hover:border-brand-gold/50 flex gap-6">

                        <div>
                          <span className="text-[10px] font-semibold text-brand-gold uppercase tracking-widest mb-2 block">
                            {story.storyType}
                          </span>
                          <h3 className="text-lg font-semibold text-brand-black group-hover:text-brand-gold transition-colors mb-2 line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-xs text-brand-muted line-clamp-2">{story.summary}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities & Industries (Grid layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {facilities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-charcoal/10">
                      <GraduationCap className="w-5 h-5 text-brand-gold" />
                      <h2 className="text-xl font-semibold text-brand-black tracking-tight">{copy.sectionHeadings.facilities}</h2>
                      <span className="bg-brand-charcoal/5 px-2 py-1 text-xs font-mono text-brand-charcoal rounded-sm">{facilities.length}</span>
                    </div>
                    <div className="space-y-4">
                      {facilities.map(facility => (
                        <Link href="/training-facilities" key={facility.id} className="block group bg-white border border-brand-charcoal/5 p-4 hover:border-brand-gold/50 transition-colors">
                          <h3 className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors">{facility.name}</h3>
                          {facility.location && <p className="text-xs text-brand-muted mt-1 uppercase tracking-widest">{facility.location}</p>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {industries.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-brand-charcoal/10">
                      <Building2 className="w-5 h-5 text-brand-gold" />
                      <h2 className="text-xl font-semibold text-brand-black tracking-tight">{copy.sectionHeadings.industries}</h2>
                      <span className="bg-brand-charcoal/5 px-2 py-1 text-xs font-mono text-brand-charcoal rounded-sm">{industries.length}</span>
                    </div>
                    <div className="space-y-4">
                      {industries.map(industry => (
                        <Link href="/industries" key={industry.id} className="block group bg-white border border-brand-charcoal/5 p-4 hover:border-brand-gold/50 transition-colors">
                          <h3 className="font-semibold text-brand-black group-hover:text-brand-gold transition-colors">{industry.name}</h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </section>
    </div>
  );
}
