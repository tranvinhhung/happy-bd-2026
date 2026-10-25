
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import styles from "../styles/HandwritingLetter.module.scss";

const CHAR_DELAY = 65;
const PARAGRAPH_DELAY = 650;
const MAX_PETALS = 5;

function splitCharacters(text) {
  const value = String(text ?? "").normalize("NFC");

  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("vi", {
      granularity: "grapheme",
    });

    return Array.from(segmenter.segment(value), (part) => part.segment);
  }

  return Array.from(value);
}

function prepareParagraphs(paragraphs) {
  let globalIndex = 0;
  const allCharacters = [];

  const groups = paragraphs.map((paragraph) => {
    const tokens = String(paragraph ?? "")
      .normalize("NFC")
      .match(/\S+|\s+/gu) ?? [];

    return tokens.map((token) => {
      if (/^\s+$/u.test(token)) {
        return {
          type: "space",
          value: " ",
        };
      }

      const letters = splitCharacters(token);

      const characters = letters.map((char, index) => {
        const character = {
          char,
          id: globalIndex++,
          isWordEnd: index === letters.length - 1,
        };

        allCharacters.push(character);
        return character;
      });

      return {
        type: "word",
        characters,
      };
    });
  });

  return {
    groups,
    allCharacters,
  };
}

export default function HandwritingLetter({
  paragraphs = [],
  onComplete,
  speed = CHAR_DELAY,
}) {
  const rootRef = useRef(null);
  const penRef = useRef(null);
  const charRefs = useRef([]);
  const petalsRef = useRef(new Set());

  const progressRef = useRef(0);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  const { groups, allCharacters } = useMemo(
    () => prepareParagraphs(paragraphs),
    [paragraphs]
  );

  const isInView = useInView(rootRef, {
    amount: "some",
    margin: "0px 0px -40px 0px",
  });

  const reduceMotion = useReducedMotion();

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const root = rootRef.current;
    const pen = penRef.current;

    if (!root) return;

    // Hiển thị toàn bộ ngay khi người dùng giảm chuyển động.
    if (reduceMotion) {
      charRefs.current.forEach((element) => {
        element?.classList.add(styles.visible);
      });

      if (pen) pen.style.display = "none";

      if (!finishedRef.current) {
        finishedRef.current = true;
        onCompleteRef.current?.();
      }

      return;
    }

    if (!isInView || finishedRef.current) return;

    startedRef.current = true;

    let timeoutId;
    let previousParagraph = -1;

    const movePen = (element) => {
      if (!element || !pen) return null;

      const charRect = element.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();

      // Tính tọa độ trong hệ local của phần tử.
      // Dùng tỉ lệ để bù scale/rotate nhẹ của giấy.
      const scaleX =
        root.offsetWidth > 0
          ? rootRect.width / root.offsetWidth
          : 1;

      const scaleY =
        root.offsetHeight > 0
          ? rootRect.height / root.offsetHeight
          : 1;

      const x = (charRect.right - rootRect.left) / scaleX;
      const y = (charRect.bottom - rootRect.top) / scaleY;

      pen.style.left = `${x}px`;
      pen.style.top = `${y}px`;

      return { x, y };
    };

    const createPetal = (position, characterIndex) => {
      if (!position || petalsRef.current.size >= MAX_PETALS) {
        return;
      }

      const petal = document.createElement("span");

      petal.className = styles.petal;
      petal.textContent = characterIndex % 2 === 0 ? "🌸" : "❀";
      petal.setAttribute("aria-hidden", "true");

      const drift = ((characterIndex % 5) - 2) * 16;
      const rotation = (characterIndex * 37) % 120;

      petal.style.left = `${position.x}px`;
      petal.style.top = `${position.y}px`;
      petal.style.setProperty("--drift", `${drift}px`);
      petal.style.setProperty("--rotation", `${rotation}deg`);

      root.appendChild(petal);
      petalsRef.current.add(petal);

      petal.addEventListener(
        "animationend",
        () => {
          petal.remove();
          petalsRef.current.delete(petal);
        },
        { once: true }
      );
    };

    const finish = () => {
      finishedRef.current = true;

      if (pen) {
        pen.classList.add(styles.penFinished);
      }

      onCompleteRef.current?.();
    };

    const writeNext = () => {
      if (progressRef.current >= allCharacters.length) {
        finish();
        return;
      }

      const index = progressRef.current;
      const character = allCharacters[index];
      const element = charRefs.current[index];

      if (!character || !element) {
        progressRef.current += 1;
        timeoutId = window.setTimeout(writeNext, speed);
        return;
      }

      // Cho chữ xuất hiện.
      element.classList.add(styles.visible);

      // Bút di chuyển theo ký tự vừa viết.
      const position = movePen(element);

      // Hoa rơi sau mỗi vài từ.
      if (character.isWordEnd && index % 12 < 4) {
        createPetal(position, index);
      }

      progressRef.current += 1;

      // Tạm dừng nhẹ giữa các đoạn.
      const paragraphIndex = Number(
        element.dataset.paragraph
      );

      const nextElement =
        charRefs.current[progressRef.current];

      const nextParagraph = nextElement
        ? Number(nextElement.dataset.paragraph)
        : paragraphIndex;

      const delay =
        nextParagraph !== paragraphIndex
          ? PARAGRAPH_DELAY
          : speed;

      previousParagraph = paragraphIndex;

      timeoutId = window.setTimeout(writeNext, delay);
    };

    // Chỉ tiếp tục khi trong viewport.
    timeoutId = window.setTimeout(
      writeNext,
      startedRef.current ? 120 : 400
    );

    return () => {
      window.clearTimeout(timeoutId);

      // Xóa cánh hoa đang chạy khi ra khỏi viewport.
      petalsRef.current.forEach((petal) => petal.remove());
      petalsRef.current.clear();
    };
  }, [isInView, reduceMotion, allCharacters, speed]);

  return (
    <div
      ref={rootRef}
      className={styles.letterWriting}
      aria-label={paragraphs.join(" ")}
    >
      {groups.map((tokens, paragraphIndex) => (
        <p
          key={paragraphIndex}
          className={styles.paragraph}
          aria-hidden="true"
        >
          {tokens.map((token, tokenIndex) => {
            if (token.type === "space") {
              return " ";
            }

            return (
              <span
                key={tokenIndex}
                className={styles.word}
              >
                {token.characters.map(({ char, id }) => (
                  <span
                    key={id}
                    ref={(element) => {
                      charRefs.current[id] = element;
                    }}
                    data-paragraph={paragraphIndex}
                    className={styles.character}
                  >
                    {char}
                  </span>
                ))}
              </span>
            );
          })}
        </p>
      ))}

      <span
        ref={penRef}
        className={styles.pen}
        aria-hidden="true"
      >
        ✒️
      </span>
    </div>
  );
}
