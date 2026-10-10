
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    useReducedMotion,
} from "framer-motion";

import { polaroidMemories } from "../utils/data/polaroid";

const createPositions = (items) =>
    Object.fromEntries(
        items.map((item) => [
            item.id,
            {
                x: item.x,
                y: item.y,
                rotate: item.rotation,
            },
        ])
    );

const initialPositions = createPositions(polaroidMemories);

function PolaroidCard({
    memory,
    position,
    index,
    isFlipped,
    isActive,
    isMobile,
    reduceMotion,
    onActivate,
    onFlip,
    onPositionChange,
}) {
    const cardRef = useRef(null);

    const scale = isMobile ? 0.58 : 1;

    const handleDragEnd = (_, info) => {
        onPositionChange(memory.id, {
            x: position.x + info.offset.x / scale,
            y: position.y + info.offset.y / scale,
            rotate: position.rotate,
        });
    };

    return (
        <motion.div
            ref={cardRef}
            className={`polaroid-album__card ${isActive ? "is-active" : ""
                }`}
            style={{
                zIndex: index,
                x: position.x * scale,
                y: position.y * scale,
                rotate: position.rotate,
                scale,
            }}
            drag={!isFlipped}
            dragMomentum={false}
            dragElastic={0.12}
            onDragStart={onActivate}
            onDragEnd={handleDragEnd}
            onPointerDown={onActivate}
            whileDrag={{
                scale: scale * 1.06,
                cursor: "grabbing",
            }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
            }}
        >
            <motion.div
                className="polaroid-album__card-inner"
                animate={{
                    rotateY: isFlipped ? 180 : 0,
                }}
                transition={{
                    duration: reduceMotion ? 0 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                }}
            >
                {/* Front */}
                <div className="polaroid-album__front">
                    <div className="polaroid-album__photo">
                        <img
                            src={memory.image}
                            alt={memory.title}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                        />
                    </div>

                    <div className="polaroid-album__caption">
                        <span>{memory.title}</span>

                        <button
                            type="button"
                            className="polaroid-album__flip-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onFlip(memory.id);
                            }}
                            aria-label={`Lật ảnh ${memory.title}`}
                        >
                            ↻
                        </button>
                    </div>
                </div>

                {/* Back */}
                <div className="polaroid-album__back">
                    <span className="polaroid-album__back-heart">♡</span>

                    <span className="polaroid-album__back-date">
                        {memory.date}
                    </span>

                    <p>{memory.message}</p>

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onFlip(memory.id);
                        }}
                    >
                        Xem lại ảnh ↻
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function PolaroidAlbum() {
    const reduceMotion = useReducedMotion();

    const [positions, setPositions] = useState(initialPositions);
    const [order, setOrder] = useState(
        polaroidMemories.map((item) => item.id)
    );
    const [flippedIds, setFlippedIds] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 600px)");

        const update = () => setIsMobile(media.matches);

        update();
        media.addEventListener("change", update);

        return () => media.removeEventListener("change", update);
    }, []);

    const activateCard = useCallback((id) => {
        setOrder((current) => [
            ...current.filter((item) => item !== id),
            id,
        ]);
    }, []);

    const flipCard = useCallback((id) => {
        activateCard(id);

        setFlippedIds((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    }, [activateCard]);

    const updatePosition = useCallback((id, nextPosition) => {
        setPositions((current) => ({
            ...current,
            [id]: nextPosition,
        }));
    }, []);

    const shuffleCards = () => {
        setFlippedIds([]);

        setPositions((current) => {
            const ids = polaroidMemories.map((item) => item.id);
            const shuffled = [...ids].sort(() => Math.random() - 0.5);

            const values = shuffled.map((id) => current[id]);

            return Object.fromEntries(
                ids.map((id, index) => [
                    id,
                    {
                        x: values[index].x,
                        y: values[index].y,
                        rotate: values[index].rotate,
                    },
                ])
            );
        });
    };

    const resetCards = () => {
        setPositions(createPositions(polaroidMemories));
        setFlippedIds([]);
        setOrder(polaroidMemories.map((item) => item.id));
    };

    return (
        <section className="polaroid-album">
            <motion.div
                className="polaroid-album__heading"
                initial={reduceMotion ? false : { opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
            >
                <span className="polaroid-album__eyebrow">
                    OUR LITTLE MEMORIES
                </span>

                <h2>
                    Những mảnh ghép
                    <br />
                    <em>kỷ niệm ♡</em>
                </h2>

                <p>
                    Mỗi tấm ảnh là một câu chuyện nhỏ.
                    <br />
                    Chạm, kéo và lật ảnh để khám phá nhé!
                </p>
            </motion.div>

            <div className="polaroid-album__workspace">
                <div className="polaroid-album__decoration polaroid-album__decoration--one">
                    ✦
                </div>
                <div className="polaroid-album__decoration polaroid-album__decoration--two">
                    ♡
                </div>

                <div className="polaroid-album__stage">
                    {polaroidMemories.map((memory) => (
                        <PolaroidCard
                            key={memory.id}
                            memory={memory}
                            position={positions[memory.id]}
                            index={order.indexOf(memory.id) + 1}
                            isFlipped={flippedIds.includes(memory.id)}
                            isActive={order[order.length - 1] === memory.id}
                            isMobile={isMobile}
                            reduceMotion={reduceMotion}
                            onActivate={() => activateCard(memory.id)}
                            onFlip={flipCard}
                            onPositionChange={updatePosition}
                        />
                    ))}
                </div>
            </div>

            <div className="polaroid-album__actions">
                <button type="button" onClick={shuffleCards}>
                    <span>✧</span> Xáo trộn ảnh
                </button>

                <button type="button" onClick={resetCards}>
                    <span>↻</span> Sắp xếp lại
                </button>
            </div>

            <p className="polaroid-album__footer">
                Five little moments, a thousand beautiful memories ♡
            </p>
        </section>
    );
}
