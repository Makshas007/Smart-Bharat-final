import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypingDots } from "@/components/chat/TypingDots";
import { useApp } from "@/context/AppContext";
import { getChatHistory, streamChat } from "@/lib/api";

const getSessionId = () => {
  let sid = localStorage.getItem("sb_chat_session");
  if (!sid) {
    sid = `sb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("sb_chat_session", sid);
  }
  return sid;
};

const Bubble = ({ role, children }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
    initial="hidden"
    animate="show"
    transition={{ type: "spring", stiffness: 300, damping: 26 }}
    className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
        role === "user"
          ? "rounded-br-md bg-slate-900 text-white"
          : "rounded-bl-md border bg-white text-slate-800"
      }`}
    >
      {children}
    </div>
  </motion.div>
);

export const CivicChatWidget = () => {
  const { t, language, changeLanguage, chatOpen, setChatOpen } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef(null);
  const sessionId = useRef(getSessionId());

  // Load history when opened for the first time
  useEffect(() => {
    if (chatOpen && !historyLoaded) {
      getChatHistory(sessionId.current)
        .then((data) => setMessages(data.messages || []))
        .catch(() => {})
        .finally(() => setHistoryLoaded(true));
    }
  }, [chatOpen, historyLoaded]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText, thinking, chatOpen]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed || thinking) return;
      setInput("");
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: trimmed, timestamp: new Date().toISOString() },
      ]);
      setThinking(true);
      setStreamingText("");

      let acc = "";
      await streamChat({
        sessionId: sessionId.current,
        message: trimmed,
        language,
        onDelta: (delta) => {
          acc += delta;
          setStreamingText(acc);
        },
        onDone: (assistantMsg) => {
          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingText("");
          setThinking(false);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: `e-${Date.now()}`,
              role: "assistant",
              content: t("chat_error"),
              timestamp: new Date().toISOString(),
            },
          ]);
          setStreamingText("");
          setThinking(false);
        },
      });
    },
    [language, thinking, t]
  );

  const suggestions = [t("suggested_1"), t("suggested_2"), t("suggested_3")];

  return (
    <>
      {/* Floating toggle button */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            key="chat-fab"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setChatOpen(true)}
            aria-label="Open Civic AI chat"
            data-testid="chat-widget-open-button"
            className="shadow-floating fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-white"
          >
            <MessageCircle size={24} />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--secondary))]">
              <Sparkles size={10} className="text-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Side panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            key="chat-panel"
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 w-[94vw] p-2 sm:w-[430px] sm:p-3"
            role="dialog"
            aria-label="Civic AI Companion chat"
            data-testid="chat-panel"
          >
            {/* Thinking gradient border wrapper */}
            <div className="relative h-full overflow-hidden rounded-2xl p-[2px]">
              {thinking && <div className="thinking-gradient-layer" data-testid="chat-thinking-border" />}
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-[14px] bg-slate-50 ${
                  thinking ? "" : "border"
                } shadow-floating`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-white px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{t("chat_title")}</h3>
                      <p className="text-xs text-slate-500">{t("chat_sub")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center rounded-lg border bg-white p-0.5"
                      role="group"
                      aria-label="Chat language toggle"
                      data-testid="chat-language-toggle"
                    >
                      {[
                        { code: "en", label: "EN" },
                        { code: "hi", label: "\u0939\u093f\u0902" },
                      ].map((l) => (
                        <button
                          key={l.code}
                          onClick={() => changeLanguage(l.code)}
                          data-testid={`chat-language-${l.code}`}
                          aria-pressed={language === l.code}
                          className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                            language === l.code
                              ? "bg-[hsl(var(--primary))] text-white"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setChatOpen(false)}
                      aria-label="Close chat"
                      data-testid="chat-close-button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4" data-testid="chat-messages">
                  {messages.length === 0 && !thinking && (
                    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
                        <Sparkles size={24} />
                      </span>
                      <h4 className="mt-4 text-base font-semibold text-slate-900">{t("chat_empty_title")}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{t("chat_empty_sub")}</p>
                      <div className="mt-5 flex w-full flex-col gap-2">
                        {suggestions.map((s, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => sendMessage(s)}
                            data-testid={`chat-suggestion-${i}`}
                            className="rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm text-slate-700 hover:border-[hsl(var(--primary))]/40"
                          >
                            {s}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((m) => (
                    <Bubble key={m.id} role={m.role}>
                      {m.content}
                    </Bubble>
                  ))}

                  {/* Streaming response */}
                  {thinking && streamingText && <Bubble role="assistant">{streamingText}</Bubble>}

                  {/* Typing indicator (before first token) */}
                  {thinking && !streamingText && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md border bg-white px-3 py-2.5">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form
                  className="flex items-center gap-2 border-t bg-white px-3 py-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("chat_placeholder")}
                    aria-label="Chat message"
                    data-testid="chat-input"
                    className="h-11 flex-1 rounded-xl border bg-slate-50 px-3.5 text-sm outline-none transition-colors focus:border-[hsl(var(--ring))] focus:bg-white"
                  />
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      disabled={thinking || !input.trim()}
                      aria-label="Send message"
                      data-testid="chat-send-button"
                      className="h-11 w-11 rounded-xl bg-[hsl(var(--primary))] p-0 text-white hover:bg-[hsl(var(--primary))]/90"
                    >
                      <Send size={17} />
                    </Button>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
