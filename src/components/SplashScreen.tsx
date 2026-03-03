import biLogo from '../assets/pictures/bi-logo.png';
import { useEffect, useState } from 'react';

function playChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const t = ctx.currentTime;

    // Two-note ascending chime: C5 → E5
    ([523.25, 659.25] as const).forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = t + i * 0.13;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  } catch {
    // AudioContext blocked or unsupported — fail silently
  }
}

interface SplashScreenProps {
  onDone: () => void;
}

function SplashScreen({ onDone }: SplashScreenProps) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      playChime();
      setHiding(true);
      setTimeout(onDone, 450); // matches CSS transition duration
    }, 1200);

    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={`splash-screen${hiding ? ' splash-screen--hiding' : ''}`}>
      <img src={biLogo} className="splash-screen__logo" alt="" />
      <span className="splash-screen--title">Gate Control</span>
      <span className="splash-screen--subtitle">Developed by BI DATA 373</span>
    </div>
  );
}

export default SplashScreen;
