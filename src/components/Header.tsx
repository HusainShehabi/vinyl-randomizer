"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  showCollection: boolean;
  setShowCollection: (show: boolean) => void;
  refreshRecords: () => void;
}

export default function Header({ showCollection, setShowCollection, refreshRecords }: HeaderProps) {
  const DEFAULT_USERNAME = "HusainShehabi";
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [editing, setEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  const handleEditClick = () => {
    if (!editing) {
      setTempUsername(username);
      setEditing(true);
    }
  };

  const handleSave = () => {
    setUsername(tempUsername);
    localStorage.setItem("username", tempUsername);
    setEditing(false);
    refreshRecords();
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/45 bg-white/65 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <motion.div
          className="w-full sm:w-auto"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {editing ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white/90 px-3 text-base font-semibold text-brandPlum outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="h-11 rounded-xl bg-brandPlum px-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEditClick}
              className="text-left text-balance text-xl font-semibold tracking-tight text-brandPlum transition hover:opacity-80 sm:text-2xl"
            >
              {username}&#39;s Vinyl {showCollection ? "Collection" : "Randomizer"}
            </button>
          )}
          {!editing && (
            <p className="mt-1 text-sm text-brandGray">Click title to edit your Discogs username</p>
          )}
        </motion.div>

        <motion.button
          onClick={() => setShowCollection(!showCollection)}
          className="h-11 w-full rounded-xl bg-brandPlum px-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(26,48,74,0.25)] transition hover:-translate-y-0.5 hover:opacity-95 sm:w-auto"
          whileTap={{ scale: 0.98 }}
        >
          {showCollection ? "Switch to Randomizer" : "Open Collection"}
        </motion.button>
      </div>
    </header>
  );
}
