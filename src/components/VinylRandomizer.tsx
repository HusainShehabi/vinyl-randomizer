
"use client";  //This tells Next.js it's a client component

import { useState } from 'react';
import { getRandomRecordFromCollection } from '../utils/discogs';
import { motion } from 'framer-motion';
import { getTracklistFromLastFM } from '@/utils/lastfm';
import Image from "next/image";


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
                const tracks = await getTracklistFromLastFM(randomRecord.artists[0].name, randomRecord.title);
                setTracklist(tracks);
            }
        } catch {
            setError("Error fetching record. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white p-6">
            <motion.h1
                className="text-4xl font-semibold mb-8 text-center tracking-wide"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Husain&#39;s Vinyl Randomizer
            </motion.h1>

            {error && <p className="text-red-400 text-lg">{error}</p>}

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

            {record && !loading && (
                <div className="relative flex flex-col items-center text-center">
                    {/* Album + Vinyl Container */}
                    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
                        {/* Vinyl Record - Initially Under the Album */}
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

                        {/* Album Cover */}
                        <div
                            className="relative w-full h-full"
                            onClick={() => setFlipped(!flipped)}
                        >
                            {/* Front Side - Album Cover */}
                            <motion.div
                                className={`absolute inset-0 w-full h-full rounded-xl shadow-lg border border-gray-600 bg-gray-800/70 backdrop-blur-md transition-transform duration-500 ${
                                    flipped ? "rotate-y-180 opacity-0" : "opacity-100"
                                }`}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                <img
                                    src={record.cover_image}
                                    alt={record.title}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </motion.div>

                            {/* Back Side - Track List */}
                            <motion.div
                                className={`absolute inset-0 w-full h-full rounded-xl flex flex-col items-center justify-center p-6 text-center bg-gray-800 border border-gray-700 transition-transform duration-500 ${
                                    flipped ? "rotate-y-0 opacity-100" : "opacity-0"
                                }`}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                <h2 className="text-lg font-medium z-10 mb-2">Track List</h2>

                                {/* Scrollable Tracklist Container */}
                                <div className="relative w-full max-h-64 overflow-hidden">
                                    <div className="overflow-y-auto scrollbar-hidden max-h-64 px-4">
                                        {/* Side A */}
                                        <div className="w-full text-left">
                                            <h3 className="text-md font-semibold text-gray-200 mb-1">Side A</h3>
                                            <ul className="space-y-1 text-gray-300">
                                                {tracklist.sideA.length > 0 ? (
                                                    tracklist.sideA.map((track, index) => (
                                                        <li key={index} className="border-b border-gray-600 pb-1">
                                                            {track.position}. {track.title}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-gray-400">No tracks available</li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Side B */}
                                        <div className="w-full text-left mt-3">
                                            <h3 className="text-md font-semibold text-gray-200 mb-1">Side B</h3>
                                            <ul className="space-y-1 text-gray-300">
                                                {tracklist.sideB.length > 0 ? (
                                                    tracklist.sideB.map((track, index) => (
                                                        <li key={index} className="border-b border-gray-600 pb-1">
                                                            {track.position}. {track.title}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-gray-400">No tracks available</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Album Details (Under Image) */}
                    <h2 className="text-2xl font-medium mt-6">{record.title}</h2>
                    <p className="text-gray-400 text-lg">{record.artists?.[0]?.name || "Unknown Artist"}</p>
                    <p className="text-gray-500">{record.year || "Unknown Year"}</p>

                    {/* Play Record Button */}
                    <motion.button
                        onClick={() => setPlaying(true)}
                        className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        🎵 Play Record
                    </motion.button>
                </div>
            )}

            <motion.button
                onClick={fetchRecord}
                className="mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                🎲 Generate Random Vinyl
            </motion.button>
        </div>
    );
}