/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Diagnostico } from "./components/Diagnostico";
import { TuBalance } from "./components/TuBalance";
import { DisenoRutina } from "./components/DisenoRutina";
import { MiedosYCreencias } from "./components/MiedosYCreencias";
import { PlanDeAccion } from "./components/PlanDeAccion";

export default function App() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <div className="min-h-screen text-slate-800 antialiased selection:bg-rose-200 selection:text-rose-900 bg-[#fdfbf7] font-sans flex flex-col items-center">
      <div className="w-full max-w-[1024px] px-6 py-8 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-rose-100/50 pb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-sm text-xl">
              ✨
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                Desbloqueo Emocional
              </h1>
              <p className="text-rose-500/80 text-sm mt-1 font-medium">
                Tu espacio de calma y claridad
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-rose-50 shadow-sm flex items-center gap-4">
            <div className="text-2xl opacity-80">🌱</div>
            <div>
              <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">
                Mantra de Hoy
              </p>
              <p className="text-slate-700 font-bold text-sm">"Solo tengo que empezar"</p>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-rose-50">
          {[
            { id: 1, label: "Diagnóstico", emoji: "🧐" },
            { id: 2, label: "Tu Balance", emoji: "⚖️" },
            { id: 3, label: "Rutina", emoji: "📅" },
            { id: 4, label: "Creencias", emoji: "💭" },
            { id: 5, label: "Plan de Acción", emoji: "🚀" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-500 hover:text-slate-900 hover:bg-rose-50"
              }`}
            >
              <span className="text-base">{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 flex flex-col bg-white rounded-[2rem] border border-rose-100/50 shadow-xl shadow-rose-900/5 p-6 sm:p-10 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 -z-10 -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50 -z-10 translate-y-1/4 -translate-x-1/4"></div>
          
          {activeTab === 1 && <Diagnostico />}
          {activeTab === 2 && <TuBalance />}
          {activeTab === 3 && <DisenoRutina />}
          {activeTab === 4 && <MiedosYCreencias />}
          {activeTab === 5 && <PlanDeAccion />}
        </main>
      </div>
    </div>
  );
}
