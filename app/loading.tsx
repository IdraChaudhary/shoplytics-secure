export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          <div className="h-10 w-1/2 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-2/3 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-[12px] shadow-sm border border-gray-100">
              <div className="aspect-[4/5] w-full bg-gray-100 rounded-t-[12px]" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
