"use client"

import { useState, useEffect } from "react"
import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check } from "lucide-react"

export interface Comorbidities {
  pressaoAlta: boolean
  diabetes: boolean
  diabetesTipo?: string
  cardiopatia: boolean
  doencaRenal: boolean
  doencaRespiratoria: boolean
  outro: boolean
  outroEspecificar?: string
}

interface ComorbiditiesStepProps {
  comorbidities: Comorbidities
  onComorbiditiesChange: (comorbidities: Comorbidities) => void
  onConfirm: () => void
  onGoBack: () => void
}

const comorbidityOptions = [
  { key: "pressaoAlta", label: "Pressão Alta (Hipertensão)" },
  { key: "diabetes", label: "Diabetes", hasSpecify: true, specifyField: "diabetesTipo", specifyPlaceholder: "Tipo (1, 2, gestacional...)" },
  { key: "cardiopatia", label: "Cardiopatia (Doença do Coração)" },
  { key: "doencaRenal", label: "Doença Renal" },
  { key: "doencaRespiratoria", label: "Doença Respiratória (Asma, DPOC...)" },
  { key: "outro", label: "Outro", hasSpecify: true, specifyField: "outroEspecificar", specifyPlaceholder: "Especifique a doença/condição" },
]

export function ComorbiditiesStep({ comorbidities, onComorbiditiesChange, onConfirm, onGoBack }: ComorbiditiesStepProps) {
  const [hasComorbidity, setHasComorbidity] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar se alguma comorbidade está selecionada
    const hasAny = Object.entries(comorbidities).some(([key, value]) => {
      if (key === "diabetesTipo" || key === "outroEspecificar") return false
      return value === true
    })
    if (hasAny) setHasComorbidity(true)
  }, [comorbidities])

  const handleToggle = (key: string) => {
    const newValue = !comorbidities[key as keyof Comorbidities]
    const updates: Partial<Comorbidities> = { [key]: newValue }
    
    // Limpar campo de especificação se desmarcar
    if (!newValue) {
      if (key === "diabetes") updates.diabetesTipo = undefined
      if (key === "outro") updates.outroEspecificar = undefined
    }
    
    onComorbiditiesChange({ ...comorbidities, ...updates })
  }

  const handleSpecifyChange = (field: string, value: string) => {
    onComorbiditiesChange({ ...comorbidities, [field]: value })
  }

  const handleNoComorbidity = () => {
    setHasComorbidity(false)
    onComorbiditiesChange({
      pressaoAlta: false,
      diabetes: false,
      cardiopatia: false,
      doencaRenal: false,
      doencaRespiratoria: false,
      outro: false,
    })
  }

  const handleYesComorbidity = () => {
    setHasComorbidity(true)
  }

  // Validação
  const isValid = hasComorbidity === false || (
    hasComorbidity === true && (
      comorbidities.pressaoAlta ||
      (comorbidities.diabetes && comorbidities.diabetesTipo?.trim()) ||
      comorbidities.cardiopatia ||
      comorbidities.doencaRenal ||
      comorbidities.doencaRespiratoria ||
      (comorbidities.outro && comorbidities.outroEspecificar?.trim())
    )
  )

  return (
    <TriageCard title="Comorbidades / Doenças">
      <div className="flex flex-col gap-4">
        <p className="text-[#1d334a]/70 text-sm text-center">
          Você possui alguma doença crônica ou condição de saúde pré-existente?
        </p>

        {/* Pergunta inicial */}
        {hasComorbidity === null && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleNoComorbidity}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#00CC00] transition-all text-center"
            >
              <span className="text-[#1d334a] font-medium">Não</span>
              <p className="text-[#1d334a]/60 text-xs mt-1">Não possuo doenças</p>
            </button>
            <button
              type="button"
              onClick={handleYesComorbidity}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#FF6600] transition-all text-center"
            >
              <span className="text-[#1d334a] font-medium">Sim</span>
              <p className="text-[#1d334a]/60 text-xs mt-1">Possuo condições</p>
            </button>
          </div>
        )}

        {/* Mensagem para quem não tem */}
        {hasComorbidity === false && (
          <div className="bg-[#00CC00]/10 border border-[#00CC00]/30 rounded-lg p-4 text-center">
            <Check className="w-8 h-8 text-[#00CC00] mx-auto mb-2" />
            <p className="text-[#1d334a] font-medium">Nenhuma comorbidade informada</p>
            <button
              type="button"
              onClick={() => setHasComorbidity(null)}
              className="text-[#5d77e2] text-xs mt-2 hover:underline"
            >
              Alterar resposta
            </button>
          </div>
        )}

        {/* Lista de comorbidades */}
        {hasComorbidity === true && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[#1d334a] text-sm font-medium">Selecione as condições:</Label>
              <button
                type="button"
                onClick={() => setHasComorbidity(null)}
                className="text-[#5d77e2] text-xs hover:underline"
              >
                Alterar
              </button>
            </div>
            
            {comorbidityOptions.map((option) => {
              const isChecked = comorbidities[option.key as keyof Comorbidities] === true
              const showSpecify = option.hasSpecify && isChecked

              return (
                <div key={option.key} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(option.key)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                      isChecked
                        ? "border-[#5d77e2] bg-[#5d77e2]/10"
                        : "border-gray-200 hover:border-[#5d77e2]/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isChecked ? "bg-[#5d77e2] border-[#5d77e2]" : "border-gray-300"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm ${isChecked ? "text-[#5d77e2] font-medium" : "text-[#1d334a]"}`}>
                      {option.label}
                    </span>
                  </button>
                  
                  {showSpecify && option.specifyField && (
                    <Input
                      type="text"
                      value={(comorbidities[option.specifyField as keyof Comorbidities] as string) || ""}
                      onChange={(e) => handleSpecifyChange(option.specifyField!, e.target.value)}
                      className="bg-gray-100 border-none text-gray-800 h-10 rounded-md w-full"
                      placeholder={option.specifyPlaceholder}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

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
            disabled={hasComorbidity === null || !isValid}
            className="flex-1 bg-[#c8516d] border-none text-white hover:bg-[#b04460] px-4 py-2 uppercase text-xs font-semibold tracking-wide rounded-md disabled:opacity-50"
          >
            Continuar
          </Button>
        </div>
      </div>
    </TriageCard>
  )
}
