"use client"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Users, Clock, AlertCircle } from "lucide-react"

interface QueueStepProps {
  currentPatient: {
    id: string
    level: string
    position: number
    estimatedWait: string
  }
  onRestart: () => void
}

interface QueuePatient {
  id: string
  name: string
  level: string
  priority: number
  waitTime: string
  color: string
  textColor: string
  isCurrentPatient?: boolean
}

const levelColors: Record<string, { color: string; textColor: string; priority: number }> = {
  "MUITO URGENTE": { color: "#ec8b4e", textColor: "#1d334a", priority: 1 },
  "URGENTE": { color: "#f5c542", textColor: "#1d334a", priority: 2 },
  "POUCO URGENTE": { color: "#5d77e2", textColor: "#ffffff", priority: 3 },
  "NÃO URGENTE": { color: "#cbfefe", textColor: "#1d334a", priority: 4 },
}

export function QueueStep({ currentPatient, onRestart }: QueueStepProps) {
  const levelInfo = levelColors[currentPatient.level] || levelColors["URGENTE"]

  // Inserir paciente atual na fila simulada baseado na prioridade
  const allPatients: QueuePatient[] = [
    {
      id: currentPatient.id,
      name: "Você",
      level: currentPatient.level,
      priority: levelInfo.priority,
      waitTime: currentPatient.estimatedWait,
      color: levelInfo.color,
      textColor: levelInfo.textColor,
      isCurrentPatient: true,
    },
  ].sort((a, b) => a.priority - b.priority)

  // Calcular posição do paciente atual
  const currentPosition = allPatients.findIndex((p) => p.isCurrentPatient) + 1

  return (
    <TriageCard title="Fila de Atendimento">
      <div className="flex flex-col gap-4">
        {/* Status do paciente atual */}
        <div
          className="rounded-lg p-4 border-2"
          style={{ backgroundColor: `${levelInfo.color}20`, borderColor: levelInfo.color }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" style={{ color: levelInfo.color }} />
              <span className="font-bold text-sm" style={{ color: levelInfo.color }}>
                SUA CLASSIFICAÇÃO
              </span>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: levelInfo.color, color: levelInfo.textColor }}
            >
              {currentPatient.level}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#1d334a]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                Posição na fila: <strong>{currentPosition}º</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Espera: <strong>{currentPatient.estimatedWait}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Lista da fila */}
        <div className="space-y-2">
          <p className="text-[#5d77e2] text-xs font-semibold uppercase">Fila Atual</p>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {allPatients.map((patient, index) => (
              <div
                key={patient.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  patient.isCurrentPatient
                    ? "border-2 border-[#c8516d] bg-[#c8516d]/5 scale-[1.02]"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: patient.color, color: patient.textColor }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        patient.isCurrentPatient ? "text-[#c8516d]" : "text-[#1d334a]"
                      }`}
                    >
                      {patient.name}
                      {patient.isCurrentPatient && " (Você)"}
                    </p>
                    <p className="text-xs text-gray-500">{patient.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1d334a]">{patient.waitTime}</p>
                  <p className="text-xs text-gray-500">espera</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="bg-[#1d334a]/5 rounded-lg p-3">
          <p className="text-[#5d77e2] text-xs font-semibold uppercase mb-2">Legenda de Prioridades</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(levelColors).map(([level, info]) => (
              <div key={level} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <span className="text-xs text-[#1d334a]/80">{level}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={onRestart}
          className="bg-[#c8516d] text-white hover:bg-[#b04460] px-10 py-2 uppercase text-xs font-semibold tracking-wide rounded-md mt-2 w-full"
        >
          Nova Triagem
        </Button>
      </div>
    </TriageCard>
  )
}
