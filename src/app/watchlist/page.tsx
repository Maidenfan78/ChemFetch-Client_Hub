'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWatchList } from '@/lib/hooks/useWatchList';

export default function WatchListPage() {
  const router = useRouter();
  const { data, loading, error } = useWatchList();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleUpdate = async (productId: string, pdfUrl?: string | null) => {
    try {
      setStatusMsg(null);
      setUpdatingId(productId);

      const res = await fetch('/api/update-sds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ send the PDF url so backend /parse-sds can parse it
        body: JSON.stringify({ productId, pdfUrl }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Failed to parse SDS' }));
        throw new Error(error || 'Failed to parse SDS');
      }

      setStatusMsg('SDS parsed successfully. Refreshing…');
      // Revalidate the data shown on this page
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update SDS info';
      console.error(msg);
      setStatusMsg(msg);
    } finally {
      setUpdatingId(null);
      // Clear status after a short moment
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chemical Register List</h1>

      {statusMsg && (
        <div className="rounded border p-2 text-sm bg-gray-50 dark:bg-gray-800">
          {statusMsg}
        </div>
      )}

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
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => {
                const product = entry.product;
                const meta = product.sds_metadata;

                const hasPdf = Boolean(product.sds_url);
                const isUpdating = updatingId === product.id;

                return (
                  <tr key={entry.id} className="border-t">
                    <td className="p-2 border">
                      {hasPdf ? (
                        <a
                          href={product.sds_url!}
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          {product.name}
                        </a>
                      ) : (
                        product.name
                      )}
                    </td>

                    <td className="p-2 border">
                      {meta?.issue_date ?? '—'}
                    </td>

                    <td className="p-2 border text-center">
                      {meta?.hazardous_substance ? 'Yes' : 'No'}
                    </td>

                    <td className="p-2 border text-center">
                      {meta?.dangerous_good ? 'Yes' : 'No'}
                    </td>

                    <td className="p-2 border">
                      {meta?.dangerous_goods_class ?? '—'}
                    </td>

                    <td className="p-2 border">
                      {meta?.packing_group ?? '—'}
                    </td>

                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleUpdate(product.id, product.sds_url)}
                        disabled={isUpdating || !hasPdf}
                        title={
                          hasPdf
                            ? 'Parse SDS and update metadata'
                            : 'Add an SDS PDF URL to this product first'
                        }
                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50"
                      >
                        {isUpdating ? 'Parsing…' : 'Update SDS'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
