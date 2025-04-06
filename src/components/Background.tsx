import React from 'react';
import styles from './Background.module.css';

const Background: React.FC = () => {
  return (
    <div className={styles.background}>
      {/* Sun */}
      <div className={styles.sun}>
        <svg viewBox="0 0 200 200" className={styles.illustration}>
          <circle cx="100" cy="100" r="60" fill="#FFD700" stroke="#FFA500" strokeWidth="8" className={styles.wobbly} />
          <g className={styles.sunRays}>
            {[...Array(12)].map((_, i) => (
              <path
                key={i}
                d="M100,20 Q105,35 100,40 Q95,35 100,20"
                stroke="#FFA500"
                strokeWidth="6"
                fill="#FFD700"
                transform={`rotate(${i * 30} 100 100)`}
              />
            ))}
          </g>
          {/* Child-like face */}
          <path d="M80,90 Q100,110 120,90" stroke="#000" strokeWidth="6" fill="none" />
          <circle cx="75" cy="75" r="8" fill="#000" />
          <circle cx="125" cy="75" r="8" fill="#000" />
        </svg>
      </div>

      {/* Multiple Clouds */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`${styles.cloud} ${styles['cloud' + i]}`}>
          <svg viewBox="0 0 200 100" className={styles.illustration}>
            <path
              d="M30,50 Q60,20 90,50 Q120,20 150,50 Q170,30 180,50 Q150,80 120,50 Q90,80 60,50 Q30,80 30,50"
              fill="#FFFFFF"
              stroke="#E0E0E0"
              strokeWidth="4"
              className={styles.wobbly}
            />
          </svg>
        </div>
      ))}

      {/* River with multiple waves */}
      <div className={styles.river}>
        <svg viewBox="0 0 600 400" className={styles.illustration}>
          {/* Background waves */}
          {[...Array(8)].map((_, i) => (
            <path
              key={`bg-${i}`}
              d={`M0,${150 + i * 25} Q150,${120 + i * 25} 300,${150 + i * 25} Q450,${180 + i * 25} 600,${150 + i * 25}`}
              fill="none"
              stroke="#3478C5"
              strokeWidth="20"
              strokeLinecap="round"
              className={`${styles.wave} ${styles['wave' + i]}`}
              opacity="0.3"
            />
          ))}
          {/* Foreground waves */}
          {[...Array(8)].map((_, i) => (
            <path
              key={`fg-${i}`}
              d={`M0,${80 + i * 25} Q150,${50 + i * 25} 300,${80 + i * 25} Q450,${110 + i * 25} 600,${80 + i * 25}`}
              fill="none"
              stroke="#4A90E2"
              strokeWidth="20"
              strokeLinecap="round"
              className={`${styles.wave} ${styles['waveFg' + i]}`}
            />
          ))}
        </svg>
      </div>

      {/* Kayaks/Canoes */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`${styles.boat} ${styles['boat' + i]}`}>
          <svg viewBox="0 0 200 100" className={styles.illustration}>
            {/* Kayak/Canoe shape - more curved and boat-like */}
            <path
              d="M20,50 
                 C20,50 40,60 100,60 
                 C160,60 180,50 180,50
                 L170,40 
                 C170,40 140,30 100,30
                 C60,30 30,40 30,40 Z"
              fill="#8B4513"
              stroke="#654321"
              strokeWidth="4"
              className={styles.wobbly}
            />
            {/* Tiny Pirate in boat */}
            <circle cx="100" cy="40" r="10" fill="#FDB797" stroke="#000" strokeWidth="2" />
            {/* Pirate Hat */}
            <path d="M90,30 L110,30 L100,20 Z" fill="#333" />
            <path d="M88,30 L112,30" stroke="#333" strokeWidth="4" />
            {/* Eye patch or mean eye */}
            {i % 2 === 0 ? (
              <path d="M95,38 L105,38" stroke="#000" strokeWidth="2" />
            ) : (
              <>
                <circle cx="97" cy="38" r="2" fill="#000" />
                <circle cx="103" cy="38" r="2" fill="#000" />
              </>
            )}
            {/* Mean expression */}
            <path d="M97,42 Q100,41 103,42" stroke="#000" strokeWidth="1" />
            
            {/* Paddle */}
            <path
              d="M70,20 L130,20"
              stroke="#654321"
              strokeWidth="6"
              className={styles.paddleRotate}
            />
            <path
              d="M65,15 L75,25"
              stroke="#654321"
              strokeWidth="8"
              className={styles.paddleRotate}
            />
            <path
              d="M125,15 L135,25"
              stroke="#654321"
              strokeWidth="8"
              className={styles.paddleRotate}
            />
          </svg>
        </div>
      ))}

      {/* Simple Rum Bottle */}
      <div className={styles.rumBottle}>
        <svg viewBox="0 0 100 200" className={styles.illustration}>
          {/* Bottle body */}
          <path
            d="M30,50 
               L70,50 
               L65,170
               C65,180 35,180 35,170
               L30,50"
            fill="#2E1810"
            stroke="#1A0F09"
            strokeWidth="2"
          />
          {/* Bottle neck */}
          <path
            d="M40,20 L60,20 L70,50 L30,50 Z"
            fill="#2E1810"
            stroke="#1A0F09"
            strokeWidth="2"
          />
          {/* Cork */}
          <rect x="38" y="10" width="24" height="10" fill="#8B4513" stroke="#654321" strokeWidth="2" />
          {/* Label */}
          <rect x="35" y="80" width="30" height="40" fill="#F4D03F" stroke="#8B4513" strokeWidth="1" />
          {/* Simple RUM text */}
          <text x="38" y="105" fill="#8B4513" fontSize="12">RUM</text>
        </svg>
      </div>

      {/* Single Large Fish */}
      <div className={styles.largeFish}>
        <svg viewBox="0 0 200 150" className={styles.illustration}>
          <path
            d="M40,75 Q80,30 120,75 Q80,120 40,75"
            fill="#FF6B6B"
            stroke="#FF4444"
            strokeWidth="6"
            className={styles.wobbly}
          />
          <path
            d="M120,75 L180,45 L180,105 Z"
            fill="#FF6B6B"
            stroke="#FF4444"
            strokeWidth="6"
          />
          {/* Blinking eye */}
          <circle cx="60" cy="70" r="8" fill="#000" className={styles.fishEye} />
          {/* Eyelid */}
          <path 
            d="M52,70 Q60,70 68,70"
            stroke="#FF6B6B"
            strokeWidth="10"
            className={styles.fishEyelid}
          />
        </svg>
      </div>
    </div>
  );
};

export default Background; 