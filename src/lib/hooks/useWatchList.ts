// src/lib/hooks/useWatchList.ts
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export type WatchListItem = {
  id: number
  product: {
    id: string
    name: string
    sds_url: string | null
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
        .select('id, product:product_id(id, name, sds_url)')
        .order('added_at', { ascending: false })
        .returns<WatchListItem[]>();

      if (error) setError(error.message);
      else setData(data || []);

      setLoading(false);
    };

    fetchWatchList();
  }, []);

  return { data, loading, error };
}
