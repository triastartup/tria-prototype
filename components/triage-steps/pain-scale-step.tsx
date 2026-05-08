"use client"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PainScaleStepProps {
  painScale: number
  onPainScaleChange: (scale: number) => void
  onConfirm: () => void
  onGoBack: () => void
}

const painLevels = [
  { min: 0, max: 2, label: "Leve", color: "#00CC00", description: "Dor mínima ou desconforto leve" },
  { min: 3, max: 4, label: "Tolerável", color: "#7FCC00", description: "Dor presente mas suportável" },
  { min: 5, max: 6, label: "Angustiante", color: "#FFCC00", description: "Dor moderada que incomoda" },
  { min: 7, max: 7, label: "Intensa", color: "#FF6600", description: "Dor forte que afeta atividades" },
  { min: 8, max: 10, label: "Insuportável", color: "#CC0000", description: "Dor muito severa ou insuportável" },
]

function getPainLevel(scale: number) {
  return painLevels.find((level) => scale >= level.min && scale <= level.max) || painLevels[0]
}

export function PainScaleStep({ painScale, onPainScaleChange, onConfirm, onGoBack }: PainScaleStepProps) {
  const currentLevel = getPainLevel(painScale)

  return (
    <TriageCard title="Escala de Dor">
      <div className="flex flex-col gap-5">
        <p className="text-[#1d334a]/70 text-sm text-center">
          Selecione o nível de dor que você está sentindo neste momento
        </p>

        {/* Escala visual */}
        <div className="flex flex-col gap-3">
          {/* Número selecionado */}
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold transition-all"
              style={{ backgroundColor: currentLevel.color, color: "#ffffff" }}
            >
              {painScale}
            </div>
            <p
              className="mt-2 text-lg font-semibold"
              style={{ color: currentLevel.color }}
            >
              {currentLevel.label}
            </p>
            <p className="text-[#1d334a]/60 text-xs mt-1">{currentLevel.description}</p>
          </div>

          {/* Slider visual */}
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="10"
              value={painScale}
              onChange={(e) => onPainScaleChange(parseInt(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00CC00 0%, #7FCC00 30%, #FFCC00 50%, #FF6600 70%, #CC0000 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-[#1d334a]/60 mt-1">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10</span>
            </div>
          </div>

          {/* Botões de seleção rápida */}
          <div className="grid grid-cols-11 gap-1 mt-2">
            {Array.from({ length: 11 }, (_, i) => {
              const level = getPainLevel(i)
              const isSelected = painScale === i
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onPainScaleChange(i)}
                  className={`aspect-square rounded-md text-xs font-semibold transition-all ${
                    isSelected
                      ? "ring-2 ring-offset-1 ring-[#1d334a] scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: isSelected ? level.color : `${level.color}40`,
                    color: isSelected ? "#ffffff" : level.color,
                  }}
                >
                  {i}
                </button>
              )
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="bg-[#1d334a]/5 rounded-lg p-3">
          <p className="text-[#1d334a]/60 text-xs font-medium uppercase mb-2">Níveis de Dor</p>
          <div className="space-y-1.5">
            {painLevels.map((level) => (
              <div key={level.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: level.color }}
                />
                <span className="text-xs text-[#1d334a]/80">
                  <span className="font-medium">{level.min}-{level.max}:</span> {level.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-2">
          <Button
            onClick={onGoBack}
            variant="outline"
            className="flex-1 border-[#c8516d] text-[#5d77e2] hover:bg-[#c8516d]/10 px-4 py-2 uppercase text-xs font-semibold tracking-wide rounded-md bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-[#c8516d] border-none text-white hover:bg-[#b04460] px-4 py-2 uppercase text-xs font-semibold tracking-wide rounded-md"
          >
            Continuar
          </Button>
        </div>
      </div>
    </TriageCard>
  )
}
