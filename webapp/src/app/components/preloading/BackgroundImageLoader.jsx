"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BackgroundImageLoader({ imageUrl, children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      setIsLoaded(true);
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${imageUrl}`);
      setError("Failed to load background image");
      setIsLoaded(true);
    };

    const timeout = setTimeout(() => {
      if (!isLoaded) {
        console.warn(`Image load timeout for: ${imageUrl}`);
        setIsLoaded(true);
      }
    }, 5000);

    return () => {
      img.onload = null;
      img.onerror = null;
      clearTimeout(timeout);
    };
  }, [imageUrl]);

  return (
    <div className="w-full h-screen" data-nav-theme="dark">
      {!isLoaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white">
          <motion.div
            className="w-12 h-12 border-4 border-t-transparent border-black rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
      )}

      {error && isLoaded && (
        <div className="absolute top-0 left-0 p-2 text-red-500 bg-black/50 z-40">
          {error}
        </div>
      )}

      {/* Content with fade-in animation */}
      <motion.div
        className="w-full h-screen bg-cover bg-no-repeat flex flex-col"
        style={{
          backgroundImage: isLoaded && !error ? `url(${imageUrl})` : "none",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
