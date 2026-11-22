"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { birthdayData as data, BIRTHDAY_DATE } from "@/components/features/hpbd/utils/data/birthday";
import MusicToggle from "./MusicToggle.jsx";
import useAmbientMotion from "../hooks/useAmbientMotion";
import useSceneDepth from "../hooks/useSceneDepth";
import useJourneyMusic from "../hooks/useJourneyMusic";
import useHeroAnimation, { useHeroPreload } from "../hooks/useHeroAnimation";
import GiftIntro from "./GiftIntro.jsx";
import BirthdayAngel from "./BirthdayAngel.jsx";
import BirthdaySmoothScroll from "./BirthdaySmoothScroll.jsx";
import SectionParallax from "./SectionParallax.jsx";
import ScratchReveal from "./ScratchReveal.jsx";
import PolaroidAlbum from "./PolaroidAlbum.jsx";
import MakeAWish from "./MakeAWish.jsx";
import BirthdayCountdown from "./BirthdayCountdown.jsx";
import CatchHeartGame from "./CatchHeartGame.jsx";
import LoveGacha from "./LoveGacha.jsx";
import WaveText from "./WaveText.jsx";
import LoveLetter from "./LoveLetter.jsx";
import Ending from "./Ending.jsx";
import LoveUniverse from "@/components/features/hpbd/components/LoveUniverse";
import NewPromises from "./Promises.jsx";
import NewBirthdayWish from "./BirthdayWish.jsx";
import LoveRoom3D from "@/components/features/hpbd/components/LoveRoom3D/LoveRoom3D";
// import FlyingCupid from "./FlyingCupid.jsx";
import "./birthday.scss";
import "../styles/SceneDepth.scss";
import SectionTitle from "./SectionTitle.jsx";

const FLOATING_HEARTS = [
  { left: "6%", size: 22, symbol: "♡", variant: "rose", duration: 12.5, initialP: 0.08, swayAmp: 36, swayFreq: 1.6, gustAmp: 14, gustFreq: 3.1, drift: 18, bobAmp: 0.28, baseOpacity: 0.78, twirl: 0 },
  { left: "13%", size: 16, symbol: "♥", variant: "blush", duration: 14.2, initialP: 0.42, swayAmp: 48, swayFreq: 1.9, gustAmp: 18, gustFreq: 3.7, drift: -24, bobAmp: 0.34, baseOpacity: 0.72, twirl: 1 },
  { left: "21%", size: 27, symbol: "♡", variant: "peach", duration: 11.4, initialP: 0.74, swayAmp: 30, swayFreq: 1.3, gustAmp: 12, gustFreq: 2.8, drift: 26, bobAmp: 0.24, baseOpacity: 0.75, twirl: 0 },
  { left: "29%", size: 19, symbol: "❦", variant: "rose", duration: 15.0, initialP: 0.22, swayAmp: 54, swayFreq: 2.1, gustAmp: 20, gustFreq: 4.1, drift: -16, bobAmp: 0.32, baseOpacity: 0.68, twirl: 0 },
  { left: "37%", size: 24, symbol: "♡", variant: "soft", duration: 13.0, initialP: 0.58, swayAmp: 42, swayFreq: 1.7, gustAmp: 16, gustFreq: 3.3, drift: 22, bobAmp: 0.3, baseOpacity: 0.8, twirl: 0 },
  { left: "45%", size: 15, symbol: "♥", variant: "blush", duration: 10.6, initialP: 0.86, swayAmp: 28, swayFreq: 1.5, gustAmp: 11, gustFreq: 2.9, drift: -28, bobAmp: 0.26, baseOpacity: 0.7, twirl: -1 },
  { left: "53%", size: 29, symbol: "♡", variant: "rose", duration: 15.6, initialP: 0.14, swayAmp: 50, swayFreq: 1.4, gustAmp: 22, gustFreq: 3.5, drift: 14, bobAmp: 0.35, baseOpacity: 0.76, twirl: 0 },
  { left: "61%", size: 18, symbol: "♡", variant: "peach", duration: 11.8, initialP: 0.66, swayAmp: 38, swayFreq: 2.0, gustAmp: 15, gustFreq: 3.9, drift: -20, bobAmp: 0.29, baseOpacity: 0.74, twirl: 0 },
  { left: "69%", size: 25, symbol: "♥", variant: "blush", duration: 13.8, initialP: 0.34, swayAmp: 44, swayFreq: 1.8, gustAmp: 18, gustFreq: 3.2, drift: 30, bobAmp: 0.31, baseOpacity: 0.82, twirl: 1 },
  { left: "76%", size: 17, symbol: "♡", variant: "rose", duration: 10.9, initialP: 0.91, swayAmp: 32, swayFreq: 1.5, gustAmp: 13, gustFreq: 3.4, drift: -18, bobAmp: 0.25, baseOpacity: 0.72, twirl: 0 },
  { left: "83%", size: 26, symbol: "♡", variant: "peach", duration: 14.4, initialP: 0.49, swayAmp: 52, swayFreq: 1.7, gustAmp: 19, gustFreq: 3.8, drift: -26, bobAmp: 0.33, baseOpacity: 0.77, twirl: 0 },
  { left: "90%", size: 20, symbol: "♥", variant: "blush", duration: 12.2, initialP: 0.03, swayAmp: 34, swayFreq: 1.6, gustAmp: 15, gustFreq: 3.0, drift: -22, bobAmp: 0.27, baseOpacity: 0.75, twirl: -1 },
  { left: "17%", size: 14, symbol: "✦", variant: "sparkle", duration: 10.2, initialP: 0.79, swayAmp: 26, swayFreq: 2.2, gustAmp: 12, gustFreq: 4.3, drift: 16, bobAmp: 0.22, baseOpacity: 0.85, twirl: 0 },
  { left: "49%", size: 21, symbol: "♡", variant: "rose", duration: 13.4, initialP: 0.28, swayAmp: 40, swayFreq: 1.8, gustAmp: 17, gustFreq: 3.6, drift: 12, bobAmp: 0.3, baseOpacity: 0.74, twirl: 0 },
  { left: "73%", size: 15, symbol: "✦", variant: "sparkle", duration: 11.1, initialP: 0.61, swayAmp: 30, swayFreq: 2.1, gustAmp: 14, gustFreq: 4.0, drift: -14, bobAmp: 0.24, baseOpacity: 0.85, twirl: 0 },
  { left: "93%", size: 22, symbol: "♡", variant: "soft", duration: 12.9, initialP: 0.38, swayAmp: 38, swayFreq: 1.5, gustAmp: 16, gustFreq: 3.2, drift: -28, bobAmp: 0.28, baseOpacity: 0.72, twirl: 0 },
];

const smoothstep = (edge0, edge1, x) => {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const Heart = ({ config, active, index, reduceMotion }) => {
  const elementRef = useRef(null);
  const stateRef = useRef({
    progress: config.initialP,
    phase: index * 1.37,
    time: index * 2.1,
  });

  useEffect(() => {
    const el = elementRef.current;
    if (!el || reduceMotion || !active) {
      if (el) el.style.opacity = "0";
      return;
    }

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const state = stateRef.current;
      state.time += dt;

      // Tốc độ bay lên biến thiên nhẹ theo làn gió (lúc chậm rãi lơ lửng, lúc nâng lên nhanh hơn)
      const speedFactor = 1 + config.bobAmp * Math.sin(state.time * 1.15 + state.phase);
      state.progress += (dt / config.duration) * speedFactor;

      if (state.progress >= 1) {
        state.progress -= 1;
        state.phase += 1.91; // Đổi pha mỗi chu kỳ để đường bay luôn mới mẻ
      }

      const p = state.progress;
      const vh = window.innerHeight || 800;
      const startY = vh + 40;
      const endY = -60;
      const y = startY + (endY - startY) * p;

      const a1 = p * Math.PI * 2 * config.swayFreq + state.phase;
      const a2 = p * Math.PI * 2 * config.gustFreq + state.phase * 1.63;

      const x =
        config.drift * p +
        config.swayAmp * Math.sin(a1) +
        config.gustAmp * Math.sin(a2);

      // Góc nghiêng tự nhiên theo hướng gió (đạo hàm ngang)
      const vx =
        config.swayAmp * Math.cos(a1) * config.swayFreq +
        config.gustAmp * Math.cos(a2) * config.gustFreq;
      let rotate = Math.max(-28, Math.min(28, vx * 0.25));

      if (config.twirl !== 0) {
        rotate += 360 * smoothstep(0.32, 0.72, p) * config.twirl;
      }

      const fadeIn = smoothstep(0, 0.12, p);
      const fadeOut = 1 - smoothstep(0.82, 1, p);
      const shimmer = 0.9 + 0.1 * Math.sin(state.time * 2.1 + state.phase);
      const opacity = config.baseOpacity * fadeIn * fadeOut * shimmer;

      const scale =
        0.62 +
        0.38 * smoothstep(0, 0.18, p) -
        0.22 * smoothstep(0.84, 1, p) +
        0.07 * Math.sin(state.time * 2.4 + state.phase);

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [active, config, reduceMotion]);

  return (
    <span
      ref={elementRef}
      className={`floating-heart floating-heart--${config.variant}`}
      style={{
        left: config.left,
        fontSize: `${config.size}px`,
        opacity: 0,
      }}
    >
      <span className="floating-heart__inner">{config.symbol}</span>
    </span>
  );
};

const FloatingHearts = () => {
  const ref = useRef(null);
  const active = useAmbientMotion(ref);
  const reduceMotion = useReducedMotion();
  return (
    <div ref={ref} className="floating-hearts" aria-hidden="true">
      {FLOATING_HEARTS.map((config, index) => (
        <Heart
          key={index}
          index={index}
          config={config}
          active={active}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
};

const Reveal = ({ children, className = "" }) => {
  const reduceMotion = useReducedMotion();
  return (
  <motion.div
    className={className}
    initial={reduceMotion ? false : {
      opacity: 0,
      y: 40,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    viewport={{
      once: true,
      amount: 0.25,
    }}
    transition={{
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1],
    }}
  >
    {children}
  </motion.div>
  );
};

export default function BirthdayExperience() {
  useHeroPreload();
  const reduceMotion = useReducedMotion();
  const experienceRef = useRef(null);
  const [started, setStarted] = useState(false);
  const audioRef = useRef(null);
  const handleJourneyActiveChange = useJourneyMusic(audioRef);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const [cursorPortalRoot, setCursorPortalRoot] = useState(null);
  const cursorElementRef = useRef(null);
  const cursorIconRef = useRef(null);
  const cursorVisibleRef = useRef(false);
  const cursorModeRef = useRef("sparkle");
  const cursorFrameRef = useRef(0);
  const pendingCursorRef = useRef(null);
  useEffect(() => () => {
    if (cursorFrameRef.current) {
      cancelAnimationFrame(cursorFrameRef.current);
    }
    delete document.body.dataset.birthdayCursorActive;
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCursorPortalRoot(document.body);
  }, []);

  const hideCustomCursor = () => {
    pendingCursorRef.current = null;
    if (cursorFrameRef.current) {
      cancelAnimationFrame(cursorFrameRef.current);
      cursorFrameRef.current = 0;
    }
    if (cursorVisibleRef.current) {
      cursorVisibleRef.current = false;
      if (cursorElementRef.current) cursorElementRef.current.style.visibility = "hidden";
      if (experienceRef.current) experienceRef.current.dataset.cursorActive = "false";
      document.body.dataset.birthdayCursorActive = "false";
    }
  };

  const handlePagePointerMove = (event) => {
    if (event.pointerType !== "mouse" || reduceMotion) {
      hideCustomCursor();
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    const nativeCursorTarget = target?.closest(
      "input, textarea, select, [contenteditable='true'], canvas, [data-native-cursor='true']",
    );
    if (nativeCursorTarget) {
      hideCustomCursor();
      return;
    }

    pendingCursorRef.current = { x: event.clientX, y: event.clientY, target };
    if (cursorFrameRef.current) return;
    cursorFrameRef.current = requestAnimationFrame(() => {
      cursorFrameRef.current = 0;
      const pending = pendingCursorRef.current;
      if (!pending) return;
      const mode = pending.target?.closest("[data-dragging='true']")
        ? "drag"
        : pending.target?.closest(".polaroid-album__photo")
          ? "zoom"
          : pending.target?.closest(".polaroid-album__card")
            ? "drag"
            : pending.target?.closest("button, a, [role='button']")
              ? "heart"
              : "sparkle";

      const cursorElement = cursorElementRef.current;
      if (cursorElement) {
        cursorElement.style.transform = `translate3d(${pending.x}px, ${pending.y}px, 0)`;
        cursorElement.style.visibility = "visible";
      }
      if (!cursorVisibleRef.current) {
        cursorVisibleRef.current = true;
        if (experienceRef.current) experienceRef.current.dataset.cursorActive = "true";
        document.body.dataset.birthdayCursorActive = "true";
      }
      if (cursorModeRef.current !== mode) {
        cursorModeRef.current = mode;
        if (cursorElementRef.current) cursorElementRef.current.dataset.mode = mode;
        if (cursorIconRef.current) {
          cursorIconRef.current.textContent =
            mode === "zoom" ? "⌕" : mode === "drag" ? "✋" : mode === "heart" ? "♡" : "✦";
        }
      }
    });
  };

  const handlePagePointerLeave = (event) => {
    if (!event.pointerType || event.pointerType === "mouse") hideCustomCursor();
  };

  const playMusic = () => {
    setMusicError(false);
    audioRef.current?.play().catch((error) => {
      if (error.name !== "AbortError") setMusicError(true);
    });
  };

  const openGift = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.currentTime = 0;
      playMusic();
    }

  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) playMusic();
    else audioRef.current.pause();
  };

  const startExperience = useCallback(() => {
    // A short screen may have scrolled the intro down to reach the gift button.
    window.scrollTo({ top: 0, behavior: "instant" });
    setStarted(true);
  }, []);

  const handleMemoryAudioChange = useCallback((isPlaying) => {
    if (!audioRef.current) return;

    audioRef.current.volume = isPlaying ? 0.1 : 0.3;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  return (
    <main
      ref={experienceRef}
      className="birthday"
      id="birthday-top"
      data-cursor-active="false"
      onPointerMove={handlePagePointerMove}
      onPointerLeave={handlePagePointerLeave}
    >
      <BirthdaySmoothScroll enabled={started} />
      {cursorPortalRoot && !reduceMotion && createPortal(
        <div
          ref={cursorElementRef}
          className="birthday__custom-cursor"
          data-mode="sparkle"
          style={{ visibility: "hidden" }}
          aria-hidden="true"
        >
          <span ref={cursorIconRef} className="birthday__custom-cursor-icon">✦</span>
        </div>,
        cursorPortalRoot,
      )}
      <audio
        ref={audioRef}
        src="/audio/beautiful_in_white.mp3"
        preload="none"
        loop
        onPlay={() => setMusicPlaying(true)}
        onPause={() => setMusicPlaying(false)}
        onError={() => { setMusicPlaying(false); setMusicError(true); }}
      />

      {started && <MusicToggle playing={musicPlaying} onToggle={toggleMusic} error={musicError} />}

      <FloatingHearts />

        {!started ? (
          <GiftIntro
            key="intro"
            intro={data.intro}
            onOpen={openGift}
            onComplete={startExperience}
          />
        ) : (
          <div key="content">
            <SectionParallax rootRef={experienceRef} />
            <Hero />
            
            <SectionConnector variant="letter" />
            <BirthdayCountdown birthday={BIRTHDAY_DATE} />

            {/* <Memories /> */}

            <SectionConnector variant="flower" />
            <LoveUniverse />

            <SectionConnector variant="branch" />
            <PolaroidAlbum onMemoryAudioChange={handleMemoryAudioChange} />

            <SectionConnector variant="letter" />
            <Timeline />

            <SectionConnector variant="flower" />
            <ScratchReveal />

            <SectionConnector variant="branch" />
            <LoveLetter paragraphs={data.letter} />

            <SectionConnector variant="letter" />
            <ThingsILove />

            {/* <Promises /> */}
            <SectionConnector variant="flower" />
            <NewPromises data={data} />

            {/* <BirthdayWish /> */}
            <SectionConnector variant="branch" />
            <NewBirthdayWish data={data} />

            <SectionConnector variant="flower" />
            <CatchHeartGame />

            <SectionConnector variant="letter" />
            <LoveGacha />

            <SectionConnector variant="branch" />
            <MakeAWish />

            <SectionConnector variant="flower" />
            <LoveRoom3D />

            <SectionConnector variant="letter" />
            <Ending onJourneyActiveChange={handleJourneyActiveChange} />
          </div>
        )}
    </main>
  );
}

function Hero() {
  const heroRef = useRef(null);
  useSceneDepth(heroRef);

  useHeroAnimation(heroRef);

  return (
    <section ref={heroRef} className="hero section-dark">
      <div className="hero__star-depth" aria-hidden="true">
      <div className="hero__stars">
        {stars.map((star, index) => (
          <span key={index} style={{ left: star.left, top: star.top }} />
        ))}
      </div>
      </div>

      <div className="hero__content">
        {/* ANGEL */}
        <div className="hero__angel">
          <div className="hero__angel-depth">
          <BirthdayAngel />
          </div>
        </div>
        {/* <FlyingCupid /> */}

        <span className="eyebrow hero__date">19 · 12 · 2026</span>

        <h1 aria-label="Happy Birthday!">
          {["Happy", "Birthday!"].map((word) => (
            <span className="hero__title-line" key={word} aria-hidden="true">
              {Array.from(word).map((character, index) => (
                <span className="hero__title-char" key={`${word}-${index}`}>
                  {character}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <div className="hero__heart"><span className="hero__heart-depth">♡</span></div>

        <p className="hero__description">{data.hero.description}</p>

        <div className="hero__photo-depth">
        <div className="hero__couple">
          <Image src="/images/bg.jpg" alt="Kỷ niệm của chúng mình" width={600} height={380} sizes="(max-width: 600px) 80vw, 300px" loading="eager" />
        </div>
        </div>

        <span className="scroll-text">Cuộn xuống để xem món quà ↓</span>
      </div>
    </section>
  );
}

function Memories() {
  return (
    <section className="memories section-paper">
      <Reveal>
        <SectionTitle
          small="Our Memories"
          title="Những khoảnh khắc"
          subtitle="đẹp nhất của chúng mình ♡"
        />
      </Reveal>

      <div className="polaroid-grid">
        {data.memories.map((memory, index) => (
          <motion.article
            className={`polaroid polaroid--${index + 1}`}
            key={memory.title}
            initial={{
              opacity: 0,
              y: 50,
              rotate: index % 2 ? 5 : -5,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              rotate: index % 2 ? 2 : -2,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: index * 0.15,
            }}
            whileHover={{
              rotate: 0,
              scale: 1.04,
              zIndex: 10,
            }}
          >
            <div className="tape" />

            <img src={memory.image} alt={memory.title} />

            <p>{memory.title}</p>

            <span>♡</span>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

const LOVE_TIMELINE_PATH = "M50 0 C25 70,25 120,50 175 C75 230,75 280,50 350 C25 420,25 470,50 535 C75 600,75 650,50 720";

function Timeline() {
  const sectionRef = useRef(null);
  useSceneDepth(sectionRef);
  const isNear = useInView(sectionRef, { once: true, margin: "600px 0px" });

  useEffect(() => {
    if (!isNear) return;

    let disposed = false;
    let media;

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (disposed || !sectionRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const section = sectionRef.current;
        const content = section.querySelector(".love-timeline__content");
        const svg = section.querySelector(".love-timeline__path");
        const path = section.querySelector(".love-timeline__progress-path");
        const traveler = section.querySelector(".love-timeline__traveler");
        const items = [...section.querySelectorAll(".love-timeline__item")];
        const length = path.getTotalLength();
        const journey = { progress: 0 };
        let geometry;

        gsap.set(traveler, { xPercent: -50, yPercent: -50, opacity: 1 });
        const setX = gsap.quickSetter(traveler, "x", "px");
        const setY = gsap.quickSetter(traveler, "y", "px");

        const updateJourney = () => {
          if (!geometry) return;
          const point = path.getPointAtLength(length * journey.progress);
          const y = geometry.top + point.y * geometry.scaleY;
          setX(geometry.left + point.x * geometry.scaleX);
          setY(y);
          items.forEach((item, index) => {
            item.classList.toggle("is-reached", y >= geometry.milestones[index]);
          });
        };

        // Chỉ đo lại bố cục khi refresh/resize, không đọc layout mỗi khung hình.
        const measureJourney = () => {
          const svgRect = svg.getBoundingClientRect();
          const contentRect = content.getBoundingClientRect();
          geometry = {
            left: svgRect.left - contentRect.left,
            top: svgRect.top - contentRect.top,
            scaleX: svgRect.width / 100,
            scaleY: svgRect.height / 720,
            milestones: items.map((item) => item.offsetTop + item.offsetHeight / 2),
          };
          updateJourney();
        };

        measureJourney();

        gsap.timeline({
          defaults: { duration: 1, ease: "none" },
          scrollTrigger: {
            trigger: content,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 0.45,
            invalidateOnRefresh: true,
            onRefresh: measureJourney,
          },
        })
          .fromTo(path,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0 }, 0,
          )
          .to(journey, { progress: 1, onUpdate: updateJourney }, 0);

        items.forEach((item, index) => {
          const photo = item.querySelector(".love-timeline__photo");
          const heart = item.querySelector(".love-timeline__heart");
          const text = item.querySelector(".love-timeline__text");

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              end: "center 60%",
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          })
            .from(photo, { opacity: 0, x: index % 2 ? 24 : -24, y: 24, rotation: index % 2 ? 6 : -6, scale: 0.94, duration: 0.6 })
            .from(heart, { opacity: 0, scale: 0.3, duration: 0.35 }, 0.2)
            .from(text, { opacity: 0, y: 18, duration: 0.5 }, 0.35);

          gsap.fromTo(photo.querySelector("img"),
            { yPercent: -3, scale: 1.1 },
            {
              yPercent: 3,
              scale: 1.1,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });

        gsap.from(".love-timeline__epilogue", {
          opacity: 0,
          y: 20,
          scrollTrigger: {
            trigger: ".love-timeline__epilogue",
            start: "top 95%",
            end: "top 75%",
            scrub: 0.45,
          },
        });

        return () => items.forEach((item) => item.classList.remove("is-reached"));
      }, sectionRef);

      document.fonts.ready.then(() => {
        if (!disposed) ScrollTrigger.refresh();
      });
    };

    setup().catch((error) => {
      media?.revert();
      console.warn("Không thể khởi tạo hiệu ứng dòng thời gian:", error);
    });

    return () => {
      disposed = true;
      media?.revert();
    };
  }, [isNear]);

  return (
    <section ref={sectionRef} className="love-timeline">
      <Reveal className="love-timeline__header">
        <span>OUR STORY</span>

        <h2 data-parallax="heading">Hành trình yêu xa của chúng mình ♡</h2>
      </Reveal>

      <div className="love-timeline__content">
        {/* Đường timeline cong */}
        <svg
          className="love-timeline__path"
          viewBox="0 0 100 720"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="love-timeline__track"
            d={LOVE_TIMELINE_PATH}
            fill="none"
            stroke="#edcbd2"
            strokeWidth="1.2"
            strokeDasharray="3 5"
          />
          <path
            className="love-timeline__progress-path"
            d={LOVE_TIMELINE_PATH}
            fill="none"
            stroke="#ec9eaa"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        <span className="love-timeline__traveler" aria-hidden="true">♥</span>

        {data.timeline.map((item, index) => {
          const image =
            item.image || `/images/timelines/timeline-0${(index % 4) + 1}.jpg`;

          return (
            <article
              key={`${item.title}-${index}`}
              className={`love-timeline__item ${
                index % 2 === 0
                  ? "love-timeline__item--left"
                  : "love-timeline__item--right"
              }`}
            >
              {/* Ảnh */}
              <div
                className="love-timeline__photo"
              >
                <div className="love-timeline__photo-depth">
                <span className="love-timeline__tape" />

                <div className="love-timeline__image-window">
                  <Image src={image} alt={item.title} width={600} height={700} sizes="(max-width: 600px) 42vw, 300px" />
                </div>
                </div>
              </div>

              {/* Tim nằm giữa timeline */}
              <div
                className="love-timeline__heart"
              >
                <img src="/heart.svg" alt="Heart" />
              </div>

              {/* Nội dung */}
              <div className="love-timeline__text" data-parallax="text">
                <span className="love-timeline__number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="love-timeline__epilogue" data-parallax="text">
        <span aria-hidden="true">✧ ♡ ✧</span>
        <p>Dù gần hay xa, anh vẫn luôn hướng về em.</p>
        <span>Câu chuyện tụi mình vẫn sẽ được viết tiếp ♡</span>
      </div>

      <motion.div
        className="love-timeline__scroll"
        animate={{
          y: [0, 7, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        ↓
      </motion.div>
    </section>
  );
}

function NoteDepth({ children }) {
  const ref = useRef(null);
  useSceneDepth(ref);

  return (
    <div ref={ref} className="note-depth-track" data-parallax="media">
      <div className="note-depth">{children}</div>
    </div>
  );
}

function ThingsILove() {
  const sectionRef = useRef(null);
  const isNear = useInView(sectionRef, { once: true, margin: "600px 0px" });
  const reduceMotion = useReducedMotion();
  const noteColors = ["pink", "cream", "lavender", "peach", "mint", "rose"];

  const noteRotations = [-5, 4, -3, 5, -4, 3];

  useEffect(() => {
    if (!isNear) return;

    let disposed = false;
    let media;

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || !sectionRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      media = gsap.matchMedia();
      media.add({
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 901px)",
        tablet: "(min-width: 601px) and (max-width: 900px)",
        mobile: "(max-width: 600px)",
      }, (context) => {
        if (!context.conditions.motion) return;

        const section = sectionRef.current;
        const notes = [...section.querySelectorAll(".note-reveal")];
        const columns = context.conditions.desktop ? 3 : context.conditions.tablet ? 2 : 1;

        // Reveal each row when it enters view, so mobile cards don't finish offscreen.
        for (let index = 0; index < notes.length; index += columns) {
          const row = notes.slice(index, index + columns);
          const tape = row.map((note) => note.querySelector(".note__tape"));
          const pins = row.map((note) => note.querySelector(".note__pin"));

          gsap.timeline({
            defaults: { ease: "power3.out" },
            // Keep completed triggers registered until context cleanup. Removing
            // them during matchMedia refresh can invalidate GSAP's refresh list.
            scrollTrigger: { trigger: row[0], start: "top 88%", toggleActions: "play none none none" },
          })
            .fromTo(row, {
              opacity: 0, y: columns === 1 ? 30 : 44, z: -65, transformPerspective: 1000, scale: 0.96,
              rotation: (itemIndex) => (index + itemIndex) % 2 ? 5 : -5,
            }, {
              opacity: 1, y: 0, z: 0, scale: 1, rotation: 0,
              duration: 0.85, stagger: 0.16,
            })
            .from(tape, { opacity: 0, scaleX: 0.5, duration: 0.4, stagger: 0.16 }, 0.35)
            .from(pins, { opacity: 0, scale: 0.3, duration: 0.4, stagger: 0.16, ease: "back.out(1.4)" }, 0.5);
        }

        [".things__intro", ".things__footer"].forEach((selector) => {
          const element = section.querySelector(selector);
          if (!element) return;
          gsap.from(element, {
            opacity: 0, y: 18, duration: 0.75, ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 92%", toggleActions: "play none none none" },
          });
        });
      }, sectionRef);
    };

    setup().catch((error) => {
      media?.revert();
      console.warn("Không thể khởi tạo hiệu ứng giấy ghi chú:", error);
    });

    return () => {
      disposed = true;
      media?.revert();
    };
  }, [isNear]);

  return (
    <section ref={sectionRef} className="things section-paper">
      <div className="things__decoration things__decoration--one" data-parallax="decoration">✦</div>
      <div className="things__decoration things__decoration--two" data-parallax="decoration">♡</div>

      <Reveal>
        <SectionTitle
          small="What I Love"
          title="Những điều"
          subtitle="anh yêu ở em ♡"
        />
      </Reveal>

      <div className="things__intro-parallax" data-parallax="text">
        <p className="things__intro">
        Có rất nhiều điều nhỏ ở em khiến anh yêu em nhiều hơn mỗi ngày...
      </p>
      </div>

      <div className="notes">
        {data.thingsILove.map((item, index) => {
          const rotation = noteRotations[index % noteRotations.length];

          const color = noteColors[index % noteColors.length];

          return (
            <div className="note-reveal" key={`${item}-${index}`}>
              <NoteDepth>
              <motion.div
                className={`note note--${color}`}
                style={{
                  "--note-rotation": `${rotation}deg`,
                  rotate: rotation,
                }}
                whileHover={reduceMotion ? undefined : {
                  y: -14,
                  scale: 1.07,
                  rotate: 0,
                  zIndex: 10,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                  },
                }}
                whileTap={reduceMotion ? undefined : {
                  scale: 0.97,
                }}
              >
                <span className="note__tape" aria-hidden="true" />

                <span className="note__pin" aria-hidden="true">
                  ♥
                </span>

                <span className="note__number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="note__content">
                  <WaveText text={item} />
                </span>

                <span className="note__heart" aria-hidden="true">
                  ♡
                </span>

                <span className="note__bottom">a little thing I love</span>
              </motion.div>
              </NoteDepth>
            </div>
          );
        })}
      </div>

      <div className="things__footer-parallax" data-parallax="text">
        <div className="things__footer">
        <span>♡</span>
        <p>Và còn hàng nghìn điều khác nữa...</p>
        <span>♡</span>
      </div>
      </div>
    </section>
  );
}

const stars = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 53) % 100}%`,
  duration: 2 + (index % 4),
  delay: index * 0.15,
}));

function SectionConnector({ variant = "flower" }) {
  const connectorRef = useRef(null);
  const isNear = useInView(connectorRef, { once: true, margin: "600px 0px" });
  const isInView = useInView(connectorRef, {
    amount: 0.1,
    once: false,
  });
  const connectorId = useId().replace(/:/g, "");
  const pathId = `section-connector-path-${connectorId}`;
  const animationDuration = 18;
  const pulseInterval = 2.4;
  const trailCycleDuration = pulseInterval * 3;
  const startOffset = Array.from(connectorId).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  ) % animationDuration;

  useEffect(() => {
    if (!isNear) return;

    let disposed = false;
    let media;

    const setup = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || !connectorRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const connector = connectorRef.current;
        const stem = connector.querySelector(".section-connector__stem");
        const twigs = connector.querySelectorAll(".section-connector__twig");
        const ornaments = connector.querySelectorAll(".section-connector__ornament");
        const trail = connector.querySelector(".section-connector__heart-trail");
        const length = stem.getTotalLength();

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: connector,
            start: "top 92%",
            end: "top 55%",
            scrub: 0.7,
            onLeave: (trigger) => {
              trigger.animation?.progress(1);
              trigger.disable(false);
            },
          },
        });

        timeline.fromTo(stem,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.7 }, 0,
        );

        twigs.forEach((twig, index) => {
          const twigLength = twig.getTotalLength();
          timeline.fromTo(twig,
            { strokeDasharray: twigLength, strokeDashoffset: twigLength },
            { strokeDashoffset: 0, duration: 0.2 }, 0.25 + index * 0.3,
          );
        });

        if (ornaments.length) {
          timeline.fromTo(ornaments,
            { opacity: 0, scale: 0.3, transformOrigin: "50% 50%" },
            { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: "power2.out" },
            0.45,
          );
        }

        timeline.fromTo(trail, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.85);
      }, connectorRef);
    };

    setup().catch((error) => {
      media?.revert();
      console.warn("Không thể khởi tạo hiệu ứng đường nối:", error);
    });

    return () => {
      disposed = true;
      media?.revert();
    };
  }, [isNear, variant]);

  return (
    <div
      ref={connectorRef}
      className={`section-connector section-connector--${variant}`}
      data-animation-active={isInView ? "true" : "false"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 640 100" role="presentation">
        <path
          id={pathId}
          className="section-connector__stem"
          d="M25 51 C145 18 215 82 320 50 S495 18 615 51"
        />

        <g className="section-connector__heart-trail">
          <g
            className="section-connector__heart section-connector__heart--main"
            style={{ animationDelay: `-${startOffset % pulseInterval}s` }}
          >
            <animateMotion
              dur={`${animationDuration}s`}
              begin={`-${startOffset}s`}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
            <path d="M0 -3 C-6 -10 -14 -5 -12 1 C-10 7 0 12 0 12 C0 12 10 7 12 1 C14 -5 6 -10 0 -3Z" />
          </g>

          {[0, 1, 2].map((trailIndex) => (
            <g
              key={trailIndex}
              className={`section-connector__heart section-connector__heart--trail-${trailIndex}`}
              style={{ animationDelay: `-${startOffset % trailCycleDuration}s` }}
            >
              <animateMotion
                dur={`${animationDuration}s`}
                begin={`-${(startOffset - (trailIndex + 1) * 0.6 + animationDuration) % animationDuration}s`}
                repeatCount="indefinite"
                rotate="auto"
              >
                <mpath href={`#${pathId}`} />
              </animateMotion>
              <path d="M0 -3 C-6 -10 -14 -5 -12 1 C-10 7 0 12 0 12 C0 12 10 7 12 1 C14 -5 6 -10 0 -3Z" />
            </g>
          ))}
        </g>

        {variant === "branch" && (
          <>
            <path className="section-connector__twig" d="M166 48 C172 27 187 21 203 13" />
            <path className="section-connector__twig" d="M474 52 C468 73 453 80 437 87" />
            <g className="section-connector__ornament">
              <ellipse className="section-connector__leaf" cx="195" cy="18" rx="12" ry="5" transform="rotate(-28 195 18)" />
              <ellipse className="section-connector__leaf section-connector__leaf--soft" cx="210" cy="29" rx="10" ry="4" transform="rotate(32 210 29)" />
            </g>
            <g className="section-connector__ornament">
              <ellipse className="section-connector__leaf" cx="445" cy="82" rx="12" ry="5" transform="rotate(-28 445 82)" />
              <ellipse className="section-connector__leaf section-connector__leaf--soft" cx="430" cy="70" rx="10" ry="4" transform="rotate(32 430 70)" />
            </g>
          </>
        )}

        {variant === "flower" && (
          <>
            <g className="section-connector__ornament" transform="translate(178 25)">
              <g className="section-connector__flower section-connector__flower--first">
                <circle cx="0" cy="-8" r="7" />
                <circle cx="8" cy="0" r="7" />
                <circle cx="0" cy="8" r="7" />
                <circle cx="-8" cy="0" r="7" />
                <circle className="section-connector__flower-center" cx="0" cy="0" r="4" />
              </g>
            </g>
            <g className="section-connector__ornament" transform="translate(462 73)">
              <g className="section-connector__flower section-connector__flower--second">
                <circle cx="0" cy="-7" r="6" />
                <circle cx="7" cy="0" r="6" />
                <circle cx="0" cy="7" r="6" />
                <circle cx="-7" cy="0" r="6" />
                <circle className="section-connector__flower-center" cx="0" cy="0" r="3.5" />
              </g>
            </g>
          </>
        )}

        {variant === "letter" && (
          <g className="section-connector__ornament" transform="translate(292 29)">
            <g className="section-connector__envelope">
              <rect x="0" y="0" width="56" height="40" rx="5" />
              <path className="section-connector__envelope-flap" d="M2 5 L28 25 L54 5" />
              <path d="M2 36 L20 20" />
              <path d="M54 36 L36 20" />
              <path className="section-connector__seal" d="M28 34 l3 3 l-3 3 l-3-3 z" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
