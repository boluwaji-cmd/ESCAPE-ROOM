"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/lib/gameStore";

export default function EnigmaPage() {
  const { id } = useParams<{ id: string }>();
  const { teamId } = useGameStore();
  const [enigma, setEnigma] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("enigma_pool").select("*").eq("id", id).single().then(({ data }) => setEnigma(data));
  }, [id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { setTimedOut(true); return 0; } return prev - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const submitAnswer = async () => {
    if (!teamId || !enigma) return;
    const { data } = await supabase.functions.invoke("check-answer", {
      body: { enigma_id: enigma.id, answer, team_id: teamId, question_started_at: new Date().toISOString() },
    });
    setResult(data);
  };

  if (!enigma) return <div className="flex justify-center items-center h-screen">Caricamento...</div>;

  const options: string[] = typeof enigma.options === "string" ? JSON.parse(enigma.options) : (enigma.options || []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="card bg-white shadow-xl p-8 max-w-lg w-full">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Domanda</h1>
          <span className={`text-xl font-mono ${timeLeft <= 3 ? "text-red-500" : ""}`}>{timeLeft}s</span>
        </div>
        <p className="text-lg mb-4">{enigma.question}</p>
        {options.length > 0 ? (
          <div className="space-y-2 mb-4">
            {options.map((opt: string, i: number) => (
              <button key={i} className={`btn w-full ${answer === opt ? "btn-primary" : "btn-outline"}`} onClick={() => setAnswer(opt)}>{opt}</button>
            ))}
          </div>
        ) : (
          <input className="input input-bordered w-full mb-4" placeholder="Scrivi la risposta..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
        )}
        <button className="btn btn-primary w-full" onClick={submitAnswer} disabled={!answer.trim()}>Invia Risposta</button>
        {result && <div className={`alert mt-4 ${result.correct ? "alert-success" : "alert-error"}`}>{result.message}</div>}
      </div>
    </div>
  );
}
