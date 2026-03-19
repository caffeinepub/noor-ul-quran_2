import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Surah {
    ayahCount: bigint;
    urduName: string;
    audioUrl: string;
    transliteration: string;
    arabicName: string;
    number: bigint;
}
export interface Ayah {
    startingTime: bigint;
    urduTranslation: string;
    arabicText: string;
    number: bigint;
}
export interface backendInterface {
    getAllSurahs(): Promise<Array<Surah>>;
    getAyahsForSurah(surahNumber: bigint): Promise<Array<Ayah>>;
}
