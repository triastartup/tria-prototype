"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR, { mutate } from "swr"
import { TriaLogo } from "@/components/tria-logo"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Users,
  Clock,
  AlertCircle,
  Bell,
  ChevronRight,
  X,
  Check,
  Edit3,
  User,
  Calendar,
  Activity,
  Timer,
  FileText,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Home,
} from "lucide-react"

// Tipos
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

interface AnamneseData {
  pressaoArterial?: string
  temperatura?: string
  frequenciaCardiaca?: string
  frequenciaRespiratoria?: string
  oximetro?: string
  peso?: string
  hgtGlicose?: string
  alergiaMedicamentos?: string
}

interface Patient {
  id: string
  name: string
  age: number
  birthDate: string
  ethnicity: string
  gender: string
  entryTime: string
  level: string
  symptoms: string[]
  symptomsDuration: string
  painScale: number
  comorbidities?: Comorbidities
  anamnese?: AnamneseData
  aiClassification: string
  finalClassification?: string
  classificationJustification?: string
  triageStartTime?: string
  triageEndTime?: string
  status: "waiting" | "in-triage" | "completed"
}

interface NurseSession {
  id: string
  name: string
  coren: string
  email: string
}

const colorLabels: Record<string, string> = {
  branca: "Branca",
  preta: "Preta",
  parda: "Parda",
  amarela: "Amarela",
  indigena: "Indígena",
  "nao-declarado": "Não declarado",
}

const genderLabels: Record<string, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  outro: "Outro",
  "nao-declarado": "Prefiro não declarar",
}

// Cores do Protocolo de Manchester (cores originais) com tempo máximo de espera em minutos
const manchesterColors: Record<string, { color: string; textColor: string; priority: number; label: string; maxWaitTime: number }> = {
  "MUITO URGENTE": { color: "#FF6600", textColor: "#ffffff", priority: 1, label: "Muito Urgente", maxWaitTime: 10 },  // Laranja - até 10 min
  URGENTE: { color: "#FFCC00", textColor: "#1d334a", priority: 2, label: "Urgente", maxWaitTime: 60 },               // Amarelo - até 60 min
  "POUCO URGENTE": { color: "#00CC00", textColor: "#ffffff", priority: 3, label: "Pouco Urgente", maxWaitTime: 120 }, // Verde - até 120 min
  "NÃO URGENTE": { color: "#0066FF", textColor: "#ffffff", priority: 4, label: "Não Urgente", maxWaitTime: 240 },     // Azul - até 240 min
}

// Função para verificar se o tempo de espera ultrapassou o limite da classificação
function isWaitTimeExceeded(entryTime: string, level: string): boolean {
  const now = new Date()
  const entry = new Date(entryTime)
  const diffMins = Math.floor((now.getTime() - entry.getTime()) / 60000)
  const maxWait = manchesterColors[level]?.maxWaitTime || 240
  return diffMins > maxWait
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatWaitTime(entryTime: string, endTime?: string): string {
  const end = endTime ? new Date(endTime) : new Date()
  const entry = new Date(entryTime)
  const diffMs = end.getTime() - entry.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return "0 min"
  if (diffMins < 60) return `${diffMins} min`
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}min`
}

function formatTime(entryTime: string): string {
  return new Date(entryTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export default function NurseDashboard() {
  const router = useRouter()
  const { data: patients = [], isLoading } = useSWR<Patient[]>("/api/queue", fetcher, {
    refreshInterval: 3000, // Atualiza a cada 3 segundos
  })
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedClassification, setEditedClassification] = useState("")
  const [justification, setJustification] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue")
  const [anamnese, setAnamnese] = useState<AnamneseData>({
    pressaoArterial: "",
    temperatura: "",
    frequenciaCardiaca: "",
    frequenciaRespiratoria: "",
    oximetro: "",
    peso: "",
    hgtGlicose: "",
    alergiaMedicamentos: "",
  })
  const [anamneseErrors, setAnamneseErrors] = useState<Record<string, string>>({})
  const [semAlergia, setSemAlergia] = useState(false)
  const [nurseSession, setNurseSession] = useState<NurseSession | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Verificar autenticação
  useEffect(() => {
    const currentNurse = localStorage.getItem("currentNurse")
    if (!currentNurse) {
      router.push("/enfermeiro/login")
      return
    }
    
    try {
      const nurse = JSON.parse(currentNurse)
      setNurseSession(nurse)
      setIsAuthLoading(false)
    } catch {
      localStorage.removeItem("currentNurse")
      router.push("/enfermeiro/login")
    }
  }, [router])

  // Função de validação da anamnese
  const validateAnamnese = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Validar Pressão Arterial (formato: xxx/xx)
    if (!anamnese.pressaoArterial?.trim()) {
      errors.pressaoArterial = "Campo obrigatório"
    } else if (!/^\d{2,3}\/\d{2,3}$/.test(anamnese.pressaoArterial.trim())) {
      errors.pressaoArterial = "Formato inválido (ex: 120/80)"
    }
    
    // Validar Temperatura (número decimal entre 30 e 45)
    if (!anamnese.temperatura?.trim()) {
      errors.temperatura = "Campo obrigatório"
    } else {
      const temp = parseFloat(anamnese.temperatura.replace(",", "."))
      if (isNaN(temp) || temp < 30 || temp > 45) {
        errors.temperatura = "Valor inválido (30-45°C)"
      }
    }
    
    // Validar Frequência Cardíaca (número entre 30 e 250)
    if (!anamnese.frequenciaCardiaca?.trim()) {
      errors.frequenciaCardiaca = "Campo obrigatório"
    } else {
      const fc = parseInt(anamnese.frequenciaCardiaca)
      if (isNaN(fc) || fc < 30 || fc > 250) {
        errors.frequenciaCardiaca = "Valor inválido (30-250 bpm)"
      }
    }
    
    // Validar Frequência Respiratória (número entre 8 e 60)
    if (!anamnese.frequenciaRespiratoria?.trim()) {
      errors.frequenciaRespiratoria = "Campo obrigatório"
    } else {
      const fr = parseInt(anamnese.frequenciaRespiratoria)
      if (isNaN(fr) || fr < 8 || fr > 60) {
        errors.frequenciaRespiratoria = "Valor inválido (8-60 irpm)"
      }
    }
    
    // Validar Oxímetro (número entre 50 e 100)
    if (!anamnese.oximetro?.trim()) {
      errors.oximetro = "Campo obrigatório"
    } else {
      const ox = parseInt(anamnese.oximetro)
      if (isNaN(ox) || ox < 50 || ox > 100) {
        errors.oximetro = "Valor inválido (50-100%)"
      }
    }
    
    // Validar Peso (número entre 1 e 500)
    if (!anamnese.peso?.trim()) {
      errors.peso = "Campo obrigatório"
    } else {
      const peso = parseFloat(anamnese.peso.replace(",", "."))
      if (isNaN(peso) || peso < 1 || peso > 500) {
        errors.peso = "Valor inválido (1-500 kg)"
      }
    }
    
    // Validar HGT Glicose (número entre 20 e 600)
    if (!anamnese.hgtGlicose?.trim()) {
      errors.hgtGlicose = "Campo obrigatório"
    } else {
      const hgt = parseInt(anamnese.hgtGlicose)
      if (isNaN(hgt) || hgt < 20 || hgt > 600) {
        errors.hgtGlicose = "Valor inválido (20-600 mg/dL)"
      }
    }
    
    // Validar Alergia a Medicamentos (obrigatório se não marcou "sem alergia")
    if (!semAlergia && !anamnese.alergiaMedicamentos?.trim()) {
      errors.alergiaMedicamentos = "Informe as alergias ou marque 'Não possui alergia'"
    }
    
    setAnamneseErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isAnamneseComplete = (): boolean => {
    const alergiaPreenchida = semAlergia || !!anamnese.alergiaMedicamentos?.trim()
    return !!(
      anamnese.pressaoArterial?.trim() &&
      anamnese.temperatura?.trim() &&
      anamnese.frequenciaCardiaca?.trim() &&
      anamnese.frequenciaRespiratoria?.trim() &&
      anamnese.oximetro?.trim() &&
      anamnese.peso?.trim() &&
      anamnese.hgtGlicose?.trim() &&
      alergiaPreenchida
    )
  }

  const isClassificationValidated = (): boolean => {
    if (!selectedPatient) return false
    return !!selectedPatient.finalClassification
  }

  const canFinishTriage = (): boolean => {
    return isAnamneseComplete() && isClassificationValidated()
  }

  // Atualizar tempo a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Filtrar e ordenar pacientes aguardando
  const sortedPatients = patients
    .filter((p) => p.status === "waiting")
    .sort((a, b) => {
      const priorityA = manchesterColors[a.level]?.priority || 5
      const priorityB = manchesterColors[b.level]?.priority || 5
      if (priorityA !== priorityB) return priorityA - priorityB
      return new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime()
    })

  // Pacientes já triados (histórico)
  const completedPatients = patients
    .filter((p) => p.status === "completed")
    .sort((a, b) => new Date(b.triageEndTime || b.entryTime).getTime() - new Date(a.triageEndTime || a.entryTime).getTime())

  const handleCallNextPatient = async () => {
    if (sortedPatients.length === 0) return
    
    const nextPatient = sortedPatients[0]
    
    try {
      await fetch("/api/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: nextPatient.id, action: "call" }),
      })
      
      mutate("/api/queue")
      
      // Limpar campos antes de selecionar o novo paciente
      setIsEditing(false)
      setEditedClassification(nextPatient.aiClassification)
      setJustification("")
      setAnamnese({
        pressaoArterial: "",
        temperatura: "",
        frequenciaCardiaca: "",
        frequenciaRespiratoria: "",
        oximetro: "",
        peso: "",
        hgtGlicose: "",
        alergiaMedicamentos: "",
      })
      setSemAlergia(false)
      setAnamneseErrors({})
      
      setSelectedPatient({ ...nextPatient, status: "in-triage", triageStartTime: new Date().toISOString() })
      showToastMessage(`Chamando ${nextPatient.name}...`)
    } catch (error) {
      console.error("Erro ao chamar paciente:", error)
      showToastMessage("Erro ao chamar paciente")
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsEditing(false)
    setEditedClassification(patient.finalClassification || patient.aiClassification)
    setJustification(patient.classificationJustification || "")
    setAnamnese(patient.anamnese || {
      pressaoArterial: "",
      temperatura: "",
      frequenciaCardiaca: "",
      frequenciaRespiratoria: "",
      oximetro: "",
      peso: "",
      hgtGlicose: "",
      alergiaMedicamentos: "",
    })
  }

  const handleConfirmClassification = async () => {
    if (!selectedPatient) return
    
    try {
      await fetch("/api/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPatient.id,
          finalClassification: editedClassification || selectedPatient.aiClassification,
          classificationJustification: justification,
        }),
      })
      
      mutate("/api/queue")
      setSelectedPatient((prev) =>
        prev
          ? {
              ...prev,
              finalClassification: editedClassification || prev.aiClassification,
              classificationJustification: justification,
            }
          : null
      )
      setIsEditing(false)
      showToastMessage("Classificação confirmada!")
    } catch (error) {
      console.error("Erro ao confirmar classificação:", error)
      showToastMessage("Erro ao confirmar classificação")
    }
  }

  const handleFinishTriage = async () => {
    if (!selectedPatient) return
    
    // Validar classificação de risco
    if (!isClassificationValidated()) {
      showToastMessage("Valide a classificação de risco antes de finalizar a triagem")
      return
    }
    
    // Validar campos antes de finalizar
    if (!validateAnamnese()) {
      showToastMessage("Preencha todos os campos da anamnese corretamente antes de finalizar")
      return
    }
    
    try {
      await fetch("/api/queue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPatient.id,
          action: "complete",
          finalClassification: selectedPatient.finalClassification || selectedPatient.aiClassification,
          classificationJustification: selectedPatient.classificationJustification,
          anamnese,
        }),
      })
      
      mutate("/api/queue")
      showToastMessage(`Triagem de ${selectedPatient.name} finalizada!`)
      setSelectedPatient(null)
    } catch (error) {
      console.error("Erro ao finalizar triagem:", error)
      showToastMessage("Erro ao finalizar triagem")
    }
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const getWaitTimeClass = (entryTime: string) => {
    const diffMins = Math.floor((new Date().getTime() - new Date(entryTime).getTime()) / 60000)
    if (diffMins >= 60) return "text-[#c8516d] animate-pulse"
    if (diffMins >= 30) return "text-[#ec8b4e]"
    return "text-[#1d334a]/60"
  }

  const handleLogout = () => {
    localStorage.removeItem("currentNurse")
    router.push("/enfermeiro/login")
  }

  // Tela de carregamento enquanto verifica autenticação
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-12 w-12 text-[#5d77e2] mx-auto" />
          <p className="text-[#1d334a]/60 mt-4">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Header */}
      <header className="bg-[#1d334a] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity" title="Voltar ao menu de perfis">
              <TriaLogo className="h-10 w-auto brightness-0 invert" />
            </Link>
            <div className="h-6 w-px bg-white/30" />
            <span className="text-sm font-medium text-white/80">Painel do Enfermeiro</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => mutate("/api/queue")}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{sortedPatients.length} na fila</span>
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-white/60" />
                <span className="text-white/80">{nurseSession?.name || "Enfermeiro"}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Pacientes */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Abas */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("queue")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "queue"
                      ? "text-[#c8516d] border-b-2 border-[#c8516d] bg-[#c8516d]/5"
                      : "text-[#1d334a]/60 hover:text-[#1d334a] hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" />
                    Fila ({sortedPatients.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "history"
                      ? "text-[#5d77e2] border-b-2 border-[#5d77e2] bg-[#5d77e2]/5"
                      : "text-[#1d334a]/60 hover:text-[#1d334a] hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Histórico ({completedPatients.length})
                  </div>
                </button>
              </div>

              {/* Cabeçalho da Lista */}
              {activeTab === "queue" && (
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#1d334a]">Fila de Pacientes</h2>
                    <span className="text-xs text-[#1d334a]/60">Ordenado por prioridade</span>
                  </div>
                  <Button
                    onClick={handleCallNextPatient}
                    disabled={sortedPatients.length === 0}
                    className="w-full bg-[#c8516d] hover:bg-[#b04460] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Bell className="w-4 h-4" />
                    Chamar Próximo Paciente
                  </Button>
                </div>
              )}

              {/* Lista - Fila */}
              {activeTab === "queue" && (
                <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                      <Spinner className="h-8 w-8 text-[#5d77e2]" />
                      <p className="text-sm text-[#1d334a]/60 mt-2">Carregando fila...</p>
                    </div>
                  ) : sortedPatients.length === 0 ? (
                    <div className="p-8 text-center text-[#1d334a]/60">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhum paciente na fila</p>
                      <p className="text-xs mt-1">Pacientes aparecerão aqui após a triagem inicial</p>
                    </div>
                  ) : (
                    sortedPatients.map((patient, index) => {
                      const levelInfo = manchesterColors[patient.level]
                      const isSelected = selectedPatient?.id === patient.id
                      const waitTimeExceeded = isWaitTimeExceeded(patient.entryTime, patient.level)

                      return (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className={`w-full p-4 border-b border-gray-50 text-left transition-all hover:bg-gray-50 ${
                            isSelected ? "bg-[#5d77e2]/5 border-l-4 border-l-[#5d77e2]" : ""
                          } ${waitTimeExceeded ? "bg-red-50/50" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Posição e Indicador de Risco */}
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{ backgroundColor: levelInfo?.color, color: levelInfo?.textColor }}
                              >
                                {index + 1}
                              </span>
                              {waitTimeExceeded && (
                                <AlertCircle className="w-4 h-4 text-[#c8516d] animate-pulse" />
                              )}
                            </div>

                            {/* Informações do Paciente */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-medium text-[#1d334a] truncate">{patient.name}</h3>
                                <ChevronRight className="w-4 h-4 text-[#1d334a]/30 flex-shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-[#1d334a]/60">
                                <span>{patient.age} anos</span>
                                <span>•</span>
                                <span className={getWaitTimeClass(patient.entryTime)}>
                                  <Timer className="w-3 h-3 inline mr-1" />
                                  {formatWaitTime(patient.entryTime)}
                                </span>
                              </div>
                              <div className="mt-1.5">
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                  style={{ backgroundColor: levelInfo?.color, color: levelInfo?.textColor }}
                                >
                                  {levelInfo?.label || patient.level}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              )}

              {/* Lista - Histórico */}
              {activeTab === "history" && (
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {completedPatients.length === 0 ? (
                    <div className="p-8 text-center text-[#1d334a]/60">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhuma triagem concluída</p>
                      <p className="text-xs mt-1">Triagens finalizadas aparecerão aqui</p>
                    </div>
                  ) : (
                    completedPatients.map((patient) => {
                      const levelInfo = manchesterColors[patient.finalClassification || patient.level]
                      const isSelected = selectedPatient?.id === patient.id

                      return (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className={`w-full p-4 border-b border-gray-50 text-left transition-all hover:bg-gray-50 ${
                            isSelected ? "bg-[#5d77e2]/5 border-l-4 border-l-[#5d77e2]" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-medium text-[#1d334a] truncate">{patient.name}</h3>
                                <ChevronRight className="w-4 h-4 text-[#1d334a]/30 flex-shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-[#1d334a]/60">
                                <span>{patient.age} anos</span>
                                <span>•</span>
                                <span>
                                  {patient.triageEndTime
                                    ? new Date(patient.triageEndTime).toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "-"}
                                </span>
                              </div>
                              <div className="mt-1.5">
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                  style={{ backgroundColor: levelInfo?.color, color: levelInfo?.textColor }}
                                >
                                  {levelInfo?.label || patient.finalClassification || patient.level}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detalhes do Paciente */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cabeçalho do Paciente */}
                <div className="bg-[#1d334a] text-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                      <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {selectedPatient.age} anos
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {selectedPatient.birthDate.split("-").reverse().join("/")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPatient.status === "in-triage" && (
                        <span className="px-3 py-1 bg-[#5d77e2] text-white text-xs font-medium rounded-full animate-pulse">
                          Em Atendimento
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  {/* Indicador de Histórico com data/hora */}
                  {selectedPatient.status === "completed" && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Triagem Concluída</span>
                      </div>
                      <span className="text-sm text-green-600">
                        {selectedPatient.triageEndTime 
                          ? new Date(selectedPatient.triageEndTime).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }) + " às " + new Date(selectedPatient.triageEndTime).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Data não registrada"
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dados Básicos */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#5d77e2] uppercase flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Dados da Triagem
                      </h3>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-[#1d334a]/60 mt-0.5" />
                          <div>
                            <p className="text-xs text-[#1d334a]/60">Horário de Entrada</p>
                            <p className="text-sm font-medium text-[#1d334a]">
                              {formatTime(selectedPatient.entryTime)} ({formatWaitTime(
                                selectedPatient.entryTime, 
                                selectedPatient.status !== "waiting" ? selectedPatient.triageStartTime : undefined
                              )} de espera)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <User className="w-4 h-4 text-[#1d334a]/60 mt-0.5" />
                          <div>
                            <p className="text-xs text-[#1d334a]/60">Sexo / Cor</p>
                            <p className="text-sm font-medium text-[#1d334a]">
                              {genderLabels[selectedPatient.gender] || selectedPatient.gender} / {colorLabels[selectedPatient.ethnicity] || selectedPatient.ethnicity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Activity className="w-4 h-4 text-[#1d334a]/60 mt-0.5" />
                          <div>
                            <p className="text-xs text-[#1d334a]/60">Sintomas Relatados</p>
                            <p className="text-sm font-medium text-[#1d334a]">
                              {selectedPatient.symptoms.join(", ")}
                            </p>
                            <p className="text-xs text-[#1d334a]/60 mt-1">
                              Duração: {selectedPatient.symptomsDuration}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-[#1d334a]/60 mt-0.5" />
                          <div>
                            <p className="text-xs text-[#1d334a]/60">Escala de Dor</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${selectedPatient.painScale * 10}%`,
                                    backgroundColor:
                                      selectedPatient.painScale <= 3
                                        ? "#22c55e"
                                        : selectedPatient.painScale <= 6
                                          ? "#eab308"
                                          : "#ef4444",
                                  }}
                                />
                              </div>
                              <span className="text-sm font-bold text-[#1d334a]">{selectedPatient.painScale}/10</span>
                            </div>
                          </div>
                        </div>

                        {selectedPatient.comorbidities && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="w-4 h-4 text-[#1d334a]/60 mt-0.5" />
                            <div>
                              <p className="text-xs text-[#1d334a]/60">Comorbidades</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedPatient.comorbidities.pressaoAlta && (
                                  <span className="px-2 py-0.5 bg-[#c8516d]/10 text-[#c8516d] text-xs rounded">Pressão Alta</span>
                                )}
                                {selectedPatient.comorbidities.diabetes && (
                                  <span className="px-2 py-0.5 bg-[#c8516d]/10 text-[#c8516d] text-xs rounded">
                                    Diabetes {selectedPatient.comorbidities.diabetesTipo && `(${selectedPatient.comorbidities.diabetesTipo})`}
                                  </span>
                                )}
                                {selectedPatient.comorbidities.cardiopatia && (
                                  <span className="px-2 py-0.5 bg-[#c8516d]/10 text-[#c8516d] text-xs rounded">Cardiopatia</span>
                                )}
                                {selectedPatient.comorbidities.doencaRenal && (
                                  <span className="px-2 py-0.5 bg-[#c8516d]/10 text-[#c8516d] text-xs rounded">Doença Renal</span>
                                )}
                                {selectedPatient.comorbidities.doencaRespiratoria && (
                                  <span className="px-2 py-0.5 bg-[#c8516d]/10 text-[#c8516d] text-xs rounded">Doença Respiratória</span>
                                )}
                                {selectedPatient.comorbidities.outro && selectedPatient.comorbidities.outroEspecificar && (
                                  <span className="px-2 py-0.5 bg-[#c8516d]/10 text-[#c8516d] text-xs rounded">
                                    {selectedPatient.comorbidities.outroEspecificar}
                                  </span>
                                )}
                                {!selectedPatient.comorbidities.pressaoAlta &&
                                  !selectedPatient.comorbidities.diabetes &&
                                  !selectedPatient.comorbidities.cardiopatia &&
                                  !selectedPatient.comorbidities.doencaRenal &&
                                  !selectedPatient.comorbidities.doencaRespiratoria &&
                                  !selectedPatient.comorbidities.outro && (
                                    <span className="text-sm text-[#1d334a]/60">Nenhuma informada</span>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Anamnese */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-[#c8516d] uppercase flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4" />
                          Dados da Anamnese
                        </h3>
                        
                        {/* Visualização somente leitura para histórico */}
                        {selectedPatient.status === "completed" ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-[#1d334a]/60">Pressão Arterial</p>
                                <p className="text-sm font-medium text-[#1d334a]">{selectedPatient.anamnese?.pressaoArterial || "Não informado"}</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-[#1d334a]/60">Temperatura</p>
                                <p className="text-sm font-medium text-[#1d334a]">{selectedPatient.anamnese?.temperatura ? `${selectedPatient.anamnese.temperatura}°C` : "Não informado"}</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-[#1d334a]/60">Freq. Cardíaca</p>
                                <p className="text-sm font-medium text-[#1d334a]">{selectedPatient.anamnese?.frequenciaCardiaca ? `${selectedPatient.anamnese.frequenciaCardiaca} bpm` : "Não informado"}</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-[#1d334a]/60">Freq. Respiratória</p>
                                <p className="text-sm font-medium text-[#1d334a]">{selectedPatient.anamnese?.frequenciaRespiratoria ? `${selectedPatient.anamnese.frequenciaRespiratoria} irpm` : "Não informado"}</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-[#1d334a]/60">Oxímetro (SpO2)</p>
                                <p className="text-sm font-medium text-[#1d334a]">{selectedPatient.anamnese?.oximetro ? `${selectedPatient.anamnese.oximetro}%` : "Não informado"}</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-[#1d334a]/60">Peso</p>
                                <p className="text-sm font-medium text-[#1d334a]">{selectedPatient.anamnese?.peso ? `${selectedPatient.anamnese.peso} kg` : "Não informado"}</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-[#1d334a]/60">HGT Glicose</p>
                                <p className="text-sm font-medium text-[#1d334a]">{selectedPatient.anamnese?.hgtGlicose ? `${selectedPatient.anamnese.hgtGlicose} mg/dL` : "Não informado"}</p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-[#1d334a]/60">Alergia a Medicamentos</p>
                                <p className="text-sm font-medium text-[#1d334a]">{selectedPatient.anamnese?.alergiaMedicamentos || "Não informado"}</p>
                              </div>
                            </div>
                          </div>
                        ) : selectedPatient.status === "waiting" ? (
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-sm text-[#1d334a]/60">
                              Chame o paciente para preencher a anamnese
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-[#1d334a]/60 block mb-1">Pressão Arterial *</label>
                                <input
                                  type="text"
                                  value={anamnese.pressaoArterial || ""}
                                  onChange={(e) => {
                                    setAnamnese({ ...anamnese, pressaoArterial: e.target.value })
                                    if (anamneseErrors.pressaoArterial) {
                                      setAnamneseErrors((prev) => ({ ...prev, pressaoArterial: "" }))
                                    }
                                  }}
                                  placeholder="120/80"
                                  className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50 ${
                                    anamneseErrors.pressaoArterial ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                />
                                {anamneseErrors.pressaoArterial && (
                                  <p className="text-xs text-red-500 mt-0.5">{anamneseErrors.pressaoArterial}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs text-[#1d334a]/60 block mb-1">Temperatura (°C) *</label>
                                <input
                                  type="text"
                                  value={anamnese.temperatura || ""}
                                  onChange={(e) => {
                                    setAnamnese({ ...anamnese, temperatura: e.target.value })
                                    if (anamneseErrors.temperatura) {
                                      setAnamneseErrors((prev) => ({ ...prev, temperatura: "" }))
                                    }
                                  }}
                                  placeholder="36.5"
                                  className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50 ${
                                    anamneseErrors.temperatura ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                />
                                {anamneseErrors.temperatura && (
                                  <p className="text-xs text-red-500 mt-0.5">{anamneseErrors.temperatura}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs text-[#1d334a]/60 block mb-1">Freq. Cardíaca (bpm) *</label>
                                <input
                                  type="text"
                                  value={anamnese.frequenciaCardiaca || ""}
                                  onChange={(e) => {
                                    setAnamnese({ ...anamnese, frequenciaCardiaca: e.target.value })
                                    if (anamneseErrors.frequenciaCardiaca) {
                                      setAnamneseErrors((prev) => ({ ...prev, frequenciaCardiaca: "" }))
                                    }
                                  }}
                                  placeholder="80"
                                  className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50 ${
                                    anamneseErrors.frequenciaCardiaca ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                />
                                {anamneseErrors.frequenciaCardiaca && (
                                  <p className="text-xs text-red-500 mt-0.5">{anamneseErrors.frequenciaCardiaca}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs text-[#1d334a]/60 block mb-1">Freq. Respiratória (irpm) *</label>
                                <input
                                  type="text"
                                  value={anamnese.frequenciaRespiratoria || ""}
                                  onChange={(e) => {
                                    setAnamnese({ ...anamnese, frequenciaRespiratoria: e.target.value })
                                    if (anamneseErrors.frequenciaRespiratoria) {
                                      setAnamneseErrors((prev) => ({ ...prev, frequenciaRespiratoria: "" }))
                                    }
                                  }}
                                  placeholder="16"
                                  className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50 ${
                                    anamneseErrors.frequenciaRespiratoria ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                />
                                {anamneseErrors.frequenciaRespiratoria && (
                                  <p className="text-xs text-red-500 mt-0.5">{anamneseErrors.frequenciaRespiratoria}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs text-[#1d334a]/60 block mb-1">Oxímetro (%) *</label>
                                <input
                                  type="text"
                                  value={anamnese.oximetro || ""}
                                  onChange={(e) => {
                                    setAnamnese({ ...anamnese, oximetro: e.target.value })
                                    if (anamneseErrors.oximetro) {
                                      setAnamneseErrors((prev) => ({ ...prev, oximetro: "" }))
                                    }
                                  }}
                                  placeholder="98"
                                  className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50 ${
                                    anamneseErrors.oximetro ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                />
                                {anamneseErrors.oximetro && (
                                  <p className="text-xs text-red-500 mt-0.5">{anamneseErrors.oximetro}</p>
                                )}
                              </div>
                              <div>
                                <label className="text-xs text-[#1d334a]/60 block mb-1">Peso (kg) *</label>
                                <input
                                  type="text"
                                  value={anamnese.peso || ""}
                                  onChange={(e) => {
                                    setAnamnese({ ...anamnese, peso: e.target.value })
                                    if (anamneseErrors.peso) {
                                      setAnamneseErrors((prev) => ({ ...prev, peso: "" }))
                                    }
                                  }}
                                  placeholder="70"
                                  className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50 ${
                                    anamneseErrors.peso ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                />
                                {anamneseErrors.peso && (
                                  <p className="text-xs text-red-500 mt-0.5">{anamneseErrors.peso}</p>
                                )}
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs text-[#1d334a]/60 block mb-1">HGT Glicose (mg/dL) *</label>
                                <input
                                  type="text"
                                  value={anamnese.hgtGlicose || ""}
                                  onChange={(e) => {
                                    setAnamnese({ ...anamnese, hgtGlicose: e.target.value })
                                    if (anamneseErrors.hgtGlicose) {
                                      setAnamneseErrors((prev) => ({ ...prev, hgtGlicose: "" }))
                                    }
                                  }}
                                  placeholder="100"
                                  className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50 ${
                                    anamneseErrors.hgtGlicose ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                />
                                {anamneseErrors.hgtGlicose && (
                                  <p className="text-xs text-red-500 mt-0.5">{anamneseErrors.hgtGlicose}</p>
                                )}
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs text-[#1d334a]/60 block mb-1">Alergia a Medicamentos *</label>
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="checkbox"
                                    id="semAlergia"
                                    checked={semAlergia}
                                    onChange={(e) => {
                                      setSemAlergia(e.target.checked)
                                      if (e.target.checked) {
                                        setAnamnese({ ...anamnese, alergiaMedicamentos: "Nenhuma" })
                                        if (anamneseErrors.alergiaMedicamentos) {
                                          setAnamneseErrors((prev) => ({ ...prev, alergiaMedicamentos: "" }))
                                        }
                                      } else {
                                        setAnamnese({ ...anamnese, alergiaMedicamentos: "" })
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-[#5d77e2] focus:ring-[#5d77e2]"
                                  />
                                  <label htmlFor="semAlergia" className="text-xs text-[#1d334a]/80">
                                    Paciente não possui alergia a medicamentos
                                  </label>
                                </div>
                                <input
                                  type="text"
                                  value={anamnese.alergiaMedicamentos || ""}
                                  onChange={(e) => {
                                    setAnamnese({ ...anamnese, alergiaMedicamentos: e.target.value })
                                    if (anamneseErrors.alergiaMedicamentos) {
                                      setAnamneseErrors((prev) => ({ ...prev, alergiaMedicamentos: "" }))
                                    }
                                  }}
                                  disabled={semAlergia}
                                  placeholder="Ex: Dipirona, Penicilina..."
                                  className={`w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50 ${
                                    anamneseErrors.alergiaMedicamentos ? "border-red-400 bg-red-50" : "border-gray-200"
                                  } ${semAlergia ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                                />
                                {anamneseErrors.alergiaMedicamentos && (
                                  <p className="text-xs text-red-500 mt-0.5">{anamneseErrors.alergiaMedicamentos}</p>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-[#1d334a]/40 mt-2">* Campos obrigatórios</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Classificação */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-[#5d77e2] uppercase flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Classificação de Risco
                      </h3>

                      {/* Visualização somente leitura para histórico */}
                      {selectedPatient.status === "completed" ? (
                        <div className="space-y-4">
                          {/* Classificação da IA */}
                          <div className="p-4 rounded-lg border-2 border-dashed border-[#5d77e2]/30 bg-[#5d77e2]/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-[#5d77e2] font-medium">Sugestão da IA</span>
                              <span className="text-xs text-[#1d334a]/60">Protocolo Manchester</span>
                            </div>
                            <div
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                              style={{
                                backgroundColor: manchesterColors[selectedPatient.aiClassification]?.color,
                                color: manchesterColors[selectedPatient.aiClassification]?.textColor,
                              }}
                            >
                              <span className="font-bold text-sm">{selectedPatient.aiClassification}</span>
                            </div>
                          </div>

                          {/* Classificação Final (somente leitura) */}
                          <div className="p-4 rounded-lg border border-gray-200 bg-white">
                            <span className="text-xs text-[#1d334a]/60 font-medium block mb-3">Classificação Final Validada</span>
                            <div
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                              style={{
                                backgroundColor: manchesterColors[selectedPatient.finalClassification || selectedPatient.aiClassification]?.color,
                                color: manchesterColors[selectedPatient.finalClassification || selectedPatient.aiClassification]?.textColor,
                              }}
                            >
                              <span className="font-bold text-sm">
                                {selectedPatient.finalClassification || selectedPatient.aiClassification}
                              </span>
                              {selectedPatient.finalClassification && selectedPatient.finalClassification !== selectedPatient.aiClassification && (
                                <span className="text-xs opacity-80">(Alterado)</span>
                              )}
                            </div>
                            {selectedPatient.classificationJustification && (
                              <p className="mt-2 text-xs text-[#1d334a]/60 italic">
                                Justificativa: {selectedPatient.classificationJustification}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Classificação da IA */}
                          <div className="p-4 rounded-lg border-2 border-dashed border-[#5d77e2]/30 bg-[#5d77e2]/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-[#5d77e2] font-medium">Sugestão da IA</span>
                              <span className="text-xs text-[#1d334a]/60">Protocolo Manchester</span>
                            </div>
                            <div
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                              style={{
                                backgroundColor: manchesterColors[selectedPatient.aiClassification]?.color,
                                color: manchesterColors[selectedPatient.aiClassification]?.textColor,
                              }}
                            >
                              <span className="font-bold text-sm">{selectedPatient.aiClassification}</span>
                            </div>
                          </div>

                          {/* Mensagem para paciente aguardando */}
                          {selectedPatient.status === "waiting" && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                              <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                              <p className="text-xs text-amber-700">
                                Chame o paciente para validar a classificação de risco
                              </p>
                            </div>
                          )}

                          {/* Classificação Final - Só mostra se paciente foi chamado */}
                          {selectedPatient.status === "in-triage" && (
                            <div className="p-4 rounded-lg border border-gray-200 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-[#1d334a]/60 font-medium">Classificação Final</span>
                                {!isEditing && (
                                  <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs text-[#5d77e2] hover:underline flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    Alterar
                                  </button>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="space-y-3">
                                  <select
                                    value={editedClassification}
                                    onChange={(e) => setEditedClassification(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50"
                                  >
                                    {Object.keys(manchesterColors).map((level) => (
                                      <option key={level} value={level}>
                                        {level}
                                      </option>
                                    ))}
                                  </select>
                                  <textarea
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    placeholder="Justificativa da alteração (opcional)"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5d77e2]/50"
                                    rows={2}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => setIsEditing(false)}
                                      variant="outline"
                                      className="flex-1 text-xs"
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      onClick={handleConfirmClassification}
                                      className="flex-1 bg-[#5d77e2] hover:bg-[#4a64c9] text-white text-xs"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Confirmar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                    style={{
                                      backgroundColor: manchesterColors[selectedPatient.finalClassification || selectedPatient.aiClassification]?.color,
                                      color: manchesterColors[selectedPatient.finalClassification || selectedPatient.aiClassification]?.textColor,
                                    }}
                                  >
                                    <span className="font-bold text-sm">
                                      {selectedPatient.finalClassification || selectedPatient.aiClassification}
                                    </span>
                                    {selectedPatient.finalClassification && selectedPatient.finalClassification !== selectedPatient.aiClassification && (
                                      <span className="text-xs opacity-80">(Alterado)</span>
                                    )}
                                  </div>
                                  {selectedPatient.classificationJustification && (
                                    <p className="mt-2 text-xs text-[#1d334a]/60 italic">
                                      Justificativa: {selectedPatient.classificationJustification}
                                    </p>
                                  )}
                                  {!selectedPatient.finalClassification && (
                                    <Button
                                      onClick={handleConfirmClassification}
                                      className="mt-3 bg-[#5d77e2] hover:bg-[#4a64c9] text-white text-xs w-full"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Confirmar Classificação da IA
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Botão Finalizar */}
                          {selectedPatient.status === "in-triage" && (
                            <div className="space-y-2">
                              {!isClassificationValidated() && (
                                <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-xs text-red-700 text-center">
                                    Valide a classificação de risco clicando em &quot;Confirmar Classificação da IA&quot; ou alterando manualmente
                                  </p>
                                </div>
                              )}
                              {isClassificationValidated() && !isAnamneseComplete() && (
                                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                  <p className="text-xs text-amber-700 text-center">
                                    Preencha todos os campos da anamnese para finalizar a triagem
                                  </p>
                                </div>
                              )}
                              <Button
                                onClick={handleFinishTriage}
                                disabled={!canFinishTriage()}
                                className="w-full bg-[#c8516d] hover:bg-[#b04460] text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Finalizar Triagem
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-[#1d334a]/20 mb-4" />
                <h3 className="text-lg font-medium text-[#1d334a]/60 mb-2">Nenhum paciente selecionado</h3>
                <p className="text-sm text-[#1d334a]/40">
                  Selecione um paciente da fila ou clique em &quot;Chamar Próximo Paciente&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#1d334a] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <Bell className="w-4 h-4" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
