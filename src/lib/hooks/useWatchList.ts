// src/lib/hooks/useWatchList.ts
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export function useWatchList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWatchList = async () => {
      const supabase = supabaseBrowser();

      const { data, error } = await supabase
        .from('user_chemical_watch_list')
        .select('*, products(*)')
        .order('created_at', { ascending: false });

      if (error) setError(error.message);
      else setData(data || []);

      setLoading(false);
    };

    fetchWatchList();
  }, []);

  return { data, loading, error };
}
