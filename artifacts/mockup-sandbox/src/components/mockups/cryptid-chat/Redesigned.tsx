import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  EyeOff,
  Info,
  LockKeyhole,
  MoreHorizontal,
  Send,
  ShieldCheck,
  Sparkle,
  X,
} from "lucide-react";

type LocalMessage = {
  id: number;
  text: string;
  time: string;
};

export function Redesigned() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => timersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;

    const id = Date.now() + Math.floor(Math.random() * 1000);
    const localMessage = { id, text, time: "just now" };
    setMessages((current) => [...current, localMessage]);
    setDraft("");
    if (composerRef.current) composerRef.current.style.height = "auto";

    const timer = window.setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
      timersRef.current = timersRef.current.filter((activeTimer) => activeTimer !== timer);
    }, 12_000);
    timersRef.current.push(timer);
  }

  function clearRoom() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
    setMessages([]);
    setDraft("");
    setMenuOpen(false);
    setNotice("This local view has been cleared.");
    window.setTimeout(() => setNotice(""), 3200);
  }

  return (
    <main className="cryptid-redesign">
      <style>{`
        .cryptid-redesign {
          --paper: #f4f0e8;
          --paper-bright: #fbf9f4;
          --paper-deep: #e9e3d8;
          --ink: #252a28;
          --ink-soft: #565d57;
          --ink-faint: #80857e;
          --line: #d8d2c6;
          --line-dark: #c8c1b4;
          --forest: #28544a;
          --forest-deep: #1f433b;
          --forest-wash: #e4ece5;
          --coral: #b85842;
          --coral-wash: #f1e3dc;
          --font-body: "Avenir Next", Avenir, "Segoe UI", sans-serif;
          --font-display: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
          --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          min-height: 100dvh;
          color: var(--ink);
          background:
            radial-gradient(ellipse at 82% 0%, rgba(224, 215, 196, .42), transparent 31rem),
            var(--paper);
          font-family: var(--font-body);
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }
        .cryptid-redesign *,
        .cryptid-redesign *::before,
        .cryptid-redesign *::after { box-sizing: border-box; }
        .cryptid-redesign::after {
          content: "";
          position: fixed;
          z-index: 10;
          inset: 0;
          pointer-events: none;
          opacity: .11;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.84' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");
        }
        .cr-shell {
          width: min(1480px, 100%);
          min-height: 100dvh;
          margin: 0 auto;
          padding: 0 38px;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }
        .cr-topbar {
          min-height: 76px;
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1px solid var(--line);
        }
        .cr-wordmark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-width: 190px;
          color: var(--ink);
          font: 600 16px/1 var(--font-display);
          letter-spacing: -.035em;
        }
        .cr-mark {
          width: 29px;
          height: 29px;
          display: grid;
          place-items: center;
          color: var(--paper-bright);
          background: var(--forest);
          border-radius: 9px 9px 9px 3px;
        }
        .cr-mark svg { width: 16px; height: 16px; }
        .cr-top-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--ink-faint);
          font: 10px/1 var(--font-mono);
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .cr-top-label::before {
          content: "";
          width: 1px;
          height: 20px;
          margin-right: 2px;
          background: var(--line-dark);
        }
        .cr-top-actions { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .cr-session-pill {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--line-dark);
          border-radius: 999px;
          padding: 0 12px;
          color: var(--ink-soft);
          background: rgba(251, 249, 244, .66);
          font-size: 11px;
          letter-spacing: .01em;
        }
        .cr-session-pill svg { color: var(--forest); }
        .cr-top-button, .cr-back, .cr-menu-button, .cr-mobile-info {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 1px solid transparent;
          border-radius: 50%;
          background: transparent;
          color: var(--ink-soft);
          cursor: pointer;
          transition: color .18s ease, background .18s ease, border-color .18s ease, transform .18s ease;
        }
        .cr-top-button:hover, .cr-back:hover, .cr-menu-button:hover, .cr-mobile-info:hover {
          color: var(--forest-deep);
          background: var(--forest-wash);
          border-color: #cfdbd0;
        }
        .cr-top-button:active, .cr-back:active, .cr-menu-button:active { transform: scale(.96); }
        .cr-content {
          flex: 1;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(170px, 1fr) minmax(400px, 660px) minmax(230px, 1fr);
          gap: clamp(24px, 4vw, 66px);
          padding: 32px 0 26px;
        }
        .cr-left-rail {
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding-top: 11px;
        }
        .cr-back {
          width: auto;
          height: 35px;
          align-self: flex-start;
          display: inline-flex;
          gap: 9px;
          padding: 0 10px 0 8px;
          border-radius: 20px;
          font-size: 11px;
          color: var(--ink-faint);
        }
        .cr-rail-rule { height: 1px; background: var(--line); margin: 26px 0 20px; }
        .cr-kicker {
          color: var(--ink-faint);
          font: 9px/1.4 var(--font-mono);
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .cr-channel-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 10px;
          margin: 12px -10px 0;
          border: 1px solid #d3d9cd;
          border-radius: 13px;
          background: rgba(228, 236, 229, .72);
        }
        .cr-room-symbol {
          flex: 0 0 auto;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          color: var(--forest);
          background: #f4f6ef;
          border: 1px solid #d1d9cf;
        }
        .cr-channel-copy { min-width: 0; }
        .cr-channel-copy strong { display: block; font-size: 12px; font-weight: 650; }
        .cr-channel-copy span { display: block; margin-top: 4px; color: var(--ink-faint); font-size: 10px; }
        .cr-rail-note {
          margin-top: auto;
          padding: 15px 0 2px;
          color: var(--ink-faint);
          font: 10px/1.7 var(--font-mono);
          letter-spacing: .01em;
        }
        .cr-rail-note b { display: block; margin-bottom: 7px; color: var(--coral); font-weight: 500; }
        .cr-chat-panel {
          display: flex;
          min-width: 0;
          min-height: 650px;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #d7d1c6;
          border-radius: 19px;
          background: rgba(251, 249, 244, .8);
          box-shadow: 0 20px 60px rgba(59, 52, 38, .055), 0 2px 6px rgba(59, 52, 38, .025);
          animation: cr-enter .55s cubic-bezier(.2,.75,.25,1) both;
        }
        .cr-chat-header {
          min-height: 76px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--line);
          background: rgba(255, 254, 250, .58);
        }
        .cr-back-mobile { display: none; }
        .cr-identity-mark {
          width: 41px;
          height: 41px;
          display: grid;
          place-items: center;
          border-radius: 14px 14px 14px 5px;
          border: 1px solid #d2d7cb;
          background: #e9eee5;
          color: var(--forest);
        }
        .cr-identity { flex: 1; min-width: 0; }
        .cr-identity h1 { margin: 0; font: 500 20px/1.1 var(--font-display); letter-spacing: -.025em; }
        .cr-identity p {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 6px 0 0;
          color: var(--ink-faint);
          font-size: 10px;
        }
        .cr-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #658771; }
        .cr-header-separator { width: 1px; height: 28px; background: var(--line); margin: 0 4px; }
        .cr-header-mode {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--ink-soft);
          font: 9px/1.3 var(--font-mono);
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .cr-header-mode svg { color: var(--coral); }
        .cr-menu-wrap { position: relative; }
        .cr-menu-button { width: 32px; height: 32px; }
        .cr-dropdown {
          position: absolute;
          z-index: 20;
          right: 0;
          top: calc(100% + 9px);
          width: 188px;
          padding: 6px;
          border: 1px solid var(--line-dark);
          border-radius: 12px;
          background: var(--paper-bright);
          box-shadow: 0 14px 30px rgba(35, 37, 30, .14);
          animation: cr-pop .16s ease-out both;
        }
        .cr-dropdown button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 0;
          border-radius: 8px;
          padding: 9px 10px;
          background: transparent;
          color: var(--ink-soft);
          text-align: left;
          font: 11px var(--font-body);
          cursor: pointer;
        }
        .cr-dropdown button:hover { background: var(--paper); color: var(--ink); }
        .cr-room-notice {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin: 18px 19px 0;
          padding: 12px 14px;
          border: 1px solid #d5ddd1;
          border-radius: 11px;
          background: #edf1e9;
          color: #44564a;
          font-size: 10px;
          line-height: 1.55;
        }
        .cr-room-notice svg { margin-top: 1px; flex: 0 0 auto; color: var(--forest); }
        .cr-room-notice strong { color: #293b31; font-weight: 650; }
        .cr-room-notice em { color: #657568; font-style: normal; }
        .cr-feed {
          flex: 1;
          min-height: 340px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 30px 28px;
        }
        .cr-empty {
          width: min(100%, 360px);
          align-self: center;
          text-align: center;
          animation: cr-fade-up .7s .08s ease-out both;
        }
        .cr-empty-stamp {
          width: 56px;
          height: 56px;
          margin: 0 auto 19px;
          display: grid;
          place-items: center;
          border: 1px solid #dbd4c8;
          border-radius: 50%;
          color: var(--coral);
          background: #f7f2e8;
          box-shadow: 0 0 0 7px rgba(233, 227, 216, .38);
        }
        .cr-empty .cr-kicker { color: var(--coral); }
        .cr-empty h2 {
          margin: 10px 0 8px;
          font: 400 clamp(24px, 2.3vw, 30px)/1.14 var(--font-display);
          letter-spacing: -.035em;
        }
        .cr-empty p {
          max-width: 320px;
          margin: 0 auto;
          color: var(--ink-soft);
          font-size: 12px;
          line-height: 1.7;
        }
        .cr-empty-foot {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 23px;
          padding-top: 12px;
          border-top: 1px solid var(--line);
          color: var(--ink-faint);
          font: 9px/1.3 var(--font-mono);
        }
        .cr-message-list { display: flex; flex-direction: column; gap: 10px; }
        .cr-message-row { display: flex; justify-content: flex-end; animation: cr-message-in .28s ease-out both; }
        .cr-message {
          max-width: min(82%, 420px);
          padding: 12px 14px 9px;
          border: 1px solid #315c50;
          border-radius: 15px 15px 4px 15px;
          color: #f8f4ea;
          background: var(--forest);
          box-shadow: 0 4px 12px rgba(40, 84, 74, .11);
        }
        .cr-message p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 13px; line-height: 1.55; }
        .cr-message small { display: flex; justify-content: flex-end; align-items: center; gap: 5px; margin-top: 8px; color: #d0dfd5; font: 9px var(--font-mono); }
        .cr-composer-area { padding: 0 19px 16px; }
        .cr-composer {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 8px 8px 8px 14px;
          border: 1px solid var(--line-dark);
          border-radius: 14px;
          background: var(--paper-bright);
          transition: border-color .18s ease, box-shadow .18s ease;
        }
        .cr-composer:focus-within {
          border-color: #91a69a;
          box-shadow: 0 0 0 3px rgba(40, 84, 74, .09);
        }
        .cr-composer textarea {
          flex: 1;
          min-width: 0;
          min-height: 38px;
          max-height: 130px;
          resize: none;
          padding: 10px 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--ink);
          font: 12px/1.5 var(--font-body);
        }
        .cr-composer textarea::placeholder { color: #92938b; }
        .cr-send {
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 11px;
          color: #f8f4ea;
          background: var(--forest);
          cursor: pointer;
          transition: background .18s ease, transform .18s ease;
        }
        .cr-send:not(:disabled):hover { background: var(--forest-deep); transform: translateY(-1px); }
        .cr-send:disabled { color: #92988f; background: #e9e6df; cursor: not-allowed; }
        .cr-composer-foot {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 3px 0;
          color: var(--ink-faint);
          font: 9px/1.4 var(--font-mono);
        }
        .cr-compose-hint { display: inline-flex; align-items: center; gap: 5px; }
        .cr-right-rail { min-width: 0; padding-top: 94px; }
        .cr-side-title {
          margin: 0 0 15px;
          color: var(--ink-faint);
          font: 9px/1.3 var(--font-mono);
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .cr-fact {
          padding: 15px 0 17px;
          border-top: 1px solid var(--line);
        }
        .cr-fact-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .cr-fact-head span {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--ink-soft);
          font-size: 11px;
          font-weight: 600;
        }
        .cr-fact-head svg { color: var(--forest); }
        .cr-fact-value {
          display: block;
          margin: 11px 0 5px;
          font: 400 26px/1 var(--font-display);
          letter-spacing: -.04em;
          color: var(--ink);
        }
        .cr-fact-value small { margin-left: 5px; color: var(--ink-faint); font: 10px var(--font-mono); letter-spacing: 0; }
        .cr-fact p { margin: 0; color: var(--ink-soft); font-size: 10px; line-height: 1.6; }
        .cr-public-count {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 12px 0 6px;
        }
        .cr-public-count strong { color: var(--forest); font: 400 31px/1 var(--font-display); }
        .cr-public-count span { color: var(--ink-soft); font: 10px var(--font-mono); }
        .cr-disclosure {
          margin-top: 8px;
          padding: 12px;
          border: 1px solid #e1cfc5;
          border-radius: 10px;
          background: rgba(241, 227, 220, .57);
          color: #6d544b;
          font-size: 9px;
          line-height: 1.65;
        }
        .cr-disclosure b { color: #664438; font-weight: 650; }
        .cr-disclosure-link {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          border: 0;
          color: var(--forest);
          background: transparent;
          font: 10px var(--font-body);
          cursor: pointer;
        }
        .cr-disclosure-link:hover { color: var(--coral); }
        .cr-footer {
          min-height: 47px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border-top: 1px solid var(--line);
          color: var(--ink-faint);
          font: 9px/1.4 var(--font-mono);
        }
        .cr-footer-left, .cr-footer-right { display: inline-flex; align-items: center; gap: 8px; }
        .cr-footer svg { color: var(--forest); }
        .cr-toast {
          position: fixed;
          z-index: 30;
          left: 50%;
          bottom: 25px;
          transform: translateX(-50%);
          padding: 10px 14px;
          border: 1px solid var(--line-dark);
          border-radius: 999px;
          color: var(--ink);
          background: var(--paper-bright);
          box-shadow: 0 8px 24px rgba(35, 37, 30, .11);
          font-size: 11px;
          animation: cr-fade-up .2s ease-out both;
        }
        .cr-modal-backdrop {
          position: fixed;
          z-index: 40;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(37, 42, 40, .22);
          animation: cr-fade .16s ease-out both;
        }
        .cr-modal {
          width: min(440px, 100%);
          padding: 23px;
          border: 1px solid var(--line-dark);
          border-radius: 18px;
          background: var(--paper-bright);
          box-shadow: 0 24px 70px rgba(37, 42, 40, .18);
          animation: cr-modal-in .2s ease-out both;
        }
        .cr-modal-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; }
        .cr-modal-top h2 { margin: 0; font: 400 23px/1.15 var(--font-display); letter-spacing: -.025em; }
        .cr-modal-close {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border: 1px solid var(--line);
          border-radius: 50%;
          color: var(--ink-soft);
          background: transparent;
          cursor: pointer;
        }
        .cr-modal p { color: var(--ink-soft); font-size: 12px; line-height: 1.7; }
        .cr-modal-list { display: grid; gap: 10px; margin: 17px 0 0; padding: 14px 0 0; border-top: 1px solid var(--line); list-style: none; }
        .cr-modal-list li { display: flex; align-items: flex-start; gap: 9px; color: var(--ink-soft); font-size: 11px; line-height: 1.55; }
        .cr-modal-list svg { flex: 0 0 auto; margin-top: 1px; color: var(--forest); }
        .cr-mobile-info { display: none; }
        .cryptid-redesign button:focus-visible, .cryptid-redesign textarea:focus-visible {
          outline: 3px solid rgba(184, 88, 66, .55);
          outline-offset: 3px;
        }
        @keyframes cr-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cr-fade-up { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cr-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cr-pop { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cr-message-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cr-modal-in { from { opacity: 0; transform: translateY(5px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (max-width: 1000px) {
          .cr-shell { padding: 0 25px; }
          .cr-content { grid-template-columns: 150px minmax(350px, 1fr); gap: 26px; }
          .cr-right-rail { display: none; }
          .cr-mobile-info { display: grid; }
        }
        @media (max-width: 680px) {
          .cryptid-redesign { overflow: auto; }
          .cr-shell { padding: 0 15px; min-height: 100dvh; }
          .cr-topbar { min-height: 60px; gap: 10px; }
          .cr-wordmark { min-width: 0; font-size: 15px; }
          .cr-mark { width: 26px; height: 26px; }
          .cr-top-label { display: none; }
          .cr-top-actions { gap: 5px; }
          .cr-session-pill { min-height: 30px; padding: 0 9px; font-size: 10px; }
          .cr-top-button { width: 32px; height: 32px; }
          .cr-content { display: flex; padding: 12px 0 14px; }
          .cr-left-rail { display: none; }
          .cr-chat-panel { min-height: calc(100dvh - 132px); width: 100%; border-radius: 16px; }
          .cr-chat-header { min-height: 66px; padding: 12px 13px; gap: 10px; }
          .cr-back-mobile { display: grid; width: 30px; height: 30px; }
          .cr-identity-mark { width: 36px; height: 36px; border-radius: 12px 12px 12px 4px; }
          .cr-identity h1 { font-size: 18px; }
          .cr-identity p { font-size: 9px; }
          .cr-header-separator, .cr-header-mode { display: none; }
          .cr-mobile-info { width: 30px; height: 30px; }
          .cr-room-notice { margin: 12px 12px 0; padding: 10px; gap: 8px; font-size: 9px; }
          .cr-feed { min-height: 250px; padding: 23px 16px; }
          .cr-empty h2 { font-size: 25px; }
          .cr-composer-area { padding: 0 11px 11px; }
          .cr-composer { gap: 7px; padding-left: 11px; }
          .cr-composer textarea { font-size: 12px; }
          .cr-composer-foot { font-size: 8px; }
          .cr-footer { min-height: 43px; gap: 8px; font-size: 8px; }
          .cr-footer-right { display: none; }
        }
        @media (max-width: 370px) {
          .cr-shell { padding: 0 10px; }
          .cr-session-pill span { display: none; }
          .cr-session-pill { width: 31px; justify-content: center; padding: 0; }
          .cr-composer-hint { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cryptid-redesign *, .cryptid-redesign *::before, .cryptid-redesign *::after {
            scroll-behavior: auto !important;
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="cr-shell">
        <header className="cr-topbar">
          <div className="cr-wordmark">
            <span className="cr-mark"><EyeOff aria-hidden="true" /></span>
            <span>CryptID</span>
          </div>
          <div className="cr-top-label">A room for the moment</div>
          <div className="cr-top-actions">
            <div className="cr-session-pill" aria-label="Login session lasts 24 hours">
              <Clock3 size={13} aria-hidden="true" />
              <span>Session · 24 hours</span>
            </div>
            <button className="cr-top-button cr-mobile-info" type="button" aria-label="About this room" onClick={() => setDetailsOpen(true)}>
              <Info size={16} />
            </button>
            <button className="cr-top-button" type="button" aria-label="Open session details" onClick={() => setDetailsOpen(true)}>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </header>

        <div className="cr-content">
          <aside className="cr-left-rail" aria-label="Room navigation">
            <button className="cr-back" type="button" onClick={() => setNotice("You are already in your only open room.")}>
              <ArrowLeft size={15} />
              <span>All rooms</span>
            </button>
            <div className="cr-rail-rule" />
            <div className="cr-kicker">Open now</div>
            <div className="cr-channel-card">
              <div className="cr-room-symbol"><LockKeyhole size={16} /></div>
              <div className="cr-channel-copy">
                <strong>Quiet room</strong>
                <span>Local · temporary</span>
              </div>
            </div>
            <div className="cr-rail-note">
              <b>01 / 01</b>
              One room. No history to catch up on.
            </div>
          </aside>

          <section className="cr-chat-panel" aria-label="Quiet room conversation">
            <header className="cr-chat-header">
              <button className="cr-back cr-back-mobile" type="button" aria-label="Back to rooms" onClick={() => setNotice("You are already in your only open room.")}>
                <ArrowLeft size={16} />
              </button>
              <div className="cr-identity-mark"><Sparkle size={18} /></div>
              <div className="cr-identity">
                <h1>Quiet room</h1>
                <p><i className="cr-status-dot" /> This browser · ready when you are</p>
              </div>
              <span className="cr-header-separator" />
              <div className="cr-header-mode"><EyeOff size={13} /> View once</div>
              <div className="cr-menu-wrap">
                <button
                  className="cr-menu-button"
                  type="button"
                  aria-label="Room options"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <MoreHorizontal size={19} />
                </button>
                {menuOpen && (
                  <div className="cr-dropdown" role="menu">
                    <button type="button" role="menuitem" onClick={() => { setDetailsOpen(true); setMenuOpen(false); }}>
                      <Info size={14} /> How this room works
                    </button>
                    <button type="button" role="menuitem" onClick={clearRoom}>
                      <X size={14} /> Clear this local view
                    </button>
                  </div>
                )}
              </div>
            </header>

            <div className="cr-room-notice">
              <Info size={15} aria-hidden="true" />
              <div>
                <strong>Local to this browser.</strong> Messages you write here stay in this browser/runtime and are not delivered to another person.
                <em> This is not end-to-end encrypted.</em>
              </div>
            </div>

            <div className="cr-feed" aria-live="polite" aria-relevant="additions removals">
              {messages.length === 0 ? (
                <div className="cr-empty">
                  <div className="cr-empty-stamp"><EyeOff size={21} /></div>
                  <div className="cr-kicker">No conversation history</div>
                  <h2>Say it while<br />the room is open.</h2>
                  <p>Your message is a local preview, not a delivery. It fades from this view after a short moment.</p>
                  <div className="cr-empty-foot"><Check size={12} /> Nothing to scroll back through</div>
                </div>
              ) : (
                <div className="cr-message-list">
                  {messages.map((message) => (
                    <div className="cr-message-row" key={message.id}>
                      <div className="cr-message">
                        <p>{message.text}</p>
                        <small>{message.time} <EyeOff size={11} aria-label="Temporary local message" /></small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cr-composer-area">
              <div className="cr-composer">
                <textarea
                  ref={composerRef}
                  aria-label="Write a local message"
                  placeholder="Write a message for this moment"
                  maxLength={500}
                  rows={1}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    event.currentTarget.style.height = "auto";
                    event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 130)}px`;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button className="cr-send" type="button" onClick={sendMessage} disabled={!draft.trim()} aria-label="Send local preview">
                  <Send size={16} />
                </button>
              </div>
              <div className="cr-composer-foot">
                <span className="cr-compose-hint"><ChevronDown size={11} /> Enter to preview · Shift + Enter for a line break</span>
                <span>{draft.length} / 500</span>
              </div>
            </div>
          </section>

          <aside className="cr-right-rail" aria-label="Room details">
            <h2 className="cr-side-title">A few clear things</h2>
            <div className="cr-fact">
              <div className="cr-fact-head"><span><Clock3 size={14} /> Login session</span></div>
              <span className="cr-fact-value">24<small>hours</small></span>
              <p>Your shared account login expires after 24 hours. This timer is separate from how long a message appears.</p>
            </div>
            <div className="cr-fact">
              <div className="cr-fact-head"><span><EyeOff size={14} /> Message lifetime</span></div>
              <span className="cr-fact-value">A moment</span>
              <p>Local message previews disappear from this view after 12 seconds. They are not sent to another person.</p>
            </div>
            <div className="cr-fact">
              <div className="cr-fact-head"><span><ShieldCheck size={14} /> Ghost-log disclosure</span></div>
              <div className="cr-public-count"><strong>0</strong><span>public details</span></div>
              <p>The public disclosure contains exactly zero details.</p>
              <div className="cr-disclosure"><b>Not zero private security events.</b> Private operational security records may still exist. No message contents, usernames, credentials, or IP addresses are displayed here as security logs.</div>
              <button className="cr-disclosure-link" type="button" onClick={() => setDetailsOpen(true)}>
                Read the plain-language notes <ArrowUpRight size={12} />
              </button>
            </div>
          </aside>
        </div>

        <footer className="cr-footer">
          <span className="cr-footer-left"><LockKeyhole size={12} /> Shared account · fixed 24-hour login</span>
          <span className="cr-footer-right">Deliberate by design <span aria-hidden="true">·</span> Local preview only</span>
        </footer>
      </div>

      {notice && <div className="cr-toast" role="status">{notice}</div>}

      {detailsOpen && (
        <div className="cr-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDetailsOpen(false);
        }}>
          <section className="cr-modal" role="dialog" aria-modal="true" aria-labelledby="cr-modal-heading">
            <div className="cr-modal-top">
              <h2 id="cr-modal-heading">A clear view of this room</h2>
              <button className="cr-modal-close" type="button" aria-label="Close details" onClick={() => setDetailsOpen(false)}><X size={15} /></button>
            </div>
            <p>CryptID is designed for deliberate, temporary chats. This preview keeps its conversation in the current browser/runtime only.</p>
            <ul className="cr-modal-list">
              <li><Check size={14} /><span>Messages here are not delivered to another person and are not end-to-end encrypted.</span></li>
              <li><Clock3 size={14} /><span>The shared-account login lasts 24 hours. That session timer is separate from message lifetime.</span></li>
              <li><EyeOff size={14} /><span>Local message previews clear from view after 12 seconds.</span></li>
              <li><Info size={14} /><span>Ghost-log public disclosure: exactly 0 public details. This does not mean zero private security events.</span></li>
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
