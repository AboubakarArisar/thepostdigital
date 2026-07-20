import type { Metadata } from "next";

// Every admin route inherits this. robots.txt only asks crawlers not to fetch
// the page; it does not stop the URL being indexed from an inbound link. The
// noindex directive is what actually keeps /admin and /admin/login out of
// search results, and the root layout otherwise declares index: true.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
