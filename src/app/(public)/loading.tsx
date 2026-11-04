/** Skeleton shown while a public page streams in. */
export default function Loading() {
  return (
    <div className="px-5 py-16 md:px-10" aria-busy="true" aria-label="Loading">
      <div className="container-x space-y-6">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-16 w-3/4 max-w-xl" />
        <div className="skeleton h-6 w-full max-w-lg" />
        <div className="grid gap-5 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-72" />)}
        </div>
      </div>
    </div>
  );
}
