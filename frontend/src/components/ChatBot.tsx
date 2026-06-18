import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { sendChatMessage, ChatMessage } from '../api/analysis'
import { useAuth } from '../context/AuthContext'

const MAX_USER_MESSAGES = 3

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function ChatBot() {
  const { user } = useAuth()
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [analysisId, setAnalysisId] = useState<number | undefined>(undefined)
  const [dailyCount, setDailyCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  const usageStorageKey = user ? `facerate-chat-usage-${user.id}` : null
  const limitReached = dailyCount >= MAX_USER_MESSAGES

  useEffect(() => {
    if (!usageStorageKey) return
    try {
      const saved = JSON.parse(localStorage.getItem(usageStorageKey) ?? '{}')
      setDailyCount(saved.date === todayKey() ? Number(saved.count ?? 0) : 0)
    } catch {
      setDailyCount(0)
      localStorage.removeItem(usageStorageKey)
    }
  }, [usageStorageKey])

  // scroll to bottom on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  if (!user) return null

  const send = async () => {
    const text = input.trim()
    if (!text || loading || limitReached) return

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await sendChatMessage(newMessages, analysisId)
      setAnalysisId(res.analysis_id)
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
      const nextCount = dailyCount + 1
      setDailyCount(nextCount)
      if (usageStorageKey) {
        localStorage.setItem(usageStorageKey, JSON.stringify({ date: todayKey(), count: nextCount }))
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e.message
      setError(msg)
      if (e?.response?.status === 403) {
        setDailyCount(MAX_USER_MESSAGES)
        if (usageStorageKey) {
          localStorage.setItem(usageStorageKey, JSON.stringify({ date: todayKey(), count: MAX_USER_MESSAGES }))
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-500"
        title="AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat drawer */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col rounded-2xl border border-dark-500 bg-dark-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-dark-700 border-b border-dark-500">
            <div>
              <p className="font-bold text-sm">AI Face Assistant</p>
              {analysisId && (
                <p className="text-xs text-gray-400">Analysis #{analysisId}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${limitReached ? 'text-red-400' : 'text-gray-400'}`}>
                {dailyCount}/{MAX_USER_MESSAGES} today
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-8 space-y-2">
                <div className="flex justify-center">
                  <MessageCircle className="h-8 w-8 text-brand-400" />
                </div>
                <p>Hi! Ask me anything about your facial analysis.</p>
                <p className="text-xs text-gray-600">You have {MAX_USER_MESSAGES} messages per day.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-dark-600 text-gray-200 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-dark-600 text-gray-400 px-3 py-2 rounded-xl text-sm rounded-bl-sm flex items-center gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
              </div>
            )}
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            {limitReached && !loading && (
              <p className="text-center text-xs text-amber-400 mt-2">
                Daily limit of {MAX_USER_MESSAGES} messages reached.<br />
                Try again tomorrow.
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-dark-500 p-3 flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading || limitReached}
              placeholder={limitReached ? 'Daily limit reached' : 'Write a message...'}
              rows={1}
              className="flex-1 bg-dark-700 border border-dark-400 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-primary-500 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || limitReached || !input.trim()}
              className="bg-primary-600 hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl text-sm transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
