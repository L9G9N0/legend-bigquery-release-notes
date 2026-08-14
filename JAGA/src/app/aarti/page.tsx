import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Sparkles, BookOpen, AlertCircle, Quote } from 'lucide-react';

export default async function AartiPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const supabase = await createClient();

  const { data: contents, error } = await supabase
    .from('devotional_content')
    .select('*')
    .neq('title', 'Bhoga Offering Procedure')
    .order('display_order', { ascending: true });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 devotional-border-single flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <h3 className="font-cinzel font-bold text-lg mb-1">Database Error</h3>
            <p className="font-sans text-sm">Failed to retrieve devotional texts. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contents || contents.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="devotional-card">
          <p className="font-cinzel text-lg">No Devotional Content Found</p>
          <p className="font-sans text-xs text-primary-dark-blue/60 mt-1">Please ensure the database seeds have been run.</p>
        </div>
      </div>
    );
  }

  // Determine active tab
  const activeContent = contents.find((c) => c.title === tab) || contents[0];
  const jayaSequence = contents.find((c) => c.title.includes('Closing'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold font-cinzel text-primary-dark-blue mb-3">
          Vaishnava Prayers & Aartis
        </h1>
        <div className="h-0.5 w-24 bg-saffron mx-auto"></div>
        <p className="text-xs text-primary-dark-blue/80 font-sans tracking-wide mt-2">
          Guru-approved lyrics, transliterations, and translations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4 space-y-2">
          <h2 className="font-cinzel text-xs font-bold text-saffron uppercase tracking-wider px-3 mb-2">
            Select Prayer
          </h2>
          <div className="flex flex-col space-y-1.5">
            {contents
              .filter((c) => !c.title.includes('Closing'))
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/aarti?tab=${encodeURIComponent(c.title)}`}
                  className={`text-left px-4 py-3 border border-primary-dark-blue/20 transition-all font-cinzel text-sm flex items-center justify-between ${
                    activeContent.id === c.id
                      ? 'bg-primary-dark-blue text-white border-saffron border-r-4'
                      : 'bg-white hover:bg-parchment-dark text-primary-dark-blue'
                  }`}
                >
                  <span>{c.title}</span>
                  <Sparkles className={`h-4 w-4 ${activeContent.id === c.id ? 'text-saffron' : 'text-primary-dark-blue/30'}`} />
                </Link>
              ))}
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-8 bg-white border-2 border-primary-dark-blue/30 devotional-border-double p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="border-b border-primary-dark-blue/15 pb-4 mb-6">
              <span className="text-[10px] uppercase font-bold text-saffron tracking-wider font-sans">
                {activeContent.source_reference || 'Traditional'}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-cinzel text-primary-dark-blue mt-1">
                {activeContent.title}
              </h2>
            </div>

            {/* Translation and Text */}
            <div className="space-y-8 font-sans">
              {activeContent.original_text && (
                <div>
                  <h3 className="font-cinzel text-xs font-bold text-primary-blue uppercase tracking-wider mb-3">
                    Original Text
                  </h3>
                  <pre className="whitespace-pre-wrap font-serif text-base text-primary-dark-blue leading-relaxed bg-parchment-dark/30 p-4 border-l-2 border-primary-dark-blue/30">
                    {activeContent.original_text}
                  </pre>
                </div>
              )}

              {activeContent.translation && (
                <div>
                  <h3 className="font-cinzel text-xs font-bold text-primary-blue uppercase tracking-wider mb-2">
                    Translation
                  </h3>
                  <div className="italic text-primary-dark-blue/90 text-sm leading-relaxed relative pl-6">
                    <Quote className="absolute left-0 top-0 h-4 w-4 text-saffron opacity-60" />
                    <p>{activeContent.translation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mandatory Aarti Closing Message */}
          {activeContent.title !== 'Sri Gurvastakam' && activeContent.title !== 'Vaishnave Vijnapti' && jayaSequence && (
            <div className="mt-12 pt-6 border-t-2 border-double border-saffron bg-parchment-dark/30 p-5">
              <h4 className="font-cinzel text-xs font-bold text-saffron uppercase tracking-widest text-center mb-4">
                Mandatory Aarti Closing Sequence
              </h4>
              <pre className="whitespace-pre-wrap font-serif text-xs text-primary-dark-blue/80 text-center leading-relaxed">
                {jayaSequence.original_text}
              </pre>
              <p className="text-[10px] text-center text-primary-dark-blue/60 mt-4 font-sans uppercase tracking-wider">
                {jayaSequence.translation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
