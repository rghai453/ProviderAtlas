export default function Loading(): React.ReactNode {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="animate-pulse space-y-8">
        <div className="text-center space-y-3">
          <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
