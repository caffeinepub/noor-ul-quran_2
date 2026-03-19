import { useQuery } from "@tanstack/react-query";
import type { Ayah, Surah } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllSurahs() {
  const { actor, isFetching } = useActor();
  return useQuery<Surah[]>({
    queryKey: ["surahs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSurahs();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetAyahsForSurah(surahNumber: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Ayah[]>({
    queryKey: ["ayahs", surahNumber],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAyahsForSurah(BigInt(surahNumber));
    },
    enabled: !!actor && !isFetching && surahNumber > 0,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
