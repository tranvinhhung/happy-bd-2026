"use client";

import Image from "next/image";
import RoomBalloon from "./RoomBalloon";
import { ROOM_STORY } from "./roomStory";
import styles from "../../styles/RoomScene2D.module.scss";

const ROOM_BALLOONS = [
  { left: "2%", top: "21%", color: "#eca8c5", delay: "-1s", duration: "5.5s" },
  { left: "30%", top: "20%", color: "#f4d49b", delay: "-3s", duration: "6.2s" },
  { left: "63%", top: "26%", color: "#c4ade5", delay: "-2s", duration: "5.8s" },
  { left: "90%", top: "20%", color: "#a9d2d0", delay: "-4s", duration: "6.5s" },
];

function Couple({ hugging, action, version, hearts }) {
  return (
    <svg key={version} viewBox="0 0 200 180" className={styles.people} aria-hidden="true">
      <ellipse cx="100" cy="163" rx="75" ry="10" fill="#66435a" opacity=".2" />
      <g className={styles.boy} data-close={hugging}>
        <path d="M58 132 L54 159 M78 132 L83 159" stroke="#55506c" strokeWidth="14" strokeLinecap="round" />
        <path d="M45 87 Q67 73 89 87 L91 132 Q68 143 44 132Z" fill="#9cb8c8" />
        <path d="M47 89 L33 117" stroke="#f5c8ad" strokeWidth="12" strokeLinecap="round" className={styles.boyArm} />
        <path d="M87 89 L104 115" stroke="#f5c8ad" strokeWidth="12" strokeLinecap="round" />
        <circle cx="67" cy="56" r="28" fill="#f5c8ad" />
        <path d="M39 54 Q31 18 65 21 Q98 15 97 53 L82 42 Q63 51 50 39Z" fill="#503e44" />
        <path d="M55 57 v3 M77 57 v3" stroke="#513747" strokeWidth="3" strokeLinecap="round" />
        <path d="M61 69 Q67 75 73 69" fill="none" stroke="#ba777e" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className={styles.girl} data-close={hugging}>
        <path d="M108 53 Q109 17 139 23 Q169 21 169 62 L170 101 L106 101Z" fill="#68424c" />
        <path d="M125 135 L123 160 M145 135 L148 160" stroke="#f6cfb9" strokeWidth="11" strokeLinecap="round" />
        <path d="M116 87 Q137 76 157 88 L170 137 Q139 150 106 137Z" fill="#e7a6bf" />
        <path d="M116 92 L101 114" stroke="#f6cfb9" strokeWidth="11" strokeLinecap="round" />
        <path d="M157 91 L169 116" stroke="#f6cfb9" strokeWidth="11" strokeLinecap="round" className={styles.girlArm} />
        <circle cx="137" cy="58" r="26" fill="#f6cfb9" />
        <path d="M110 54 Q111 23 138 26 Q165 26 164 55 L151 40 Q130 54 110 54Z" fill="#68424c" />
        <path d="M126 59 v3 M147 59 v3" stroke="#513747" strokeWidth="3" strokeLinecap="round" />
        <path d="M131 70 Q137 76 143 70" fill="none" stroke="#ba777e" strokeWidth="2" strokeLinecap="round" />
        <path d="M159 33 l12 -6 -2 15Z M159 33 l-7 -11 -5 14Z" fill="#f4b8d0" />
      </g>
      {hearts && <g className={styles.coupleHearts}><text x="86" y="24" fontSize="27" fill="#e571a1">♥</text><text x="160" y="20" fontSize="16" fill="#f1a5c7">♡</text></g>}
      {action === "kiss" && <text className={styles.kiss} x="90" y="72" fontSize="22" fill="#e571a1">♥</text>}
    </svg>
  );
}

export default function RoomScene2D({
  active, activeObject, hintedObject, isNight, isHugging, onInteract, onCornerInteract,
  onBlowCake, cakeBlownOut, celebrate, coupleAction, coupleActionVersion,
  cinematicActive, cinematicProgress, blocked,
}) {
  const hugging = isHugging || ["hug", "hold"].includes(coupleAction);
  const hearts = cinematicActive ? cinematicProgress >= 5 : hugging || coupleAction === "kiss";

  const objectProps = (id) => ({
    type: "button",
    "data-room-object": id,
    "data-active": activeObject === id,
    "data-hinted": hintedObject === id,
    "aria-label": `Khám phá: ${ROOM_STORY.find((story) => story.id === id).title}`,
    disabled: blocked || activeObject !== id,
    onClick: () => onInteract(id),
  });

  return (
    <div className={styles.room} data-night={isNight} data-active={active} data-action={coupleAction || "idle"} data-cinematic={cinematicActive} aria-label="Căn phòng kỷ niệm 2D">
      <div className={styles.world}>
        <div className={styles.wallpaper} aria-hidden="true" />
        <div className={styles.floor} aria-hidden="true" />
        <svg className={styles.lights} viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 8 Q300 110 600 8" fill="none" stroke="#aa839e" strokeWidth="2" />
          {[30, 90, 150, 210, 270, 330, 390, 450, 510, 570].map((x, index) => <circle key={x} cx={x} cy={14 + Math.sin((x / 600) * Math.PI) * 47} r="5" fill={index % 2 ? "#f7c4db" : "#ffe9af"} />)}
        </svg>
        <div className={styles.window} aria-hidden="true"><span>{isNight ? "☾" : "☀"}</span><i /><i /></div>
        <div className={styles.roomBalloons} data-room-balloons="ambient" aria-hidden="true">
          {ROOM_BALLOONS.map((balloon) => (
            <span key={balloon.left} className={styles.roomBalloon} style={{ left: balloon.left, top: balloon.top, "--float-delay": balloon.delay, "--float-duration": balloon.duration }}>
              <RoomBalloon color={balloon.color} />
            </span>
          ))}
        </div>
        <button className={styles.neon} type="button" onClick={() => onCornerInteract("neon")} disabled={blocked} aria-label="Đọc lời nhắn Love you">love you ♡</button>

        <button {...objectProps("photo")} className={`${styles.object} ${styles.photo}`}>
          <span className={styles.photoFrame}><Image src="/images/love-room/our-photo.jpg" alt="Kỷ niệm của chúng mình" fill sizes="(max-width: 600px) 20vw, 190px" /></span>
          <span className={styles.caption}>Khung ảnh</span>
        </button>
        <button {...objectProps("bed")} className={`${styles.object} ${styles.bed}`}>
          <span className={styles.headboard} /><span className={styles.mattress}><i /><b /></span>
          <span className={styles.caption}>Góc bình yên</span>
        </button>
        <button {...objectProps("gift")} className={`${styles.object} ${styles.gift}`}>
          <span className={styles.giftBox}><i /><b>♡</b></span><span className={styles.giftLid} />
          <span className={styles.caption}>Món quà</span>
        </button>
        <button {...objectProps("couple")} className={`${styles.object} ${styles.couple}`}>
          <Couple hugging={hugging} action={coupleAction} version={coupleActionVersion} hearts={hearts} />
          <span className={styles.caption}>Chúng mình ♡</span>
        </button>

        <button className={`${styles.object} ${styles.teddy}`} type="button" onClick={() => onCornerInteract("teddy")} disabled={blocked} aria-label="Đọc lời nhắn từ gấu bông">
          <span aria-hidden="true">🧸</span>
        </button>
        <button className={`${styles.object} ${styles.flowers}`} type="button" onClick={() => onCornerInteract("flower")} disabled={blocked} aria-label="Đọc lời nhắn từ chậu hoa">
          <span aria-hidden="true">🌷</span>
        </button>
        <button className={`${styles.object} ${styles.cake}`} type="button" onClick={onBlowCake} disabled={blocked || cakeBlownOut} aria-label={cakeBlownOut ? "Nến đã tắt" : "Thổi nến sinh nhật"}>
          <span className={styles.candle}>{!cakeBlownOut && <i />}</span><span className={styles.cakeTop}>♡</span><span className={styles.cakeBase} />
        </button>
        {celebrate && <div className={styles.celebration} aria-hidden="true">✦ ♡ ✧ ♡ ✦</div>}
      </div>
    </div>
  );
}
