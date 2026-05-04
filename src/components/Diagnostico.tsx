import { useState, MouseEvent } from "react";
import { askGemini } from "../lib/gemini";
import { Type } from "@google/genai";

export function Diagnostico() {
  const [braindumpInput, setBraindumpInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ hoy: string[]; posponer: string[]; soltar: string[] } | null>(null);

  const flipCard = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget.querySelector('.inner');
    if (target) target.classList.toggle('rotate-y-180');
  };

  const sortBrainDump = async () => {
    if (!braindumpInput.trim()) return;
    setIsLoading(true);

    const prompt = `El usuario ha escrito todos sus pendientes desordenados: "${braindumpInput}". Clasifícalos en un JSON: "hoy" (max 2 tareas pequeñas procesables en bloques de 15 min), "posponer" (lo que puede esperar), "soltar" (preocupaciones o cosas que no dependen de él). Estructura requerida: {"hoy":[], "posponer":[], "soltar":[]}`;

    try {
      const res = await askGemini(prompt, true, {
        type: Type.OBJECT,
        properties: {
          hoy: { type: Type.ARRAY, items: { type: Type.STRING } },
          posponer: { type: Type.ARRAY, items: { type: Type.STRING } },
          soltar: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      });
      if (res) {
        setResults(JSON.parse(res.replace(/```json|```/g, '').trim()));
      }
    } catch (e) {
      console.error(e);
      alert("Error processing diagnostics");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-500">
      <div className="mb-8 border-b border-rose-100/50 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2 font-serif">Diagnóstico de Energía</h2>
        <p className="text-rose-500/80 text-sm font-medium">
          Entendiendo tus bloqueos y mecanismos de defensa.
        </p>
      </div>

      <div className="bg-rose-50/30 border border-rose-100/50 p-8 rounded-[2rem] mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-rose-900 font-bold text-sm tracking-tight">Cambio de Perspectiva</h3>
          <span className="text-[10px] font-bold text-orange-600 px-3 py-1 bg-orange-100/50 border border-orange-200/50 rounded-full">✨ MAGIA MENTAL</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 [perspective:1000px]">
          {[
            {
              front: '"Tengo que..."',
              frontDesc: '(Obligación pesada)',
              back: '"Elijo..."',
              backDesc: '(Recuperas el control)'
            },
            {
              front: '"Debo terminar todo"',
              frontDesc: '(Parálisis por tamaño)',
              back: '"¿Cuándo empiezo?"',
              backDesc: '(Foco en la acción)'
            },
            {
              front: '"Debe ser perfecto"',
              frontDesc: '(Miedo a fallar)',
              back: '"Progreso > Perfección"',
              backDesc: '(Permítete iterar)'
            }
          ].map((card, i) => (
            <div key={i} onClick={flipCard} className="cursor-pointer h-32 w-full group">
              <div className="inner relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]">
                <div className="absolute w-full h-full bg-white border border-rose-100 rounded-2xl flex items-center justify-center p-5 text-center text-rose-900 font-bold shadow-sm [backface-visibility:hidden]">
                  <div>
                    {card.front}<br />
                    <span className="text-[11px] font-medium text-rose-400 mt-2 block">{card.frontDesc}</span>
                  </div>
                </div>
                <div className="absolute w-full h-full bg-gradient-to-br from-rose-400 to-orange-400 border border-rose-400 rounded-2xl flex items-center justify-center p-5 text-center text-white font-bold shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div>
                    {card.back}<br />
                    <span className="text-[11px] font-medium text-rose-100 mt-2 block">{card.backDesc}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-rose-100/50 p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(251,113,133,0.1)] flex flex-col flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
             <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-1">Volcado de Memoria</h3>
             <p className="text-xs text-slate-500">Deja que la IA ordene esos pendientes que te abruman.</p>
          </div>
          <button
            onClick={sortBrainDump}
            disabled={isLoading}
            className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-md shadow-rose-500/20"
          >
            {isLoading ? 'Ordenando...' : 'Ordenar Pendientes'}
          </button>
        </div>
        
        <textarea
          value={braindumpInput}
          onChange={(e) => setBraindumpInput(e.target.value)}
          rows={3}
          className="w-full px-5 py-4 border border-rose-100 bg-rose-50/30 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-200 transition-all font-sans text-sm mb-6 text-slate-700 placeholder:text-slate-400 resize-none"
          placeholder="Ej: Tengo que lavar ropa, mandar ese mail, el proyecto final me da miedo, comprar leche..."
        ></textarea>

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300 border-t border-rose-50 pt-8 mt-auto">
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50">
              <p className="text-emerald-800 text-xs font-bold tracking-tight mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></span> HOY (Corto)</p>
              <ul className="text-xs font-medium text-emerald-700 space-y-3">
                {results.hoy?.map((item, i) => <li key={i} className="leading-relaxed border-l-2 border-emerald-300 pl-3">{item}</li>)}
              </ul>
            </div>
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
              <p className="text-amber-800 text-xs font-bold tracking-tight mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-amber-500 rounded-full shadow-sm"></span> POSPONER</p>
              <ul className="text-xs font-medium text-amber-700 space-y-3">
                {results.posponer?.map((item, i) => <li key={i} className="leading-relaxed border-l-2 border-amber-300 pl-3">{item}</li>)}
              </ul>
            </div>
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
              <p className="text-slate-700 text-xs font-bold tracking-tight mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-slate-400 rounded-full shadow-sm"></span> SOLTAR</p>
              <ul className="text-xs font-medium text-slate-600 space-y-3">
                {results.soltar?.map((item, i) => <li key={i} className="leading-relaxed border-l-2 border-slate-300 pl-3">{item}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
