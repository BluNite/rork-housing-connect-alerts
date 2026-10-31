import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, ChevronRight, Clock } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { useStore } from "@/lib/store";
import { GUIDES, guideBySlug } from "@/lib/guides";

/**
 * Editorial guides — readable signed-out (AdSense reviewers crawl without an
 * account) and inside the signed-in shell. Layout mirrors the Privacy page's
 * standalone wrapper when there's no user.
 */

function StandaloneHeader({ back, label }: { back: string; label: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-border">
          <BrandMark className="h-8 w-8" />
        </span>
        <span className="font-bold">NYC Lottery Tracker</span>
      </Link>
      <Link to={back} className="text-sm font-semibold text-primary hover:underline">
        {label}
      </Link>
    </div>
  );
}

function useGuideTitle(title?: string) {
  useEffect(() => {
    document.title = title
      ? `${title} — NYC Lottery Tracker`
      : "Housing guides — NYC Lottery Tracker";
    return () => {
      document.title = "NYC Lottery Tracker – affordable housing lottery alerts";
    };
  }, [title]);
}

function ArticleBody({ slug }: { slug: string }) {
  const guide = guideBySlug(slug);
  useGuideTitle(guide?.title);
  if (!guide) {
    return (
      <div className="panel mt-8 px-6 py-14 text-center">
        <h2 className="text-lg font-bold">Guide not found</h2>
        <Link to="/guides" className="mt-3 inline-block font-semibold text-primary hover:underline">
          See all guides
        </Link>
      </div>
    );
  }
  const idx = GUIDES.findIndex((g) => g.slug === slug);
  const next = GUIDES[(idx + 1) % GUIDES.length];
  return (
    <article className="mt-8">
      <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-primary">Housing guide</p>
      <h1 className="font-display text-grad mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{guide.title}</h1>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" aria-hidden /> {guide.minutes} min read · Updated {guide.updated}
      </p>
      {guide.blocks.map((b, i) => (
        <section key={i} className="mt-6">
          {b.h && <h2 className="text-lg font-bold">{b.h}</h2>}
          <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            {b.p?.map((t, j) => (
              <p key={j}>{t}</p>
            ))}
            {b.ul && (
              <ul className="list-disc space-y-1.5 pl-5">
                {b.ul.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
      <div className="mt-10 flex flex-wrap gap-3 border-t pt-6">
        <Link to={`/guides/${next.slug}`} className="panel flex-1 basis-64 p-4 transition-colors hover:border-primary/40">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Next guide</p>
          <p className="mt-1 flex items-center gap-1 font-bold text-primary">
            {next.title} <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </p>
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Guides are general information from NYC Lottery Tracker (bluNite), not legal advice, and are not affiliated with NYC HPD or
        Housing Connect. Program rules change — confirm on official government sites.
      </p>
    </article>
  );
}

export function GuideArticle() {
  const { slug } = useParams();
  const { user } = useStore();
  const guide = guideBySlug(slug);
  if (user) {
    return (
      <AppShell header={<PageTitle title={guide?.title ?? "Guide"} subtitle="From the NYC Lottery Tracker guide library." />}>
        <div className="max-w-3xl">
          <p className="text-sm">
            <Link to="/guides" className="font-semibold text-primary hover:underline">
              ← All guides
            </Link>
          </p>
          <ArticleBody slug={slug ?? ""} />
        </div>
      </AppShell>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 pb-36 pt-10 sm:px-8">
        <StandaloneHeader back="/guides" label="All guides" />
        <ArticleBody slug={slug ?? ""} />
      </div>
    </div>
  );
}

export function Guides() {
  const { user } = useStore();
  useGuideTitle(undefined);
  const grid = (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {GUIDES.map((g) => (
        <Link
          key={g.slug}
          to={`/guides/${g.slug}`}
          className="panel group flex flex-col p-5 transition-all hover:-translate-y-px hover:border-primary/40 hover:shadow-md"
        >
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            <BookOpen className="h-3.5 w-3.5" aria-hidden /> Guide · {g.minutes} min
          </span>
          <h2 className="mt-2 font-bold leading-snug group-hover:text-primary">{g.title}</h2>
          <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{g.description}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Read guide <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  );

  if (user) {
    return (
      <AppShell header={<PageTitle title="Housing guides" subtitle="Plain-language answers to the questions every NYC applicant asks." />}>
        {grid}
      </AppShell>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-5 pb-36 pt-10 sm:px-8">
        <StandaloneHeader back="/" label="Back to home" />
        <h1 className="font-display text-grad mt-8 text-4xl font-semibold">Housing guides</h1>
        <p className="mt-2 text-muted-foreground">
          Free, plain-language guides from NYC Lottery Tracker — how lotteries work, what to prepare, and how to stay safe.
        </p>
        {grid}
      </div>
    </div>
  );
}
