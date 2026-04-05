import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryCollection } from "@/types/collection";

export function useCollectionData() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async (): Promise<CountryCollection[]> => {
      const { data, error } = await supabase
        .from("collections")
        .select("country, coins, notes");

      if (error) throw error;
      return data as CountryCollection[];
    },
  });
}
