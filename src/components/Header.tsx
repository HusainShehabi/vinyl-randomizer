"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  showCollection: boolean;
  setShowCollection: (show: boolean) => void;
}

export default function Header({ showCollection, setShowCollection }: HeaderProps) {
  const DEFAULT_USERNAME = "HusainShehabi";
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [editing, setEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState("");

  // On mount, load the username from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  // Only enable edit on header click when not already editing
  const handleEditClick = () => {
    if (!editing) {
      setTempUsername(username);
      setEditing(true);
    }
  };

  // Save the username and exit edit mode
  const handleSave = () => {
    setUsername(tempUsername);
    localStorage.setItem("username", tempUsername);
    setEditing(false);
  };

  // Cancel editing and revert to display mode
  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white shadow-md">
      <motion.h1
        className="w-full sm:w-auto text-lg sm:text-2xl font-bold text-brandPlum cursor-pointer truncate"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleEditClick}
      >
        {editing ? (
          <span className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              className="w-full flex-1 text-lg sm:text-2xl font-bold text-brandPlum p-1 border border-gray-300 rounded focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent header onClick 
                  handleSave();
                }}
                className="px-2 py-1 border border-green-900 rounded text-green-900 text-sm sm:text-base"
              >
                Save
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent header onClick
                  handleCancel();
                }}
                className="px-2 py-1 border border-red-500 text-red-500 rounded text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </span>
        ) : (
          <>
            {username}&#39;s Vinyl {showCollection ? "Collection" : "Randomizer"}
          </>
        )}
      </motion.h1>

      <motion.button
        onClick={() => setShowCollection(!showCollection)}
        className="mt-2 sm:mt-0 px-3 py-2 sm:px-4 sm:py-2 bg-brandPlum text-white text-sm sm:text-base font-medium rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {showCollection ? "🎲 Randomizer" : "📀 View Collection"}
      </motion.button>
    </header>
  );
}
