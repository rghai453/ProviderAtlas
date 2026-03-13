export default function Loading(): React.ReactNode {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-40 bg-gray-200 rounded-xl mt-6" />
        <div className="h-56 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
