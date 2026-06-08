/// <reference types="node" />

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

type Luck = 'great' | 'good' | 'neutral' | 'caution'

interface DreamResult {
  luck: Luck
  summary: string
  general: string
  wealth: string
  love: string
  career: string
  health: string
  advice: string
}

// ---------------------------------------------------------------------------
// Local keyword-based fallback (runs when Gemini is unavailable)
// ---------------------------------------------------------------------------
const KEYWORD_RULES: Array<{
  words: string[]
  luck: Luck
  summary: string
  general: string
  wealth: string
  love: string
  career: string
  health: string
  advice: string
}> = [
  {
    words: ['돼지', '돼지꿈', '豚'],
    luck: 'great',
    summary: '재물과 풍요를 상징하는 대길몽',
    general: '돼지꿈은 예로부터 재물과 복을 상징하는 최고의 길몽입니다. 특히 여러 마리이거나 집 안으로 들어오는 경우 큰 횡재수를 암시합니다. 가까운 시일 안에 뜻밖의 수입이나 좋은 기회가 찾아올 것입니다.',
    wealth: '강한 재물운이 들어옵니다. 투자나 사업에서 예상보다 좋은 결과가 기대되고, 뜻밖의 돈이 생길 수 있습니다.',
    love: '인연운이 열려 있습니다. 새로운 만남이나 현재 관계의 발전을 기대해볼 수 있습니다.',
    career: '직업운이 상승합니다. 승진이나 새로운 기회가 찾아올 수 있으니 적극적으로 행동하세요.',
    health: '활력이 넘치는 시기입니다. 건강 상태가 전반적으로 양호하며 에너지가 충만합니다.',
    advice: '이 좋은 기운을 살려 미루던 일들을 과감하게 추진해 보세요. 로또나 투자 등 적극적인 행동이 운을 더욱 키웁니다.',
  },
  {
    words: ['용', '龍', '드래곤'],
    luck: 'great',
    summary: '권세와 성공을 예고하는 대길몽',
    general: '용꿈은 권력, 성공, 높은 지위를 상징하는 최고의 길몽입니다. 용이 승천하거나 함께하는 꿈은 큰 성취와 명예를 예고합니다. 삶의 큰 전환점이 될 사건이 찾아올 것입니다.',
    wealth: '큰 재물운이 따릅니다. 사업이나 투자에서 높은 수익을 기대할 수 있습니다.',
    love: '카리스마가 넘쳐 이성에게 매력적으로 보이는 시기입니다. 특별한 인연이 찾아올 수 있습니다.',
    career: '탁월한 리더십이 인정받는 시기입니다. 중요한 프로젝트나 승진의 기회를 놓치지 마세요.',
    health: '강한 생명력과 에너지를 가진 시기입니다. 무엇이든 도전할 수 있는 신체 상태입니다.',
    advice: '자신감을 갖고 큰 목표를 향해 나아가세요. 이 시기에 세운 계획은 반드시 결실을 맺을 것입니다.',
  },
  {
    words: ['뱀', '사', '뱀꿈'],
    luck: 'great',
    summary: '재물과 지혜를 상징하는 길몽',
    general: '뱀꿈은 동양 전통에서 재물과 지혜를 상징합니다. 특히 뱀이 집 안에 있거나 품에 안기는 꿈은 돈이 들어올 징조입니다. 예상치 못한 재물이나 귀인의 도움이 있을 것입니다.',
    wealth: '재물운이 강하게 들어옵니다. 특히 생각지도 못한 곳에서 돈이 들어올 수 있습니다.',
    love: '매혹적인 매력을 발산하는 시기입니다. 이성에게 강한 인상을 남길 수 있습니다.',
    career: '지혜와 통찰력이 발휘되는 시기입니다. 복잡한 문제를 해결하는 능력이 인정받습니다.',
    health: '건강에 특별한 주의를 기울이는 것이 좋습니다. 정기적인 검진을 추천합니다.',
    advice: '직관을 믿고 행동하세요. 좋은 기회가 왔을 때 망설이지 말고 잡으세요.',
  },
  {
    words: ['물', '강', '바다', '비', '홍수', '강물', '바닷물'],
    luck: 'good',
    summary: '흐르는 기운과 감정의 변화를 나타내는 길몽',
    general: '물꿈은 재물의 흐름과 감정 상태를 반영합니다. 맑고 풍부한 물은 좋은 운을 의미하고, 강이나 바다가 넓게 펼쳐진 꿈은 큰 기회가 열림을 뜻합니다. 유연한 대처로 기회를 잡으세요.',
    wealth: '재물이 물처럼 흘러들어오는 시기입니다. 꾸준한 수입과 안정적인 흐름을 기대할 수 있습니다.',
    love: '감성이 풍부해지는 시기입니다. 진심 어린 감정 표현이 관계를 더욱 깊게 만듭니다.',
    career: '흐르는 물처럼 유연하게 상황에 적응하는 능력이 빛을 발합니다. 협업에서 좋은 성과가 있을 것입니다.',
    health: '심리적 안정과 휴식이 필요한 시기입니다. 스트레스를 풀 수 있는 활동을 찾아보세요.',
    advice: '억지로 밀어붙이기보다 자연스러운 흐름을 타세요. 유연함이 곧 강점입니다.',
  },
  {
    words: ['하늘', '구름', '별', '달', '태양', '햇빛'],
    luck: 'good',
    summary: '밝고 희망적인 미래를 예고하는 길몽',
    general: '하늘과 천체는 높은 이상과 희망을 상징합니다. 밝은 하늘이나 빛나는 태양, 별빛은 좋은 일이 찾아올 것을 예고합니다. 정신적으로 고양되는 시기가 될 것입니다.',
    wealth: '안정적인 수입과 점진적인 재물의 증가가 기대됩니다. 장기적 관점의 투자가 유리합니다.',
    love: '밝고 긍정적인 에너지로 주변에 좋은 영향을 줍니다. 만남과 관계가 빛처럼 빛나는 시기입니다.',
    career: '명예와 인정이 따르는 시기입니다. 큰 그림을 그리고 목표를 높이 세우세요.',
    health: '활기차고 에너지가 넘칩니다. 야외 활동이나 운동으로 이 에너지를 발산하면 좋습니다.',
    advice: '꿈과 목표를 향해 당당하게 나아가세요. 주변의 시선보다 자신의 빛을 믿으세요.',
  },
  {
    words: ['아기', '태몽', '임신', '아이', '신생아'],
    luck: 'great',
    summary: '새 생명과 새로운 시작을 알리는 대길몽',
    general: '아기 꿈은 새로운 시작, 창조, 가능성을 상징하는 대길몽입니다. 새로운 프로젝트나 사업이 시작될 수 있고, 기쁜 소식이 찾아올 것을 암시합니다. 풍요롭고 생명력 넘치는 시기가 될 것입니다.',
    wealth: '새로운 수입원이 생기거나 기존 사업이 번창할 징조입니다. 시작하고 싶었던 일을 지금 시도하세요.',
    love: '사랑이 깊어지거나 새로운 인연이 찾아오는 시기입니다. 가족과의 유대감도 강해집니다.',
    career: '새로운 기회가 문을 두드립니다. 창의적인 프로젝트나 새 역할에 도전해볼 좋은 타이밍입니다.',
    health: '생명력이 넘치는 시기입니다. 임신 가능성이 있으신 분은 주의 깊게 살펴보세요.',
    advice: '새로운 것에 대한 두려움을 내려놓고 열린 마음으로 받아들이세요. 시작이 반입니다.',
  },
  {
    words: ['불', '화재', '화염', '불꽃'],
    luck: 'caution',
    summary: '열정과 변화, 주의가 필요한 꿈',
    general: '불꿈은 강렬한 에너지와 변화를 상징합니다. 통제된 불(난로, 촛불)은 열정과 성공을 의미하지만, 걷잡을 수 없는 화재는 갑작스러운 변동이나 손실을 경고합니다. 충동적인 결정을 피하고 신중하게 행동하세요.',
    wealth: '재물의 급격한 변동이 생길 수 있습니다. 투기성 투자나 큰 지출은 자제하는 것이 좋습니다.',
    love: '감정이 격해지기 쉬운 시기입니다. 충동적인 언행으로 관계가 상처받지 않도록 주의하세요.',
    career: '급격한 변화가 있을 수 있습니다. 모험보다는 안정을 택하고 기초를 다지는 것이 현명합니다.',
    health: '과로나 스트레스에 주의하세요. 특히 심장·혈압 관련 건강 관리에 신경 쓰세요.',
    advice: '흥분된 감정이 가라앉을 때까지 중요한 결정을 미루세요. 차분함이 최선의 방어입니다.',
  },
  {
    words: ['죽음', '사망', '장례', '무덤', '귀신', '유령'],
    luck: 'good',
    summary: '끝과 새로운 시작을 상징하는 변화의 꿈',
    general: '죽음 꿈은 역설적으로 좋은 의미를 담고 있는 경우가 많습니다. 전통 해몽에서 죽음은 낡은 것의 끝과 새로운 것의 시작을 상징합니다. 큰 변화나 전환점이 다가오고 있음을 알려주는 꿈입니다.',
    wealth: '이전의 재정 상태에서 벗어나 새로운 국면을 맞이할 수 있습니다. 변화를 두려워하지 마세요.',
    love: '기존 관계에서 새로운 단계로 나아가는 시기입니다. 변화를 받아들이면 관계가 더욱 성숙해집니다.',
    career: '직업적 전환점이 올 수 있습니다. 새로운 도전이나 이직을 고려해볼 시기입니다.',
    health: '묵은 걱정과 스트레스를 내려놓는 것이 중요합니다. 심리적 정화가 필요한 시기입니다.',
    advice: '변화를 두려워하지 마세요. 끝이 있어야 새로운 시작이 있습니다. 용기를 내어 전진하세요.',
  },
]

function localFallback(dream: string): DreamResult {
  const text = dream.toLowerCase()

  const matched = KEYWORD_RULES.find(r => r.words.some(w => text.includes(w)))

  if (matched) {
    return {
      luck: matched.luck,
      summary: matched.summary,
      general: matched.general,
      wealth: matched.wealth,
      love: matched.love,
      career: matched.career,
      health: matched.health,
      advice: matched.advice,
    }
  }

  // Generic fallback — analyse basic tone
  const positiveWords = ['좋', '행복', '웃', '밝', '예쁘', '아름', '맛있', '즐', '기쁘', '설레']
  const negativeWords = ['무섭', '두렵', '힘들', '슬프', '아프', '피', '쫓기', '떨어지', '잃', '잊']

  const positiveScore = positiveWords.filter(w => text.includes(w)).length
  const negativeScore = negativeWords.filter(w => text.includes(w)).length

  const luck: Luck = positiveScore > negativeScore ? 'good'
    : negativeScore > positiveScore ? 'caution'
    : 'neutral'

  const interpretations: Record<Luck, DreamResult> = {
    great: {
      luck: 'great',
      summary: '기운이 넘치는 대길몽',
      general: '꿈속의 밝고 긍정적인 기운이 현실로 이어질 것입니다. 전통 해몽에 따르면 이런 꿈은 좋은 소식이나 행운이 찾아올 징조입니다. 자신감을 갖고 원하는 것을 향해 나아가세요.',
      wealth: '재물운이 상승하는 시기입니다. 들어오는 기회를 놓치지 마세요.',
      love: '따뜻하고 밝은 인연운이 함께합니다. 소중한 사람에게 마음을 전해보세요.',
      career: '능력을 인정받는 시기입니다. 적극적으로 자신의 역량을 드러내세요.',
      health: '활기차고 건강한 시기입니다. 이 에너지를 긍정적으로 활용하세요.',
      advice: '긍정적인 마음을 유지하며 적극적으로 행동하세요. 좋은 운이 함께합니다.',
    },
    good: {
      luck: 'good',
      summary: '순탄한 흐름을 암시하는 길몽',
      general: '꿈이 전반적으로 안정적이고 조화로운 기운을 담고 있습니다. 전통 해몽에서 이런 꿈은 일상이 순조롭게 흘러가고 작은 기쁨이 찾아올 것을 의미합니다.',
      wealth: '안정적인 재물운이 유지됩니다. 무리한 투자보다 꾸준한 저축이 유리합니다.',
      love: '서로를 이해하고 배려하는 관계가 깊어지는 시기입니다.',
      career: '성실하게 임한 일들이 서서히 결실을 맺는 시기입니다.',
      health: '건강 상태가 안정적입니다. 규칙적인 생활 습관을 유지하세요.',
      advice: '현재에 충실하고 감사한 마음으로 하루하루를 보내세요.',
    },
    neutral: {
      luck: 'neutral',
      summary: '평온한 일상을 나타내는 평몽',
      general: '특별한 길흉보다는 현재 상황을 있는 그대로 반영하는 꿈입니다. 전통 해몽에서 평온한 꿈은 큰 변화 없이 안정적인 일상이 지속됨을 의미합니다.',
      wealth: '큰 변동 없이 현 상태가 유지됩니다. 절약과 관리에 신경 쓰세요.',
      love: '관계가 안정적으로 유지됩니다. 일상적인 소통이 관계의 기반을 다집니다.',
      career: '현재 하는 일을 충실히 해나가는 것이 가장 좋습니다.',
      health: '큰 변화 없이 안정적인 상태입니다. 기본적인 건강 관리를 유지하세요.',
      advice: '평범한 일상 속에도 작은 행복이 있습니다. 주변의 소중한 것들을 돌아보세요.',
    },
    caution: {
      luck: 'caution',
      summary: '주의와 신중함이 필요한 꿈',
      general: '꿈이 불안하거나 부정적인 감정을 담고 있습니다. 전통 해몽에서 이런 꿈은 경고의 의미로, 중요한 결정이나 행동에 주의를 기울이라는 신호입니다.',
      wealth: '충동적인 지출이나 투자를 자제하고 재정 관리에 신중을 기하세요.',
      love: '오해나 갈등이 생길 수 있습니다. 상대방의 말을 경청하고 감정적 충돌을 피하세요.',
      career: '서두르지 말고 한 걸음 한 걸음 신중하게 나아가세요.',
      health: '과로와 스트레스에 주의하세요. 충분한 휴식이 필요합니다.',
      advice: '중요한 결정은 감정이 안정된 후에 내리세요. 신중함이 최선의 방어입니다.',
    },
  }

  return interpretations[luck]
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

  const { dream } = (req.body ?? {}) as { dream?: string }
  if (!dream?.trim()) {
    return res.status(400).json({ error: '꿈 내용을 입력해주세요' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  // No API key — use local fallback directly
  if (!apiKey) {
    return res.status(200).json(localFallback(dream))
  }

  try {
    const prompt = `당신은 한국 전통 해몽 전문가입니다. 사용자의 꿈을 전통 해몽 방식으로 해석해주세요. 꿈 내용: "${dream.slice(0, 300)}" 반드시 아래 JSON 형식으로만 응답하세요. 설명 텍스트 없이 JSON만 출력하세요. {"luck": "great", "summary": "재물과 풍요를 암시하는 대길몽", "general": "전통 해몽 전체 설명 (2~3문장, 구체적으로)", "wealth": "재물운 해석 (1~2문장)", "love": "애정운 해석 (1~2문장)", "career": "직업/사업운 해석 (1~2문장)", "health": "건강운 해석 (1~2문장)", "advice": "오늘의 행동 지침 (1~2문장)" } luck 값 기준: great=대길몽, good=길몽, neutral=평몽, caution=주의몽`

    const resp = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!resp.ok) {
      // Gemini failed — use local fallback silently
      console.error('Gemini error:', resp.status, await resp.text().catch(() => ''))
      return res.status(200).json(localFallback(dream))
    }

    const data = await resp.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)

    if (!match) {
      return res.status(200).json(localFallback(dream))
    }

    const result = JSON.parse(match[0]) as DreamResult
    if (!['great', 'good', 'neutral', 'caution'].includes(result.luck ?? '')) {
      result.luck = 'neutral'
    }

    return res.status(200).json(result)
  } catch (e) {
    console.error('Handler error:', e)
    // Always return valid JSON — fall back to local interpretation
    return res.status(200).json(localFallback(dream))
  }
}
