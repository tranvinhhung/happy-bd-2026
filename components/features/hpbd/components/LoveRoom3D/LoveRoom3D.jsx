"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";

import { ROOM_STORY } from "./roomStory";
import CinematicEnding from "./CinematicEnding";
import LoveCornerMessage from "./LoveCornerMessage";
import styles from "../../styles/LoveRoom3D.module.scss";
import SectionTitle from "../SectionTitle";
import CoupleActionButtons from "./CoupleActionButtons";
import { usePageVisible } from "../../hooks/useAmbientMotion";
import RoomScene2D from "./RoomScene2D";
import RoomEndingEffects from "./RoomEndingEffects";
import useRoomMode from "../../hooks/useRoomMode";
import RoomSceneBoundary from "./RoomSceneBoundary";

const RoomScene = dynamic(() => import("./RoomScene"), {
  ssr: false,
  loading: () => (
    <div className={styles.loading}>
      Đang mở cánh cửa vào thế giới nhỏ của chúng mình... ♡
    </div>
  ),
});

export default function LoveRoom3D() {
  const [viewMode, setViewMode] = useRoomMode();
  const pageVisible = usePageVisible();
  const [chapter, setChapter] = useState(0);
  const [activeStory, setActiveStory] = useState(null);
  const [isNight, setIsNight] = useState(true);
  const [isHugging, setIsHugging] = useState(false);
  const [cameraTarget, setCameraTarget] = useState("default");
  const [cameraVersion, setCameraVersion] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [cakeBlownOut, setCakeBlownOut] = useState(false);
  const [cinematicResetKey, setCinematicResetKey] = useState(0);
  const [cornerMessage, setCornerMessage] = useState(null);
  const [coupleAction, setCoupleAction] = useState(null);
  const [coupleActionVersion, setCoupleActionVersion] = useState(0);
  const [hintedChapter, setHintedChapter] = useState(null);

  // Cinematic
  const [cinematicActive, setCinematicActive] = useState(false);
  const [cinematicProgress, setCinematicProgress] = useState(0);
  const [cinematicMessage, setCinematicMessage] = useState(false);

  const cinematicIntervalRef = useRef(null);
  const cinematicMessageTimerRef = useRef(null);
  const sectionRef = useRef(null);
  const sceneWrapperRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const currentStory = ROOM_STORY[chapter];

  const chooseCoupleAction = (action) => {
    switch (action) {
      case "cinematic":
        startCinematic();
        return;
    }
    setCoupleAction(action);
    setCoupleActionVersion((value) => value + 1);
  };

  const clearCinematicTimers = useCallback(() => {
    if (cinematicIntervalRef.current !== null) {
      clearInterval(cinematicIntervalRef.current);
      cinematicIntervalRef.current = null;
    }

    if (cinematicMessageTimerRef.current !== null) {
      clearTimeout(cinematicMessageTimerRef.current);
      cinematicMessageTimerRef.current = null;
    }
  }, []);

  const handleCornerInteract = useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    (type) => {
      if (cinematicActive || activeStory) return;

      setCornerMessage(type);
    },
    [cinematicActive, activeStory],
  );

  const startCinematic = useCallback(() => {
    setCornerMessage(null);
    clearCinematicTimers();

    setCinematicResetKey((value) => value + 1);
    setActiveStory(null);
    setCinematicActive(true);
    setCinematicProgress(0);
    setCinematicMessage(false);

    const startTime = performance.now();

    cinematicIntervalRef.current = setInterval(() => {
      const seconds = (performance.now() - startTime) / 1000;

      setCinematicProgress(Math.min(seconds, 12));

      if (seconds >= 12) {
        clearInterval(cinematicIntervalRef.current);
        cinematicIntervalRef.current = null;
      }
    }, 50);

    cinematicMessageTimerRef.current = setTimeout(() => {
      setCinematicMessage(true);
    }, 9000);
  }, [clearCinematicTimers]);

  const closeCinematic = useCallback(() => {
    clearCinematicTimers();

    setCinematicActive(false);
    setCinematicMessage(false);
    setCinematicProgress(0);
    setCoupleAction(null);
    setIsHugging(true);
    setCameraTarget("couple");

    setCameraVersion((value) => value + 1);
  }, [clearCinematicTimers]);

  useEffect(() => {
    return () => {
      clearCinematicTimers();
    };
  }, [clearCinematicTimers]);

  const handleInteract = useCallback(
    (type) => {
      if (cinematicActive || completed || activeStory) {
        return;
      }

      const expected = ROOM_STORY[chapter];

      if (!expected || expected.id !== type) return;

      setCameraTarget(type);
      setCameraVersion((value) => value + 1);
      setHintedChapter(null);
      setActiveStory(expected);
    },
    [chapter, completed, activeStory, cinematicActive],
  );

  const handleBlowCake = () => {
    if (cakeBlownOut || cinematicActive) return;

    setCakeBlownOut(true);
    setCelebrate(true);
  };

  const showHint = () => {
    if (!currentStory || activeStory || completed || cinematicActive) return;

    setHintedChapter(chapter);
    setCameraTarget(currentStory.id);
    // Cho phép bấm lại sau khi người xem tự xoay camera.
    setCameraVersion((value) => value + 1);
  };

  const continueStory = () => {
    setHintedChapter(null);
    if (chapter === ROOM_STORY.length - 1) {
      setActiveStory(null);
      setIsNight(true);
      setIsHugging(true);
      setCameraTarget("couple");
      setCameraVersion((value) => value + 1);
      setCompleted(true);
      startCinematic();
      return;
    }

    setChapter((value) => value + 1);
    setActiveStory(null);
    setCameraTarget("default");
    setCameraVersion((value) => value + 1);
  };

  const resetStory = () => {
    closeCinematic();

    setHintedChapter(null);

    setChapter(0);
    setActiveStory(null);
    setIsNight(true);
    setIsHugging(false);
    setCameraTarget("default");
    setCameraVersion((value) => value + 1);
    setCompleted(false);
    setCelebrate(false);
    setCakeBlownOut(false);
    setCornerMessage(null);
    setCoupleAction(null);
    setCoupleActionVersion(0);
  };

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.1,
  });
  // Bắt đầu tải bundle 3D và các model trước khi người xem cuộn tới phòng.
  const isSceneNear = useInView(sceneWrapperRef, {
    once: true,
    margin: "1200px 0px",
  });
  const isSceneVisible = useInView(sceneWrapperRef, {
    amount: 0.05,
  });

  return (
    <section ref={sectionRef} className={styles.section} id="our-little-world">
      <motion.div
        className={styles.heading} data-parallax="heading"
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 35,
                filter: "blur(8px)",
              }
        }
        animate={
          isInView
            ? {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
              }
            : {}
        }
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <SectionTitle
          small="AN INTERACTIVE LOVE STORY"
          title="Tương tác tình yêu nào em !!!"
          subtitle="Căn phòng nhỏ với những mảnh kỷ niệm, một thế giới dành riêng cho hai đứa ♡"
          light
        />
      </motion.div>

      <div className={styles.viewModeControls} role="group" aria-label="Chế độ căn phòng">
        <button type="button" aria-pressed={viewMode === "3d"} onClick={() => setViewMode("3d")}>◈ Phòng 3D</button>
        <button type="button" aria-pressed={viewMode === "2d"} onClick={() => setViewMode("2d")}>▧ 2D nhẹ</button>
        <p>Chuyển chế độ vẫn giữ tiến trình khám phá của em ♡</p>
      </div>

      <div className={styles.storyProgress} data-parallax="text">
        {ROOM_STORY.map((item, index) => (
          <div
            key={item.id}
            className={`${styles.progressDot} ${
              index <= chapter ? styles.progressDotActive : ""
            }`}
            title={item.title}
          >
            {index < chapter || completed ? "♥" : "♡"}
          </div>
        ))}
      </div>

      <div ref={sceneWrapperRef} className={styles.sceneWrapper} data-mode={viewMode} style={{ position: "relative" }}>
        {isSceneNear && viewMode === "3d" ? (
          <RoomSceneBoundary onUse2D={() => setViewMode("2d")}>
          <RoomScene
            active={isSceneVisible && pageVisible}
            hintedObject={hintedChapter === chapter ? currentStory?.id : null}
            isNight={isNight}
            isHugging={isHugging}
            cameraTarget={cameraTarget}
            resetVersion={cameraVersion}
            activeObject={completed ? null : currentStory?.id}
            onInteract={handleInteract}
            celebrate={celebrate}
            cakeBlownOut={cakeBlownOut}
            onBlowCake={handleBlowCake}
            cinematicActive={cinematicActive}
            cinematicProgress={cinematicProgress}
            cinematicResetKey={cinematicResetKey}
            onCornerInteract={handleCornerInteract}
            coupleAction={coupleAction}
            coupleActionVersion={coupleActionVersion}
          />
          </RoomSceneBoundary>
        ) : isSceneNear ? (
          <RoomScene2D
            active={isSceneVisible && pageVisible}
            isNight={isNight}
            isHugging={isHugging}
            activeObject={completed ? null : currentStory?.id}
            hintedObject={hintedChapter === chapter ? currentStory?.id : null}
            onInteract={handleInteract}
            onCornerInteract={handleCornerInteract}
            cakeBlownOut={cakeBlownOut}
            onBlowCake={handleBlowCake}
            celebrate={celebrate}
            coupleAction={coupleAction}
            coupleActionVersion={coupleActionVersion}
            cinematicActive={cinematicActive}
            cinematicProgress={cinematicProgress}
            blocked={cinematicActive || Boolean(activeStory)}
          />
        ) : (
          <div className={styles.loading}>
            Cuộn xuống để mở cánh cửa vào thế giới nhỏ của chúng mình... ♡
          </div>
        )}

        {!completed && !cinematicActive && !activeStory && (
          <button
            type="button"
            className={styles.hintButton}
            onClick={showHint}
            aria-label={`Chỉ vị trí ${currentStory.title}`}
          >
            ✨ Gợi ý
          </button>
        )}

        {hintedChapter === chapter && !activeStory && (
          <div className={styles.hintMessage} role="status">
            {viewMode === "2d" ? "Đồ vật cần tìm đang được đánh dấu. Chạm vào đó nhé ♡" : "Camera đang hướng tới vật cần tìm. Chạm vào điểm sáng nhé ♡"}
          </div>
        )}

        <LoveCornerMessage
          active={cornerMessage}
          onClose={() => setCornerMessage(null)}
        />

        {completed && !cinematicActive && (
          <button
            type="button"
            onClick={startCinematic}
            style={{
              position: "absolute",
              right: 16,
              bottom: 72,
              zIndex: 20,
              padding: "12px 18px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.4)",
              background: "rgba(38, 21, 57, .85)",
              color: "#fff",
              cursor: "pointer",
              backdropFilter: "blur(12px)",
            }}
          >
            🎬 Xem lại đoạn kết
          </button>
        )}

        {cinematicActive && cinematicProgress >= 7 && (
          <RoomEndingEffects
            messageVisible={cinematicMessage}
            active={isSceneVisible && pageVisible}
            compact={viewMode === "3d"}
          />
        )}

        <CinematicEnding
          active={cinematicActive}
          showHeartIcon={false}
          showMessage={cinematicMessage}
          onReplay={startCinematic}
          onClose={closeCinematic}
        />

        <CoupleActionButtons
          value={coupleAction}
          disabled={cinematicActive || Boolean(activeStory)}
          onSelect={chooseCoupleAction}
        />

        <div className={styles.sceneHint}>
          {viewMode === "2d" ? "✧ Chạm vào đồ vật có viền sáng để mở kỷ niệm" : "✧ Kéo để xoay · Chạm vào đồ vật phát sáng"}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={chapter}
            className={styles.storyInstruction} data-parallax="text"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
          >
            <span>
              CHƯƠNG {chapter + 1} / {ROOM_STORY.length}
            </span>

            <h3>{currentStory.title}</h3>
            <p>{currentStory.instruction}</p>
          </motion.div>
        ) : (
          <motion.div
            key="ending"
            className={styles.storyEnding}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span>✦ ♡ ✦</span>
            <h3>Thế giới nhỏ của chúng mình</h3>
            <p>
              Chẳng cần điều gì quá lớn lao.
              <br />
              Chỉ cần sau này vẫn có anh và em.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.controls}>
        <button type="button" onClick={resetStory}>
          ↺ Khám phá lại từ đầu
        </button>

        <button type="button" onClick={() => setIsNight((value) => !value)}>
          {isNight ? "☀ Ban ngày" : "☾ Ban đêm"}
        </button>

        {viewMode === "3d" && <button
          type="button"
          onClick={() => {
            setCameraTarget("default");
            setCameraVersion((value) => value + 1);
          }}
        >
          ◇ Toàn cảnh
        </button>}
      </div>

      <AnimatePresence>
        {activeStory && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="room-story-title"
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              transition={{ duration: 0.45 }}
            >
              <div className={styles.modalEmoji}>{activeStory.emoji}</div>

              <span className={styles.modalChapter}>
                MẢNH KỶ NIỆM {chapter + 1}
              </span>

              <h3 id="room-story-title">{activeStory.title}</h3>

              <p>{activeStory.message}</p>

              <button
                type="button"
                className={styles.continueButton}
                onClick={continueStory}
              >
                {chapter === ROOM_STORY.length - 1
                  ? "♡ Xem điều bất ngờ cuối cùng"
                  : "Tiếp tục khám phá →"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
