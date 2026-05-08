import { NextResponse } from "next/server"

// Tipo de comorbidades
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

// Tipo de dados da anamnese
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

// Tipo de paciente na fila
export interface QueuePatient {
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

// Armazenamento em memória (em produção, usar banco de dados)
const queue: QueuePatient[] = []

// Cores do Protocolo de Manchester para ordenação
const manchesterPriority: Record<string, number> = {
  "MUITO URGENTE": 1,
  "URGENTE": 2,
  "POUCO URGENTE": 3,
  "NÃO URGENTE": 4,
}

// GET - Listar todos os pacientes na fila
export async function GET() {
  // Ordenar por prioridade e depois por tempo de entrada
  const sortedQueue = [...queue].sort((a, b) => {
    const priorityA = manchesterPriority[a.level] || 5
    const priorityB = manchesterPriority[b.level] || 5
    if (priorityA !== priorityB) return priorityA - priorityB
    return new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime()
  })

  return NextResponse.json(sortedQueue)
}

// POST - Adicionar novo paciente à fila
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Gerar ID único
    const id = `P${String(queue.length + 1).padStart(3, "0")}-${Date.now()}`

    const newPatient: QueuePatient = {
      id,
      name: body.name || "Paciente Anônimo",
      age: body.age || 0,
      birthDate: body.birthDate || "",
      ethnicity: body.ethnicity || "nao-declarado",
      gender: body.gender || "nao-declarado",
      entryTime: new Date().toISOString(),
      level: body.level || "URGENTE",
      symptoms: body.symptoms
        ? body.symptoms.split(",").map((s: string) => s.trim())
        : ["Não especificado"],
      symptomsDuration: body.symptomsDuration || "Não informado",
      painScale: body.painScale || 0,
      comorbidities: body.comorbidities,
      aiClassification: body.level || "URGENTE",
      status: "waiting",
    }

    queue.push(newPatient)

    return NextResponse.json(newPatient, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro ao adicionar paciente" }, { status: 400 })
  }
}

// PUT - Atualizar paciente (chamar, finalizar triagem, etc.)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, action, ...updates } = body

    const patientIndex = queue.findIndex((p) => p.id === id)
    if (patientIndex === -1) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    if (action === "call") {
      queue[patientIndex].status = "in-triage"
      queue[patientIndex].triageStartTime = new Date().toISOString()
    } else if (action === "complete") {
      queue[patientIndex].status = "completed"
      queue[patientIndex].triageEndTime = new Date().toISOString()
      if (updates.finalClassification) {
        queue[patientIndex].finalClassification = updates.finalClassification
      }
      if (updates.classificationJustification) {
        queue[patientIndex].classificationJustification = updates.classificationJustification
      }
      if (updates.anamnese) {
        queue[patientIndex].anamnese = updates.anamnese
      }
    } else {
      // Atualização genérica
      Object.assign(queue[patientIndex], updates)
    }

    return NextResponse.json(queue[patientIndex])
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar paciente" }, { status: 400 })
  }
}

// DELETE - Remover paciente da fila
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    const patientIndex = queue.findIndex((p) => p.id === id)
    if (patientIndex === -1) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    queue.splice(patientIndex, 1)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao remover paciente" }, { status: 400 })
  }
}
