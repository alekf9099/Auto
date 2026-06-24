interface Props {
  onBack: () => void
}

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '제1조 (목적)',
    body: [
      '이 약관은 운명봄(이하 "서비스")이 제공하는 사주, 운세, 궁합, 꿈해몽 등 콘텐츠 서비스의 이용과 관련하여 서비스 운영자와 이용자의 권리, 의무 및 책임사항을 정하는 것을 목적으로 합니다.',
    ],
  },
  {
    title: '제2조 (서비스의 내용)',
    body: [
      '서비스는 이용자가 입력한 생년월일 등을 바탕으로 사주, 신년운세, 토정비결, 오늘의 운세, 대운 분석, 궁합, 꿈해몽, 직업운, 코디 추천 등 콘텐츠를 제공합니다.',
      '서비스 내 콘텐츠는 전통 명리학 및 일반적인 해석을 바탕으로 한 참고 정보이며, 운세 결과에 대한 정확성, 신뢰성을 보장하지 않습니다.',
    ],
  },
  {
    title: '제3조 (회원가입 및 이용)',
    body: [
      '이용자는 구글(Google) 계정을 통한 소셜 로그인으로 서비스에 가입합니다.',
      '서비스는 무료로 제공되며, 출석 체크, 이벤트 참여 등을 통해 적립되는 "포인트"는 서비스 내 일부 콘텐츠(예: 심층 사주 해석) 이용에만 사용할 수 있는 가상의 재화로, 현금으로 환급되거나 외부에서 거래될 수 없습니다.',
    ],
  },
  {
    title: '제4조 (이용자의 의무)',
    body: [
      '이용자는 다음 행위를 해서는 안 됩니다.',
      '· 타인의 계정을 무단으로 사용하는 행위',
      '· 서비스의 정상적인 운영을 방해하는 행위(자동화 도구를 이용한 비정상적인 포인트 적립 등)',
      '· 서비스를 이용해 법령 또는 공공질서에 반하는 행위를 하는 행위',
    ],
  },
  {
    title: '제5조 (서비스 제공의 변경 및 중단)',
    body: [
      '서비스 운영자는 운영상, 기술상의 필요에 따라 제공하는 콘텐츠 및 서비스의 전부 또는 일부를 변경, 중단할 수 있으며, 이 경우 사전에 서비스 내 공지를 통해 안내합니다. 다만 불가피한 사정이 있는 경우 사후에 통지할 수 있습니다.',
    ],
  },
  {
    title: '제6조 (면책 조항)',
    body: [
      '서비스가 제공하는 사주, 운세 등 콘텐츠는 전통적인 해석 방식에 기반한 참고용 정보로서 오락 및 흥미를 목적으로 제공됩니다.',
      '서비스 운영자는 이용자가 콘텐츠를 바탕으로 행한 결정이나 행동에 대해 어떠한 법적 책임도 지지 않습니다.',
      '서비스 운영자는 천재지변, 서비스 설비의 장애, 이용량 급증 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다.',
    ],
  },
  {
    title: '제7조 (저작권)',
    body: [
      '서비스가 제작한 콘텐츠(디자인, 텍스트, UI 등)에 대한 저작권은 서비스 운영자에게 있으며, 이용자는 운영자의 사전 동의 없이 이를 영리적 목적으로 복제, 배포, 전송할 수 없습니다.',
    ],
  },
  {
    title: '제8조 (회원 탈퇴 및 데이터 삭제)',
    body: [
      '이용자는 언제든지 아래 연락처로 회원 탈퇴 및 개인정보 삭제를 요청할 수 있으며, 요청 즉시 관련 데이터를 지체 없이 파기합니다.',
      '· 이메일: alekf9099@naver.com',
    ],
  },
  {
    title: '제9조 (약관의 변경)',
    body: [
      '이 약관은 관계 법령 또는 서비스 정책 변경에 따라 개정될 수 있으며, 개정 시 서비스 내 공지를 통해 사전에 안내합니다.',
      '시행일: 2026년 6월 17일',
    ],
  },
]

export default function TermsPage({ onBack }: Props) {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#0D0A1A]/95 backdrop-blur-md border-b border-[#C9962A30]">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="뒤로 가기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#231844] transition text-[#C4B8D8] text-lg flex-shrink-0"
          >
            ←
          </button>
          <h1 className="text-base font-bold text-[#F5EDD4]" style={{ fontFamily: "'Gowun Batang', serif" }}>
            이용약관
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
