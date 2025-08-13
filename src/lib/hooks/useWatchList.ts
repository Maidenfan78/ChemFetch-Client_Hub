// src/lib/hooks/useWatchList.ts
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export type WatchListItem = {
  id: number
  product: {
    id: string
    name: string
    sds_url: string | null
    sds_metadata: {
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

  useEffect(() => {
    const fetchWatchList = async () => {
      const supabase = supabaseBrowser();

      const { data, error } = await supabase
        .from('user_chemical_watch_list')
        .select(
          'id, product:product_id(id, name, sds_url, sds_metadata(issue_date, hazardous_substance, dangerous_good, dangerous_goods_class, packing_group, subsidiary_risks, description))'
        )
        // The table uses `created_at` to track insert time
        .order('created_at', { ascending: false })
        .returns<WatchListItem[]>();

      if (error) setError(error.message);
      else setData(data || []);

      setLoading(false);
    };

    fetchWatchList();
  }, []);

  return { data, loading, error };
} 
