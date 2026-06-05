import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Find your next role
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        A full-stack job board for recruiters and job seekers. Browse open
        roles, apply in one click, or post listings for your company.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/jobs"
          className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
        >
          Browse jobs
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Create account
        </Link>
      </div>
      <div className="mt-12 grid max-w-2xl gap-6 text-left sm:grid-cols-2">
        <Feature
          title="For job seekers"
          items={[
            "Search and filter by location, type, and salary",
            "Apply with a cover letter",
            "Save jobs and track applications",
          ]}
        />
        <Feature
          title="For recruiters"
          items={[
            "Post jobs for your companies",
            "Manage active listings",
            "Review applicants (via API)",
          ]}
        />
      </div>
    </div>
  );
}

function Feature({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-brand-600">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
