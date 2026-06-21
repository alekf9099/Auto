/// <reference types="node" />
import { createClient } from '@supabase/supabase-js'

// 공지/점검 메시지 등 민감하지 않은 원격 설정을 돌려준다. 인증이 필요 없는 공개 엔드포인트이며,
// 배포 없이 supabase의 app_config 테이블만 바꿔서 클라이언트 동작을 조정할 수 있다.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return res.status(200).json({})
  }
  const supabase = createClient(supabaseUrl, serviceKey)

  const { data, error } = await supabase.from('app_config').select('key, value')
  if (error) return res.status(500).json({ error: error.message })

  const config: Record<string, unknown> = {}
  for (const row of data ?? []) config[row.key] = row.value

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  return res.status(200).json(config)
}
