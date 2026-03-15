"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

const DURATION = 0.3;
const EASE_OUT = "easeOut";

const VideoTransition = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.play();

    const onTimeUpdate = () => {
      if (v.duration) setProgress(v.currentTime / v.duration);
    };

    const onEnded = () => {
      setFadeOut(true);
      setTimeout(() => {
        window.location.href = "https://0-2-xi.vercel.app";
      }, 800);
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <motion.div
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 bg-black z-50"
    >
      {/* Video */}
      <video
        ref={videoRef}
        src="/video.mp4"
        playsInline
        className="absolute inset-0 w-full h-full object-contain md:object-cover"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Progress bar — thin stripe at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-10">
        <motion.div
          className="h-full bg-white/70"
          style={{ width: `${progress * 100}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
};

export const Newsletter = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!videoOpen ? (
        <motion.div
          key="hero"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: DURATION, ease: EASE_OUT }}
          className="flex overflow-hidden relative flex-col gap-4 justify-center items-center pt-10 w-full h-full short:lg:pt-10 pb-footer-safe-area 2xl:pt-footer-safe-area px-sides short:lg:gap-4 lg:gap-8"
        >
          <motion.div layout="position" transition={{ duration: DURATION, ease: EASE_OUT }}>
            <h1 className="font-serif text-5xl italic short:lg:text-8xl sm:text-8xl lg:text-9xl text-foreground">
              Water-IQ
            </h1>
          </motion.div>
          <Button className="relative px-8" shine onClick={() => setVideoOpen(true)}>
            Proceed
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="fixed inset-0 z-50"
        >
          <VideoTransition />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
