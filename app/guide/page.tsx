export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'GPTStyler 서비스 가이드',
  description: 'AI가 만들어주는 맞춤형 채팅 테마 디자이너 — 사용법 및 기능 소개',
};

export default function GuidePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');

        .guide-body {
          font-family: 'Noto Sans KR', sans-serif;
          background: #fff;
          color: #1a1a1a;
          line-height: 1.6;
        }

        @media print {
          .guide-body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .guide-cover { page-break-after: always; }
          .guide-dark-section { page-break-before: always; }
          .guide-feature-card, .guide-step, .guide-highlight,
          .guide-screenshot, .guide-section { break-inside: avoid; page-break-inside: avoid; }
          .guide-section-label, .guide-body h2, .guide-body h3 { break-after: avoid; page-break-after: avoid; }
          .guide-features { break-inside: avoid; page-break-inside: avoid; }
        }

        .guide-cover {
          background: linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0d1a0f 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 40px;
          position: relative;
          overflow: hidden;
        }
        .guide-cover::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(120,40,200,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 50%, rgba(40,160,80,0.1) 0%, transparent 60%);
        }
        .guide-badge {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 6px 18px;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 32px;
          position: relative;
        }
        .guide-cover h1 {
          font-size: 72px;
          font-weight: 900;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #ffffff 0%, #19c37d 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          margin-bottom: 16px;
        }
        .guide-cover-sub {
          font-size: 22px;
          color: #888;
          font-weight: 300;
          position: relative;
          margin-bottom: 48px;
        }
        .guide-cover-desc {
          font-size: 16px;
          color: #666;
          max-width: 500px;
          position: relative;
          line-height: 1.8;
        }
        .guide-cover-meta {
          position: absolute;
          bottom: 40px;
          font-size: 12px;
          color: #444;
          letter-spacing: 1px;
        }

        .guide-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 80px 40px;
        }
        .guide-section { margin-bottom: 72px; }
        .guide-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #19c37d;
          margin-bottom: 12px;
        }
        .guide-section h2 {
          font-size: 36px;
          font-weight: 800;
          color: #0f0f1a;
          line-height: 1.2;
          margin-bottom: 20px;
        }
        .guide-section p { font-size: 16px; color: #555; line-height: 1.9; }

        .guide-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 32px;
        }
        .guide-feature-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 16px;
          padding: 28px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .guide-feature-icon { font-size: 32px; margin-bottom: 12px; }
        .guide-feature-card h3 { font-size: 17px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
        .guide-feature-card p { font-size: 14px; color: #777; line-height: 1.7; }

        .guide-steps { margin-top: 32px; display: flex; flex-direction: column; gap: 0; }
        .guide-step {
          display: flex;
          gap: 24px;
          position: relative;
          padding-bottom: 40px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .guide-step:last-child { padding-bottom: 0; }
        .guide-step:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 19px;
          top: 40px;
          bottom: 0;
          width: 2px;
          background: #e9ecef;
        }
        .guide-step-num {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #0f0f1a;
          color: white;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .guide-step-content h3 { font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; margin-top: 8px; }
        .guide-step-content p { font-size: 14px; color: #777; line-height: 1.7; }

        .guide-screenshot {
          background: linear-gradient(135deg, #0f0f1a, #1a0a2e);
          border-radius: 16px;
          overflow: hidden;
          margin: 32px 0;
          border: 1px solid #e9ecef;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .guide-screenshot-bar {
          background: rgba(255,255,255,0.05);
          padding: 10px 16px;
          display: flex;
          gap: 6px;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .guide-dot { width: 10px; height: 10px; border-radius: 50%; }
        .guide-dot.r { background: #ff5f57; }
        .guide-dot.y { background: #febc2e; }
        .guide-dot.g { background: #28c840; }
        .guide-screenshot-body { padding: 32px; min-height: 200px; display: flex; align-items: center; }
        .guide-screenshot-mock { width: 100%; display: flex; gap: 0; }
        .guide-mock-sidebar {
          width: 180px;
          background: rgba(255,255,255,0.03);
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 16px 12px;
          flex-shrink: 0;
        }
        .guide-mock-sidebar-item { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 8px; }
        .guide-mock-main { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .guide-mock-msg-user {
          align-self: flex-end;
          background: #343541;
          color: rgba(255,255,255,0.7);
          padding: 8px 14px;
          border-radius: 14px 14px 2px 14px;
          font-size: 12px;
          max-width: 60%;
        }
        .guide-mock-msg-ai { align-self: flex-start; color: rgba(255,255,255,0.6); font-size: 12px; max-width: 70%; line-height: 1.6; }

        .guide-highlight {
          background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
          border: 1px solid #86efac;
          border-radius: 16px;
          padding: 28px 32px;
          margin: 32px 0;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .guide-highlight h3 { font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 12px; }
        .guide-highlight ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
        .guide-highlight li { font-size: 14px; color: #166534; display: flex; gap: 8px; align-items: flex-start; }
        .guide-highlight li::before { content: '✓'; font-weight: 700; flex-shrink: 0; }

        .guide-dark-section {
          background: #0f0f1a;
          color: white;
          padding: 80px 40px;
          text-align: center;
        }
        .guide-dark-section h2 {
          font-size: 40px;
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #fff, #19c37d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .guide-dark-section p { color: #666; font-size: 16px; margin-bottom: 32px; }
        .guide-url-badge {
          display: inline-block;
          background: rgba(25,195,125,0.15);
          border: 1px solid rgba(25,195,125,0.3);
          color: #19c37d;
          padding: 12px 28px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .guide-hr { border: none; border-top: 1px solid #e9ecef; margin: 48px 0; }
        .guide-tag {
          display: inline-block;
          background: #f1f3f5;
          color: #495057;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin: 4px;
        }
        .guide-tags { margin-top: 16px; }
        .guide-print-btn {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: #0f0f1a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 100;
          font-family: inherit;
          transition: background 0.2s;
        }
        .guide-print-btn:hover { background: #19c37d; }
        @media print { .guide-print-btn { display: none; } }
      `}</style>

      <div className="guide-body">
        {/* Print button */}
        <button className="guide-print-btn" onClick={() => typeof window !== 'undefined' && window.print()}>
          🖨️ PDF로 저장
        </button>

        {/* Cover */}
        <div className="guide-cover">
          <div className="guide-badge">Service Guide 2025</div>
          <h1>GPTStyler</h1>
          <p className="guide-cover-sub">나만의 AI 채팅 테마 디자이너</p>
          <p className="guide-cover-desc">
            AI가 만들어주는 맞춤형 채팅 테마.<br />
            사이버펑크 도시부터 귀여운 토끼까지 —<br />
            원하는 분위기를 말하면 바로 적용됩니다.
          </p>
          <div className="guide-cover-meta">gptstyler.vercel.app &nbsp;·&nbsp; Powered by Claude Sonnet 4.6</div>
        </div>

        {/* Content */}
        <div className="guide-content">

          {/* Overview */}
          <div className="guide-section">
            <div className="guide-section-label">서비스 소개</div>
            <h2>ChatGPT를 나만의<br />공간으로 꾸미세요</h2>
            <p>
              GPTStyler는 AI와 대화하는 것만으로 나만의 채팅 테마를 만들 수 있는 서비스입니다.
              복잡한 코딩 없이 "사이버펑크 스타일로 만들어줘" 한 마디면
              네온 불빛 도시 배경과 빗속 애니메이션이 즉시 생성됩니다.
              만든 테마는 갤러리에 공유하고 다른 사람들의 작품도 구경할 수 있습니다.
            </p>
            <div className="guide-tags">
              {['AI 테마 생성','실시간 미리보기','SVG 애니메이션','갤러리 공유','테마 채팅방'].map(t => (
                <span key={t} className="guide-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="guide-section">
            <div className="guide-section-label">주요 기능</div>
            <h2>핵심 기능 4가지</h2>
            <div className="guide-features">
              {[
                { icon: '🎨', title: 'AI 테마 디자이너', desc: '원하는 분위기를 텍스트로 설명하거나 이미지를 업로드하면 Claude AI가 맞춤형 CSS 테마를 즉시 생성합니다. 사이버펑크, 자연, 우주, 동물 캐릭터 등 무한한 표현이 가능합니다.' },
                { icon: '✨', title: 'SVG 시각 효과', desc: '단순한 색상 변경이 아닌 실제 SVG 아트가 생성됩니다. 건물 스카이라인, 귀여운 캐릭터, 빗방울 파티클, 벚꽃 낙화 등 살아있는 배경 효과를 경험하세요.' },
                { icon: '💬', title: '테마 채팅방', desc: '생성된 테마가 적용된 전용 채팅 공간에서 AI와 대화하세요. 내가 만든 분위기 속에서 즐기는 새로운 채팅 경험을 제공합니다.' },
                { icon: '🖼️', title: '갤러리 & 커뮤니티', desc: '내가 만든 테마를 갤러리에 공유하고, 다른 사람들의 창작물에 좋아요와 댓글을 남기세요. 마음에 드는 테마를 바로 채팅에 적용할 수 있습니다.' },
              ].map(f => (
                <div key={f.title} className="guide-feature-card">
                  <div className="guide-feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <hr className="guide-hr" />

          {/* How to use */}
          <div className="guide-section">
            <div className="guide-section-label">사용 방법</div>
            <h2>3단계로 시작하기</h2>
            <div className="guide-steps">
              {[
                {
                  title: 'AI 디자이너에서 테마 요청',
                  desc: (
                    <>
                      상단 메뉴 "AI 디자인" 클릭 → 원하는 테마를 자유롭게 입력하세요.<br />
                      <em style={{ color: '#19c37d' }}>"사이버펑크 스타일. 네온 핑크와 청록색"</em><br />
                      <em style={{ color: '#19c37d' }}>"귀여운 토끼 캐릭터가 있는 핑크 테마"</em><br />
                      이미지를 첨부해서 그 분위기로 만들어달라고 할 수도 있습니다.
                    </>
                  ),
                },
                {
                  title: '실시간 생성 & 미리보기 확인',
                  desc: 'AI가 테마를 생성하는 동안 오른쪽 미리보기 패널이 실시간으로 업데이트됩니다. 색상부터 SVG 애니메이션까지 점점 완성되는 모습을 볼 수 있습니다. 마음에 안 들면 "더 어둡게 해줘", "별 효과 추가해줘"처럼 수정 요청하면 됩니다.',
                },
                {
                  title: '채팅하거나 갤러리에 공유',
                  desc: '"이 테마로 채팅하기" 버튼으로 내 테마가 적용된 전용 채팅방 입장. 또는 이름과 닉네임을 입력하고 "공유하기"로 갤러리에 업로드해서 다른 사람들과 나눌 수 있습니다.',
                },
              ].map((s, i) => (
                <div key={i} className="guide-step">
                  <div className="guide-step-num">{i + 1}</div>
                  <div className="guide-step-content">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock preview */}
          <div className="guide-screenshot">
            <div className="guide-screenshot-bar">
              <div className="guide-dot r"></div>
              <div className="guide-dot y"></div>
              <div className="guide-dot g"></div>
              <span style={{ color: '#555', fontSize: 12, marginLeft: 8 }}>GPTStyler Chat — 사이버펑크 테마</span>
            </div>
            <div className="guide-screenshot-body">
              <div className="guide-screenshot-mock">
                <div className="guide-mock-sidebar">
                  {[80, 65, 75, 55].map((w, i) => (
                    <div key={i} className="guide-mock-sidebar-item" style={{ width: `${w}%`, ...(i === 0 ? { height: 10, marginBottom: 16, background: 'rgba(255,255,255,0.2)' } : {}) }} />
                  ))}
                </div>
                <div className="guide-mock-main">
                  <div className="guide-mock-msg-user">사이버펑크 도시 테마로 만들어줘</div>
                  <div className="guide-mock-msg-ai">
                    🎨 네온 불빛 가득한 미래 도시 테마를 생성했습니다.<br />
                    건물 스카이라인과 빗방울 이펙트가 포함되어 있어요.
                  </div>
                  <div className="guide-mock-msg-user">더 어둡게 해줘</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>● ● ●</div>
                </div>
              </div>
            </div>
          </div>

          <hr className="guide-hr" />

          {/* Tips */}
          <div className="guide-section">
            <div className="guide-section-label">활용 팁</div>
            <h2>더 좋은 테마 만드는 법</h2>
            <div className="guide-highlight">
              <h3>추천 프롬프트 패턴</h3>
              <ul>
                {[
                  <><strong>장소 + 분위기:</strong> "도쿄 골목길 느낌. 어둡고 습한 네온"</>,
                  <><strong>캐릭터 요청:</strong> "귀여운 고양이 캐릭터가 구석에서 졸고 있는 테마"</>,
                  <><strong>계절/날씨:</strong> "벚꽃 흩날리는 봄날 테마. 분홍색 꽃잎 파티클"</>,
                  <><strong>장르:</strong> "판타지 RPG 스타일. 마법진과 마나 이펙트"</>,
                  <><strong>수정 요청:</strong> 생성 후 "배경 더 어둡게", "캐릭터 더 크게" 등 추가 요청 가능</>,
                ].map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>

          {/* Tech */}
          <div className="guide-section">
            <div className="guide-section-label">기술 스택</div>
            <h2>서비스를 이루는 기술들</h2>
            <p style={{ marginBottom: 24 }}>GPTStyler는 최신 웹 기술과 AI를 결합해 만들어졌습니다.</p>
            <div className="guide-features">
              {[
                { icon: '🤖', title: 'Claude Sonnet 4.6', desc: 'Anthropic의 최신 AI 모델. 높은 품질의 CSS와 상세한 SVG 아트를 생성합니다. 스트리밍으로 실시간 출력.' },
                { icon: '⚡', title: 'Groq (Llama 3.3)', desc: '채팅 기능에 사용. 극도로 빠른 추론 속도로 실시간 스트리밍 대화를 제공합니다. 무료 플랜 제공.' },
                { icon: '🌐', title: 'Next.js 14', desc: 'App Router 기반 풀스택 프레임워크. API Routes로 서버 기능을 통합 관리합니다.' },
                { icon: '🗄️', title: 'Supabase', desc: 'PostgreSQL 기반 백엔드. 스타일 갤러리, 좋아요, 댓글, 조회수를 저장합니다.' },
              ].map(f => (
                <div key={f.title} className="guide-feature-card">
                  <div className="guide-feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="guide-dark-section">
          <h2>지금 바로 시작하세요</h2>
          <p>가입 없이 무료로 테마를 만들어보세요</p>
          <div className="guide-url-badge">gptstyler.vercel.app</div>
        </div>
      </div>
    </>
  );
}
