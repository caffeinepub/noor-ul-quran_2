import { useQuery } from "@tanstack/react-query";
import type { Ayah } from "../backend.d";

interface ApiAyah {
  numberInSurah: number;
  text: string;
}

interface ApiEdition {
  ayahs: ApiAyah[];
}

interface ApiResponse {
  data: ApiEdition[];
}

export function useGetAyahsForSurah(surahNumber: number) {
  return useQuery<Ayah[]>({
    queryKey: ["ayahs", surahNumber],
    queryFn: async () => {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ur.ahmedali`,
      );
      if (!res.ok) throw new Error("Failed to fetch ayahs");
      const json: ApiResponse = await res.json();
      const arabicEdition = json.data[0];
      const urduEdition = json.data[1];
      return arabicEdition.ayahs.map((ayah, idx) => ({
        number: BigInt(ayah.numberInSurah),
        arabicText: ayah.text,
        urduTranslation: urduEdition.ayahs[idx]?.text ?? "",
        startingTime: BigInt(0),
      }));
    },
    enabled: surahNumber > 0,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
