"use client"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface SymptomsDurationStepProps {
  duration: string
  onDurationChange: (value: string) => void
  onConfirm: () => void
  onGoBack: () => void
}

const durationOptions = [
  { value: "menos-de-1h", label: "Menos de 1 hora", icon: "urgent" },
  { value: "1h-6h", label: "Entre 1 e 6 horas", icon: "recent" },
  { value: "6h-24h", label: "Entre 6 e 24 horas", icon: "today" },
  { value: "1-3-dias", label: "De 1 a 3 dias", icon: "days" },
  { value: "3-7-dias", label: "De 3 a 7 dias", icon: "week" },
  { value: "mais-de-7-dias", label: "Mais de 7 dias", icon: "chronic" },
]

export function SymptomsDurationStep({
  duration,
  onDurationChange,
  onConfirm,
  onGoBack,
}: SymptomsDurationStepProps) {
  return (
    <TriageCard title="Duração dos Sintomas">
      <div className="flex flex-col items-center gap-5">
        <Label className="text-[#1d334a] text-center text-sm font-medium">
          Há quanto tempo você está sentindo esses sintomas?
        </Label>

        <div className="w-full grid grid-cols-1 gap-3">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onDurationChange(option.value)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg border-2 transition-all text-left ${
                duration === option.value
                  ? "border-[#c8516d] bg-[#c8516d]/10"
                  : "border-gray-200 bg-gray-100 hover:border-[#5d77e2]/50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  duration === option.value ? "bg-[#c8516d]" : "bg-[#5d77e2]"
                }`}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-sm font-medium ${
                  duration === option.value ? "text-[#c8516d]" : "text-[#1d334a]"
                }`}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            onClick={onGoBack}
            variant="outline"
            className="border-[#c8516d] text-[#c8516d] hover:bg-[#c8516d]/10 px-6 py-2 uppercase text-xs font-semibold tracking-wide rounded-md bg-transparent"
          >
            Voltar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!duration}
            className="bg-[#c8516d] border-none text-white hover:bg-[#b04460] px-10 py-2 uppercase text-xs font-semibold tracking-wide rounded-md disabled:opacity-50"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </TriageCard>
  )
}
