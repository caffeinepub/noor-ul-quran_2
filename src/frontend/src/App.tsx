import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Moon, Pause, Play, Search, Volume2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Ayah, Surah } from "./backend.d";
import { useGetAllSurahs, useGetAyahsForSurah } from "./hooks/useQueries";

const queryClient = new QueryClient();

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Audio Player ────────────────────────────────────────────────────────────
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
          Sheikh Al-Afasy
        </span>
        <span className="text-xs text-muted-foreground">Reciter</span>
      </div>
    </div>
  );
}

// ─── Surah List Item ──────────────────────────────────────────────────────────
interface SurahItemProps {
  surah: Surah;
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
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-l-4 ${
        isActive
          ? "bg-quran-sidebar-active border-l-primary"
          : "border-l-transparent hover:bg-accent"
      }`}
    >
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {Number(surah.number)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-arabic text-base leading-tight text-foreground">
          {surah.arabicName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {surah.transliteration}
        </p>
      </div>
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {Number(surah.ayahCount)}
      </span>
    </button>
  );
}

// ─── Ayah Card ────────────────────────────────────────────────────────────────
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

// ─── Main App Content ─────────────────────────────────────────────────────────
function AppContent() {
  const [selectedSurahNum, setSelectedSurahNum] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAyahNum, setActiveAyahNum] = useState(1);

  const { data: surahs = [], isLoading: surahsLoading } = useGetAllSurahs();
  const { data: ayahs = [], isLoading: ayahsLoading } =
    useGetAyahsForSurah(selectedSurahNum);

  const selectedSurah = surahs.find(
    (s) => Number(s.number) === selectedSurahNum,
  );

  const filteredSurahs = surahs.filter(
    (s) =>
      searchQuery === "" ||
      s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arabicName.includes(searchQuery) ||
      s.urduName.includes(searchQuery) ||
      String(Number(s.number)).includes(searchQuery),
  );

  const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${selectedSurahNum}.mp3`;

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
        <aside className="w-72 flex-shrink-0 bg-card border-r border-border flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                data-ocid="surah.search_input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search surahs..."
                className="pl-9 h-9 text-sm bg-background"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 px-1">
              {surahsLoading ? "Loading..." : `${filteredSurahs.length} Surahs`}
            </p>
          </div>

          {/* Surah list */}
          <ScrollArea className="flex-1">
            {surahsLoading ? (
              <div className="p-3 space-y-2" data-ocid="surah.loading_state">
                {Array.from({ length: 10 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div>
                {filteredSurahs.map((surah, idx) => (
                  <SurahItem
                    key={Number(surah.number)}
                    surah={surah}
                    isActive={Number(surah.number) === selectedSurahNum}
                    index={idx + 1}
                    onClick={() => handleSelectSurah(Number(surah.number))}
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
            )}
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
                {selectedSurah.transliteration} ·{" "}
                {Number(selectedSurah.ayahCount)} Ayahs
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
              © 2026 Noor-ul-Quran | Powered by Nellore Print Hub Magic
              Advertising
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
