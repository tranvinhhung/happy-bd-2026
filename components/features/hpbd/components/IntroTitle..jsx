"use client";

import { motion } from "framer-motion";
import { birthdayData as data } from "@/components/features/hpbd/utils/data/birthday";
const titleWords = data.intro.title.split(" ");

const letterVariants = {
    hidden: {
        opacity: 0,
        y: 35,
        scale: 0.8,
    },

    visible: (index) => ({
        opacity: 1,
        y: 0,
        scale: 1,

        transition: {
            duration: 0.7,
            delay: 0.35 + index * 0.055,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

export default function IntroTitle() {
    return (
        <motion.h1
            className="intro__title"
            initial="hidden"
            animate="visible"
        >
            <span className="intro__title-text">
                {titleWords.map((word, wordIndex) => (
                    <span
                        key={word}
                        className="intro__title-line"
                    >
                        {word.split("").map((char, charIndex) => {
                            const index = wordIndex * 10 + charIndex;

                            return (
                                <motion.span
                                    key={`${char}-${charIndex}`}
                                    className="intro__letter-wrap"
                                    custom={index}
                                    variants={letterVariants}
                                >
                                    <motion.span
                                        className="intro__letter"
                                        animate={{
                                            y: [0, 0, -5, 0, 0],
                                            scale: [1, 1, 1.08, 1, 1],
                                            rotate: [
                                                0,
                                                0,
                                                charIndex % 2 === 0 ? -2 : 2,
                                                0,
                                                0,
                                            ],
                                        }}
                                        transition={{
                                            duration: 5,
                                            delay: index * 0.12,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                </motion.span>
                            );
                        })}
                    </span>
                ))}
            </span>

            <motion.span
                className="intro__title-heart"
                animate={{
                    scale: [1, 1.12, 1, 1.18, 1],
                }}
                transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                ♡
            </motion.span>
        </motion.h1>
    );
}
