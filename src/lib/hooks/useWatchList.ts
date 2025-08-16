// src/lib/hooks/useWatchList.ts
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export type WatchListItem = {
  id: number
  created_at?: string
  product: {
    id: string
    name: string
    sds_url: string | null
    sds_metadata: {
      vendor: string | null
      issue_date: string | null
      hazardous_substance: boolean | null
      dangerous_good: boolean | null
      dangerous_goods_class: string | null
      packing_group: string | null
      subsidiary_risks: string | null
      description: string | null
    } | null
  }
}

export function useWatchList() {
  const [data, setData] = useState<WatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchWatchList = async () => {
      const supabase = supabaseBrowser();
      setError(null);

      try {
        // First, get the watchlist items with product info and potential SDS data from watchlist
        const { data: watchListData, error: watchListError } = await supabase
          .from('user_chemical_watch_list')
          .select(`
            id, 
            product_id,
            created_at,
            sds_issue_date,
            hazardous_substance,
            dangerous_good,
            dangerous_goods_class,
            packing_group,
            subsidiary_risks,
            description,
            product:product_id(id, name, sds_url)
          `)
          .order('created_at', { ascending: false });

        if (watchListError) {
          console.error('Watchlist query error:', watchListError);
          setError(watchListError.message);
          setLoading(false);
          return;
        }

        if (!watchListData?.length) {
          setData([]);
          setLoading(false);
          return;
        }

        console.log('Watchlist data fetched:', watchListData);

        // Get product IDs for SDS metadata query
        const productIds = watchListData.map(item => item.product_id).filter(Boolean);
        
        // Try to fetch SDS metadata (this might fail if table doesn't exist or has schema issues)
        let sdsMetadata: any[] = [];
        try {
          const { data: sdsData, error: sdsError } = await supabase
            .from('sds_metadata')
            .select('product_id, vendor, issue_date, hazardous_substance, dangerous_good, dangerous_goods_class, packing_group, subsidiary_risks, description')
            .in('product_id', productIds);

          if (sdsError) {
            console.warn('SDS metadata query failed:', sdsError);
            console.warn('This is expected if sds_metadata table does not exist or has schema issues');
            // Don't fail the whole request, just continue without SDS metadata from separate table
          } else {
            sdsMetadata = sdsData || [];
            console.log('Successfully fetched SDS metadata from sds_metadata table:', sdsMetadata);
          }
        } catch (e) {
          console.warn('SDS metadata table may not exist or have schema issues:', e);
          // Continue without SDS metadata from separate table
        }

        // Create SDS map from the separate sds_metadata table
        const sdsMap = new Map();
        sdsMetadata.forEach(meta => {
          sdsMap.set(meta.product_id, meta);
        });

        // Combine data, preferring sds_metadata table data, but falling back to watchlist data
        const combinedData = watchListData.map(item => {
          const sdsFromSeparateTable = sdsMap.get(item.product_id);
          const product = item.product;

          // Prefer data from sds_metadata table, but use watchlist data as fallback
          const sdsMetadata = sdsFromSeparateTable || {
            vendor: null, // This field only exists in sds_metadata table
            issue_date: item.sds_issue_date || null,
            hazardous_substance: item.hazardous_substance || null,
            dangerous_good: item.dangerous_good || null,
            dangerous_goods_class: item.dangerous_goods_class || null,
            packing_group: item.packing_group || null,
            subsidiary_risks: item.subsidiary_risks || null,
            description: item.description || null
          };

          return {
            id: item.id,
            created_at: item.created_at,
            product: {
              id: product?.id || '',
              name: product?.name || '',
              sds_url: product?.sds_url || null,
              sds_metadata: sdsMetadata
            }
          };
        });

        console.log('Final combined data:', combinedData);
        setData(combinedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchList();
  }, [refreshKey]);

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { data, loading, error, refresh };
} 
