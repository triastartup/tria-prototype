"use client"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useEffect, useState, useCallback, useRef } from "react"

interface PatientData {
  name: string
  birthDate: string
  ethnicity: string
  gender: string
  genderOther?: string
}

interface Comorbidities {
  pressaoAlta: boolean
  diabetes: boolean
  diabetesTipo?: string
  cardiopatia: boolean
  doencaRenal: boolean
  doencaRespiratoria: boolean
  outro: boolean
  outroEspecificar?: string
}

interface ClassificationStepProps {
  symptoms: string
  patientData: PatientData
  symptomsDuration: string
  painScale: number
  comorbidities: Comorbidities
  onRestart: () => void
}

interface TriageResult {
  level: string
  priority: number
  description: string
  waitTime: string
  color: string
  textColor: string
}

const levelColors: Record<string, { color: string; textColor: string }> = {
  "MUITO URGENTE": { color: "#FF6600", textColor: "#ffffff" },
  "URGENTE": { color: "#FFCC00", textColor: "#1d334a" },
  "POUCO URGENTE": { color: "#00CC00", textColor: "#ffffff" },
  "NÃO URGENTE": { color: "#0066FF", textColor: "#ffffff" },
}

export function ClassificationStep({ symptoms, patientData, symptomsDuration, painScale, comorbidities, onRestart }: ClassificationStepProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAddedToQueue, setIsAddedToQueue] = useState(false)
  const hasAddedToQueueRef = useRef(false)

  // Calcular idade a partir da data de nascimento
  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const age = patientData.birthDate ? calculateAge(patientData.birthDate) : 0

  const classifyPatient = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientAge: age,
          patientEthnicity: patientData.ethnicity,
          patientGender: patientData.gender === "outro" ? patientData.genderOther : patientData.gender,
          symptoms,
          symptomsDuration,
          painScale,
          comorbidities,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()

      const level = data.level?.toUpperCase() || "URGENTE"
      const colors = levelColors[level] || levelColors["URGENTE"]

      setResult({
        level: level,
        priority: data.priority || 3,
        description: "Aguarde atendimento",
        waitTime: data.waitTime || "A definir",
        color: colors.color,
        textColor: colors.textColor,
      })
    } catch (err) {
      console.error("Erro ao classificar paciente:", err)
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(`Não foi possível processar a classificação: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [symptoms, patientData, symptomsDuration, painScale, comorbidities, age])

  useEffect(() => {
    classifyPatient()
  }, [classifyPatient])

  // Enviar para a fila quando a classificação estiver pronta
  useEffect(() => {
    const addToQueue = async () => {
      if (!result || hasAddedToQueueRef.current) return

      hasAddedToQueueRef.current = true

      try {
        await fetch("/api/queue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: patientData.name,
            age,
            birthDate: patientData.birthDate,
            ethnicity: patientData.ethnicity,
            gender: patientData.gender === "outro" ? patientData.genderOther : patientData.gender,
            symptoms,
            symptomsDuration,
            level: result.level,
            painScale,
            comorbidities,
          }),
        })
        setIsAddedToQueue(true)
      } catch (err) {
        console.error("Erro ao adicionar à fila:", err)
        hasAddedToQueueRef.current = false
      }
    }

    addToQueue()
  }, [result, patientData, age, symptoms, symptomsDuration, painScale, comorbidities])

  if (isLoading) {
    return (
      <TriageCard title="Classificação do Paciente">
        <div className="flex flex-col items-center gap-6 py-8">
          <Spinner className="h-12 w-12 text-[#c8516d]" />
          <div className="text-center">
            <p className="text-[#1d334a] text-sm animate-pulse">Processando classificação com IA...</p>
            <p className="text-[#5d77e2] text-xs mt-2">Protocolo de Manchester</p>
          </div>
        </div>
      </TriageCard>
    )
  }

  // Mostrar erro com botão de retry
  if (error && !result) {
    return (
      <TriageCard title="Erro na Classificação">
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="w-20 h-20 rounded-full bg-[#c8516d]/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#c8516d]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-[#c8516d] font-medium text-sm mb-2">Ocorreu um erro</p>
            <p className="text-[#1d334a]/70 text-xs px-4">{error}</p>
          </div>

          <div className="w-full flex flex-col gap-3 mt-2">
            <Button
              onClick={classifyPatient}
              className="w-full bg-[#5d77e2] text-white hover:bg-[#4a62c7] px-6 py-2 uppercase text-xs font-semibold tracking-wide rounded-md"
            >
              Tentar Novamente
            </Button>
            <Button
              onClick={onRestart}
              variant="outline"
              className="w-full border-[#c8516d] text-[#c8516d] hover:bg-[#c8516d]/10 px-6 py-2 uppercase text-xs font-semibold tracking-wide rounded-md"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </TriageCard>
    )
  }

  if (!result) return null

  return (
    <TriageCard title="Classificação do Paciente">
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Badge de classificação */}
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg border-4"
          style={{ backgroundColor: result.color, borderColor: `${result.color}50` }}
        >
          <span className="font-bold text-sm text-center px-3 leading-tight" style={{ color: result.textColor }}>
            {result.level}
          </span>
        </div>

        {/* Informações */}
        <div className="text-center">
          <p className="text-[#5d77e2] text-sm mt-1">Tempo estimado: {result.waitTime}</p>
        </div>

        {/* Informações do paciente */}
        <div className="w-full bg-[#1d334a]/10 rounded-lg p-4 mt-2">
          <p className="text-[#5d77e2] text-xs font-semibold uppercase mb-2">Dados registrados:</p>
          <div className="space-y-2">
            <p className="text-[#1d334a]/90 text-xs">
              <span className="font-medium">Nome:</span> {patientData.name}
            </p>
            <p className="text-[#1d334a]/90 text-xs">
              <span className="font-medium">Idade:</span> {age} anos
            </p>
            <p className="text-[#1d334a]/90 text-xs">
              <span className="font-medium">Sintomas:</span> {symptoms || "Não informado"}
            </p>
          </div>
        </div>

        {isAddedToQueue && (
          <div className="w-full bg-green-100 border border-green-300 rounded-lg p-3 text-center">
            <p className="text-green-700 text-xs font-medium">Você foi adicionado à fila de espera!</p>
          </div>
        )}

        <Button
          onClick={onRestart}
          className="w-full bg-[#c8516d] text-white hover:bg-[#b04460] px-6 py-2 uppercase text-xs font-semibold tracking-wide rounded-md"
        >
          Voltar ao Início
        </Button>
      </div>
    </TriageCard>
  )
}
