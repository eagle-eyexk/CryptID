import "./_group.css";
import { useState } from "react";
import { ArrowLeft, EyeOff, Info, MoreHorizontal, Send } from "lucide-react";

type PreviewMessage = { id: number; text: string; time: string };

export function Current() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<PreviewMessage[]>([]);

  function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const id = Date.now();
    setMessages((current) => [...current, { id, text, time: "now" }]);
    setDraft("");
    window.setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
    }, 1200);
  }

  return (
    <main className="cryptid-chat-group current-chat">
      <header className="current-header">
        <div className="current-header-inner">
          <button className="current-back" aria-label="Back to channels">
            <ArrowLeft size={18} />
          </button>
          <div className="current-avatar">M</div>
          <div className="current-identity">
            <strong>Mira</strong>
            <span><i /> Local channel · view once</span>
          </div>
          <button className="current-more" aria-label="Channel options">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      <section className="current-notice" aria-label="Local delivery notice">
        <Info size={15} />
        <span>Messages are local to this runtime. Nothing is delivered to another person.</span>
        <b>EXPIRES AFTER VIEW</b>
      </section>

      <section className="current-messages" aria-live="polite">
        {messages.length ? messages.map((message) => (
          <div className="current-message-row" key={message.id}>
            <div className="current-bubble">
              <p>{message.text}</p>
              <small>{message.time} <EyeOff size={11} /></small>
            </div>
          </div>
        )) : (
          <div className="current-empty">
            <span className="current-empty-icon"><EyeOff size={21} /></span>
            <b>THIS CHANNEL HAS NO HISTORY</b>
            <h1>Write something worth the moment.</h1>
            <p>Each local message disappears about 1.2 seconds after first becoming visible.</p>
          </div>
        )}
      </section>

      <footer className="current-composer">
        <div className="current-composer-row">
          <textarea
            aria-label="Local message"
            placeholder="Write a message for this moment"
            value={draft}
            maxLength={500}
            rows={1}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage} disabled={!draft.trim()} aria-label="Send local message">
            <Send size={18} />
          </button>
        </div>
        <small>{draft.length}/500 · Enter to send, Shift+Enter for a line break</small>
      </footer>

      <style>{`
        .current-chat { min-height: 100vh; background: var(--cryptid-bg); display: flex; flex-direction: column; }
        .current-header { padding: 28px 24px 13px; border-bottom: 1px solid var(--cryptid-border-soft); }
        .current-header-inner { width: 100%; max-width: 1000px; margin: 0 auto; display: flex; align-items: center; gap: 14px; }
        .current-header button { border: 1px solid var(--cryptid-border); color: var(--cryptid-text); background: var(--cryptid-surface); display: grid; place-items: center; cursor: pointer; }
        .current-back { width: 38px; height: 38px; border-radius: 12px; }
        .current-avatar { width: 42px; height: 42px; border-radius: 14px; border: 1px solid var(--cryptid-border); background: var(--cryptid-surface-high); color: var(--cryptid-primary); display: grid; place-items: center; font-size: 16px; font-weight: 700; }
        .current-identity { flex: 1; min-width: 0; display: grid; gap: 4px; }
        .current-identity strong { font-size: 15px; font-weight: 600; }
        .current-identity span { color: var(--cryptid-secondary); font-size: 11px; display: flex; align-items: center; gap: 6px; }
        .current-identity i { width: 6px; height: 6px; border-radius: 50%; background: var(--cryptid-primary); }
        .current-more { width: 38px; height: 38px; border: 0 !important; background: transparent !important; border-radius: 12px; }
        .current-notice { width: min(100% - 48px, 1000px); margin: 17px auto 0; padding: 10px 13px; border: 1px solid var(--cryptid-border-soft); border-radius: 8px; background: var(--cryptid-surface); color: var(--cryptid-secondary); display: flex; align-items: center; gap: 8px; font-size: 11px; }
        .current-notice svg { color: var(--cryptid-primary); flex: 0 0 auto; }
        .current-notice span { flex: 1; }
        .current-notice b { color: var(--cryptid-primary); font-size: 8px; letter-spacing: 1.2px; white-space: nowrap; }
        .current-messages { width: min(100% - 48px, 1000px); flex: 1; min-height: 0; margin: 0 auto; padding: 22px 6px; display: flex; flex-direction: column; justify-content: flex-end; }
        .current-empty { flex: 1; min-height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 11px; padding: 56px 28px; }
        .current-empty-icon { width: 54px; height: 54px; border-radius: 18px; display: grid; place-items: center; background: var(--cryptid-primary-soft); border: 1px solid var(--cryptid-border); color: var(--cryptid-primary); margin-bottom: 5px; }
        .current-empty > b { color: var(--cryptid-primary); font-size: 9px; letter-spacing: 1.8px; }
        .current-empty h1 { font-size: 18px; font-weight: 500; margin: 0; }
        .current-empty p { max-width: 370px; margin: 0; color: var(--cryptid-secondary); font-size: 12px; line-height: 19px; }
        .current-message-row { display: flex; justify-content: flex-end; margin-bottom: 9px; }
        .current-bubble { max-width: 78%; min-width: 120px; padding: 11px 15px; border-radius: 15px 15px 4px 15px; background: #17463f; border: 1px solid #31786b; }
        .current-bubble p { margin: 0; font-size: 14px; line-height: 21px; }
        .current-bubble small { margin-top: 8px; color: var(--cryptid-muted); display: flex; justify-content: flex-end; align-items: center; gap: 5px; font-size: 9px; }
        .current-composer { border-top: 1px solid var(--cryptid-border-soft); padding: 13px max(24px, calc((100% - 1000px) / 2)) 22px; }
        .current-composer-row { display: flex; align-items: flex-end; gap: 10px; }
        .current-composer textarea { flex: 1; max-height: 120px; min-height: 44px; resize: vertical; padding: 12px 15px; color: var(--cryptid-text); background: var(--cryptid-surface); border: 1px solid var(--cryptid-border); border-radius: 13px; font: 14px/21px var(--cryptid-font); outline: none; }
        .current-composer textarea:focus { border-color: var(--cryptid-primary); }
        .current-composer textarea::placeholder { color: var(--cryptid-muted); }
        .current-composer-row button { width: 42px; height: 42px; flex: 0 0 auto; border: 0; border-radius: 13px; background: var(--cryptid-primary); color: var(--cryptid-bg); display: grid; place-items: center; cursor: pointer; }
        .current-composer-row button:disabled { color: var(--cryptid-muted); background: var(--cryptid-surface); border: 1px solid var(--cryptid-border); cursor: default; }
        .current-composer > small { display: block; margin: 7px 0 0 3px; color: var(--cryptid-muted); font-size: 10px; }
        @media (max-width: 650px) {
          .current-header { padding: 14px 16px 12px; }
          .current-notice { width: calc(100% - 32px); margin-top: 12px; }
          .current-notice b { display: none; }
          .current-messages { width: 100%; padding: 16px; }
          .current-composer { padding: 12px 16px max(14px, env(safe-area-inset-bottom)); }
        }
      `}</style>
    </main>
  );
}
