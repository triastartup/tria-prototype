import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ClassificationRequest {
  patientAge: number
  patientEthnicity: string
  patientGender: string
  symptoms: string
  symptomsDuration: string
  painScale: number
  comorbidities: {
    pressaoAlta: boolean
    diabetes: boolean
    diabetesTipo?: string
    cardiopatia: boolean
    doencaRenal: boolean
    doencaRespiratoria: boolean
    outro: boolean
    outroEspecificar?: string
  }
}

const systemPrompt = `Você é um sistema de triagem hospitalar que classifica pacientes segundo o Protocolo de Manchester.

Baseado nos dados do paciente, você deve retornar uma classificação com os seguintes níveis possíveis:
- "MUITO URGENTE" (laranja): Atendimento em até 10 minutos. Casos graves que precisam de atenção imediata.
- "URGENTE" (amarelo): Atendimento em até 60 minutos. Casos que requerem atenção médica em breve.
- "POUCO URGENTE" (verde): Atendimento em até 120 minutos. Casos que podem aguardar.
- "NÃO URGENTE" (azul): Atendimento em até 240 minutos. Casos de baixa complexidade.

Considere na sua avaliação:
1. Gravidade dos sintomas descritos
2. Duração dos sintomas
3. Escala de dor (0-10)
4. Comorbidades presentes (pressão alta, diabetes, cardiopatia, doença renal, doença respiratória aumentam a gravidade)
5. Idade do paciente (idosos e crianças pequenas podem ter maior risco)

Responda APENAS em formato JSON válido com a seguinte estrutura:
{
  "level": "NÍVEL DA CLASSIFICAÇÃO",
  "priority": número de 1 a 4 (1=muito urgente, 4=não urgente),
  "description": "Descrição breve do tempo de espera",
  "waitTime": "Tempo estimado de espera (exemplo: 10 minutos)"
}

NÃO inclua explicações adicionais, apenas o JSON.`

export async function POST(request: Request) {
  try {
    const body: ClassificationRequest = await request.json()

    // Formatar comorbidades para texto
    const comorbiditiesList: string[] = []
    if (body.comorbidities.pressaoAlta) comorbiditiesList.push("Pressão alta")
    if (body.comorbidities.diabetes) {
      comorbiditiesList.push(
        body.comorbidities.diabetesTipo 
          ? `Diabetes (${body.comorbidities.diabetesTipo})` 
          : "Diabetes"
      )
    }
    if (body.comorbidities.cardiopatia) comorbiditiesList.push("Cardiopatia")
    if (body.comorbidities.doencaRenal) comorbiditiesList.push("Doença renal")
    if (body.comorbidities.doencaRespiratoria) comorbiditiesList.push("Doença respiratória")
    if (body.comorbidities.outro && body.comorbidities.outroEspecificar) {
      comorbiditiesList.push(body.comorbidities.outroEspecificar)
    }

    const userMessage = `Dados do paciente para triagem:

- Idade: ${body.patientAge} anos
- Etnia: ${body.patientEthnicity}
- Gênero: ${body.patientGender}
- Sintomas: ${body.symptoms}
- Duração dos sintomas: ${body.symptomsDuration}
- Escala de dor: ${body.painScale}/10
- Comorbidades: ${comorbiditiesList.length > 0 ? comorbiditiesList.join(", ") : "Nenhuma informada"}

Classifique este paciente segundo o Protocolo de Manchester.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 200,
    })

    const responseText = completion.choices[0]?.message?.content?.trim()

    if (!responseText) {
      return NextResponse.json(
        { error: "Resposta vazia da API" },
        { status: 500 }
      )
    }

    // Tentar fazer parse do JSON
    try {
      const classification = JSON.parse(responseText)
      
      // Validar campos obrigatórios
      if (!classification.level || !classification.priority) {
        return NextResponse.json(
          { error: "Resposta da IA incompleta" },
          { status: 500 }
        )
      }

      return NextResponse.json(classification)
    } catch {
      console.error("Erro ao fazer parse da resposta:", responseText)
      return NextResponse.json(
        { error: "Erro ao processar resposta da IA" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Erro na classificação:", error)
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `Erro na API OpenAI: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno ao processar classificação" },
      { status: 500 }
    )
  }
}
