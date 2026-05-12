import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const S = 4, W = 4;

export default function LandingPage() {
  const navigate = useNavigate();

  const [st, setSt] = useState<string[][]>(Array.from({ length: S }, () => Array(W).fill('empty')));
  const [tv, setTv] = useState<(string | null)[][]>(Array.from({ length: S }, () => Array(W).fill(null)));
  const [logAddr, setLogAddr] = useState('0x0080');
  const [logHit, setLogHit] = useState(true);
  const [logInfo, setLogInfo] = useState('set=0 tag=0x02 way=0');

  useEffect(() => {
    const acc = [
      { s: 0, w: 0, tag: '0x02', hit: false, addr: '0x0080' }, { s: 1, w: 2, tag: '0x07', hit: false, addr: '0x01C0' },
      { s: 2, w: 1, tag: '0x0A', hit: false, addr: '0x0290' }, { s: 3, w: 0, tag: '0x0F', hit: false, addr: '0x03C0' },
      { s: 0, w: 1, tag: '0x11', hit: false, addr: '0x0440' }, { s: 2, w: 1, tag: '0x0A', hit: true, addr: '0x0290' },
      { s: 0, w: 0, tag: '0x02', hit: true, addr: '0x0080' }, { s: 1, w: 3, tag: '0x1C', hit: false, addr: '0x0710' },
      { s: 1, w: 2, tag: '0x07', hit: true, addr: '0x01C0' }, { s: 3, w: 2, tag: '0x15', hit: false, addr: '0x0560' },
      { s: 0, w: 0, tag: '0x02', hit: true, addr: '0x0080' }, { s: 2, w: 3, tag: '0x09', hit: false, addr: '0x0260' },
      { s: 2, w: 1, tag: '0x0A', hit: true, addr: '0x0290' }, { s: 0, w: 1, tag: '0x11', hit: true, addr: '0x0440' },
      { s: 3, w: 1, tag: '0x22', hit: false, addr: '0x08C0' }, { s: 1, w: 2, tag: '0x07', hit: true, addr: '0x01C0' },
    ];
    let ai = 0;
    
    let currentSt = Array.from({ length: S }, () => Array(W).fill('empty'));
    let currentTv = Array.from({ length: S }, () => Array(W).fill(null));

    const interval = setInterval(() => {
      const a = acc[ai % acc.length];
      const nextSt = currentSt.map(row => [...row]);
      const nextTv = currentTv.map(row => [...row]);

      for (let s = 0; s < S; s++) {
        for (let w = 0; w < W; w++) {
          if (nextSt[s][w] === 'hit' || nextSt[s][w] === 'miss') {
            nextSt[s][w] = nextTv[s][w] ? 'filled' : 'empty';
          }
        }
      }
      
      if (!a.hit && nextTv[a.s][a.w]) {
        nextSt[a.s][a.w] = 'evict';
      }
      
      nextTv[a.s][a.w] = a.tag;
      nextSt[a.s][a.w] = a.hit ? 'hit' : 'miss';
      
      setLogAddr(a.addr);
      setLogHit(a.hit);
      setLogInfo(`set=${a.s} tag=${a.tag} way=${a.w}`);
      
      setSt(nextSt);
      setTv(nextTv);
      
      currentSt = nextSt;
      currentTv = nextTv;
      
      ai++;
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctrAnim = (el: Element, t: number, dur: number) => {
      const start = performance.now();
      const f = (n: number) => {
        const p = Math.min((n - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(e * t).toString();
        if (p < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    };

    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('on');
          en.target.querySelectorAll('.ctr').forEach(c => {
            const htmlC = c as HTMLElement;
            if (htmlC.dataset.t) {
              ctrAnim(htmlC, +htmlC.dataset.t, 1400);
            }
          });
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  return (
    <div className="landing-page-root bg-[#050305] text-[#F0EAE0] font-['Space_Grotesk',sans-serif] overflow-x-hidden min-h-screen">
      <style>{`
        .landing-page-root {
          --black: #050305;
          --maroon-deep: #1a0505;
          --maroon: #6B0F0F;
          --maroon-mid: #8B1A1A;
          --maroon-bright: #B91C1C;
          --maroon-glow: #DC2626;
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --white: #F0EAE0;
          --muted: #5a3a3a;
          --surface: #0d0505;
          --glass: rgba(139,26,26,0.08);
          --glass-border: rgba(180,50,50,0.18);
        }

        .landing-page-root .gloss { position: relative; overflow: hidden; }
        .landing-page-root .gloss::after {
          content: ''; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%);
          animation: sheen 4s ease-in-out infinite;
        }
        @keyframes sheen { 0%, 100% { left: -60%; } 50% { left: 120%; } }

        .landing-page-root nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 40px;
          background: linear-gradient(180deg, rgba(20,4,4,0.98) 0%, rgba(10,2,2,0.95) 100%);
          border-bottom: 1px solid rgba(180,50,50,0.15);
          backdrop-filter: blur(20px);
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 0 rgba(180,50,50,0.1), 0 4px 24px rgba(0,0,0,0.6);
        }
        .landing-page-root .nav-logo {
          font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 700;
          letter-spacing: -0.02em; background: linear-gradient(135deg, #fff 30%, var(--gold) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .landing-page-root .nav-links { display: flex; gap: 28px; }
        .landing-page-root .nav-links a {
          font-size: 13px; color: var(--muted); text-decoration: none;
          letter-spacing: 0.05em; transition: color 0.2s; cursor: pointer;
        }
        .landing-page-root .nav-links a:hover { color: var(--white); }

        .landing-page-root .hero {
          min-height: 580px;
          background: radial-gradient(ellipse 60% 70% at 80% 50%, rgba(107,15,15,0.35) 0%, transparent 70%),
                      radial-gradient(ellipse 40% 50% at 20% 80%, rgba(80,10,10,0.2) 0%, transparent 60%),
                      linear-gradient(180deg, #0d0202 0%, #050305 100%);
          display: grid; grid-template-columns: 1.1fr 0.9fr;
          position: relative; overflow: hidden;
        }
        .landing-page-root .hero-grid-bg {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(139,26,26,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(139,26,26,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%);
        }
        .landing-page-root .hero-left { padding: 90px 48px; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 2; }
        .landing-page-root .hero-right { display: flex; align-items: center; justify-content: center; padding: 48px 32px; position: relative; z-index: 2; }

        .landing-page-root .chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, rgba(139,26,26,0.3), rgba(80,10,10,0.2));
          border: 1px solid rgba(180,50,50,0.25);
          padding: 6px 14px; font-size: 11px; color: rgba(240,180,180,0.7);
          letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 28px;
          width: fit-content; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
          opacity: 0; animation: fadeUp 0.6s 0.3s forwards;
        }
        .landing-page-root .chip-dot {
          width: 6px; height: 6px; background: var(--maroon-glow); border-radius: 50%;
          box-shadow: 0 0 6px var(--maroon-glow); animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot { 0%, 100% { box-shadow: 0 0 6px var(--maroon-glow); } 50% { box-shadow: 0 0 12px var(--maroon-glow), 0 0 20px rgba(220,38,38,0.4); } }

        .landing-page-root h1.hero-title { font-size: 58px; font-weight: 800; line-height: 1.0; letter-spacing: -0.04em; margin-bottom: 24px; }
        .landing-page-root h1.hero-title .l1 { display: block; color: var(--white); opacity: 0; animation: fadeUp 0.6s 0.5s forwards; }
        .landing-page-root h1.hero-title .l2 {
          display: block; background: linear-gradient(135deg, var(--maroon-bright) 0%, var(--gold) 60%, var(--gold-light) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          opacity: 0; animation: fadeUp 0.6s 0.65s forwards;
        }
        .landing-page-root h1.hero-title .l3 { display: block; color: rgba(240,234,224,0.18); opacity: 0; animation: fadeUp 0.6s 0.8s forwards; }

        .landing-page-root .hero-sub { font-size: 14px; color: var(--muted); line-height: 1.8; max-width: 380px; margin-bottom: 40px; opacity: 0; animation: fadeUp 0.6s 0.95s forwards; }

        .landing-page-root .cta-row { display: flex; gap: 14px; align-items: center; opacity: 0; animation: fadeUp 0.6s 1.1s forwards; }
        .landing-page-root .btn-primary {
          background: linear-gradient(135deg, var(--maroon-bright) 0%, var(--maroon) 100%);
          color: #fff; border: 1px solid rgba(220,38,38,0.5);
          padding: 14px 28px; font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.03em;
          box-shadow: 0 4px 20px rgba(185,28,28,0.4), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: all 0.25s; border-radius: 2px; display: flex; align-items: center; gap: 8px;
        }
        .landing-page-root .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(185,28,28,0.55), inset 0 1px 0 rgba(255,255,255,0.15); }
        .landing-page-root .btn-outline {
          background: rgba(255,255,255,0.03); color: rgba(240,234,224,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 14px 28px; font-size: 14px; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.03em;
          transition: all 0.25s; border-radius: 2px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .landing-page-root .btn-outline:hover { background: rgba(139,26,26,0.15); border-color: rgba(180,50,50,0.35); color: var(--white); }

        .landing-page-root .glass-card-inner {
          background: linear-gradient(145deg, rgba(25,6,6,0.9) 0%, rgba(15,3,3,0.95) 100%);
          border: 1px solid var(--glass-border); border-radius: 4px;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(180,80,80,0.15) inset, 0 -1px 0 rgba(0,0,0,0.4) inset;
          padding: 28px; position: relative; overflow: hidden;
          opacity: 0; animation: scaleIn 0.7s 0.6s forwards;
        }
        .landing-page-root .glass-card-inner::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,100,100,0.3), transparent);
        }
        .landing-page-root .glass-card-inner::after {
          content: ''; position: absolute; inset: 0; border-radius: 4px;
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 50%); pointer-events: none;
        }

        .landing-page-root .grid-lbl { font-family: 'Space Mono', monospace; font-size: 9px; color: rgba(200,150,150,0.4); letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .landing-page-root .grid-lbl::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(139,26,26,0.3), transparent); }

        .landing-page-root .ctable { width: 100%; border-collapse: separate; border-spacing: 3px; }
        .landing-page-root .ctable th { font-family: 'Space Mono', monospace; font-size: 9px; color: rgba(240,234,224,0.2); text-align: center; padding: 4px 2px; letter-spacing: 0.1em; }
        .landing-page-root .slbl { font-family: 'Space Mono', monospace; font-size: 9px; color: rgba(200,100,100,0.4); padding: 2px 8px 2px 0; white-space: nowrap; }
        .landing-page-root .cell {
          height: 36px; border-radius: 3px; font-family: 'Space Mono', monospace; font-size: 9px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); border: 1px solid transparent;
        }
        .landing-page-root .cell.empty { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.04); color: rgba(255,255,255,0.1); }
        .landing-page-root .cell.filled {
          background: linear-gradient(135deg, rgba(107,15,15,0.5), rgba(60,8,8,0.6));
          border-color: rgba(139,26,26,0.4); color: rgba(240,180,180,0.7);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .landing-page-root .cell.hit {
          background: linear-gradient(135deg, rgba(185,28,28,0.5), rgba(139,26,26,0.4));
          border-color: rgba(220,38,38,0.7); color: #fca5a5;
          box-shadow: 0 0 10px rgba(220,38,38,0.25), inset 0 1px 0 rgba(255,200,200,0.15);
          animation: cellPop 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .landing-page-root .cell.miss {
          background: linear-gradient(135deg, rgba(30,5,5,0.8), rgba(50,8,8,0.7));
          border-color: rgba(100,20,20,0.6); color: rgba(200,100,100,0.6);
          animation: cellShake 0.3s ease;
        }
        .landing-page-root .cell.evict { background: rgba(10,2,2,0.8); border-color: rgba(80,10,10,0.4); color: rgba(150,50,50,0.5); }

        @keyframes cellPop { 0% { transform: scale(0.9); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes cellShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }

        .landing-page-root .log-bar {
          margin-top: 16px; background: rgba(5,1,1,0.8); border: 1px solid rgba(139,26,26,0.2);
          border-radius: 3px; padding: 10px 14px; font-family: 'Space Mono', monospace; font-size: 10px;
          display: flex; gap: 12px; align-items: center; box-shadow: inset 0 1px 0 rgba(0,0,0,0.5);
        }
        .landing-page-root .lb-hit { color: #fca5a5; }
        .landing-page-root .lb-miss { color: rgba(200,100,100,0.5); }
        .landing-page-root .lb-dim { color: rgba(200,150,150,0.3); }
        .landing-page-root .lb-cursor { color: var(--maroon-bright); animation: blink 1s step-end infinite; }

        .landing-page-root .ticker {
          background: linear-gradient(135deg, var(--maroon) 0%, var(--maroon-deep) 100%);
          padding: 12px 0; overflow: hidden; white-space: nowrap;
          border-top: 1px solid rgba(180,50,50,0.2); border-bottom: 1px solid rgba(180,50,50,0.2);
          box-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        .landing-page-root .ticker-inner { display: inline-flex; animation: ticker-anim 22s linear infinite; }
        .landing-page-root .ti { font-family: 'Space Mono', monospace; font-size: 11px; color: rgba(240,200,200,0.5); padding: 0 28px; letter-spacing: 0.08em; font-weight: 700; }
        .landing-page-root .ts { color: rgba(180,50,50,0.5); }

        .landing-page-root .metrics { display: grid; grid-template-columns: repeat(4, 1fr); background: var(--surface); }
        .landing-page-root .metric {
          padding: 40px 28px; border-right: 1px solid rgba(139,26,26,0.1);
          position: relative; overflow: hidden; transition: background 0.4s;
          background: linear-gradient(180deg, rgba(15,3,3,1) 0%, rgba(8,1,1,1) 100%);
        }
        .landing-page-root .metric::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--maroon-bright), transparent); opacity: 0; transition: opacity 0.4s; }
        .landing-page-root .metric:hover::before { opacity: 1; }
        .landing-page-root .metric:hover { background: linear-gradient(180deg, rgba(30,5,5,1) 0%, rgba(15,2,2,1) 100%); }
        .landing-page-root .metric:last-child { border-right: none; }
        .landing-page-root .m-num {
          font-size: 46px; font-weight: 800; font-family: 'Space Mono', monospace;
          line-height: 1; letter-spacing: -0.04em;
          background: linear-gradient(135deg, var(--white) 0%, rgba(240,180,180,0.7) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .landing-page-root .m-unit { font-size: 18px; background: linear-gradient(135deg, var(--maroon-bright), var(--maroon-mid)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .landing-page-root .m-label { font-size: 11px; color: var(--muted); margin-top: 10px; letter-spacing: 0.08em; text-transform: uppercase; }

        .landing-page-root .features {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
          background: rgba(139,26,26,0.1); border-top: 1px solid rgba(139,26,26,0.1); border-bottom: 1px solid rgba(139,26,26,0.1);
        }
        .landing-page-root .feat {
          padding: 44px 32px; background: linear-gradient(180deg, rgba(12,2,2,1) 0%, rgba(8,1,1,1) 100%);
          position: relative; overflow: hidden; transition: background 0.4s;
        }
        .landing-page-root .feat:hover { background: linear-gradient(180deg, rgba(20,4,4,1) 0%, rgba(12,2,2,1) 100%); }
        .landing-page-root .feat-glow { position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(139,26,26,0.15) 0%, transparent 70%); pointer-events: none; transition: opacity 0.4s; opacity: 0; }
        .landing-page-root .feat:hover .feat-glow { opacity: 1; }
        .landing-page-root .feat-num { font-family: 'Space Mono', monospace; font-size: 11px; color: rgba(180,50,50,0.4); letter-spacing: 0.2em; margin-bottom: 20px; }
        .landing-page-root .feat-title { font-size: 20px; font-weight: 700; color: var(--white); margin-bottom: 12px; letter-spacing: -0.02em; line-height: 1.2; }
        .landing-page-root .feat-body { font-size: 13px; color: var(--muted); line-height: 1.75; }
        .landing-page-root .feat-line { width: 32px; height: 2px; background: linear-gradient(90deg, var(--maroon-bright), var(--maroon)); margin-bottom: 20px; transition: width 0.4s; }
        .landing-page-root .feat:hover .feat-line { width: 56px; }

        .landing-page-root .policies { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(60,5,5,0.3); }
        .landing-page-root .pc {
          padding: 40px 32px; background: linear-gradient(160deg, rgba(15,3,3,1) 0%, rgba(8,1,1,1) 100%);
          position: relative; overflow: hidden; transition: all 0.35s; cursor: default;
        }
        .landing-page-root .pc::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(139,26,26,0.3), transparent); }
        .landing-page-root .pc:hover { background: linear-gradient(160deg, rgba(25,5,5,1) 0%, rgba(12,2,2,1) 100%); }
        .landing-page-root .pc-accent { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--maroon-bright), transparent); transform: scaleX(0); transform-origin: left; transition: transform 0.4s ease; }
        .landing-page-root .pc:hover .pc-accent { transform: scaleX(1); }
        .landing-page-root .pc-icon {
          width: 44px; height: 44px; background: linear-gradient(135deg, rgba(139,26,26,0.3), rgba(80,10,10,0.2));
          border: 1px solid rgba(180,50,50,0.2); border-radius: 3px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700;
          color: rgba(220,100,100,0.7); margin-bottom: 20px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
          transition: box-shadow 0.3s, border-color 0.3s;
        }
        .landing-page-root .pc:hover .pc-icon { border-color: rgba(220,38,38,0.4); box-shadow: 0 0 12px rgba(185,28,28,0.2), inset 0 1px 0 rgba(255,255,255,0.08); }
        .landing-page-root .pc-name { font-family: 'Space Mono', monospace; font-size: 22px; font-weight: 700; color: var(--white); margin-bottom: 4px; letter-spacing: -0.02em; }
        .landing-page-root .pc-full { font-size: 11px; color: var(--muted); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 16px; }
        .landing-page-root .pc-desc { font-size: 13px; color: rgba(180,130,130,0.45); line-height: 1.7; }
        .landing-page-root .pc-badge {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 20px; font-size: 10px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.1em; padding: 5px 12px; background: rgba(139,26,26,0.15);
          border: 1px solid rgba(180,50,50,0.2); color: rgba(220,150,150,0.6);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04); transition: all 0.3s;
        }
        .landing-page-root .pc:hover .pc-badge { background: rgba(185,28,28,0.2); border-color: rgba(220,38,38,0.35); color: rgba(240,180,180,0.8); }

        .landing-page-root .footer {
          background: linear-gradient(135deg, var(--maroon-deep) 0%, rgba(5,1,5,1) 50%, var(--maroon-deep) 100%);
          padding: 60px 40px; display: flex; align-items: center; justify-content: space-between;
          position: relative; overflow: hidden; border-top: 1px solid rgba(139,26,26,0.2);
        }
        .landing-page-root .footer::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 100%, rgba(139,26,26,0.2) 0%, transparent 60%); pointer-events: none;
        }
        .landing-page-root .footer-bg-text {
          position: absolute; right: -10px; top: 50%; transform: translateY(-50%);
          font-family: 'Space Mono', monospace; font-size: 110px; font-weight: 700;
          color: rgba(139,26,26,0.05); letter-spacing: -0.05em; pointer-events: none; white-space: nowrap;
        }
        .landing-page-root .fhead { font-size: 32px; font-weight: 800; color: var(--white); letter-spacing: -0.03em; line-height: 1.2; position: relative; z-index: 1; }
        .landing-page-root .fhead span { background: linear-gradient(135deg, var(--maroon-bright), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .landing-page-root .fbtn {
          background: linear-gradient(135deg, rgba(240,234,224,1) 0%, rgba(220,210,195,1) 100%);
          color: var(--maroon-deep); border: none; padding: 15px 34px; font-size: 14px; font-weight: 800; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.04em;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8); transition: all 0.25s; border-radius: 2px; position: relative; z-index: 1;
        }
        .landing-page-root .fbtn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.9); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
        @keyframes ticker-anim { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes blink { 50% { opacity: 0; } }

        .landing-page-root .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .landing-page-root .reveal.on { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* <nav> removed so it uses the app's Sidebar layout, or we can keep it inside if the user expects it. The instruction says "DO NOT alter routing" which might imply keeping Sidebar intact, but the user's provided code has nav. We will include it here since it was explicitly provided. */}
      <nav>
        <div className="nav-logo">Cache<span style={{ background: 'linear-gradient(135deg,#B91C1C,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sim</span></div>
        <div className="nav-links hidden md:flex">
          <a onClick={() => navigate('/configure')}>Configure</a>
          <a onClick={() => navigate('/simulate')}>Dashboard</a>
          <a onClick={() => navigate('/compare')}>Compare</a>
          <a onClick={() => navigate('/about')}>Theory</a>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-grid-bg"></div>
        <div className="hero-left">
          <h1 className="hero-title">
            <span className="l1">Cache Memory</span>
            <span className="l2">Simulation</span>
            <span className="l3">Engine.</span>
          </h1>
          <p className="hero-sub">Trace memory accesses through LRU, FIFO, and LFU replacement policies. Compare AMAT and CPI on identical workloads. Zero server — runs entirely in your browser.</p>
          <div className="cta-row">
            <button className="btn-primary" onClick={() => navigate('/configure')}>Start Simulating →</button>
            <button className="btn-outline" onClick={() => navigate('/about')}>Read Theory</button>
          </div>
        </div>
        <div className="hero-right hidden md:flex">
          <div className="glass-card-inner gloss" style={{ width: '100%', maxWidth: '380px' }}>
            <div className="grid-lbl">Live cache state — 4-way set associative</div>
            <table className="ctable">
              <thead><tr><th></th><th>Way 0</th><th>Way 1</th><th>Way 2</th><th>Way 3</th></tr></thead>
              <tbody>
                {st.map((row, sIndex) => (
                  <tr key={sIndex}>
                    <td className="slbl">S{sIndex}</td>
                    {row.map((cellState, wIndex) => (
                      <td key={wIndex}>
                        <div className={`cell ${cellState}`}>
                          {tv[sIndex][wIndex] || '—'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="log-bar">
              <span className="lb-dim">{logAddr}</span>
              <span className={logHit ? 'lb-hit' : 'lb-miss'}>{logHit ? 'HIT' : 'MISS'}</span>
              <span className="lb-dim">{logInfo}</span>
              <span className="lb-cursor">█</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ticker">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <span key={i}>
              <span className="ti">LRU — Least Recently Used <span className="ts">◆</span></span>
              <span className="ti">FIFO — First In First Out <span className="ts">◆</span></span>
              <span className="ti">LFU — Least Frequently Used <span className="ts">◆</span></span>
              <span className="ti">AMAT = Hit Time + (Miss Rate × Miss Penalty) <span className="ts">◆</span></span>
              <span className="ti">CPI = Base CPI + (Miss Rate × Miss Penalty) <span className="ts">◆</span></span>
              <span className="ti">Direct Mapped · Set Associative · Fully Associative <span className="ts">◆</span></span>
            </span>
          ))}
        </div>
      </div>

      <div className="metrics grid-cols-2 md:grid-cols-4">
        <div className="metric reveal"><div className="m-num"><span className="ctr" data-t="74">0</span><span className="m-unit">%</span></div><div className="m-label">Hit Rate (LRU)</div></div>
        <div className="metric reveal"><div className="m-num"><span className="ctr" data-t="27">0</span><span className="m-unit">cyc</span></div><div className="m-label">AMAT</div></div>
        <div className="metric reveal"><div className="m-num"><span className="ctr" data-t="3">0</span><span className="m-unit">×</span></div><div className="m-label">Policies</div></div>
        <div className="metric reveal"><div className="m-num"><span className="ctr" data-t="0">0</span><span className="m-unit">ms</span></div><div className="m-label">Server Latency</div></div>
      </div>

      <div className="features grid-cols-1 md:grid-cols-3">
        <div className="feat reveal">
          <div className="feat-glow"></div>
          <div className="feat-num">01 — VISUALIZE</div>
          <div className="feat-line"></div>
          <div className="feat-title">Live animated cache grid</div>
          <div className="feat-body">Step through every memory access. Watch sets fill, evictions fire, and hit/miss patterns emerge in real time. Play, pause, rewind.</div>
        </div>
        <div className="feat reveal">
          <div className="feat-glow"></div>
          <div className="feat-num">02 — COMPARE</div>
          <div className="feat-line"></div>
          <div className="feat-title">Benchmark all three policies</div>
          <div className="feat-body">Run the same trace through LRU, FIFO, and LFU simultaneously. Clear winner verdict with AMAT and CPI breakdowns.</div>
        </div>
        <div className="feat reveal">
          <div className="feat-glow"></div>
          <div className="feat-num">03 — EXPORT</div>
          <div className="feat-line"></div>
          <div className="feat-title">PDF and CSV reports</div>
          <div className="feat-body">Download a formatted simulation report with config, hit rates, AMAT, and full access trace logs for analysis.</div>
        </div>
      </div>

      <div className="policies grid-cols-1 md:grid-cols-3">
        <div className="pc reveal">
          <div className="pc-accent"></div>
          <div className="pc-icon">LRU</div>
          <div className="pc-name">LRU</div>
          <div className="pc-full">Least Recently Used</div>
          <div className="pc-desc">Evicts the block not accessed for the longest time. Excels with strong temporal locality workloads where recent = reused.</div>
          <div className="pc-badge">◆ TEMPORAL LOCALITY</div>
        </div>
        <div className="pc reveal">
          <div className="pc-accent"></div>
          <div className="pc-icon">FIFO</div>
          <div className="pc-name">FIFO</div>
          <div className="pc-full">First In, First Out</div>
          <div className="pc-desc">Evicts by insertion order using a round-robin pointer. Simple hardware, no access tracking required per line.</div>
          <div className="pc-badge">◆ INSERTION ORDER</div>
        </div>
        <div className="pc reveal">
          <div className="pc-accent"></div>
          <div className="pc-icon">LFU</div>
          <div className="pc-name">LFU</div>
          <div className="pc-full">Least Frequently Used</div>
          <div className="pc-desc">Evicts the block with fewest total accesses. Wins when a concentrated hot-set is accessed repeatedly across the trace.</div>
          <div className="pc-badge">◆ ACCESS FREQUENCY</div>
        </div>
      </div>

      <div className="footer reveal flex-col md:flex-row gap-8 text-center md:text-left">
        <div className="footer-bg-text">CacheSim</div>
        <div className="fhead">Ready to simulate?<br/><span>Start with a trace.</span></div>
        <button className="fbtn" onClick={() => navigate('/configure')}>Launch CacheSim →</button>
      </div>
    </div>
  );
}

