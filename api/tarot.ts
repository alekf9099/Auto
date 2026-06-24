/// <reference types="node" />

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

type Luck = 'great' | 'good' | 'neutral' | 'caution'

interface DrawnCardInput { name?: string; reversed?: boolean }

interface TarotResult {
  luck: Luck
  summary: string
  past: string
  present: string
  future: string
  advice: string
}

// ---------------------------------------------------------------------------
// Local meaning table — fallback일 때, 그리고 Gemini 프롬프트의 근거 자료로도 사용한다
// (메이저 아르카나 22장. src/utils/tarotDeck.ts의 카드 이름과 동일하게 유지해야 한다)
// ---------------------------------------------------------------------------
const CARD_MEANINGS: Record<string, { tone: Luck; upright: string; reversed: string }> = {
  '광대':           { tone: 'good',    upright: '새로운 시작과 순수한 가능성이 열리는 때입니다',           reversed: '무모한 선택으로 일을 그르칠 수 있어 신중함이 필요한 때입니다' },
  '마법사':         { tone: 'great',   upright: '가진 능력을 펼쳐 원하는 것을 현실로 만들어내는 때입니다',   reversed: '능력을 제대로 쓰지 못하거나 속임수를 조심해야 하는 때입니다' },
  '여사제':         { tone: 'neutral', upright: '직감과 내면의 목소리를 믿어야 하는 때입니다',               reversed: '직감을 무시하고 겉모습에만 휘둘리기 쉬운 때입니다' },
  '여제':           { tone: 'great',   upright: '풍요와 안정, 결실이 가득 따르는 때입니다',                 reversed: '과한 욕심이나 의존이 발목을 잡을 수 있는 때입니다' },
  '황제':           { tone: 'good',    upright: '확고한 의지와 통제력으로 안정을 이루는 때입니다',           reversed: '독단적인 태도가 갈등을 부를 수 있는 때입니다' },
  '교황':           { tone: 'good',    upright: '전통과 원칙을 따르면 좋은 조언과 도움을 얻는 때입니다',     reversed: '낡은 방식에 얽매여 변화를 거부하게 되는 때입니다' },
  '연인':           { tone: 'great',   upright: '조화로운 관계와 좋은 인연이 깊어지는 때입니다',             reversed: '관계의 불균형이나 선택의 갈등이 생기는 때입니다' },
  '전차':           { tone: 'good',    upright: '강한 추진력으로 목표를 향해 거침없이 나아가는 때입니다',     reversed: '방향을 잃거나 통제력을 잃기 쉬운 때입니다' },
  '힘':             { tone: 'good',    upright: '부드러운 용기와 인내로 어려움을 다스리는 때입니다',         reversed: '자신감이 흔들리고 스스로를 의심하게 되는 때입니다' },
  '은둔자':         { tone: 'neutral', upright: '홀로 성찰하며 답을 찾아야 하는 때입니다',                   reversed: '고립감이나 외로움이 깊어질 수 있는 때입니다' },
  '운명의 수레바퀴': { tone: 'good',    upright: '운의 흐름이 크게 바뀌며 기회가 찾아오는 때입니다',           reversed: '예상치 못한 변동으로 흐름이 어긋날 수 있는 때입니다' },
  '정의':           { tone: 'neutral', upright: '공정한 판단과 균형 잡힌 결정이 필요한 때입니다',           reversed: '불공정한 상황이나 잘못된 판단을 조심해야 하는 때입니다' },
  '매달린 사람':     { tone: 'caution', upright: '잠시 멈추고 새로운 관점을 받아들여야 하는 때입니다',       reversed: '불필요한 희생이나 정체된 상황이 계속되는 때입니다' },
  '죽음':           { tone: 'good',    upright: '낡은 것을 끝내고 새로운 국면으로 전환되는 때입니다',       reversed: '변화를 받아들이지 못해 정체되는 때입니다' },
  '절제':           { tone: 'good',    upright: '균형과 조화를 이루며 차분히 나아가는 때입니다',             reversed: '과도함이나 균형을 잃은 행동을 조심해야 하는 때입니다' },
  '악마':           { tone: 'caution', upright: '집착이나 유혹에 발이 묶일 수 있는 때입니다',                 reversed: '속박에서 벗어나 자유를 되찾을 수 있는 때입니다' },
  '탑':             { tone: 'caution', upright: '갑작스러운 충격이나 급격한 변화가 닥치는 때입니다',         reversed: '큰 충격은 피했지만 불안정함이 남아있는 때입니다' },
  '별':             { tone: 'great',   upright: '희망과 영감이 채워지며 회복이 이루어지는 때입니다',         reversed: '희망을 잃고 자신감이 흔들리는 때입니다' },
  '달':             { tone: 'caution', upright: '불확실함과 막연한 불안이 감도는 때입니다',                   reversed: '혼란이 걷히고 진실이 드러나기 시작하는 때입니다' },
  '태양':           { tone: 'great',   upright: '밝은 기운과 성공, 활력이 가득한 최고의 때입니다',           reversed: '잠시 빛이 가려졌지만 곧 다시 밝아질 때입니다' },
  '심판':           { tone: 'good',    upright: '지난 노력에 대한 결과와 평가가 따르는 때입니다',           reversed: '과거에 대한 후회나 미련이 남아있는 때입니다' },
  '세계':           { tone: 'great',   upright: '하나의 여정이 완성되며 큰 성취를 이루는 때입니다',         reversed: '마무리가 늦어지거나 한 걸음이 더 필요한 때입니다' },
}

const POSITION_LABEL = { past: '과거', present: '현재', future: '미래' } as const

function meaningOf(name: string, reversed: boolean): { tone: Luck; text: string } {
  const entry = CARD_MEANINGS[name]
  if (!entry) return { tone: 'neutral', text: '카드의 기운이 조용히 흐르는 때입니다' }
  return { tone: entry.tone, text: reversed ? entry.reversed : entry.upright }
}

function aggregateLuck(tones: Luck[]): Luck {
  const order: Luck[] = ['great', 'good', 'neutral', 'caution']
  const counts = new Map<Luck, number>()
  for (const t of tones) counts.set(t, (counts.get(t) ?? 0) + 1)
  let best: Luck = 'neutral'
  let bestCount = -1
  for (const t of order) {
    const c = counts.get(t) ?? 0
    if (c > bestCount) { best = t; bestCount = c }
  }
  return best
}

function localFallback(cards: { name: string; reversed: boolean }[]): TarotResult {
  const [pastCard, presentCard, futureCard] = cards
  const past = meaningOf(pastCard.name, pastCard.reversed)
  const present = meaningOf(presentCard.name, presentCard.reversed)
  const future = meaningOf(futureCard.name, futureCard.reversed)

  return {
    luck: aggregateLuck([past.tone, present.tone, future.tone]),
    summary: `${presentCard.name}${presentCard.reversed ? ' (역방향)' : ''} 카드가 보여주는 지금의 흐름`,
    past: `${POSITION_LABEL.past} — ${pastCard.name}${pastCard.reversed ? ' (역방향)' : ''}: ${past.text} 그 시기의 선택과 감정이 지금까지도 영향을 남기고 있으니, 그때 무엇을 느꼈는지 한번 돌이켜보면 지금의 흐름을 이해하는 데 도움이 됩니다.`,
    present: `${POSITION_LABEL.present} — ${presentCard.name}${presentCard.reversed ? ' (역방향)' : ''}: ${present.text} 지금 마주한 상황을 너무 서둘러 판단하지 말고, 이 카드가 보여주는 기운을 있는 그대로 받아들이는 태도가 필요합니다.`,
    future: `${POSITION_LABEL.future} — ${futureCard.name}${futureCard.reversed ? ' (역방향)' : ''}: ${future.text} 지금부터의 선택이 이 흐름을 더 좋게 만들 수도, 더 늦출 수도 있으니 마음의 준비를 해두는 것이 좋습니다.`,
    advice: `${futureCard.name} 카드가 가리키는 방향을 염두에 두고, 지금은 ${present.text.replace(/때입니다$/, '')}때이니 흐름에 맞춰 행동하세요. 거창한 결심보다는 오늘 할 수 있는 작은 행동 하나를 정해 실천해보시고, 마음이 흔들릴 때는 ${pastCard.name} 카드가 일러준 경험을 다시 떠올려보세요. 결과보다 과정에 집중하면 마음이 한결 편해질 것입니다.`,
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { question, cards } = (req.body ?? {}) as { question?: string; cards?: DrawnCardInput[] }

  if (!Array.isArray(cards) || cards.length !== 3) {
    return res.status(400).json({ error: '카드 3장 정보가 필요합니다' })
  }
  const cleanCards = cards.map(c => ({
    name: typeof c.name === 'string' && c.name in CARD_MEANINGS ? c.name : '광대',
    reversed: !!c.reversed,
  }))

  const apiKey = process.env.GEMINI_API_KEY

  // No API key — use local fallback directly
  if (!apiKey) {
    return res.status(200).json(localFallback(cleanCards))
  }

  try {
    const [pastCard, presentCard, futureCard] = cleanCards
    const questionLine = question?.trim() ? `사용자의 질문: "${question.trim().slice(0, 200)}"` : '사용자가 특정 질문 없이 전반적인 운세를 물었습니다.'
    const prompt = `당신은 20년 경력의 타로 카드 전문 상담사입니다. 과거-현재-미래 3카드 스프레드 결과를 깊이 있고 구체적으로 해석해주세요. ${questionLine} 뽑힌 카드: 과거=${pastCard.name}${pastCard.reversed ? '(역방향)' : '(정방향)'}, 현재=${presentCard.name}${presentCard.reversed ? '(역방향)' : '(정방향)'}, 미래=${futureCard.name}${futureCard.reversed ? '(역방향)' : '(정방향)'}.

각 항목을 작성할 때 다음을 지켜주세요:
- 카드가 담고 있는 상징(인물, 사물, 분위기 등)을 구체적으로 풀어서 설명하되, 단순 카드 사전적 의미 나열이 아니라 사용자의 질문 맥락과 자연스럽게 연결해주세요.
- past/present/future는 각각 4~5문장 분량으로, 그 시기에 실제로 일어났거나 일어나고 있거나 일어날 법한 상황을 구체적으로 묘사해주세요.
- advice는 4~6문장 분량으로, 추상적인 격려가 아니라 지금 당장 시도해볼 수 있는 구체적인 행동이나 마음가짐을 제시해주세요.
- summary는 전체 흐름을 압축한 한 문장입니다.
- 모든 문장은 따뜻하고 신뢰감 있는 존댓말 어조로 작성해주세요.

반드시 아래 JSON 형식으로만 응답하세요. 설명 텍스트나 마크다운 없이 JSON만 출력하세요.
{"luck": "great", "summary": "전체 흐름을 압축한 한 문장", "past": "과거 카드 해석 (4~5문장)", "present": "현재 카드 해석 (4~5문장)", "future": "미래 카드 해석 (4~5문장)", "advice": "구체적인 조언 (4~6문장)"}
luck 값 기준: great=매우 좋음, good=좋음, neutral=보통, caution=주의 필요`

    const resp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!resp.ok) {
      console.error('Gemini error:', resp.status, await resp.text().catch(() => ''))
      return res.status(200).json(localFallback(cleanCards))
    }

    const data = await resp.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)

    if (!match) {
      return res.status(200).json(localFallback(cleanCards))
    }

    const result = JSON.parse(match[0]) as TarotResult
    if (!['great', 'good', 'neutral', 'caution'].includes(result.luck ?? '')) {
      result.luck = 'neutral'
    }

    return res.status(200).json(result)
  } catch (e) {
    console.error('Handler error:', e)
    return res.status(200).json(localFallback(cleanCards))
  }
}
