import { useState } from "react";
import { askGemini } from "../lib/gemini";

interface Fear {
  id: number;
  fear: string;
  reality: string;
}

const initialFears: Fear[] = [
  {
    id: 1,
    fear: "¿Y si fracaso por completo después de intentarlo?",
    reality:
      "El perfeccionismo bloquea la acción. Dar un paso pequeño y torpe es infinitamente más valioso que un plan perfecto que nunca se ejecuta.",
  },
];

export function MiedosYCreencias() {
  const [fearsData, setFearsData] = useState<Fear[]>(initialFears);
  const [newFearInput, setNewFearInput] = useState("");
  const [isLoadingFear, setIsLoadingFear] = useState(false);
  const [expandedFears, setExpandedFears] = useState<Set<number>>(new Set());

  const [successInput, setSuccessInput] = useState("");
  const [successResult, setSuccessResult] = useState("");
  const [isLoadingSuccess, setIsLoadingSuccess] = useState(false);

  const toggleFear = (id: number) => {
    setExpandedFears((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const generateFearReality = async () => {
    if (!newFearInput.trim()) return;
    setIsLoadingFear(true);

    const prompt = `Actúa como un coach comprensivo. El usuario está atascado por esta preocupación: "${newFearInput}". Ofrece un cambio de perspectiva en 2 frases cortas. Ayuda a separar su valor personal de los resultados y anímalo a que está bien cometer errores al aprender.`;

    try {
      const reality = await askGemini(prompt, false);
      if (reality) {
        setFearsData((prev) => [
          { id: Date.now(), fear: newFearInput, reality },
          ...prev,
        ]);
        setNewFearInput("");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating reframe");
    } finally {
      setIsLoadingFear(false);
    }
  };

  const visualizeSuccess = async () => {
    if (!successInput.trim()) return;
    setIsLoadingSuccess(true);
    setSuccessResult("");

    const prompt = `La usuaria tiene ansiedad de dar este paso: "${successInput}". En lugar de dejarla pensar en el peor escenario, descríbele el MEJOR escenario posible. Escribe un párrafo muy vívido, positivo, compasivo y emocionante (máximo 3 oraciones) describiendo la sensación de alivio y orgullo que sentirá justo después de haberlo completado con éxito.`;

    try {
      const res = await askGemini(prompt, false);
      if (res) {
        setSuccessResult(res);
        setSuccessInput("");
      }
    } catch (error) {
      console.error("Error visualizing:", error);
      alert("Error al conectar. Imagina por un segundo: ¿y si sale mejor de lo que esperas?");
    } finally {
      setIsLoadingSuccess(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-500">
      <div className="mb-8 border-b border-rose-100/50 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2 font-serif">Tus Creencias y Miedos</h2>
        <p className="text-rose-500/80 text-sm font-medium">
          Separa tu valor personal de los resultados de tus tareas.
        </p>
      </div>

      <div className="mb-8 border border-rose-100/50 bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(251,113,133,0.1)]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-900 font-bold text-sm tracking-tight text-rose-900 text-sm">Cambiar Creencias</h3>
          <span className="text-[10px] font-bold text-indigo-600 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full shadow-sm">🧠 REPROGRAMAR</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={newFearInput}
            onChange={(e) => setNewFearInput(e.target.value)}
            placeholder="Ej: Tengo miedo de equivocarme y parecer tonto..."
            className="flex-1 px-5 py-3 border border-indigo-100 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 text-slate-700 placeholder:text-slate-400 transition-all shadow-sm"
          />
          <button
            onClick={generateFearReality}
            disabled={isLoadingFear}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold transition-all text-sm shadow-md shadow-indigo-500/20 whitespace-nowrap"
          >
            {isLoadingFear ? "Reflexionando..." : "Buscar Otra Perspectiva"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fearsData.map((item) => (
            <div
              key={item.id}
              className="border border-indigo-100/50 rounded-2xl overflow-hidden bg-indigo-50/20 shadow-sm"
            >
              <button
                onClick={() => toggleFear(item.id)}
                className="w-full text-left px-5 py-4 hover:bg-indigo-50/50 flex justify-between focus:outline-none items-center"
              >
                <span className="font-semibold text-slate-800 text-sm pr-4 leading-relaxed">{item.fear}</span>
                <span className="text-indigo-400 text-xl leading-none font-medium">{expandedFears.has(item.id) ? '−' : '+'}</span>
              </button>
              {expandedFears.has(item.id) && (
                <div className="px-5 pb-5 pt-2 bg-indigo-50/20 text-slate-600 text-sm animate-in slide-in-from-top-2 duration-200 border-t border-indigo-100/50 leading-relaxed font-medium">
                  <strong className="text-indigo-800 mb-1 block tracking-tight text-[11px] uppercase">Verdad Amable:</strong>
                  {item.reality}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-100/50 p-8 rounded-[2rem] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-orange-900 font-bold text-sm tracking-tight text-sm">¿Y si sale bien?</h3>
          <span className="text-[10px] font-bold text-orange-600 px-3 py-1 bg-white border border-orange-200/50 rounded-full shadow-sm">🌟 VISUALIZAR</span>
        </div>
        <p className="text-sm text-slate-600 mb-6 max-w-2xl font-medium">
          Obliga a tu mente a imaginar el mejor escenario posible en lugar de ir por defecto a la catástrofe.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={successInput}
            onChange={(e) => setSuccessInput(e.target.value)}
            placeholder="Acción que me da miedo..."
            className="flex-1 px-5 py-3 border border-orange-200/50 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
          />
          <button
            onClick={visualizeSuccess}
            disabled={isLoadingSuccess}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-bold transition-all text-sm shadow-md shadow-orange-500/20 whitespace-nowrap"
          >
           {isLoadingSuccess ? "Imaginando..." : "Visualizar Éxito"}
          </button>
        </div>
        
        {successResult && (
          <div className="mt-6 p-6 bg-white border border-orange-100 rounded-2xl text-slate-700 text-sm shadow-sm leading-relaxed animate-in fade-in font-medium">
            <strong className="text-orange-600 font-bold tracking-tight text-[11px] mb-2 block uppercase">Mejor Escenario Posible:</strong>
            {successResult}
          </div>
        )}
      </div>
    </div>
  );
}
