import { useState } from "react";
import { askGemini } from "../lib/gemini";
import { Type } from "@google/genai";

interface RoutineBlock {
  time: string;
  monday: null | { task: string; cat: string };
  tuesday: null | { task: string; cat: string };
  wednesday: null | { task: string; cat: string };
  thursday: null | { task: string; cat: string };
  friday: null | { task: string; cat: string };
  saturday: null | { task: string; cat: string };
  sunday: null | { task: string; cat: string };
}

export function DisenoRutina() {
  const [scheduleInput, setScheduleInput] = useState("");
  const [schedule, setSchedule] = useState<RoutineBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSchedule = async () => {
    if (!scheduleInput.trim()) return;
    setIsLoading(true);

    const prompt = `Crea un horario semanal que priorice el bienestar para evitar el agotamiento. Entrada del usuario: "${scheduleInput}". 
    Reglas:
    1. Asigna tiempo para dormir y descansar (categoría 'sueño').
    2. Asigna tiempo libre, hobbies y comidas (categoría 'juego').
    3. Ubica las obligaciones laborales o fijas (categoría 'trabajo').
    4. Deja espacios vacíos marcados como "Disponibles para bloques de enfoque" (categoría 'blanco') en los momentos sobrantes.
    Devuelve un array JSON con objetos de bloques horarios: [{ "time": "08:00 - 10:00", "monday": {"task": "...", "cat": "..."}, "tuesday": ...hasta sunday... }]. Categorías permitidas: 'sueño', 'juego', 'trabajo', 'blanco'. Genera maximo 8 bloques por día. Si no hay actividad, usa null`;

    try {
      const res = await askGemini(prompt, true);
      if (res) {
        setSchedule(JSON.parse(res.replace(/```json|```/g, "").trim()));
      }
    } catch (e) {
      console.error(e);
      alert("Error generating schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClass = (cat: string) => {
    if (cat === "juego")
      return "bg-slate-100 text-slate-800 font-medium border border-slate-200";
    if (cat === "sueño") return "bg-white text-slate-400 border border-slate-100 text-[10px]";
    if (cat === "trabajo")
      return "bg-black text-white font-medium";
    return "bg-transparent text-slate-300 border border-dashed border-slate-200 text-[10px]";
  };

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-500">
      <div className="mb-8 border-b border-rose-100/50 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2 font-serif">
          Diseño de Rutina Amable
        </h2>
        <p className="text-rose-500/80 text-sm font-medium">
          Priorizamos tu descanso para que puedas ser consistente a largo plazo.
        </p>
      </div>

      <div className="bg-rose-50/30 border border-rose-100/50 p-8 rounded-[2rem] mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-900 font-bold text-sm tracking-tight text-rose-900">Tu Creadora de Horarios</h3>
          <span className="text-[10px] font-bold text-teal-600 px-3 py-1 bg-teal-50 border border-teal-100/50 rounded-full">🦥 SIN APUROS</span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <textarea
            value={scheduleInput}
            onChange={(e) => setScheduleInput(e.target.value)}
            rows={3}
            className="flex-1 w-full px-5 py-4 border border-rose-100 bg-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-200 text-sm text-slate-700 placeholder:text-rose-300 transition-all shadow-sm resize-none"
            placeholder="Ej: Necesito dormir 8h. Estudio 4h. Trabajo 6h. Quiero leer 1 hora..."
          ></textarea>
          <button
            onClick={generateSchedule}
            disabled={isLoading}
            className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-6 py-4 rounded-2xl text-sm font-bold w-full md:w-[180px] transition-all shadow-md shadow-rose-500/20 self-stretch"
          >
            {isLoading ? "Creando..." : "Crear Mi Rutina"}
          </button>
        </div>
      </div>

      {schedule.length > 0 ? (
        <div className="border border-rose-100/50 rounded-[2rem] overflow-hidden bg-white shadow-xl shadow-rose-900/5 flex flex-col flex-1 animate-in slide-in-from-bottom-2">
          <div className="overflow-x-auto p-4 border-b border-rose-50">
            <div className="min-w-[800px] grid grid-cols-8 gap-2 text-xs">
              <div className="py-2 text-rose-400 font-bold tracking-tight text-center">HORA</div>
              <div className="py-2 text-slate-900 font-bold tracking-tight text-center">LUN</div>
              <div className="py-2 text-slate-900 font-bold tracking-tight text-center">MAR</div>
              <div className="py-2 text-slate-900 font-bold tracking-tight text-center">MIE</div>
              <div className="py-2 text-slate-900 font-bold tracking-tight text-center">JUE</div>
              <div className="py-2 text-slate-900 font-bold tracking-tight text-center">VIE</div>
              <div className="py-2 text-rose-400 font-bold tracking-tight text-center">SAB</div>
              <div className="py-2 text-rose-400 font-bold tracking-tight text-center">DOM</div>

              {schedule.map((row, i) => (
                <div key={i} className="contents">
                  <div className="py-3 flex items-center justify-center font-bold text-[10px] text-rose-300/80">
                    {row.time}
                  </div>
                  {days.map((day) => {
                    const cell = (row as any)[day];
                    return (
                      <div key={day} className="h-full min-h-[4rem] p-1">
                        {cell ? (
                          <div
                            className={`h-full rounded-xl p-3 text-[11px] font-bold leading-tight flex items-center justify-center text-center ${getColorClass(
                              cell.cat
                            )}`}
                          >
                            {cell.task}
                          </div>
                        ) : (
                          <div className="h-full rounded-xl bg-transparent border border-dashed border-rose-100/50 text-transparent flex items-center justify-center">
                            -
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 bg-rose-50/30 border-t border-rose-100 flex flex-wrap gap-6 items-center text-xs font-bold text-slate-500 mt-auto">
            <span className="text-rose-400 tracking-widest text-[10px]">LEYENDA:</span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-200"></span> RECREACIÓN
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full border border-rose-100 bg-white"></span> SUEÑO
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> TRABAJO
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-rose-200"></span> LIBRE
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center py-20 border border-rose-100/50 bg-rose-50/30 rounded-[2rem] text-rose-300/80 font-medium text-sm shadow-sm">
          <div className="text-4xl mb-4 opacity-50 flex items-center justify-center">
             🌱
          </div>
          <p>Cuéntame de ti y yo crearé tu horario ideal...</p>
        </div>
      )}
    </div>
  );
}
