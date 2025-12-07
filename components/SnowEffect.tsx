import React, { useMemo } from 'react';

const SnowEffect: React.FC = () => {
  // 產生 50 個隨機雪花
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const left = Math.random() * 100; // 0-100vw
      const animationDuration = 5 + Math.random() * 10; // 5-15s
      const animationDelay = Math.random() * 5; // 0-5s
      const size = 5 + Math.random() * 10; // 5-15px
      
      return (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: 'white',
            borderRadius: '50%',
            opacity: Math.random() * 0.7 + 0.3,
            animationDuration: `${animationDuration}s`,
            animationDelay: `${animationDelay}s`,
          }}
        />
      );
    });
  }, []);

  return <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">{snowflakes}</div>;
};

export default SnowEffect;