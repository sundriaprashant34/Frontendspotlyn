import React, { useEffect, useRef, useState } from 'react';
import api from '../api';

const initialMessages = [
  {
    role: 'assistant',
    content:
      'Hi! I am Spotlyn AI. I can help with your Spotlyn information and, based on your role, complaint updates.',
  },
];

export default function Chatbot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    setInput('');
    setError('');
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setSending(true);

    try {
      const response = await api.post('/ai/chat', { message });
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: response.data.reply },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not reach Spotlyn AI. Please try again.'
      );
      setInput(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-4xl flex-col">
      <div className="mb-5">
        <h1 className="page-title">Spotlyn AI Assistant</h1>
        <p className="section-sub mt-1">
          Ask about your Spotlyn activity. Answers use information available to your account role.
        </p>
      </div>

      <div
        className="card flex flex-1 flex-col overflow-hidden !p-0"
        aria-label="Chat conversation"
      >
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {messages.map((message, index) => (
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              key={`${message.role}-${index}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'rounded-br-md bg-blue-600 text-white'
                    : 'rounded-bl-md bg-slate-100 text-slate-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="text-sm text-slate-500" role="status">
              Spotlyn AI is thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6">
            {error}
          </div>
        )}

        <form onSubmit={sendMessage} className="border-t border-slate-200 p-3 sm:p-4">
          <label className="sr-only" htmlFor="chat-message">
            Message Spotlyn AI
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="chat-message"
              className="field !mt-0 min-h-12 resize-y"
              rows={1}
              maxLength={2000}
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form.requestSubmit();
                }
              }}
              disabled={sending}
            />
            <button className="btn-primary min-h-12" type="submit" disabled={sending || !input.trim()}>
              Send
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Enter to send · Shift+Enter for a new line</p>
        </form>
      </div>
    </section>
  );
}
