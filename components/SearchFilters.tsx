"use client";

import type { Category } from "@/lib/types";

type SearchFiltersProps = {
  categories: Category[];
  selectedCategory: string;
  selectedLanguage: string;
  selectedDate: string;
  selectedStatus: string;
  query: string;
};

export function SearchFilters({
  categories,
  selectedCategory,
  selectedLanguage,
  selectedDate,
  selectedStatus,
  query,
}: SearchFiltersProps) {
  return (
    <form
      action="/search"
      className="mt-6 border-y border-rule py-5"
      onChange={(event) => {
        event.currentTarget.requestSubmit();
      }}
    >
      <label htmlFor="archive-search" className="editor-label">
        Search
      </label>
      <div className="flex gap-2">
        <input
          id="archive-search"
          name="q"
          type="search"
          defaultValue={query}
          className="min-w-0 flex-1 border border-rule bg-paper px-4 py-3 text-2xl font-black text-ink outline-none focus:ring-2 focus:ring-accent"
          placeholder="Politics, Karachi, rupee..."
        />
        <button
          type="submit"
          className="border border-rule bg-chrome px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-inverse hover:bg-accent"
        >
          Search
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <select
          aria-label="Category filter"
          className="border border-rule bg-paper px-3 py-2 text-ink"
          defaultValue={selectedCategory}
          name="category"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Language filter"
          className="border border-rule bg-paper px-3 py-2 text-ink"
          defaultValue={selectedLanguage}
          name="language"
        >
          <option value="en">English</option>
          <option value="ur">Urdu</option>
        </select>
        <select
          aria-label="Date filter"
          className="border border-rule bg-paper px-3 py-2 text-ink"
          defaultValue={selectedDate}
          name="date"
        >
          <option value="">Any date</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
        </select>
        <select
          aria-label="Status filter"
          className="border border-rule bg-paper px-3 py-2 text-ink"
          defaultValue={selectedStatus}
          name="status"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="">All statuses</option>
        </select>
      </div>
    </form>
  );
}
