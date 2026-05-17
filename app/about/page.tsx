import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const values = [
  {
    label: "Record",
    text: "Independent reporting with a clear public record.",
  },
  {
    label: "Reach",
    text: "English and Urdu coverage for readers across Pakistan and abroad.",
  },
  {
    label: "Judgment",
    text: "Careful editing before speed, noise, or speculation.",
  },
];

const coverage = [
  "Politics",
  "Cities",
  "Business",
  "Technology",
  "Culture",
  "Opinion",
];

export default function AboutPage() {
  return (
    <>
      <Header language="en" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        <section className="border-b-2 border-rule pb-8 sm:pb-10">
          <article className="grid gap-6 lg:grid-cols-[28rem_minmax(0,1fr)] lg:items-stretch">
            <div className="overflow-hidden border-2 border-rule bg-elevated">
              <div className="relative aspect-[4/5] overflow-hidden bg-soft-rule sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-[34rem]">
                <Image
                  src="/ceo.jpg"
                  alt="Abuzar Ghafari, CEO of The Post Digital"
                  fill
                  sizes="(min-width: 1024px) 28rem, 100vw"
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-col justify-between border-y border-rule py-5 lg:py-7">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
                  Founder and CEO / The Post Digital
                </p>
                <h1 className="font-serif-display mt-3 text-5xl font-black leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
                  Abuzar Ghafari
                </h1>
                <p className="mt-4 max-w-3xl font-serif-display text-3xl font-black leading-tight text-ink sm:text-4xl">
                  Independent journalism with a clear public purpose.
                </p>
                <div className="mt-5 max-w-3xl space-y-4 text-base leading-7 text-muted">
                  <p>
                    Abuzar Ghafari leads The Post Digital with a focus on
                    public-interest reporting, responsible publishing, and a
                    stronger digital reading experience.
                  </p>
                  <p>
                    The newsroom is built for disciplined reporting: clear
                    sourcing, thoughtful editing, and coverage that respects the
                    reader&apos;s time.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {values.map((value) => (
                  <div className="border-l-4 border-accent pl-3" key={value.label}>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ink">
                      {value.label}
                    </p>
                    <p className="mt-2 text-sm font-bold leading-6 text-muted">
                      {value.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div className="border-y border-rule py-5 sm:py-7">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
                About The Post Digital
              </p>
              <h2 className="font-serif-display mt-3 max-w-4xl text-4xl font-black leading-tight text-ink sm:text-5xl">
                A modern Pakistani newsroom built for accuracy, context, and
                civic usefulness.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                The Post Digital publishes news, analysis, editorials, photos,
                and video for readers who want reliable context without losing
                the day&apos;s urgency.
              </p>
            </div>

            <aside className="grid grid-cols-3 border border-rule text-center lg:grid-cols-1 lg:text-left">
              <div className="border-r border-rule p-3 lg:border-b lg:border-r-0">
                <p className="font-serif-display text-3xl font-black text-ink">
                  2
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted">
                  Languages
                </p>
              </div>
              <div className="border-r border-rule p-3 lg:border-b lg:border-r-0">
                <p className="font-serif-display text-3xl font-black text-ink">
                  6
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted">
                  Core desks
                </p>
              </div>
              <div className="p-3">
                <p className="font-serif-display text-3xl font-black text-ink">
                  24/7
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted">
                  Digital record
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-8 border-b border-rule py-8 lg:grid-cols-[0.7fr_1fr] lg:py-10">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
              Mission
            </p>
            <h2 className="font-serif-display mt-2 text-4xl font-black leading-tight text-ink sm:text-5xl">
              Context before noise. Editing before spectacle.
            </h2>
          </div>

          <div className="space-y-6">
            <section className="border-b border-soft-rule pb-6">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-ink">
                Our mission
              </h3>
              <p className="mt-4 text-lg leading-8 text-muted">
                We help readers understand what happened, why it matters, and
                what comes next. Our desk is built for disciplined reporting:
                clear sourcing, thoughtful editing, and coverage that respects
                the reader&apos;s time.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-ink">
                What we cover
              </h3>
              <div className="mt-4 grid gap-5 md:grid-cols-[1fr_16rem]">
                <p className="text-sm leading-6 text-muted">
                  National affairs, politics, cities, business, technology,
                  climate, culture, and opinion for readers who need reliable
                  context without losing the day&apos;s urgency.
                </p>
                <div className="grid grid-cols-2 gap-px border border-rule bg-rule text-xs font-black uppercase tracking-[0.12em] text-ink">
                  {coverage.map((item) => (
                    <span className="bg-paper p-3" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-5 border-l-4 border-rule pl-4 text-sm leading-6 text-muted">
                Our newsroom supports English and Urdu publishing, so major
                stories can reach audiences in the language that serves them
                best.
              </p>
            </section>

            <section className="grid gap-3 border-y border-rule py-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="font-serif-display text-2xl font-black leading-tight text-ink">
                Read the public record as it develops.
              </p>
              <Link
                href="/search"
                className="inline-flex justify-center border-2 border-rule bg-chrome px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-inverse hover:bg-paper hover:text-ink"
              >
                Read latest stories
              </Link>
            </section>
          </div>
        </section>

        <section className="py-8 lg:py-10">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="md:col-span-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
                Editorial standard
              </p>
              <h2 className="font-serif-display mt-2 text-4xl font-black leading-tight text-ink">
                Built for readers who want the story, not the noise around it.
              </h2>
            </div>
            <div className="border-t-4 border-rule pt-4">
              <p className="text-sm leading-6 text-muted">
                Every section of The Post Digital is shaped around a simple
                promise: publish with clarity, keep the record useful, and make
                the reading experience feel calm even when the news is not.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
