export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Job Board
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-600">
        Full-stack portfolio project — Django REST API + Next.js. UI and API
        integration ship in upcoming phases.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
          Phase 1 complete
        </span>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
          Browse jobs — coming soon
        </span>
      </div>
    </main>
  );
}
