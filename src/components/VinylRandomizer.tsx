/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getRandomRecordFromCollection, getAllRecords } from "../utils/discogs";
import { getTracklistFromLastFM } from "@/utils/lastfm";
import Header from "./Header";

/** Utility to pick N random distinct items from an array, excluding a certain ID. */
function pickRandomRecords(records: any[], count: number, excludeId?: number) {
  const filtered = excludeId
    ? records.filter((rec) => rec.id !== excludeId)
    : [...records];

  const chosen: any[] = [];
  const copy = [...filtered];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    chosen.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return chosen;
}

/** A small component to show a "shuffling" animation of random covers (or placeholders). */
function LoadingShuffle({ covers }: { covers: any[] }) {
  return (
    <div className="relative flex items-center justify-center gap-4 flex-wrap">
      <AnimatePresence>
        {covers.map((cover, i) => (
          <motion.div
            key={cover?.id || `placeholder-${i}`}
            className="relative w-32 h-32 rounded-lg overflow-hidden shadow-md"
            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
            animate={{
              opacity: 1,
              x: 0,
              rotate: [0, 1, -1, 0],
            }}
            exit={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
            transition={{
              duration: 1.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {cover?.cover_image ? (
              <img
                src={cover.cover_image}
                alt="Shuffling album"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-sm">
                No Image
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function VinylRandomizer() {
  const [record, setRecord] = useState<any | null>(null);  // The main (front) record
  const [stackRecords, setStackRecords] = useState<any[]>([]); // Background stack covers (3)
  const [allRecords, setAllRecords] = useState<any[]>([]);  // Entire library
  const [showCollection, setShowCollection] = useState<boolean>(false);// Toggle between collection & randomizer
  const [loading, setLoading] = useState<boolean>(false); // for random record
  const [loadingCollection, setLoadingCollection] = useState<boolean>(false); // for entire library
  const [loadingCovers, setLoadingCovers] = useState<any[]>([]);// Covers used during "loading shuffle"
  const [error, setError] = useState<string | null>(null);// Error

  // Tracklist
  interface Track {
    position: string;
    title: string;
  }
  const [tracklist, setTracklist] = useState<{ sideA: Track[]; sideB: Track[] }>({
    sideA: [],
    sideB: [],
  });

  // Flip and "playing" states
  const [flipped, setFlipped] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);

  // Positions for 3 stacked covers behind the main record
  const stackedPositions = [
    { x: -50, y: -20, rotate: -10, scale: 0.88 },
    { x: 0, y: 50, rotate: 0, scale: 0.9 },
    { x: 50, y: -25, rotate: 8, scale: 0.88 },
  ];

  //Fetch library if needed
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

  //Fetch the random record, ensuring library is loaded first
  async function fetchRecord() {
    setError(null);
    setLoading(true);

    try {
      // If library is empty on first randomize, show placeholder shuffle
      if (allRecords.length === 0) {
        setLoadingCovers([null, null, null, null, null]);
        // fetch the library now
        await fetchAllRecords();
      } else {
        // If library is already loaded, pick random covers for loading shuffle
        const randomLoadingCovers = pickRandomRecords(allRecords, 5);
        setLoadingCovers(randomLoadingCovers);
      }

      // get the main record
      const randomRecord = await getRandomRecordFromCollection();
      setRecord(randomRecord);
      setFlipped(false);
      setPlaying(false);

      // pick 3 stack covers (excluding the main record)
      if (allRecords.length > 0 && randomRecord) {
        const randomStack = pickRandomRecords(allRecords, 3, randomRecord.id);
        setStackRecords(randomStack);
      }

      // Fetch tracklist
      if (randomRecord) {
        const tracks = await getTracklistFromLastFM(
          randomRecord.artists[0].name,
          randomRecord.title
        );
        setTracklist(tracks);
      }
    } catch {
      setError("Error fetching record. Please try again.");
    }

    // Turn off loading
    setLoading(false);
    setLoadingCovers([]);
  }

 //Fetch Collection on page load
  useEffect(() => {
    fetchAllRecords();
  }, []);

  return (
    <div className="font-sans flex flex-col min-h-screen w-full bg-brandBeige text-brandGray">
<Header showCollection={showCollection} setShowCollection={setShowCollection}/>

      <main className="flex-1 w-full p-4 sm:p-6 flex flex-col items-center">
        {error && <p className="text-brandRed text-base sm:text-lg mt-4">{error}</p>}

        {showCollection ? (
          <div className="w-full mt-8">
            {loadingCollection ? (
              <div className="flex justify-center items-center h-96">
                <p className="text-gray-500">Loading collection...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm"
                  >
                    <img
                      src={rec.cover_image}
                      alt={rec.title}
                      className="w-full h-auto object-cover rounded"
                    />
                    <h2 className="mt-2 text-sm font-semibold text-brandPlum line-clamp-2">
                      {rec.title}
                    </h2>
                    <p className="text-xs text-brandGray">
                      {rec.artists?.[0]?.name || "Unknown Artist"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (

          <div className="flex flex-col items-center mt-4 w-full">
            <div
              className="relative w-full flex flex-col items-center justify-center"
              style={{ minHeight: "600px" }}
            >

              {loading && loadingCovers.length > 0 && (
                <LoadingShuffle covers={loadingCovers} />
              )}

          
              {record && !loading && (
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-[90vw] max-w-[400px] aspect-square flex items-center justify-center mb-12 sm:mb-16">
                    <AnimatePresence>
                      {stackRecords.slice(0, 3).map((stackRec, i) => {
                        const { x, y, rotate, scale } = stackedPositions[i] || {
                          x: 0,
                          y: 0,
                          rotate: 0,
                          scale: 1,
                        };
                        return (
                          <motion.div
                            key={stackRec.id}
                            className="absolute w-full h-full top-0 left-0 z-0"
                            initial={{ opacity: 0, scale: 0.8, x: -200 }}
                            animate={{ opacity: 1, scale, x, y, rotate }}
                            exit={{ opacity: 0, scale: 0.8, x: 200 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          >
                            <img
                              src={stackRec.cover_image}
                              alt="Stacked album"
                              className="w-full h-full object-cover rounded-xl shadow-md"
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {playing && (
                      <motion.div
                        className="absolute z-10"
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ x: 400, y: 0, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        >
                          <Image
                            src="/vinyl-record.png"
                            alt="Spinning Vinyl"
                            width={450}
                            height={450}
                          />
                        </motion.div>
                      </motion.div>
                    )}

                    <div
                      className="relative w-full h-full [perspective:1000px] z-20"
                      onClick={() => setFlipped(!flipped)}
                    >
                      <motion.div
                        className="absolute inset-0 w-full h-full"
                        style={{ transformStyle: "preserve-3d" }}
                        animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden [backface-visibility:hidden]">
                          <img
                            src={record.cover_image}
                            alt={record.title}
                            className="w-full h-full object-cover rounded-xl shadow-md"
                          />
                        </div>

                        <div
                          className="absolute inset-0 w-full h-full rounded-xl flex flex-col items-center justify-center
                                     p-6 text-center bg-white text-brandGray border border-gray-300
                                     [transform:rotateY(180deg)] [backface-visibility:hidden]"
                        >
                          <h2 className="text-lg font-medium mb-2 text-brandPlum">Track List</h2>

                          <div className="relative w-full max-h-64 overflow-hidden">
                            <div
                              className="overflow-y-auto max-h-64 px-4 
                                         [::-webkit-scrollbar]:hidden 
                                         [scrollbar-width:none]"
                            >
                              <div className="w-full text-left">
                                <h3 className="text-md font-semibold text-brandPlum mb-1">Side A</h3>
                                <ul className="space-y-1 text-sm">
                                  {tracklist.sideA.length > 0 ? (
                                    tracklist.sideA.map((track, index) => (
                                      <li key={index} className="border-b border-gray-300 pb-1">
                                        {track.position}. {track.title}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-brandRed">No tracks available</li>
                                  )}
                                </ul>
                              </div>

                              <div className="w-full text-left mt-3">
                                <h3 className="text-md font-semibold text-brandPlum mb-1">Side B</h3>
                                <ul className="space-y-1 text-sm">
                                  {tracklist.sideB.length > 0 ? (
                                    tracklist.sideB.map((track, index) => (
                                      <li key={index} className="border-b border-gray-300 pb-1">
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
                    </div>
                  </div>

                  {/* Album Details */}
                  <h2 className="text-lg sm:text-2xl font-medium text-brandPlum line-clamp-2 px-2">
                    {record.title}
                  </h2>
                  <p className="text-brandGray text-sm sm:text-md">
                    {record.artists?.[0]?.name || "Unknown Artist"}
                  </p>
                  <p className="text-xs sm:text-sm">{record.year || "Unknown Year"}</p>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                    <motion.button
                      onClick={() => setPlaying(true)}
                      className="hidden sm:block px-6 py-3 bg-brandOrange 
                                 text-white font-medium rounded-lg 
                                 shadow-lg transition-transform duration-300 hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎵 Play Record
                    </motion.button>

                    {/* Randomize Button*/}
                    <motion.button
                      onClick={fetchRecord}
                      className="px-6 py-3 bg-transparent border border-brandOrange text-brandOrange 
                                 font-medium rounded-lg shadow-lg transition-transform duration-300 
                                 hover:bg-brandOrange hover:text-white hover:scale-105 w-64 sm:w-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎲 Randomize Again
                    </motion.button>
                  </div>
                </div>
              )}

              {/* If no record loaded & not loading, show prompt */}
              {!record && !loading && (
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm sm:text-base text-brandPlum mb-4">
                    No record loaded. Click below to find one!
                  </p>
                  <motion.button
                    onClick={fetchRecord}
                    className="px-6 py-3 bg-transparent border border-brandOrange text-brandOrange 
                               font-medium rounded-lg shadow-lg transition-transform duration-300 
                               hover:bg-brandOrange hover:text-white hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎲 Randomize from my Library
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
