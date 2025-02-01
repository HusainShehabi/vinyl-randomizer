"use client";

import { useState } from "react";
import Image from "next/image";
import { getRandomRecordFromCollection } from "../utils/discogs";
import { motion } from "framer-motion";
import { getTracklistFromLastFM } from "@/utils/lastfm";

export default function VinylRandomizer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [record, setRecord] = useState<any | null>(null);
  interface Track {
      position: string;
      title: string;
  }
  const [tracklist, setTracklist] = useState<{ sideA: Track[]; sideB: Track[] }>({
      sideA: [],
      sideB: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [playing, setPlaying] = useState<boolean>(false);

  const fetchRecord = async () => {
    setError(null);
    setLoading(true);
    try {
      const randomRecord = await getRandomRecordFromCollection();
      setRecord(randomRecord);
      setFlipped(false);
      setPlaying(false);

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
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-brandBeige text-brandGray p-4 sm:p-6">
      {/* MAIN HEADING */}
      <motion.h1
        className="text-3xl sm:text-4xl font-bold mb-8 text-center tracking-wide text-brandPlum"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Husain&#39;s Vinyl Randomizer
      </motion.h1>

      {/* ERROR MESSAGE */}
      {error && <p className="text-brandRed text-lg">{error}</p>}

      {/* LOADING STATE */}
      {loading && (
        <motion.div
          className="text-center text-lg font-medium animate-pulse"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
        >
          Searching...
        </motion.div>
      )}

      {/* RECORD DISPLAY */}
      {record && !loading && (
        <div className="relative flex flex-col items-center text-center mt-4">
          {/* Use aspect-square to ensure the card has height on mobile */}
          <div className="relative w-[90vw] max-w-[400px] aspect-square flex items-center justify-center">
            {playing && (
              <motion.div
                className="absolute"
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

            {/* 3D FLIP CONTAINER */}
            <div
              className="relative w-full h-full [perspective:1000px]"
              onClick={() => setFlipped(!flipped)}
            >
              <motion.div
                className="absolute inset-0 w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* FRONT SIDE: Album Cover */}
                <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden [backface-visibility:hidden]">
                  <img
                    src={record.cover_image}
                    alt={record.title}
                    className="w-full h-full object-cover rounded-xl shadow-md"
                  />
                </div>

                {/* BACK SIDE: Tracklist */}
                <div
                  className="absolute inset-0 w-full h-full rounded-xl flex flex-col items-center justify-center
                             p-6 text-center bg-white text-brandGray border border-gray-300
                             [transform:rotateY(180deg)] [backface-visibility:hidden]"
                >
                  <h2 className="text-lg font-medium mb-2 text-brandPlum">
                    Track List
                  </h2>

                  <div className="relative w-full max-h-64 overflow-hidden">
                    <div
                      className="overflow-y-auto max-h-64 px-4 
                                 [::-webkit-scrollbar]:hidden 
                                 [scrollbar-width:none]"
                    >
                      {/* Side A */}
                      <div className="w-full text-left">
                        <h3 className="text-md font-semibold text-brandPlum mb-1">
                          Side A
                        </h3>
                        <ul className="space-y-1 text-sm">
                          {tracklist.sideA.length > 0 ? (
                            tracklist.sideA.map((track, index) => (
                              <li
                                key={index}
                                className="border-b border-gray-300 pb-1"
                              >
                                {track.position}. {track.title}
                              </li>
                            ))
                          ) : (
                            <li className="text-brandRed">
                              No tracks available
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Side B */}
                      <div className="w-full text-left mt-3">
                        <h3 className="text-md font-semibold text-brandPlum mb-1">
                          Side B
                        </h3>
                        <ul className="space-y-1 text-sm">
                          {tracklist.sideB.length > 0 ? (
                            tracklist.sideB.map((track, index) => (
                              <li
                                key={index}
                                className="border-b border-gray-300 pb-1"
                              >
                                {track.position}. {track.title}
                              </li>
                            ))
                          ) : (
                            <li className="text-brandRed">
                              No tracks available
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ALBUM DETAILS */}
          <h2 className="text-xl sm:text-2xl font-medium mt-5 text-brandPlum">
            {record.title}
          </h2>
          <p className="text-brandGray text-md sm:text-lg">
            {record.artists?.[0]?.name || "Unknown Artist"}
          </p>
          <p className="text-sm sm:text-base">
            {record.year || "Unknown Year"}
          </p>

          {/* PLAY RECORD BUTTON (hidden on mobile) */}
          <motion.button
            onClick={() => setPlaying(true)}
            className="hidden sm:block mt-6 px-6 py-3 w-64 bg-brandOrange 
                       text-white font-medium rounded-lg 
                       shadow-lg transition-transform duration-300 hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎵 Play Record
          </motion.button>
        </div>
      )}

      {/* GENERATE RANDOM VINYL BUTTON (always visible) */}
      <motion.button
        onClick={fetchRecord}
        className="mt-8 px-6 py-4 w-64 bg-transparent border border-brandOrange text-brandOrange 
                   font-medium rounded-lg shadow-lg transition-transform duration-300 
                   hover:bg-brandOrange hover:text-white hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🎲 Generate Random Vinyl
      </motion.button>
    </div>
  );
}