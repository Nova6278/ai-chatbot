import { useState, useRef, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const BOT_AVATAR = "🤖";
const USER_AVATAR = "👤";

const SUGGESTED_QUESTIONS = [
  "What can you help me with?",
  "Tell me about your features",
  "How do I get started?",
  "What are your business hours?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0">
        {BOT_AVATAR}
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
          isUser
            ? "bg-gradient-to-br from-emerald-400 to-teal-500"
            : "bg-gradient-to-br from-violet-500 to-indigo-600"
        }`}
      >
        {isUser ? USER_AVATAR : BOT_AVATAR}
      </div>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! I'm your AI assistant powered by AWS Bedrock. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamedText, setStreamedText] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamedText]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);
    setStreamedText("");

    try {
      const payload = {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      };

      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              fullText += parsed.text || "";
              setStreamedText(fullText);
            } catch {}
          }
        }
      }

      setMessages([...newMessages, { role: "assistant", content: fullText }]);
      setStreamedText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared! How can I help you today?",
      },
    ]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col" style={{ height: "90vh" }}>
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-3 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <h1 className="text-white font-semibold text-base">AI Assistant</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs">Powered by AWS Bedrock</span>
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-white/50 hover:text-white/80 text-xs border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-all"
          >
            Clear chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 overflow-y-auto mb-3">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}

          {loading && !streamedText && <TypingIndicator />}

          {streamedText && (
            <div className="flex items-end gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0">
                {BOT_AVATAR}
              </div>
              <div className="max-w-[75%] bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed shadow-sm">
                {streamedText}
                <span className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5 animate-pulse" />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center mb-4">
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg px-3 py-2 text-xs">
                ⚠️ {error}
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested questions (only at start) */}
        {messages.length <= 1 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white/80 border border-white/20 rounded-full px-3 py-1.5 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-end gap-3 px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message... (Enter to send)"
            disabled={loading}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/40 resize-none outline-none text-sm leading-relaxed max-h-32"
            style={{ minHeight: "24px" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center disabled:opacity-40 hover:from-violet-400 hover:to-indigo-500 transition-all flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-2">
          Built with AWS Bedrock · Claude 3 Haiku
        </p>
      </div>
    </div>
  );
}
