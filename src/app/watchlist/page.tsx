'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWatchList } from '@/lib/hooks/useWatchList';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { AddChemicalForm } from '@/components/add-chemical-form';
import { SdsDebugPanel } from '@/components/sds-debug-panel';

export default function WatchListPage() {
  const router = useRouter();
  const { data, loading, error, refresh } = useWatchList();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'vendor' | 'issue_date' | 'date_added'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
      // Refresh the watchlist data
      refresh();
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

  const handleDelete = async (watchListId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}" from your chemical register?`)) {
      return;
    }

    try {
      setStatusMsg(null);
      setDeletingId(watchListId);
      
      const supabase = supabaseBrowser();
      const { error } = await supabase
        .from('user_chemical_watch_list')
        .delete()
        .eq('id', watchListId);

      if (error) {
        throw new Error(error.message);
      }

      setStatusMsg(`"${productName}" deleted successfully. Refreshing…`);
      // Refresh the watchlist data
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      console.error(msg);
      setStatusMsg(msg);
    } finally {
      setDeletingId(null);
      // Clear status after a short moment
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const handleSort = (field: 'name' | 'vendor' | 'issue_date' | 'date_added') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'name':
        aValue = a.product.name.toLowerCase();
        bValue = b.product.name.toLowerCase();
        break;
      case 'vendor':
        aValue = (a.product.sds_metadata?.vendor || '').toLowerCase();
        bValue = (b.product.sds_metadata?.vendor || '').toLowerCase();
        break;
      case 'issue_date':
        aValue = a.product.sds_metadata?.issue_date ? new Date(a.product.sds_metadata.issue_date) : new Date(0);
        bValue = b.product.sds_metadata?.issue_date ? new Date(b.product.sds_metadata.issue_date) : new Date(0);
        break;
      case 'date_added':
        // Use the created_at timestamp if available, otherwise fallback to id
        aValue = a.created_at ? new Date(a.created_at) : new Date(a.id * 1000);
        bValue = b.created_at ? new Date(b.created_at) : new Date(b.id * 1000);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Chemical Register List</h1>
      
      <AddChemicalForm onSuccess={refresh} />

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
                <th className="p-2 border text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" 
                    onClick={() => handleSort('name')}
                    title="Click to sort by Product Name">
                  Product {getSortIcon('name')}
                </th>
                <th className="p-2 border text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" 
                    onClick={() => handleSort('vendor')}
                    title="Click to sort by Vendor">
                  Vendor {getSortIcon('vendor')}
                </th>
                <th className="p-2 border text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" 
                    onClick={() => handleSort('issue_date')}
                    title="Click to sort by Issue Date">
                  Issue Date {getSortIcon('issue_date')}
                </th>
                <th className="p-2 border text-center">Hazardous</th>
                <th className="p-2 border text-center">Dangerous Good</th>
                <th className="p-2 border text-left">DG Class</th>
                <th className="p-2 border text-left">Packing Group</th>
                <th className="p-2 border text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" 
                    onClick={() => handleSort('date_added')}
                    title="Click to sort by Date Added">
                  Date Added {getSortIcon('date_added')}
                </th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((entry) => {
                const product = entry.product;
                const meta = product.sds_metadata;

                const hasPdf = Boolean(product.sds_url);
                const isUpdating = updatingId === product.id;
                const isDeleting = deletingId === entry.id;

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
                      {meta?.vendor ?? '—'}
                    </td>

                    <td className="p-2 border">
                      {meta?.issue_date ? new Date(meta.issue_date).toLocaleDateString() : '—'}
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

                    <td className="p-2 border">
                      {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '—'}
                    </td>

                    <td className="p-2 border text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleUpdate(product.id, product.sds_url)}
                          disabled={isUpdating || isDeleting || !hasPdf}
                          title={
                            hasPdf
                              ? 'Parse SDS and update metadata'
                              : 'Add an SDS PDF URL to this product first'
                          }
                          className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50 hover:bg-blue-700"
                        >
                          {isUpdating ? 'Parsing…' : 'Update SDS'}
                        </button>
                        
                        {hasPdf && (
                          <SdsDebugPanel 
                            productId={product.id}
                            productName={product.name}
                            sdsUrl={product.sds_url}
                            currentMetadata={meta}
                          />
                        )}
                        
                        <button
                          onClick={() => handleDelete(entry.id, product.name)}
                          disabled={isUpdating || isDeleting}
                          title="Delete this item from your chemical register"
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white disabled:opacity-50 hover:bg-red-700"
                        >
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
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
