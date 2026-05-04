import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { askGemini } from "../lib/gemini";
import { Type } from "@google/genai";

const initialData = [
  { subject: "Work", current: 60, target: 70 },
  { subject: "Home", current: 50, target: 60 },
  { subject: "Self-Care", current: 20, target: 80 },
  { subject: "Finance", current: 30, target: 70 },
  { subject: "Worry", current: 90, target: 20 },
];

export function TuBalance() {
  const [victoriesInput, setVictoriesInput] = useState("");
  const [victories, setVictories] = useState<string[]>([]);
  const [isLoadingVictories, setIsLoadingVictories] = useState(false);

  const [energyInput, setEnergyInput] = useState("");
  const [energyData, setEnergyData] = useState(initialData);
  const [isLoadingEnergy, setIsLoadingEnergy] = useState(false);

  const findHiddenVictories = async () => {
    if (!victoriesInput.trim()) return;
    setIsLoadingVictories(true);

    const prompt = `La usuaria relata su día sintiendo que no hizo mucho: "${victoriesInput}". Demuéstrale que las acciones de autocuidado, el descanso o sobrellevar emociones difíciles también son avances positivos e importantes. Devuelve un array JSON de 3 frases alentadoras destacando estas "victorias".`;

    try {
      const res = await askGemini(prompt, true, {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      });
      if (res) {
        setVictories(JSON.parse(res.replace(/```json|```/g, "").trim()));
      }
    } catch (e) {
      console.error(e);
      alert("Error finding victories");
    } finally {
      setIsLoadingVictories(false);
    }
  };

  const analyzeEnergy = async () => {
    if (!energyInput.trim()) return;
    setIsLoadingEnergy(true);

    const prompt = `Analiza este reporte del día de la usuaria: "${energyInput}". Estima la distribución de su energía en 5 áreas y devuelve UNICAMENTE un array JSON con 5 números (0-100). Orden estricto: [Trabajo, Hogar, Cuidado Personal, Finanzas, Preocupación]. Ej: [80, 10, 5, 0, 90]. Solo el array JSON.`;

    try {
      const responseText = await askGemini(prompt, true, {
        type: Type.ARRAY,
        items: { type: Type.NUMBER },
      });
      if (responseText) {
        const newData = JSON.parse(responseText.replace(/```json|```/g, "").trim());
        if (Array.isArray(newData) && newData.length === 5) {
          const updatedData = [...energyData].map((item, index) => ({
            ...item,
            current: newData[index],
          }));
          setEnergyData(updatedData);
        }
      }
    } catch (error) {
       console.error("Error analyzing energy:", error);
       alert("Hubo un error al actualizar los datos. Intenta de nuevo.");
    } finally {
      setIsLoadingEnergy(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in duration-500 w-full">
      <div className="flex-1 w-full bg-white p-8 rounded-[2rem] border border-rose-100/50 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2 font-serif">
          Tu Balance Real
        </h2>
        <p className="text-rose-500/80 text-sm mb-8 font-medium">
          Descubriendo victorias ocultas y midiendo tu energía vital.
        </p>

        <div className="bg-orange-50/50 border border-orange-100/50 p-6 rounded-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-orange-900 font-bold text-sm tracking-tight text-sm">Registro de Logros Peq.</h3>
            <span className="text-[10px] font-bold text-rose-500 px-2 py-1 bg-white border border-rose-100 rounded-full shadow-sm shadow-rose-100/50">💖 AUTOCOMPASIÓN</span>
          </div>
          <p className="text-xs text-orange-600/80 mb-4 font-medium">
            Cuéntame tu día, incluso si sientes que no hiciste "nada".
          </p>
          <textarea
            value={victoriesInput}
            onChange={(e) => setVictoriesInput(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-orange-100 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-sm mb-4 text-slate-700 transition-all placeholder:text-slate-300 resize-none"
            placeholder="Ej: Solo logré levantarme, bañarme y ver una serie..."
          ></textarea>
          <button
            onClick={findHiddenVictories}
            disabled={isLoadingVictories}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 w-full sm:w-auto"
          >
            {isLoadingVictories ? "Descubriendo..." : "Buscar Victorias Ocultas"}
          </button>
          
          {victories.length > 0 && (
            <div className="mt-8 pt-6 border-t border-orange-200/50 animate-in fade-in">
              <ul className="space-y-3">
                {victories.map((v, i) => (
                  <li
                    key={i}
                    className="bg-white p-4 rounded-xl border border-orange-100/50 text-slate-700 text-sm shadow-sm flex gap-3 font-medium leading-relaxed"
                  >
                    <span className="text-orange-400 text-lg leading-none">✨</span> 
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[450px] bg-white p-8 rounded-[2rem] border border-rose-100/50 shadow-sm flex flex-col items-center justify-center">
        <h3 className="w-full text-slate-900 font-bold text-sm tracking-tight mb-4">¿Hacia dónde va tu energía?</h3>
        <div className="relative w-full max-w-[400px] h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={energyData}>
              <PolarGrid stroke="#fbcfe8" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#881337', fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="#f43f5e"
                fillOpacity={0.4}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="#fbbf24"
                strokeWidth={2}
                strokeDasharray="3 3"
                fill="#fbbf24"
                fillOpacity={0.1}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 w-full flex flex-col gap-4">
          <div className="text-xs flex justify-between w-full border border-rose-100 rounded-xl max-w-[400px] mx-auto divide-x divide-rose-100 bg-rose-50/30">
              <div className="flex-1 py-2 px-3 flex flex-col gap-1 items-center">
                 <span className="text-rose-400 font-bold tracking-wider text-[10px]">ACTUAL</span>
                 <span className="flex items-center gap-2 text-rose-900 font-bold"><span className="w-2 h-2 bg-rose-500 rounded-full block shadow-sm shadow-rose-500/50"></span> Tu Energía</span>
              </div>
              <div className="flex-1 py-2 px-3 flex flex-col gap-1 items-center">
                 <span className="text-amber-500 font-bold tracking-wider text-[10px]">IDEAL</span>
                 <span className="flex items-center gap-2 text-amber-700 font-bold"><span className="w-2 h-2 bg-amber-400 rounded-full block shadow-sm shadow-amber-400/50"></span> Balance</span>
              </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-rose-50">
            <h4 className="text-slate-900 font-bold text-xs tracking-tight mb-2">Ajustar Gráfico</h4>
             <textarea
              value={energyInput}
              onChange={(e) => setEnergyInput(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-rose-100 bg-rose-50/30 rounded-xl text-xs mb-3 focus:outline-none focus:ring-2 focus:ring-rose-200 text-slate-700 placeholder:text-rose-300 resize-none"
              placeholder="Ej: Hoy trabajé 8h, cociné, casi no descansé y me preocupé mucho por el dinero..."
            ></textarea>
            <button
              onClick={analyzeEnergy}
              disabled={isLoadingEnergy}
              className="bg-rose-500 disabled:opacity-50 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold w-full transition-all shadow-md shadow-rose-500/20"
            >
             {isLoadingEnergy ? "Calculando..." : "Analizar mi Energía"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
