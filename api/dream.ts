const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end()

  const { dream } = req.body as { dream?: string }
  if (!dream?.trim()) {
    return res.status(400).json({ error: '꿈 내용을 입력해주세요' })
  }

  // 1. process.env 대신 import.meta.env를 사용합니다.
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다' })
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
      const errText = await resp.text()
      console.error('Gemini error:', resp.status, errText)
      return res.status(502).json({ error: `Gemini 오류 (${resp.status}): ${errText.slice(0, 200)}` })
    }

    const data = await resp.json()
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('Parse error, raw text:', text)
      return res.status(502).json({ error: 'AI 응답 파싱 오류' })
    }

    const result = JSON.parse(match[0]) as { luck?: string }
    if (!['great', 'good', 'neutral', 'caution'].includes(result.luck ?? '')) {
      result.luck = 'neutral'
    }

    return res.status(200).json(result)
  } catch (e) {
    console.error('Handler error:', e)
    return res.status(500).json({ error: String(e) })
  }
}
