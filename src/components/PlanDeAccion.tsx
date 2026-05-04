import { useState, useRef, useEffect } from "react";
import { askGemini, askGeminiTTS } from "../lib/gemini";
import { Type } from "@google/genai";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export function PlanDeAccion() {
  // Decision 
  const [deciderInput, setDeciderInput] = useState("");
  const [deciderResult, setDeciderResult] = useState("");
  const [isLoadingDecider, setIsLoadingDecider] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Microtasks
  const [goalInput, setGoalInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // SOS
  const [sosInput, setSosInput] = useState("");
  const [sosResult, setSosResult] = useState("");
  const [isLoadingSos, setIsLoadingSos] = useState(false);
  
  // Audio SOS
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const makeQuickDecision = async () => {
    if (!deciderInput.trim()) return;
    setIsLoadingDecider(true);
    setDeciderResult("");

    const prompt = `La usuaria tiene "fatiga de decisión" y parálisis por análisis. No sabe por cuál de estas tareas empezar: "${deciderInput}". 
    Elige UNA sola tarea por ella de manera asertiva y amigable. Dale una razón brevísima (1 línea) de por qué empezar por ahí le dará inercia positiva. 
    Responde directo, ejemplo: "Empieza por [Tarea]. [Razón]."`;

    try {
      const res = await askGemini(prompt, false);
      if (res) {
        setDeciderResult(res);
        setDeciderInput("");
      }
    } catch (error) {
      console.error(error);
      alert("Error al decidir. Ante la duda, ¡elige la tarea que tome menos de 5 minutos!");
    } finally {
      setIsLoadingDecider(false);
    }
  };

  const generateMicroTasks = async () => {
    if (!goalInput.trim()) return;
    setIsLoadingTasks(true);

    const prompt = `El usuario necesita avanzar en: "${goalInput}". Genera SOLO 3 pasos iniciales minúsculos que se puedan empezar y avanzar (aunque no se terminen) en los próximos 15 minutos. Devuelve un array JSON de strings simples.`;

    try {
      const response = await askGemini(prompt, true, {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      });
      if(response) {
        const rawTasks = JSON.parse(response.replace(/```json|```/g, "").trim());
        const newTasks = rawTasks.map((t: string, i: number) => ({
            id: Date.now() + i,
            text: t,
            completed: false
        }));
        setTasks(newTasks);
        setGoalInput("");
      }
    } catch(e) {
       console.error("Microtasks error", e);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => Math.floor(t.id) === Math.floor(id) ? { ...t, completed: !t.completed } : t));
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length > 0 ? tasks.length : 3;

  const setTimer = (minutes: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  const toggleTimer = () => {
    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            setTimeout(() => alert("¡Tiempo cumplido! Detente. Has logrado un bloque de enfoque. Recuerda tomar un descanso adecuado."), 10);
            return 15 * 60; // reset to 15
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const negotiateDistraction = async () => {
    if(!sosInput.trim()) return;
    setIsLoadingSos(true);
    setSosResult("");
    
    const prompt = `La usuaria está evadiendo responsabilidades porque siente: "${sosInput}". Valida sus sentimientos empáticamente y ofrécele una actividad alternativa de 5 a 10 minutos (que no involucre redes sociales) que le ayude a calmar su mente de forma sana. Máximo 2 oraciones.`;
    
    try {
        const res = await askGemini(prompt, false);
        if(res){
            setSosResult(res);
            setSosInput("");
        }
    } catch(e) {
        console.error(e);
    } finally {
        setIsLoadingSos(false);
    }
  };

  const playSOSAudio = async () => {
    const text = "Hola. Tómate un momento para respirar profundo. Recuerda que está bien no poder con todo a la vez. Tienes permiso para descansar y retomar las cosas a tu ritmo. Tu bienestar es lo más importante ahora mismo. Estoy aquí apoyándote.";
    setIsGeneratingAudio(true);
    
    try {
        const base64Audio = await askGeminiTTS(text);
        if(base64Audio) {
            const binary = atob(base64Audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            
            setTimeout(() => {
                if(audioRef.current) {
                    audioRef.current.play();
                }
            }, 100);
        }
    } catch (e) {
        console.error("Audio generation failed: ", e);
        alert("Error al generar el audio, pero lee esto lentamente: " + text);
    } finally {
        setIsGeneratingAudio(false);
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-500">
      <div className="mb-8 border-b border-rose-100/50 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2 font-serif">Protocolo de Acción</h2>
        <p className="text-rose-500/80 text-sm font-medium">
          Reduce la fricción empezando con micro-pasos. Solo comprométete a 15 minutos.
        </p>
      </div>

      {/* Quick Decider */}
      <div className="mb-8 bg-white border border-rose-100/50 p-8 rounded-[2rem] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-900 font-bold text-sm tracking-tight text-rose-900 text-sm">Decisor Rápido</h3>
          <span className="text-[10px] font-bold text-sky-600 px-3 py-1 bg-sky-50 border border-sky-100/50 rounded-full">⚡ DESBLOQUEO</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={deciderInput}
            onChange={(e) => setDeciderInput(e.target.value)}
            placeholder="Opciones separadas por comas (o tareas sueltas)..."
            className="flex-1 px-5 py-3 border border-sky-100 bg-white rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-700 placeholder:text-slate-400 shadow-sm"
          />
          <button
            onClick={makeQuickDecision}
            disabled={isLoadingDecider}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold transition-all text-sm shadow-md shadow-sky-500/20 whitespace-nowrap"
          >
            {isLoadingDecider ? "Decidiendo..." : "IA: Elige por mi"}
          </button>
        </div>
        
        {deciderResult && (
            <div className="mt-6 p-5 bg-sky-50/50 border border-sky-100/50 rounded-2xl text-slate-800 text-sm shadow-sm font-medium animate-in slide-in-from-top-2 flex gap-4">
                <span className="text-xl text-sky-500">↳</span>
                <div className="leading-relaxed">{deciderResult}</div>
            </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Timer Component */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 p-4">
             <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-700'}`}></div>
          </div>
          <h3 className="text-rose-300/80 font-bold mb-4 tracking-widest text-[10px] z-10">
            BLOQUE DE ENFOQUE (POMODORO SUAVE)
          </h3>
          <div className="text-7xl font-light tracking-tighter mb-8 font-mono z-10 text-rose-50">{formatTime(timeLeft)}</div>
          <div className="flex gap-4 w-full justify-center z-10">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-2xl font-bold transition-all w-full max-w-[200px] shadow-sm text-sm ${
                  isRunning ? 'bg-slate-800 text-white border border-slate-700' : 'bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600'
              }`}
            >
              {isRunning ? "PAUSAR" : (timeLeft < 15 * 60 && timeLeft > 0 ? "REANUDAR" : "INICIAR")}
            </button>
          </div>
          <div className="flex gap-3 mt-4 z-10">
             <button
              onClick={() => setTimer(15)}
              className="text-slate-400 hover:text-rose-300 px-4 py-2 text-xs font-bold transition-colors"
            >
              15 MIN
            </button>
            <button
              onClick={() => setTimer(30)}
              className="text-slate-400 hover:text-rose-300 px-4 py-2 text-xs font-bold transition-colors"
            >
              30 MIN
            </button>
          </div>
        </div>

        {/* AI Micro-task Generator */}
        <div className="bg-white border border-rose-100/50 shadow-[0_4px_20px_-4px_rgba(251,113,133,0.1)] p-8 rounded-[2rem] flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-slate-900 font-bold text-sm tracking-tight text-rose-900">Pasos Minúsculos</h3>
            <span className="text-[10px] font-bold text-emerald-600 px-3 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full">🌱 CRECER</span>
          </div>
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Meta principal asustadiza..."
            className="w-full px-5 py-3 border border-emerald-100 bg-white rounded-2xl text-sm mb-4 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200 text-slate-700 placeholder:text-slate-400 shadow-sm"
          />
          <button
            onClick={generateMicroTasks}
            disabled={isLoadingTasks}
            className="w-full bg-emerald-50 disabled:opacity-50 hover:bg-emerald-100 text-emerald-800 px-4 py-3 rounded-2xl font-bold transition-colors text-sm shadow-sm border border-emerald-200/50"
          >
            {isLoadingTasks ? "Generando..." : "Dame 3 pasos fáciles"}
          </button>

          {tasks.length > 0 && (
            <div className="mt-8 animate-in fade-in">
              <div className="mb-6">
                  <div className="flex justify-between text-[10px] mb-2 font-bold text-emerald-600 tracking-wider">
                    <span>PROGRESO</span>
                    <span>{Math.round((completedTasksCount / totalTasksCount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-emerald-50 rounded-full h-2 border border-emerald-100/50">
                    <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${Math.min(100, Math.round((completedTasksCount / totalTasksCount) * 100))}%` }}
                    ></div>
                  </div>
              </div>

              <div className="space-y-3">
                  {tasks.map(t => (
                      <label key={t.id} className="flex items-start gap-4 p-4 border border-rose-50 rounded-2xl bg-white hover:bg-rose-50/30 cursor-pointer shadow-sm transition-colors group">
                          <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${t.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-slate-300 group-hover:border-emerald-400 bg-white'}`}>
                             {t.completed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)} className="hidden" />
                          <p className={`text-slate-700 text-sm font-medium transition-all leading-relaxed ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.text}</p>
                      </label>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Negotiator (SOS) */}
      <div className="bg-rose-50/50 border border-rose-100/50 p-8 rounded-[2rem] shadow-sm">
         <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-900 font-bold text-sm tracking-tight text-rose-900">Botón de Pánico (SOS)</h3>
          <span className="text-[10px] font-bold text-rose-600 px-3 py-1 bg-white border border-rose-200/50 rounded-full shadow-sm">🚨 AYUDA EMOCIONAL</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={sosInput}
            onChange={(e) => setSosInput(e.target.value)}
            placeholder="Quiero evadir esto porque siento..."
            className="flex-1 px-5 py-3 border border-rose-200/50 bg-white rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-300 text-slate-700 placeholder:text-slate-400 shadow-sm"
          />
          <button
            onClick={negotiateDistraction}
            disabled={isLoadingSos}
            className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap shadow-md shadow-rose-500/20 text-center transition-all"
          >
            {isLoadingSos ? "Buscando..." : "Negociar Alternativa Sana"}
          </button>
        </div>
        
        {sosResult && (
            <div className="mt-6 p-6 bg-white border border-rose-100/50 rounded-2xl text-slate-700 text-sm shadow-sm animate-in slide-in-from-top-2 leading-relaxed font-medium">
                <strong className="text-rose-600 font-bold tracking-tight text-[11px] mb-2 block uppercase">Recomendación Compasiva:</strong>
                {sosResult}
            </div>
        )}

        <button
          onClick={playSOSAudio}
          disabled={isGeneratingAudio}
          className="mt-8 w-full bg-white border border-rose-200/50 hover:border-rose-300 disabled:opacity-50 text-rose-700 py-4 rounded-2xl transition-all text-sm font-bold shadow-sm"
        >
          {isGeneratingAudio ? "Generando abrazo virtual..." : "🎙️ Escuchar Mensaje de Calma (IA de Voz)"}
        </button>
        
        {audioUrl && (
             <audio ref={audioRef}  src={audioUrl} className="mt-4 w-full outline-none opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all" controls></audio>
        )}
      </div>
    </div>
  );
}
