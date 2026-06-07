export const config = { runtime: 'edge' }

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 })
  }

  const { dream } = await request.json() as { dream?: string }
  if (!dream?.trim()) {
    return new Response(JSON.stringify({ error: '꿈 내용을 입력해주세요' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const apiKey = (process as NodeJS.Process & { env: Record<string, string | undefined> }).env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API 키가 설정되지 않았습니다' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  const prompt = `당신은 한국 전통 해몽 전문가입니다. 사용자의 꿈을 전통 해몽 방식으로 해석해주세요.

꿈 내용: "${dream.slice(0, 300)}"

반드시 아래 JSON 형식으로만 응답하세요. 설명 텍스트 없이 JSON만 출력하세요.

{
  "luck": "great",
  "summary": "재물과 풍요를 암시하는 대길몽",
  "general": "전통 해몽 전체 설명 (2~3문장, 구체적으로)",
  "wealth": "재물운 해석 (1~2문장)",
  "love": "애정운 해석 (1~2문장)",
  "career": "직업/사업운 해석 (1~2문장)",
  "health": "건강운 해석 (1~2문장)",
  "advice": "오늘의 행동 지침 (1~2문장)"
}

luck 값 기준: great=대길몽, good=길몽, neutral=평몽, caution=주의몽`

  try {
    const resp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    })

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'AI 서비스 오류가 발생했습니다' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      return new Response(JSON.stringify({ error: 'AI 응답 파싱 오류' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    const result = JSON.parse(match[0]) as { luck?: string }
    if (!['great', 'good', 'neutral', 'caution'].includes(result.luck ?? '')) {
      result.luck = 'neutral'
    }

    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
