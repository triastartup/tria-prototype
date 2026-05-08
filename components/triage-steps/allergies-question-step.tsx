"use client"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AllergiesQuestionStepProps {
  hasAllergy: string
  onAllergyChange: (value: string) => void
  onConfirm: () => void
  onGoBack: () => void
}

export function AllergiesQuestionStep({ hasAllergy, onAllergyChange, onConfirm, onGoBack }: AllergiesQuestionStepProps) {
  return (
    <TriageCard title="Alergias">
      <div className="flex flex-col items-center gap-6">
        <Label className="text-[#1d334a] text-center text-sm font-medium leading-relaxed">
          Você possui alergia a algum tipo
          <br />
          de medicamento?
        </Label>
        <RadioGroup value={hasAllergy} onValueChange={onAllergyChange} className="flex gap-10">
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="sim"
              id="sim"
              className="border-[#1d334a] text-[#1d334a] data-[state=checked]:bg-[#c8516d] data-[state=checked]:border-[#c8516d]"
            />
            <Label htmlFor="sim" className="text-[#1d334a] cursor-pointer">
              Sim
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="nao"
              id="nao"
              className="border-[#1d334a] text-[#1d334a] data-[state=checked]:bg-[#c8516d] data-[state=checked]:border-[#c8516d]"
            />
            <Label htmlFor="nao" className="text-[#1d334a] cursor-pointer">
              Não
            </Label>
          </div>
        </RadioGroup>
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
            disabled={!hasAllergy}
            className="bg-[#c8516d] border-none text-white hover:bg-[#b04460] px-10 py-2 uppercase text-xs font-semibold tracking-wide rounded-md disabled:opacity-50"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </TriageCard>
  )
}
