"use client"

import type React from "react"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CpfStepProps {
  cpf: string
  onCpfChange: (value: string) => void
  onConfirm: () => void
  onGoBack: () => void
}

export function CpfStep({ cpf, onCpfChange, onConfirm, onGoBack }: CpfStepProps) {
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    onCpfChange(formatted)
  }

  return (
    <TriageCard title="Identificação">
      <div className="flex flex-col items-center gap-5">
        <Label htmlFor="cpf" className="text-[#1d334a] text-center text-sm font-medium">
          Insira o número do seu CPF:
        </Label>
        <Input
          id="cpf"
          type="text"
          value={cpf}
          onChange={handleCpfChange}
          maxLength={14}
          className="bg-gray-200 border-none text-gray-800 text-center h-11 rounded-md"
          placeholder="000.000.000-00"
        />
        <div className="flex gap-3">
          <Button
            onClick={onGoBack}
            variant="outline"
            className="border-[#c8516d] text-[#5d77e2] hover:bg-[#c8516d]/10 px-6 py-2 uppercase text-xs font-semibold tracking-wide rounded-md bg-transparent"
          >
            Voltar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={cpf.replace(/\D/g, "").length !== 11}
            className="bg-[#c8516d] border-none text-white hover:bg-[#b04460] px-10 py-2 uppercase text-xs font-semibold tracking-wide rounded-md disabled:opacity-50"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </TriageCard>
  )
}
