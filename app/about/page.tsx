import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const values = [
  "Independent reporting with a clear public record",
  "Bilingual coverage for readers across Pakistan and abroad",
  "Careful editing before speed, noise, or speculation",
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <section className="border-b border-rule pb-8">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
            About The Post Digital
          </p>
          <article className="mt-5 grid gap-6 md:grid-cols-[18rem_1fr] md:items-start">
            <div className="overflow-hidden border-2 border-rule bg-elevated">
              <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-rule bg-soft-rule">
                <Image
                  src="/ceo.jpg"
                  alt="Abuzar Ghafari, CEO of The Post Digital"
                  fill
                  sizes="(min-width: 768px) 18rem, 100vw"
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  Founder and CEO
                </p>
                <h1 className="font-serif-display mt-2 text-3xl font-black leading-none text-ink">
                  Abuzar Ghafari
                </h1>
              </div>
            </div>

            <div className="max-w-3xl pt-1">
              <h2 className="font-serif-display text-4xl font-black leading-tight text-ink">
                Independent journalism with a clear public purpose.
              </h2>
              <div className="mt-4 space-y-4 text-base leading-7 text-muted">
                <p>
                  Abuzar Ghafari leads The Post Digital with a focus on
                  public-interest reporting, responsible publishing, and a
                  stronger digital reading experience.
                </p>
                <p>
                  The Post Digital is a modern Pakistani newsroom publishing
                  news, analysis, editorials, photos, and video with attention
                  to accuracy, context, and civic usefulness.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="border-b border-rule py-8">
          <div className="space-y-6">
            <section>
              <h2 className="font-serif-display text-4xl font-black text-ink">
                Our mission
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted">
                We help readers understand what happened, why it matters, and
                what comes next. Our desk is built for disciplined reporting:
                clear sourcing, thoughtful editing, and coverage that respects
                the reader&apos;s time.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              {values.map((value) => (
                <div className="border border-rule p-4" key={value}>
                  <p className="text-sm font-black leading-6 text-ink">{value}</p>
                </div>
              ))}
            </section>

            <section className="border-t border-rule pt-5">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-ink">
                What we cover
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <p className="text-sm leading-6 text-muted">
                  National affairs, politics, cities, business, technology,
                  climate, culture, and opinion for readers who need reliable
                  context without losing the day&apos;s urgency.
                </p>
                <p className="text-sm leading-6 text-muted">
                  Our newsroom supports English and Urdu publishing, so major
                  stories can reach audiences in the language that serves them
                  best.
                </p>
              </div>
            </section>

            <Link
              href="/search"
              className="inline-flex border-2 border-rule bg-chrome px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-inverse hover:bg-paper hover:text-ink"
            >
              Read latest stories
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
