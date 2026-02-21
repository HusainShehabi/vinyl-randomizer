/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getRandomRecordFromCollection, getAllRecords } from "../utils/discogs";
import { getTracklistFromLastFM } from "@/utils/lastfm";
import Header from "./Header";

const SHUFFLE_PATHS = [
  {
    x: [-40, -6, -28, -14],
    y: [10, -18, 4, -8],
    rotate: [-12, -3, -10, -6],
  },
  {
    x: [0, 28, -8, 16],
    y: [-8, 2, -14, -6],
    rotate: [-4, 10, -2, 6],
  },
  {
    x: [38, 6, 30, 12],
    y: [12, -10, 0, -12],
    rotate: [11, 2, 8, 4],
  },
  {
    x: [-22, 14, -2, 10],
    y: [26, 8, 18, 10],
    rotate: [-8, 5, -4, 2],
  },
  {
    x: [24, -12, 18, -6],
    y: [24, 6, 14, 8],
    rotate: [8, -6, 4, -3],
  },
];

function pickRandomRecords(records: any[], count: number, excludeId?: number) {
  const filtered = excludeId ? records.filter((rec) => rec.id !== excludeId) : [...records];

  const chosen: any[] = [];
  const copy = [...filtered];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    chosen.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return chosen;
}

function LoadingShuffle({ covers }: { covers: any[] }) {
  return (
    <div className="relative flex aspect-square w-[90vw] max-w-[400px] items-center justify-center">
      <AnimatePresence>
        {covers.map((cover, i) => (
          <motion.div
            key={cover?.id || `placeholder-${i}`}
            className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl border border-white/45 bg-white shadow-[0_20px_35px_rgba(15,35,55,0.25)]"
            style={{ zIndex: covers.length - i }}
            initial={{ opacity: 0, scale: 0.92, x: i % 2 === 0 ? -140 : 140 }}
            animate={{
              opacity: 1,
              scale: [0.95, 1, 0.97, 1],
              x: SHUFFLE_PATHS[i % SHUFFLE_PATHS.length].x,
              y: SHUFFLE_PATHS[i % SHUFFLE_PATHS.length].y,
              rotate: SHUFFLE_PATHS[i % SHUFFLE_PATHS.length].rotate,
            }}
            exit={{ opacity: 0, scale: 0.9, x: i % 2 === 0 ? 120 : -120 }}
            transition={{
              duration: 2.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
              delay: i * 0.08,
            }}
          >
            {cover?.cover_image ? (
              <img src={cover.cover_image} alt="Shuffling album" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-medium text-slate-500">
                Loading
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface Track {
  position: string;
  title: string;
}

export default function VinylRandomizer() {
  const [record, setRecord] = useState<any | null>(null);
  const [stackRecords, setStackRecords] = useState<any[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [showCollection, setShowCollection] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCollection, setLoadingCollection] = useState<boolean>(false);
  const [loadingCovers, setLoadingCovers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [tracklist, setTracklist] = useState<{ sideA: Track[]; sideB: Track[] }>({ sideA: [], sideB: [] });
  const [flipped, setFlipped] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);

  const stackedPositions = [
    { x: -52, y: -24, rotate: -9, scale: 0.9 },
    { x: 0, y: 50, rotate: 0, scale: 0.9 },
    { x: 52, y: -28, rotate: 8, scale: 0.9 },
  ];

  async function fetchAllRecords() {
    setLoadingCollection(true);
    try {
      const records = await getAllRecords();
      setAllRecords(records);
    } catch {
      setError("Error fetching collection.");
    }
    setLoadingCollection(false);
  }

  async function fetchRecord() {
    setError(null);
    setLoading(true);

    try {
      if (allRecords.length === 0) {
        setLoadingCovers([null, null, null, null, null]);
        await fetchAllRecords();
      } else {
        const randomLoadingCovers = pickRandomRecords(allRecords, 5);
        setLoadingCovers(randomLoadingCovers);
      }

      const randomRecord = await getRandomRecordFromCollection();
      setRecord(randomRecord);
      setFlipped(false);
      setPlaying(false);

      if (allRecords.length > 0 && randomRecord) {
        const randomStack = pickRandomRecords(allRecords, 3, randomRecord.id);
        setStackRecords(randomStack);
      }

      if (randomRecord) {
        const tracks = await getTracklistFromLastFM(randomRecord.artists[0].name, randomRecord.title);
        setTracklist(tracks);
      }
    } catch {
      setError("Error fetching record. Please try again.");
    }

    setLoading(false);
    setLoadingCovers([]);
  }

  useEffect(() => {
    fetchAllRecords();
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden text-brandGray">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-[12%] h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute right-[-100px] top-[30%] h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
      </div>

      <Header showCollection={showCollection} setShowCollection={setShowCollection} refreshRecords={fetchAllRecords} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-brandRed">
            {error}
          </p>
        )}

        {showCollection ? (
          <section className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_24px_60px_rgba(29,54,81,0.12)] backdrop-blur-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-brandPlum sm:text-2xl">Your Collection</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {allRecords.length} records
              </span>
            </div>

            {loadingCollection ? (
              <div className="flex h-80 items-center justify-center">
                <p className="text-brandGray">Loading collection...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {allRecords.map((rec) => (
                  <motion.article
                    key={rec.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    whileHover={{ y: -4 }}
                  >
                    <img
                      src={rec.cover_image}
                      alt={rec.title}
                      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="space-y-1 p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold text-brandPlum">{rec.title}</h3>
                      <p className="text-xs text-brandGray">{rec.artists?.[0]?.name || "Unknown Artist"}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="flex w-full flex-1 flex-col items-center rounded-2xl border border-white/65 bg-white/65 p-4 shadow-[0_24px_60px_rgba(29,54,81,0.12)] backdrop-blur-sm sm:p-8">
            <div className="relative flex w-full flex-1 flex-col items-center justify-center" style={{ minHeight: "620px" }}>
              <AnimatePresence mode="wait" initial={false}>
                {loading && loadingCovers.length > 0 ? (
                  <motion.div
                    key="loading-shuffle"
                    className="flex w-full items-center justify-center"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, filter: "blur(2px)" }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  >
                    <LoadingShuffle covers={loadingCovers} />
                  </motion.div>
                ) : record ? (
                  <motion.div
                    key={`record-shell-${record.id}`}
                    className="flex w-full flex-col items-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  >
                    <div className="flex w-full flex-col items-center gap-6">
                      <div
                        className="relative mb-4 flex w-[90vw] max-w-[400px] items-center justify-center sm:mb-6"
                      >
                        <div className="relative aspect-square w-full max-w-[420px]">
                          <AnimatePresence>
                            {stackRecords.slice(0, 3).map((stackRec, i) => {
                              const { x, y, rotate, scale } = stackedPositions[i] || { x: 0, y: 0, rotate: 0, scale: 1 };
                              const shuffleStart = SHUFFLE_PATHS[(i + 1) % SHUFFLE_PATHS.length];
                              return (
                                <motion.div
                                  key={stackRec.id}
                                  className="absolute left-0 top-0 z-0 h-full w-full"
                                  initial={{
                                    opacity: 0,
                                    scale: 0.88,
                                    x: shuffleStart.x[0],
                                    y: shuffleStart.y[0],
                                    rotate: shuffleStart.rotate[0],
                                  }}
                                  animate={
                                    {
                                      opacity: 1,
                                      filter: "blur(0px) saturate(1) brightness(1)",
                                      scale,
                                      x,
                                      y,
                                      rotate,
                                    }
                                  }
                                  exit={{ opacity: 0, scale: 0.86, x: shuffleStart.x[0], y: shuffleStart.y[0] }}
                                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                                >
                                  <img
                                    src={stackRec.cover_image}
                                    alt="Stacked album"
                                    className="h-full w-full rounded-2xl object-cover shadow-lg"
                                  />
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>

                        {playing && (
                          <motion.div
                            className="absolute z-10"
                            initial={{ y: 0, opacity: 1 }}
                            animate={{ x: 260, y: 0, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            >
                              <Image src="/vinyl-record.png" alt="Spinning Vinyl" width={450} height={450} />
                            </motion.div>
                          </motion.div>
                        )}

                          <motion.button
                            key={record.id}
                            className="relative z-20 h-full w-full [perspective:1000px]"
                            onClick={() => setFlipped(!flipped)}
                            aria-label="Flip album card"
                            initial={{
                              opacity: 0,
                              x: SHUFFLE_PATHS[0].x[1],
                              y: SHUFFLE_PATHS[0].y[1],
                              rotate: SHUFFLE_PATHS[0].rotate[1],
                            }}
                            animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
                          >
                            <motion.div
                              className="absolute inset-0 h-full w-full"
                              style={{ transformStyle: "preserve-3d" }}
                              animate={{ rotateY: flipped ? 180 : 0 }}
                              transition={{ duration: 0.6 }}
                            >
                              <div className="absolute inset-0 h-full w-full overflow-hidden rounded-2xl [backface-visibility:hidden]">
                                <img
                                  src={record.cover_image}
                                  alt={record.title}
                                  className="h-full w-full rounded-2xl object-cover shadow-[0_24px_45px_rgba(20,44,69,0.3)]"
                                />
                              </div>

                              <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-brandGray [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                <h2 className="mb-2 text-lg font-semibold text-brandPlum">Track List</h2>

                                <div className="relative w-full max-h-64 overflow-hidden">
                                  <div className="max-h-64 overflow-y-auto px-2 text-left text-sm [scrollbar-width:none] [::-webkit-scrollbar]:hidden">
                                    <div className="w-full">
                                      <h3 className="mb-1 text-sm font-semibold text-brandPlum">Side A</h3>
                                      <ul className="space-y-1">
                                        {tracklist.sideA.length > 0 ? (
                                          tracklist.sideA.map((track, index) => (
                                            <li key={index} className="border-b border-slate-200 pb-1">
                                              {track.position}. {track.title}
                                            </li>
                                          ))
                                        ) : (
                                          <li className="text-brandRed">No tracks available</li>
                                        )}
                                      </ul>
                                    </div>

                                    <div className="mt-3 w-full">
                                      <h3 className="mb-1 text-sm font-semibold text-brandPlum">Side B</h3>
                                      <ul className="space-y-1">
                                        {tracklist.sideB.length > 0 ? (
                                          tracklist.sideB.map((track, index) => (
                                            <li key={index} className="border-b border-slate-200 pb-1">
                                              {track.position}. {track.title}
                                            </li>
                                          ))
                                        ) : (
                                          <li className="text-brandRed">No tracks available</li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    <h2 className="mt-4 max-w-2xl px-2 text-balance text-2xl font-semibold text-brandPlum sm:mt-5 sm:text-3xl">{record.title}</h2>
                    <p className="mt-1 text-base text-brandGray">{record.artists?.[0]?.name || "Unknown Artist"}</p>
                    <p className="mt-1 text-sm text-slate-500">{record.year || "Unknown Year"}</p>

                  <div className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
                    <motion.button
                      onClick={() => setPlaying(true)}
                      className="hidden h-11 rounded-xl bg-slate-800 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-slate-700 sm:block"
                      whileTap={{ scale: 0.98 }}
                    >
                      Play Record
                    </motion.button>

                    <motion.button
                      onClick={fetchRecord}
                      className="h-11 w-64 rounded-xl bg-brandOrange px-6 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(242,138,63,0.35)] transition hover:brightness-95 sm:w-auto"
                      whileTap={{ scale: 0.98 }}
                    >
                      Randomize Again
                    </motion.button>
                  </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {!record && !loading && (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="mb-4 max-w-sm text-sm text-brandGray sm:text-base">
                    No record loaded yet.
                  </p>
                  <motion.button
                    onClick={fetchRecord}
                    className="h-11 rounded-xl bg-brandOrange px-6 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(242,138,63,0.35)] transition hover:brightness-95"
                    whileTap={{ scale: 0.98 }}
                  >
                    Randomize from My Library
                  </motion.button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
