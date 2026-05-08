"use client"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WelcomeStepProps {
  susNumber: string
  onSusNumberChange: (value: string) => void
  onConfirm: () => void
  onDontKnowNumber: () => void
}

export function WelcomeStep({ susNumber, onSusNumberChange, onConfirm, onDontKnowNumber }: WelcomeStepProps) {
  return (
    <TriageCard title="Bem Vindo(a)!">
      <div className="flex flex-col items-center gap-5">
        <Label htmlFor="sus-number" className="text-[#1d334a] text-center text-sm font-medium">
          Digite o número do seu cartão do SUS
        </Label>
        <Input
          id="sus-number"
          type="text"
          value={susNumber}
          onChange={(e) => onSusNumberChange(e.target.value)}
          className="bg-gray-200 border-none text-gray-800 text-center h-11 rounded-md"
          placeholder="000 0000 0000 0000"
        />
        <button
          onClick={onDontKnowNumber}
          className="text-[#5d77e2] text-xs underline hover:text-[#c8516d] transition-colors"
        >
          Não sei o número do meu cartão
        </button>
        <Button
          onClick={onConfirm}
          disabled={!susNumber.trim()}
          className="bg-[#c8516d] border-none text-white hover:bg-[#b04460] px-10 py-2 uppercase text-xs font-semibold tracking-wide rounded-md disabled:opacity-50"
        >
          Confirmar
        </Button>
      </div>
    </TriageCard>
  )
}
