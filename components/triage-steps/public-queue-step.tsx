"use client"

import { TriageCard } from "@/components/triage-card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Clock, RefreshCw, Users } from "lucide-react"
import useSWR from "swr"

interface PublicQueueStepProps {
  onGoBack: () => void
}

interface QueuePatient {
  id: string
  name: string
  level: string
  entryTime: string
  status: "waiting" | "in-triage" | "completed"
}

const manchesterColors: Record<string, { color: string; textColor: string; label: string }> = {
  "MUITO URGENTE": { color: "#FF6600", textColor: "#ffffff", label: "Muito Urgente" },  // Laranja
  URGENTE: { color: "#FFCC00", textColor: "#1d334a", label: "Urgente" },               // Amarelo
  "POUCO URGENTE": { color: "#00CC00", textColor: "#ffffff", label: "Pouco Urgente" }, // Verde
  "NÃO URGENTE": { color: "#0066FF", textColor: "#ffffff", label: "Não Urgente" },     // Azul
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatWaitTime(entryTime: string): string {
  const now = new Date()
  const entry = new Date(entryTime)
  const diffMs = now.getTime() - entry.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "0 min"
  if (diffMins < 60) return `${diffMins} min`
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}min`
}

export function PublicQueueStep({ onGoBack }: PublicQueueStepProps) {
  const { data: patients, error, isLoading, mutate } = useSWR<QueuePatient[]>("/api/queue", fetcher, {
    refreshInterval: 5000, // Atualiza a cada 5 segundos
  })

  const waitingPatients = patients?.filter((p) => p.status === "waiting") || []

  return (
    <TriageCard title="Fila de Espera">
      <div className="flex flex-col gap-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#5d77e2]">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">
              {waitingPatients.length} {waitingPatients.length === 1 ? "paciente" : "pacientes"} aguardando
            </span>
          </div>
          <Button
            onClick={() => mutate()}
            variant="ghost"
            size="sm"
            className="text-[#5d77e2] hover:bg-[#5d77e2]/10 p-2"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista de pacientes */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner className="h-8 w-8 text-[#5d77e2]" />
              <p className="text-[#1d334a]/60 text-sm mt-2">Carregando fila...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-[#c8516d] text-sm">Erro ao carregar fila</p>
              <Button
                onClick={() => mutate()}
                variant="ghost"
                size="sm"
                className="mt-2 text-[#5d77e2]"
              >
                Tentar novamente
              </Button>
            </div>
          ) : waitingPatients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-[#1d334a]/20 mb-3" />
              <p className="text-[#1d334a]/60 text-sm">Nenhum paciente na fila</p>
              <p className="text-[#1d334a]/40 text-xs mt-1">Realize uma triagem para entrar na fila</p>
            </div>
          ) : (
            waitingPatients.map((patient, index) => {
              const levelInfo = manchesterColors[patient.level] || manchesterColors["URGENTE"]

              return (
                <div
                  key={patient.id}
                  className="flex items-center gap-3 p-3 bg-[#1d334a]/5 rounded-lg"
                >
                  {/* Posição */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: levelInfo.color, color: levelInfo.textColor }}
                  >
                    {index + 1}
                  </div>

                  {/* Info do paciente */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1d334a] text-sm font-medium truncate">
                        {patient.name}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                        style={{
                          backgroundColor: `${levelInfo.color}20`,
                          color: levelInfo.color,
                        }}
                      >
                        {levelInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#1d334a]/50 text-xs mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Esperando há {formatWaitTime(patient.entryTime)}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Legenda */}
        <div className="border-t border-[#1d334a]/10 pt-4 mt-2">
          <p className="text-[#1d334a]/50 text-xs font-medium uppercase mb-2">Prioridades</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(manchesterColors).map(([level, info]) => (
              <div key={level} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <span className="text-[#1d334a]/60 text-xs">{info.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de voltar */}
        <Button
          onClick={onGoBack}
          variant="outline"
          className="w-full border-[#5d77e2] text-[#5d77e2] hover:bg-[#5d77e2]/10 py-2.5 rounded-md flex items-center justify-center gap-2 mt-2 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Menu
        </Button>
      </div>
    </TriageCard>
  )
}
