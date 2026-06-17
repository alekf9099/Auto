interface Props {
  onBack: () => void
}

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. 수집하는 개인정보 항목',
    body: [
      '운명봄(이하 "서비스")은 회원가입(구글 로그인) 및 서비스 제공을 위해 아래와 같은 정보를 수집합니다.',
      '· 구글 계정 정보: 이름, 이메일 주소, 프로필 사진',
      '· 사주 풀이를 위한 정보: 생년월일, 출생 시·분, 성별',
      '· 서비스 이용 정보: 포인트 적립/사용 내역, 출석 기록, 이벤트 참여 기록',
      '· 꿈해몽 기능 이용 시 입력한 꿈 내용 텍스트',
    ],
  },
  {
    title: '2. 개인정보의 수집 방법',
    body: [
      '구글 소셜 로그인(Google Identity Services)을 통해 이름·이메일·프로필 사진을 제공받으며, 생년월일 등 사주 정보는 이용자가 서비스 화면에서 직접 입력합니다.',
    ],
  },
  {
    title: '3. 개인정보의 이용 목적',
    body: [
      '· 회원 식별 및 로그인 유지',
      '· 사주, 운세, 궁합, 꿈해몽 등 콘텐츠 생성 및 제공',
      '· 기기 간 데이터 동기화(클라우드 저장)',
      '· 출석 체크, 포인트 적립 등 서비스 이용 현황 관리',
      '· 서비스 오류 대응 및 부정 이용 방지',
    ],
  },
  {
    title: '4. 개인정보의 보유 및 이용 기간',
    body: [
      '이용자가 회원 탈퇴를 요청하거나 본 항목 6의 방법으로 삭제를 요청하는 즉시 해당 개인정보를 지체 없이 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 별도 보관할 수 있습니다.',
    ],
  },
  {
    title: '5. 개인정보의 제3자 제공 및 처리 위탁',
    body: [
      '서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만 서비스 운영을 위해 아래와 같이 외부 업체의 인프라를 이용하고 있습니다.',
      '· Google LLC (Google Identity Services) — 로그인 인증 처리',
      '· Google LLC (Gemini API) — 꿈해몽 기능 이용 시 입력한 꿈 내용 텍스트의 해석 처리(텍스트는 해석 결과 생성 목적으로만 일시적으로 전송되며 별도 저장되지 않습니다)',
      '· Supabase Inc. — 클라우드 데이터 저장(데이터베이스 호스팅)',
      '· Vercel Inc. — 웹 애플리케이션 및 서버 호스팅',
      '이들 업체는 서비스 제공에 필요한 범위 내에서만 정보를 처리하며, 별도의 목적으로 이용하지 않습니다.',
    ],
  },
  {
    title: '6. 이용자의 권리와 행사 방법',
    body: [
      '이용자는 언제든지 자신의 개인정보 조회, 정정, 삭제, 처리정지를 요청할 수 있습니다. 아래 연락처로 요청하시면 지체 없이 조치합니다.',
      '· 이메일: alekf9099@naver.com',
    ],
  },
  {
    title: '7. 개인정보의 안전성 확보 조치',
    body: [
      '서비스는 클라이언트가 데이터베이스에 직접 접근하지 못하도록 모든 데이터 동기화 요청을 서버를 경유하여 처리하고, 구글 로그인 토큰을 서버에서 검증하는 방식으로 개인정보를 보호하고 있습니다.',
    ],
  },
  {
    title: '8. 만 14세 미만 아동의 개인정보',
    body: [
      '본 서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.',
    ],
  },
  {
    title: '9. 개인정보 보호책임자',
    body: [
      '서비스 운영자(개인 개발자)가 개인정보 보호책임자로서 개인정보 처리에 관한 문의, 불만 처리, 피해 구제 등을 담당합니다.',
      '· 이메일: alekf9099@naver.com',
    ],
  },
  {
    title: '10. 개정 전 고지',
    body: [
      '본 개인정보처리방침은 법령, 정책 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다.',
      '시행일: 2026년 6월 17일',
    ],
  },
]

export default function PrivacyPolicyPage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#0D0A1A]">
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="뒤로 가기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg flex-shrink-0"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
            개인정보처리방침
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <p className="text-xs text-[#7B6F9A] leading-relaxed">
          운명봄(이하 "서비스")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다.
          서비스는 본 개인정보처리방침을 통해 이용자가 제공하는 개인정보가 어떠한 목적과 방식으로 이용되고 있으며,
          개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
        </p>

        {SECTIONS.map((sec, i) => (
          <section key={i} className="space-y-1.5">
            <h2 className="text-sm font-bold text-[#F5EDD4]">{sec.title}</h2>
            {sec.body.map((line, j) => (
              <p key={j} className="text-xs text-[#A89BC0] leading-relaxed">{line}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
