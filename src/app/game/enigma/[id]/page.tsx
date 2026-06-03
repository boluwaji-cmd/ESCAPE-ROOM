"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useGameStore } from "@/lib/gameStore"

const QUESTION_TIME = 10

export default function EnigmaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { teamId } = useGameStore()
  const [enigma, setEnigma] = useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [timedOut, setTimedOut] = useState(false)
  const questionStartedAt = useRef<string>(new Date().toISOString())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load enigma
  const loadEnigma = useCallback((enigmaId: string) => {
    supabase.from("enigma_pool").select("*").eq("id", enigmaId).single().then(({ data }) => {
      if (data) {
        setEnigma(data)
        setSelectedAnswer("")
        setResult(null)
        setTimeLeft(QUESTION_TIME)
        setTimedOut(false)
        questionStartedAt.current = new Date().toISOString()
      }
    })
  }, [])

  useEffect(() => {
    if (id) loadEnigma(id as string)
  }, [id, loadEnigma])

  // Countdown timer
  useEffect(() => {
    if (!enigma || timedOut || result) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setTimedOut(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [enigma, timedOut, result])

  const submitAnswer = async () => {
    if (!selectedAnswer || !teamId || !enigma || timedOut) return
    setLoading(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const { data, error } = await supabase.functions.invoke("check-answer", {
      body: {
        enigma_id: enigma.id,
        answer: selectedAnswer,
        team_id: teamId,
        question_started_at: questionStartedAt.current,
      },
    })

    const response = data || { correct: false, message: error?.message }
    setResult(response)
    setLoading(false)

    if (response.correct) {
      setTimeout(() => router.push("/game/map"), 2000)
    } else if (response.new_enigma) {
      // Load the new question on wrong answer
      setEnigma({
        ...response.new_enigma,
        id: response.new_enigma.id,
        options: JSON.stringify(response.new_enigma.options),
      })
      setResult({ correct: false, message: response.message })
    }
  }

  // Auto-submit on timeout
  useEffect(() => {
    if (timedOut && !result && enigma) {
      submitAnswer()
    }
  }, [timedOut])

  if (!enigma) return <div className="flex justify-center items-center h-screen text-gray-900">Caricamento...</div>

  const options: string[] = typeof enigma.options === "string" ? JSON.parse(enigma.options) : (enigma.options || [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="card w-full max-w-lg bg-white shadow-xl border border-gray-200">
        <div className="card-body">
          {/* Timer bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${timeLeft <= 3 ? "bg-red-500" : timeLeft <= 6 ? "bg-yellow-500" : "bg-green-500"}`}
              style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
            />
          </div>
          <p className={`text-sm font-bold text-center ${timeLeft <= 3 ? "text-red-600" : "text-gray-600"}`}>
            {timeLeft > 0 ? `${timeLeft}s` : "Tempo scaduto!"}
          </p>

          <h2 className="card-title text-gray-900 mt-2">{enigma.question}</h2>

          {enigma.hint && (
            <details className="collapse collapse-arrow bg-base-200 mt-2">
              <summary className="collapse-title text-sm font-medium text-gray-600">Suggerimento</summary>
              <div className="collapse-content text-sm text-gray-700">{enigma.hint}</div>
            </details>
          )}

          <div className="mt-4 space-y-2">
            {enigma.type === "true_false" ? (
              <div className="flex gap-4">
                <button
                  className={`btn flex-1 ${selectedAnswer === "Vero" ? "btn-primary" : "btn-outline text-gray-700"}`}
                  onClick={() => setSelectedAnswer("Vero")}
                  disabled={timedOut || loading}
                >Vero</button>
                <button
                  className={`btn flex-1 ${selectedAnswer === "Falso" ? "btn-primary" : "btn-outline text-gray-700"}`}
                  onClick={() => setSelectedAnswer("Falso")}
                  disabled={timedOut || loading}
                >Falso</button>
              </div>
            ) : (
              options.map((opt: string, i: number) => (
                <div key={i} className="form-control">
                  <label className="cursor-pointer label justify-start gap-2">
                    <input
                      type="radio"
                      name="answer"
                      className="radio radio-primary"
                      checked={selectedAnswer === opt}
                      onChange={() => setSelectedAnswer(opt)}
                      disabled={timedOut || loading}
                    />
                    <span className="text-gray-900">{opt}</span>
                  </label>
                </div>
              ))
            )}
          </div>

          <button
            className="btn btn-primary mt-4"
            onClick={submitAnswer}
            disabled={loading || !selectedAnswer || timedOut}
          >
            {loading ? <span className="loading loading-spinner"></span> : "Invia Risposta"}
          </button>

          {result && (
            <div className={`alert mt-4 ${result.correct ? "alert-success text-white" : "alert-error text-white"}`}>
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
