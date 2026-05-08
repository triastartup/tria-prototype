"use client"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SymptomsStepProps {
  symptoms: string
  onSymptomsChange: (value: string) => void
  onConfirm: () => void
  onGoBack: () => void
}

export function SymptomsStep({ symptoms, onSymptomsChange, onConfirm, onGoBack }: SymptomsStepProps) {
  return (
    <TriageCard title="Sintomas">
      <div className="flex flex-col items-center gap-5">
        <Label className="text-[#1d334a] text-center text-sm font-medium">O que você está sentindo?</Label>
        <Textarea
          value={symptoms}
          onChange={(e) => onSymptomsChange(e.target.value)}
          className="bg-gray-200 border-none text-gray-800 min-h-[120px] resize-none rounded-md"
          placeholder="Descreva seus sintomas com o máximo de detalhes possível..."
        />
        <div className="flex gap-3">
          <Button
            onClick={onGoBack}
            variant="outline"
            className="border-[#c8516d] text-[#c8516d] hover:bg-[#c8516d]/10 px-6 py-2 uppercase text-xs font-semibold tracking-wide rounded-md bg-transparent"
          >
            Voltar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!symptoms.trim()}
            className="bg-[#c8516d] border-none text-white hover:bg-[#b04460] px-10 py-2 uppercase text-xs font-semibold tracking-wide rounded-md disabled:opacity-50"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </TriageCard>
  )
}
