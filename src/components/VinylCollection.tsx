
import React from "react";
import { motion } from "framer-motion";

type VinylCollectionProps = {
    records: { title: string; artists?: { name: string }[] }[];
    onClose: () => void;
}

export default function VinylCollection({records, onClose}: VinylCollectionProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-bold text-brandPlum mb-4">My Vinyl Collection</h2>
            
            <div className="overflow-y-auto max-h-64 border-t border-b">
              <ul>
                {records.map((rec, index) => (
                  <li key={index} className="py-2 border-b text-brandGray">
                    <span className="font-semibold">{rec.title}</span> - {rec.artists?.[0]?.name || "Unknown Artist"}
                  </li>
                ))}
              </ul>
            </div>
    
            <button
              className="mt-4 px-4 py-2 bg-brandOrange text-white rounded hover:bg-brandRed transition"
              onClick={onClose}
            >
              Close
            </button>
          </motion.div>
        </div>
      );
    };
 
