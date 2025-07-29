// app/(tabs)/watch-list/page.tsx
'use client';

import { useWatchList } from '@/lib/hooks/useWatchList';

export default function WatchListPage() {
  const { data, loading, error } = useWatchList();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chemical Watch List</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data.length === 0 && !loading ? (
        <p>No entries found.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((entry) => (
            <li key={entry.id} className="border p-4 rounded shadow">
              <p>
                <strong>Product:</strong> {entry.product.name}
              </p>
              {entry.product.sds_url && (
                <p>
                  <a
                    href={entry.product.sds_url}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    View SDS
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
