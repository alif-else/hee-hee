"use client";

import Script from "next/script";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./page.module.css";

const POEM_LINES = [
  "The woods are lovely, dark and deep,",
  "But I have promises to keep,",
  "And miles to go before I sleep,",
  "And miles to go before I sleep,",
];
const STATIC_POEM_LINES = POEM_LINES.slice(0, 2);
const ANIMATED_POEM_LINES = POEM_LINES.slice(2);
const TOTAL_ANIMATED_CHARACTERS = ANIMATED_POEM_LINES.reduce(
  (total, line) => total + line.length,
  0,
);

const LOADER_SEEN_KEY = "hee-hee-loader-complete";
const LOADER_COMPLETE_EVENT = "hee-hee-loader-complete";

type PagePhase = "checking" | "loading" | "image";

function subscribeToPagePhase(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOADER_COMPLETE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOADER_COMPLETE_EVENT, onChange);
  };
}

function getPagePhase(): PagePhase {
  return window.localStorage.getItem(LOADER_SEEN_KEY) === "true"
    ? "image"
    : "loading";
}

function getServerPagePhase(): PagePhase {
  return "checking";
}

export default function HomeExperience() {
  const phase = useSyncExternalStore(
    subscribeToPagePhase,
    getPagePhase,
    getServerPagePhase,
  );
  const [animatedLines, setAnimatedLines] = useState<string[]>(
    ANIMATED_POEM_LINES.map(() => ""),
  );
  const [activeAnimatedLine, setActiveAnimatedLine] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "loading") return;

    let active = true;
    let lineIndex = 0;
    let characterIndex = 0;
    let timer: number;

    const typeNextCharacter = () => {
      if (!active) return;

      const currentLine = ANIMATED_POEM_LINES[lineIndex];
      if (characterIndex < currentLine.length) {
        characterIndex += 1;
        setAnimatedLines((lines) =>
          lines.map((line, index) =>
            index === lineIndex
              ? currentLine.slice(0, characterIndex)
              : line,
          ),
        );
        const completedCharacters = ANIMATED_POEM_LINES.slice(0, lineIndex)
          .reduce((total, line) => total + line.length, 0) + characterIndex;
        setProgress(
          Math.round((completedCharacters / TOTAL_ANIMATED_CHARACTERS) * 100),
        );
        timer = window.setTimeout(typeNextCharacter, 72);
        return;
      }

      if (lineIndex < ANIMATED_POEM_LINES.length - 1) {
        timer = window.setTimeout(() => {
          if (!active) return;
          lineIndex += 1;
          characterIndex = 0;
          setActiveAnimatedLine(lineIndex);
          typeNextCharacter();
        }, 650);
        return;
      }

      timer = window.setTimeout(() => {
        if (!active) return;
        window.localStorage.setItem(LOADER_SEEN_KEY, "true");
        window.dispatchEvent(new Event(LOADER_COMPLETE_EVENT));
      }, 1100);
    };

    timer = window.setTimeout(typeNextCharacter, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [phase]);

  if (phase === "checking") {
    return <main className={styles.page} />;
  }

  if (phase === "loading") {
    return (
      <main className={`${styles.page} ${styles.loaderPage}`}>
        <Script src="/pine-loader.js" strategy="afterInteractive" />
        <div className={styles.loaderIcon}>
          <canvas
            id="pineLoaderCanvas"
            className={styles.loaderCanvas}
            width={160}
            height={136}
            aria-label="A pixel-art snowy pine forest floating island"
            role="img"
          />
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-label="Loading image"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span
              className={styles.progressIndicator}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className={styles.poem} aria-label="A poem typing line by line">
          {STATIC_POEM_LINES.map((line) => (
            <div className={styles.poemLine} key={line}>
              {line}
            </div>
          ))}
          {animatedLines.map((line, index) => (
            <div className={styles.poemLine} key={`animated-${index}`}>
              {line}
              {activeAnimatedLine === index && (
                <span className={styles.caret} aria-hidden="true">
                  _
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Image
        className={styles.image}
        src="/quote-meme.jpeg"
        alt="A four-panel manga meme about loving the ordinary"
        width={447}
        height={447}
        unoptimized
        priority
      />
    </main>
  );
}
