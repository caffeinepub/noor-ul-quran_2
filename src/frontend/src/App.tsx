import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Moon, Pause, Play, Search, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Ayah } from "./backend.d";
import { SURAHS } from "./data/surahs";
import { useGetAyahsForSurah } from "./hooks/useQuranApi";

const queryClient = new QueryClient();

// Use SurahMeta shape compatible with the UI
type SurahMeta = (typeof SURAHS)[0];

const SURAH_AUDIO_URLS: Record<number, string> = {
  1: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/001-Al-Fatihah-The-Opening-سورة-الفاتحة.mp3",
  2: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/002-Al-Baqarah-The-Cow-سورة-البقرة.mp3",
  3: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/003-Al-Imran-The-Family-of-Imran-سورة-آل-عمران.mp3",
  4: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/004-An-Nisa-The-Women-سورة-النساء.mp3",
  5: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/005-Al-Maidah-The-Table-spread-with-Food-سورة-المائدة.mp3",
  6: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/006-Al-Anam-The-Cattle-سورة-الأنعام.mp3",
  7: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/007-Al-Araf-The-Heights-سورة-الأعراف.mp3",
  8: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/008-Al-Anfal-The-Spoils-of-War-سورة-الأنفال.mp3",
  9: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/009-At-Taubah-The-Repentance-سورة-التوبة.mp3",
  10: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/010-Yunus-Jonah-سورة-يونس.mp3",
  11: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/011-Hud-سورة-هود.mp3",
  12: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/012-Yusuf-Joseph-سورة-يوسف.mp3",
  13: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/013-Ar-Rad-The-Thunder-سورة-الرعد.mp3",
  14: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/014-Ibrahim-Abraham-سورة-إبراهيم.mp3",
  15: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/015-Al-Hijr-The-Rocky-Tract-سورة-الحجر.mp3",
  16: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/016-An-Nahl-The-Bees-سورة-النحل.mp3",
  17: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/017-Al-Isra-The-Night-Journey-سورة-الإسراء.mp3",
  18: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/018-Al-Kahf-The-Cave-سورة-الكهف.mp3",
  19: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/019-Maryam-Mary-سورة-مريم.mp3",
  20: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/020-Taha-سورة-طه.mp3",
  21: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/021-Al-Anbiya-The-Prophets-سورة-الأنبياء.mp3",
  22: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/022-Al-Hajj-The-Pilgrimage-سورة-الحج.mp3",
  23: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/023-Al-Muminoon-The-Believers-سورة-المؤمنون.mp3",
  24: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/024-An-Noor-The-Light-سورة-النور.mp3",
  25: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/025-Al-furqantheCriterion-.mp3",
  26: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/026-Ash-Shuara-The-Poets-سورة-الشعراء.mp3",
  27: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/027-An-Naml-The-Ants-سورة-النمل.mp3",
  28: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/028-Al-Qasas-The-Stories-سورة-القصص.mp3",
  29: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/029-Al-Ankaboot-The-Spider-سورة-العنكبوت.mp3",
  30: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/030-Ar-Room-The-Romans-سورة-الروم.mp3",
  31: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/031-Luqman-سورة-لقمان.mp3",
  32: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/032-As-Sajdah-The-Prostration-سورة-السجدة.mp3",
  33: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/033-Al-Ahzab-The-Combined-Forces-سورة-الأحزاب.mp3",
  34: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/034-Saba-Sheba-سورة-سبأ.mp3",
  35: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/035-Fatir-The-Orignator-سورة-فاطر.mp3",
  36: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/036-Ya-seen-سورة-يس.mp3",
  37: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/037-As-Saaffat-Those-Ranges-in-Ranks-سورة-الصافات.mp3",
  38: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/038-Sad-The-Letter-Sad-سورة-ص.mp3",
  39: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/039-Az-Zumar-The-Groups-سورة-الزمر.mp3",
  40: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/040-Ghafir-The-Forgiver-God-سورة-غافر.mp3",
  41: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/041-Fussilat-Explained-in-Detail-سورة-فصلت.mp3",
  42: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/042-Ash-Shura-Consultation-سورة-الشورى.mp3",
  43: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/043-Az-Zukhruf-The-Gold-Adornment-سورة-الزخرف.mp3",
  44: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/044-Ad-Dukhan-The-Smoke-سورة-الدخان.mp3",
  45: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/045-Al-Jathiya-Crouching-سورة-الجاثية.mp3",
  46: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/046-Al-Ahqaf-The-Curved-Sand-hills-سورة-الأحقاف.mp3",
  47: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/047-Muhammad-سورة-محمد.mp3",
  48: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/048-Al-Fath-The-Victory-سورة-الفتح.mp3",
  49: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/049-Al-Hujurat-The-Dwellings-سورة-الحجرات.mp3",
  50: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/050-Qaf-The-Letter-Qaf-سورة-ق.mp3",
  51: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/051-Adh-Dhariyat-The-Wind-that-Scatter-سورة-الذاريات.mp3",
  52: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/052-At-Tur-The-Mount-سورة-الطور.mp3",
  53: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/053-An-Najm-The-Star-سورة-النجم.mp3",
  54: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/054-Al-Qamar-The-Moon-سورة-القمر.mp3",
  55: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/055-Ar-Rahman-The-Most-Graciouse-سورة-الرحمن.mp3",
  56: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/056-Al-Waqiah-The-Event-سورة-الواقعة.mp3",
  57: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/057-Al-Hadid-The-Iron-سورة-الحديد.mp3",
  58: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/058-Al-Mujadilah-She-That-Disputeth-سورة-المجادلة.mp3",
  59: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/059-Al-Hashr-The-Gathering-سورة-الحشر.mp3",
  60: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/060-Al-Mumtahanah-The-Woman-to-be-examined-سورة-الممتحنة.mp3",
  61: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/061-As-Saff-The-Row-سورة-الصف.mp3",
  62: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/062-Al-Jumuah-Friday-سورة-الجمعة.mp3",
  63: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/063-Al-Munafiqoon-The-Hypocrites-سورة-المنافقون.mp3",
  64: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/064-At-Taghabun-Mutual-Loss-Gain-سورة-التغابن.mp3",
  65: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/065-At-Talaq-The-Divorce-سورة-الطلاق.mp3",
  66: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/066-At-Tahrim-The-Prohibition-سورة-التحريم.mp3",
  67: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/067-Al-Mulk-Dominion-سورة-الملك.mp3",
  68: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/068-Al-Qalam-The-Pen-سورة-القلم.mp3",
  69: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/069-Al-Haaqqah-The-Inevitable-سورة-الحاقة.mp3",
  70: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/070-Al-Maarij-The-Ways-of-Ascent-سورة-المعارج.mp3",
  71: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/071-Nooh-سورة-نوح.mp3",
  72: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/072-Al-Jinn-The-Jinn-سورة-الجن.mp3",
  73: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/073-Al-Muzzammil-The-One-wrapped-in-Garments-سورة-المزمل.mp3",
  74: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/074-Al-Muddaththir-The-One-Enveloped-سورة-المدثر.mp3",
  75: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/075-Al-Qiyamah-The-Resurrection-سورة-القيامة.mp3",
  76: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/076-Al-Insan-Man-سورة-الإنسان.mp3",
  77: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/077-Al-Mursalat-Those-sent-forth-سورة-المرسلات.mp3",
  78: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/078-An-Naba-The-Great-News-سورة-النبأ.mp3",
  79: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/079-An-Naziat-Those-who-Pull-Out-سورة-النازعات.mp3",
  80: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/080-Abasa-He-frowned-سورة-عبس.mp3",
  81: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/081-At-Takwir-The-Overthrowing-سورة-التكوير.mp3",
  82: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/082-Al-Infitar-The-Cleaving-سورة-الانفطار.mp3",
  83: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/083-Al-Mutaffifin-Those-Who-Deal-in-Fraud-سورة-المطففين.mp3",
  84: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/084-Al-Inshiqaq-The-Splitting-Asunder-سورة-الانشقاق.mp3",
  85: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/085-Al-buroojTheBigStars-.mp3",
  86: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/086-At-Tariq-The-Night-Comer-سورة-الطارق.mp3",
  87: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/087-Al-Ala-The-Most-High-سورة-الأعلى.mp3",
  88: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/088-Al-Ghashiya-The-Overwhelming-سورة-الغاشية.mp3",
  89: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/089-Al-Fajr-The-Dawn-سورة-الفجر.mp3",
  90: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/090-Al-Balad-The-City-سورة-البلد.mp3",
  91: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/091-Ash-Shams-The-Sun-سورة-الشمس.mp3",
  92: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/092-Al-Layl-The-Night-سورة-الليل.mp3",
  93: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/093-Ad-Dhuha-The-Forenoon-سورة-الضحى.mp3",
  94: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/094-As-Sharh-The-Opening-Forth-سورة-الشرح.mp3",
  95: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/095-At-Tin-The-Fig-سورة-التين.mp3",
  96: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/096-Al-alaq-The-Clot-سورة-العلق.mp3",
  97: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/097-Al-Qadr-The-Night-of-Decree-سورة-القدر.mp3",
  98: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/098-Al-Bayyinah-The-Clear-Evidence-سورة-البينة.mp3",
  99: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/099-Az-Zalzalah-The-Earthquake-سورة-الزلزلة.mp3",
  100: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/100-Al-adiyat-Those-That-Run-سورة-العاديات.mp3",
  101: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/101-Al-Qariah-The-Striking-Hour-سورة-القارعة.mp3",
  102: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/102-At-Takathur-The-piling-Up-سورة-التكاثر.mp3",
  103: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/103-Al-Asr-The-Time-سورة-العصر.mp3",
  104: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/104-Al-Humazah-The-Slanderer-سورة-الهمزة.mp3",
  105: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/105-Al-Fil-The-Elephant-سورة-الفيل.mp3",
  106: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/106-Quraish-سورة-قريش.mp3",
  107: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/107-Al-Maun-Small-Kindnesses-سورة-الماعون.mp3",
  108: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/108-Al-Kauthor-A-River-in-Paradise-سورة-الكوثر.mp3",
  109: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/109-Al-Kafiroon-The-Disbelievers-سورة-الكافرون.mp3",
  110: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/110-An-Nasr-The-Help-سورة-النصر.mp3",
  111: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/111-Al-Masad-The-Palm-Fibre-سورة-المسد.mp3",
  112: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/112-Al-Ikhlas-Sincerity-سورة-الإخلاص.mp3",
  113: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/113-Al-Falaq-The-Daybreak-سورة-الفلق.mp3",
  114: "https://www.emaanlibrary.com/wp-content/uploads/2018/04/114-An-Nas-Mankind-سورة-الناس.mp3",
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Audio Player ─────────────────────────────────────────────────────────────────────────────
interface AudioPlayerProps {
  audioUrl: string;
  surahName: string;
  ayahs: Ayah[];
  onActiveAyah: (n: number) => void;
}

function AudioPlayer({
  audioUrl,
  surahName,
  ayahs,
  onActiveAyah,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Reset state when surah changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset on audioUrl change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioUrl]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = audio.currentTime;
    setCurrentTime(t);

    if (ayahs.length === 0) return;
    let activeIdx = 0;
    for (let i = 0; i < ayahs.length; i++) {
      if (t >= Number(ayahs[i].startingTime)) {
        activeIdx = i;
      } else {
        break;
      }
    }
    onActiveAyah(Number(ayahs[activeIdx].number));
  }, [ayahs, onActiveAyah]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = Number(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      data-ocid="player.panel"
      className="bg-card shadow-player border border-border rounded-xl mx-4 my-3 px-5 py-4 flex items-center gap-5"
    >
      {/* biome-ignore lint/a11y/useMediaCaption: Quran audio — captions not applicable */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play/Pause */}
      <button
        data-ocid="player.toggle"
        onClick={togglePlay}
        type="button"
        className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Surah name + progress */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate mb-1">
          {surahName}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 h-2 bg-border rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Seek"
            />
          </div>
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Volume2 size={16} className="text-muted-foreground" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={handleVolume}
          className="w-20 accent-primary cursor-pointer"
          aria-label="Volume"
        />
      </div>

      {/* Reciter */}
      <div className="hidden md:flex flex-col items-end flex-shrink-0">
        <span className="text-xs font-medium text-foreground">
          Emaan Library
        </span>
        <span className="text-xs text-muted-foreground">Urdu Translation</span>
      </div>
    </div>
  );
}

// ─── Surah List Item ──────────────────────────────────────────────────────────────────────────────
interface SurahItemProps {
  surah: SurahMeta;
  isActive: boolean;
  index: number;
  onClick: () => void;
}

function SurahItem({ surah, isActive, index, onClick }: SurahItemProps) {
  return (
    <button
      type="button"
      data-ocid={`surah.item.${index}`}
      onClick={onClick}
      className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors border-l-4 ${
        isActive
          ? "bg-quran-sidebar-active border-l-primary"
          : "border-l-transparent hover:bg-accent"
      }`}
    >
      <span
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {surah.number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-arabic text-sm leading-tight text-foreground">
          {surah.arabicName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {surah.transliteration}
        </p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {surah.ayahCount}
      </span>
    </button>
  );
}

// ─── Ayah Card ──────────────────────────────────────────────────────────────────────────────────
interface AyahCardProps {
  ayah: Ayah;
  isActive: boolean;
  index: number;
}

function AyahCard({ ayah, isActive, index }: AyahCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive]);

  return (
    <motion.div
      ref={ref}
      data-ocid={`ayah.item.${index}`}
      layout
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl border transition-all duration-300 ${
        isActive
          ? "bg-quran-mint border-primary border-l-4 shadow-sm"
          : "bg-card border-border hover:border-primary/30"
      }`}
    >
      <div className="p-5">
        {/* Ayah number badge */}
        <div className="flex items-start mb-4">
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {Number(ayah.number)}
          </span>
        </div>

        {/* Arabic text */}
        <p
          className="font-arabic text-right leading-loose mb-4 text-foreground"
          style={{ fontSize: "2rem", lineHeight: "2.8rem" }}
          dir="rtl"
        >
          {ayah.arabicText}
        </p>

        {/* Urdu translation */}
        <p
          className="font-urdu text-right text-muted-foreground leading-loose"
          style={{ fontSize: "1.1rem", lineHeight: "2.4rem" }}
          dir="rtl"
        >
          {ayah.urduTranslation}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main App Content ─────────────────────────────────────────────────────────────────────────────
function AppContent() {
  const [selectedSurahNum, setSelectedSurahNum] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAyahNum, setActiveAyahNum] = useState(1);

  const surahs = SURAHS;
  const surahsLoading = false;

  const { data: ayahs = [], isLoading: ayahsLoading } =
    useGetAyahsForSurah(selectedSurahNum);

  const selectedSurah = surahs.find((s) => s.number === selectedSurahNum);

  const filteredSurahs = surahs.filter(
    (s) =>
      searchQuery === "" ||
      s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arabicName.includes(searchQuery) ||
      s.urduName.includes(searchQuery) ||
      String(s.number).includes(searchQuery),
  );

  const audioUrl = SURAH_AUDIO_URLS[selectedSurahNum] ?? SURAH_AUDIO_URLS[1];

  const handleSelectSurah = (num: number) => {
    setSelectedSurahNum(num);
    setActiveAyahNum(1);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header
        data-ocid="app.panel"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.50 0.09 175), oklch(0.52 0.12 149))",
        }}
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <Moon size={28} className="text-white opacity-90" />
          <div>
            <h1 className="text-white font-bold text-xl leading-none">
              Noor-ul-Quran
            </h1>
            <p className="text-white/70 text-xs mt-0.5">نور القرآن</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button
            type="button"
            data-ocid="nav.link"
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            Home
          </button>
          <button
            type="button"
            data-ocid="nav.link"
            className="text-white/80 hover:text-white text-sm transition-colors"
            onClick={() => handleSelectSurah(1)}
          >
            Al-Fatihah
          </button>
          <button
            type="button"
            data-ocid="nav.link"
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            About
          </button>
        </nav>
      </header>

      {/* Audio Player Bar */}
      <div data-ocid="audio.panel" className="flex-shrink-0">
        <AudioPlayer
          audioUrl={audioUrl}
          surahName={
            selectedSurah
              ? `${selectedSurah.transliteration} — ${selectedSurah.arabicName}`
              : "Loading..."
          }
          ayahs={ayahs}
          onActiveAyah={setActiveAyahNum}
        />
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  data-ocid="surah.search_input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search surahs..."
                  className="pl-9 h-8 text-xs bg-background"
                />
              </div>
              <p className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                {surahsLoading
                  ? "Loading..."
                  : `${filteredSurahs.length} Surahs`}
              </p>
            </div>
          </div>

          {/* Surah list */}
          <ScrollArea className="flex-1">
            <div>
              {filteredSurahs.map((surah, idx) => (
                <SurahItem
                  key={surah.number}
                  surah={surah}
                  isActive={surah.number === selectedSurahNum}
                  index={idx + 1}
                  onClick={() => handleSelectSurah(surah.number)}
                />
              ))}
              {filteredSurahs.length === 0 && (
                <div
                  data-ocid="surah.empty_state"
                  className="p-6 text-center text-muted-foreground text-sm"
                >
                  No surahs found
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Reading Panel */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Surah title */}
          {selectedSurah && (
            <div
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.50 0.09 175 / 0.08), oklch(0.52 0.12 149 / 0.05))",
              }}
              className="px-8 py-5 border-b border-border flex-shrink-0 text-center"
            >
              <p
                className="font-arabic text-4xl font-bold text-foreground"
                dir="rtl"
              >
                {selectedSurah.arabicName}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedSurah.transliteration} · {selectedSurah.ayahCount}{" "}
                Ayahs
              </p>
              <p
                className="font-urdu text-lg text-muted-foreground mt-1"
                dir="rtl"
              >
                {selectedSurah.urduName}
              </p>
            </div>
          )}

          {/* Ayahs */}
          <ScrollArea className="flex-1">
            <div className="px-6 py-5 space-y-4 max-w-3xl mx-auto">
              {ayahsLoading ? (
                <div data-ocid="ayah.loading_state" className="space-y-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedSurahNum}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                    {ayahs.map((ayah, idx) => (
                      <AyahCard
                        key={Number(ayah.number)}
                        ayah={ayah}
                        isActive={Number(ayah.number) === activeAyahNum}
                        index={idx + 1}
                      />
                    ))}
                    {ayahs.length === 0 && (
                      <div
                        data-ocid="ayah.empty_state"
                        className="text-center text-muted-foreground py-16 text-sm"
                      >
                        No ayahs found
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Footer */}
      <footer
        style={{ background: "oklch(var(--footer-bg))" }}
        className="flex-shrink-0 py-5 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Moon size={18} className="text-white/60" />
            <span className="text-white font-semibold">Noor-ul-Quran</span>
          </div>
          <div className="border-t border-white/10 pt-3">
            <p className="text-center text-white/50 text-xs">
              © {new Date().getFullYear()} Noor-ul-Quran | Powered by Nellore
              Print Hub Magic Advertising
            </p>
            <p className="text-center text-white/60 text-xs mt-1">
              Website Created by: Shaik Munwar Basha | Contact: 9390535070
            </p>
            <p className="text-center text-white/30 text-xs mt-1">
              Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.hostname : "",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/50 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
