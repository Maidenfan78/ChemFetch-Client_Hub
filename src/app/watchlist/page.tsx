// app/(tabs)/watch-list/page.tsx
'use client';

import { useWatchList } from '@/lib/hooks/useWatchList';

export default function WatchListPage() {
  const { data, loading, error } = useWatchList();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chemical Register List</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {data.length === 0 && !loading ? (
        <p>No entries found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="p-2 border text-left">Product</th>
                <th className="p-2 border text-left">Issue Date</th>
                <th className="p-2 border text-center">Hazardous</th>
                <th className="p-2 border text-center">Dangerous Good</th>
                <th className="p-2 border text-left">DG Class</th>
                <th className="p-2 border text-left">Packing Group</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="p-2 border">
                    {entry.product.sds_url ? (
                      <a
                        href={entry.product.sds_url}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {entry.product.name}
                      </a>
                    ) : (
                      entry.product.name
                    )}
                  </td>
                  <td className="p-2 border">
                    {entry.product.sds_metadata?.issue_date ?? '—'}
                  </td>
                  <td className="p-2 border text-center">
                    {entry.product.sds_metadata?.hazardous_substance ? 'Yes' : 'No'}
                  </td>
                  <td className="p-2 border text-center">
                    {entry.product.sds_metadata?.dangerous_good ? 'Yes' : 'No'}
                  </td>
                  <td className="p-2 border">
                    {entry.product.sds_metadata?.dangerous_goods_class ?? '—'}
                  </td>
                  <td className="p-2 border">
                    {entry.product.sds_metadata?.packing_group ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
