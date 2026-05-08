"use client"

import { useState } from "react"
import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export interface PersonalData {
  name: string
  birthDate: string
  ethnicity: string
  gender: string
  genderOther?: string
}

interface PersonalDataStepProps {
  data: PersonalData
  onDataChange: (data: PersonalData) => void
  onConfirm: () => void
  onGoBack: () => void
}

const colorOptions = [
  { value: "branca", label: "Branca" },
  { value: "preta", label: "Preta" },
  { value: "parda", label: "Parda" },
  { value: "amarela", label: "Amarela" },
  { value: "indigena", label: "Indígena" },
  { value: "nao-declarado", label: "Prefiro não declarar" },
]

const genderOptions = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "outro", label: "Outro" },
  { value: "nao-declarado", label: "Prefiro não declarar" },
]

export function PersonalDataStep({ data, onDataChange, onConfirm, onGoBack }: PersonalDataStepProps) {
  const [showGenderInput, setShowGenderInput] = useState(data.gender === "outro")
  const [birthDateError, setBirthDateError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  const validateName = (name: string): string | null => {
    if (!name.trim()) return null
    
    // Permite apenas letras (incluindo acentuadas), espaços e apóstrofo
    const validNameRegex = /^[a-zA-ZÀ-ÿ\s']+$/
    
    if (!validNameRegex.test(name)) {
      return "O nome deve conter apenas letras e apóstrofos"
    }
    
    return null
  }

  const validateBirthDate = (dateStr: string): string | null => {
    if (!dateStr) return null
    
    const selectedDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate > today) {
      return "A data de nascimento não pode ser após a data atual"
    }
    
    // Calcular idade
    const ageInYears = (today.getTime() - selectedDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    
    if (ageInYears > 123) {
      return "Idade inválida"
    }
    
    return null
  }

  const handleChange = (field: keyof PersonalData, value: string) => {
    if (field === "gender") {
      if (value === "outro") {
        setShowGenderInput(true)
        onDataChange({ ...data, gender: value, genderOther: "" })
      } else {
        setShowGenderInput(false)
        onDataChange({ ...data, gender: value, genderOther: undefined })
      }
    } else {
      onDataChange({ ...data, [field]: value })
    }
  }

  const isValid = data.name.trim() && !nameError && !validateName(data.name) &&
    data.birthDate && !birthDateError && !validateBirthDate(data.birthDate) && 
    data.ethnicity && data.gender && 
    (data.gender !== "outro" || (data.genderOther && data.genderOther.trim()))

  return (
    <TriageCard title="Dados Pessoais">
      <div className="flex flex-col gap-4">
        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-[#1d334a] text-sm font-medium">
            Nome completo
          </Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => {
              const value = e.target.value
              const error = validateName(value)
              setNameError(error)
              
              if (!error) {
                handleChange("name", value)
              } else {
                onDataChange({ ...data, name: value })
              }
            }}
            className={`bg-gray-200 border-none text-gray-800 h-11 rounded-md ${
              nameError ? "ring-2 ring-red-400" : ""
            }`}
            placeholder="Digite seu nome completo"
          />
          {nameError && (
            <p className="text-xs text-red-500">{nameError}</p>
          )}
        </div>

        {/* Data de Nascimento */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="birthDate" className="text-[#1d334a] text-sm font-medium">
            Data de nascimento
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              const value = e.target.value
              const error = validateBirthDate(value)
              setBirthDateError(error)
              
              if (!error) {
                handleChange("birthDate", value)
              } else {
                // Permite visualizar a data mas marca como erro
                onDataChange({ ...data, birthDate: value })
              }
            }}
            className={`bg-gray-200 border-none text-gray-800 h-11 rounded-md ${
              birthDateError ? "ring-2 ring-red-400" : ""
            }`}
          />
          {birthDateError && (
            <p className="text-xs text-red-500">{birthDateError}</p>
          )}
        </div>

        {/* Cor */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[#1d334a] text-sm font-medium">Cor</Label>
          <div className="grid grid-cols-2 gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange("ethnicity", option.value)}
                className={`px-3 py-2 text-xs rounded-md border transition-all ${
                  data.ethnicity === option.value
                    ? "bg-[#5d77e2] text-white border-[#5d77e2]"
                    : "bg-gray-200 text-[#1d334a] border-gray-300 hover:border-[#5d77e2]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gênero */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-[#1d334a] text-sm font-medium">Gênero</Label>
          <div className="grid grid-cols-2 gap-2">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange("gender", option.value)}
                className={`px-3 py-2 text-xs rounded-md border transition-all ${
                  data.gender === option.value
                    ? "bg-[#5d77e2] text-white border-[#5d77e2]"
                    : "bg-gray-200 text-[#1d334a] border-gray-300 hover:border-[#5d77e2]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {showGenderInput && (
            <Input
              type="text"
              value={data.genderOther || ""}
              onChange={(e) => onDataChange({ ...data, genderOther: e.target.value })}
              className="bg-gray-200 border-none text-gray-800 h-11 rounded-md mt-2"
              placeholder="Especifique seu gênero"
            />
          )}
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
            disabled={!isValid}
            className="flex-1 bg-[#c8516d] border-none text-white hover:bg-[#b04460] px-4 py-2 uppercase text-xs font-semibold tracking-wide rounded-md disabled:opacity-50"
          >
            Continuar
          </Button>
        </div>
      </div>
    </TriageCard>
  )
}
