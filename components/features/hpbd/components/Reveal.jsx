import {
  motion
} from "framer-motion";

const Reveal = ({ children, className = "" }) => (
  <motion.div
    className={className}
    initial={{
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

export default Reveal;