"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, ChevronDown } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import type { Trial } from "@/lib/clinicaltrials";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Hi! I'm your TrialFind AI — I help you find clinical trials personalized to you.\n\nWhat medical condition are you looking for trials about? You can also share your location to find nearby trials.";

interface AIAgentProps {
  onTrialsFound: (trials: Trial[], condition: string) => void;
}

export default function AIAgent({ onTrialsFound }: AIAgentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trialsFound, setTrialsFound] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Slice off the hardcoded greeting — Anthropic requires messages start with user role
      const apiMessages = updatedMessages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.message ??
            "Sorry, something went wrong. Please try again.",
        },
      ]);

      if (data.trials?.length > 0) {
        onTrialsFound(data.trials, data.searchParams?.condition ?? "");
        setTrialsFound(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, onTrialsFound]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: "min(370px, calc(100vw - 24px))",
            maxHeight: "min(520px, calc(100vh - 120px))",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-secondary)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--accent)" }}
              >
                <Sparkles size={15} color="white" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ color: "var(--text)", fontFamily: "Sora, sans-serif" }}
                >
                  TrialFind AI
                </p>
                <p
                  className="text-xs leading-tight"
                  style={{ color: "var(--text-tertiary)", fontFamily: "Sora, sans-serif" }}
                >
                  Personalized trial navigator
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "var(--border-subtle)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "transparent")
              }
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? {
                          background: "var(--accent)",
                          color: "#fff",
                          borderRadius: "18px 18px 4px 18px",
                          fontFamily: "Sora, sans-serif",
                        }
                      : {
                          background: "var(--bg-secondary)",
                          color: "var(--text)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "18px 18px 18px 4px",
                          fontFamily: "Sora, sans-serif",
                        }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "18px 18px 18px 4px",
                  }}
                >
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          background: "var(--text-tertiary)",
                          animationDelay: `${i * 0.16}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Scroll nudge after trials found */}
            {trialsFound && (
              <div
                className="flex items-center justify-center gap-1.5 text-xs py-2 px-3 rounded-xl"
                style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
              >
                <ChevronDown size={13} />
                Scroll down to see your personalized trials
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div
            className="p-3 shrink-0"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{
                  color: "var(--text)",
                  fontFamily: "Sora, sans-serif",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-1.5 rounded-lg transition-all duration-150"
                style={{
                  background:
                    input.trim() && !isLoading ? "var(--accent)" : "transparent",
                  color:
                    input.trim() && !isLoading ? "#fff" : "var(--text-tertiary)",
                }}
                aria-label="Send"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating trigger button ── */}
      <MagneticButton
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all duration-200"
        style={{
          background: isOpen ? "var(--text)" : "var(--accent)",
          color: "#fff",
          fontFamily: "Sora, sans-serif",
          letterSpacing: "0.02em",
          boxShadow: isOpen
            ? "0 8px 24px rgba(0,0,0,0.25)"
            : "0 8px 32px rgba(38,119,199,0.4), 0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        {isOpen ? (
          <>
            <X size={15} />
            Close
          </>
        ) : (
          <>
            <Sparkles size={15} />
            AI Agent
          </>
        )}
      </MagneticButton>
    </>
  );
}
