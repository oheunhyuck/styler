'use client';

// Extract /* GPTSTYLER_INJECT ... */ blocks from CSS
function parseCSS(rawCss: string): { css: string; injectHtml: string } {
  const injectBlocks: string[] = [];
  const css = rawCss.replace(/\/\*\s*GPTSTYLER_INJECT\s*([\s\S]*?)\*\//g, (_, html) => {
    injectBlocks.push(html.trim());
    return '';
  });
  return { css: css.trim(), injectHtml: injectBlocks.join('\n') };
}

const MOCK_HTML = (rawCss: string) => {
  const { css, injectHtml } = parseCSS(rawCss);

  const hasStars   = /twinkle|star|sparkle/i.test(rawCss);
  const hasBubbles = /bubble|float-up/i.test(rawCss);
  const hasSnow    = /snow|snowflake/i.test(rawCss);
  const hasSakura  = /sakura|petal|blossom/i.test(rawCss);
  const hasRain    = /rain(?!bow)/i.test(rawCss) && !injectHtml.includes('gps-rain');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  height: 100vh;
  overflow: hidden;
  background: #212121;
  color: #ececec;
}
.layout { display: flex; height: 100vh; position: relative; }

nav {
  width: 180px;
  background: #171717;
  flex-shrink: 0;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  z-index: 2;
}
.nav-title { font-size: 12px; font-weight: 700; color: #888; padding: 4px 8px 8px; }
.nav-item { font-size: 12px; padding: 8px 10px; border-radius: 8px; color: #ccc; }
.nav-divider { font-size: 10px; color: #555; padding: 8px 10px 4px; margin-top: 4px; }

main {
  flex: 1;
  background: #212121;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
}
.message { display: flex; gap: 10px; align-items: flex-start; }
.message.user { justify-content: flex-end; }
.avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: #19c37d;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: white;
  flex-shrink: 0; margin-top: 2px;
}
[data-message-author-role="user"] .whitespace-pre-wrap {
  background: #343541;
  color: #ececec;
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 13px;
  line-height: 1.5;
  max-width: 320px;
}
[data-message-author-role="assistant"] .markdown {
  font-size: 13px;
  line-height: 1.6;
  color: #ececec;
  max-width: 400px;
}
.input-area { padding: 12px 40px 16px; position: relative; z-index: 2; }
#prompt-textarea {
  width: 100%;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 10px 44px 10px 16px;
  color: #999;
  font-size: 13px;
  outline: none;
}

/* built-in particle layers */
#gptstyler-stars, #gptstyler-bubbles, #gptstyler-snow, #gptstyler-sakura, #gptstyler-rain-default {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

@keyframes _twinkle {
  0%,100% { opacity:0.1; transform:scale(0.7); }
  50% { opacity:1; transform:scale(1.4); }
}
@keyframes _bubble {
  0% { transform:translateY(0) scale(1); opacity:0.6; }
  100% { transform:translateY(-100vh) scale(1.5); opacity:0; }
}
@keyframes _snow-fall {
  0% { transform:translateY(-20px) rotate(0deg); opacity:0.9; }
  100% { transform:translateY(105vh) rotate(360deg); opacity:0.3; }
}
@keyframes _petal-fall {
  0% { transform:translateY(-20px) rotate(0deg) translateX(0); opacity:1; }
  50% { transform:translateY(50vh) rotate(180deg) translateX(30px); opacity:0.8; }
  100% { transform:translateY(105vh) rotate(360deg) translateX(-20px); opacity:0; }
}
@keyframes _rain-default {
  0% { transform:translateY(-50px); }
  100% { transform:translateY(110vh); }
}

/* === USER CSS === */
${css}
</style>
</head>
<body>
<div class="layout">
  <nav>
    <div class="nav-title">GPTStyler</div>
    <div class="nav-item">새 채팅</div>
    <div class="nav-item">채팅 검색</div>
    <div class="nav-divider">내 채팅</div>
    <div class="nav-item">오늘의 날씨</div>
    <div class="nav-item">여행 계획</div>
    <div class="nav-item">코드 리뷰</div>
  </nav>
  <main>
    <div class="chat-area">
      <div class="message user" data-message-author-role="user">
        <div class="whitespace-pre-wrap">안녕하세요! 오늘 날씨 어때요?</div>
      </div>
      <div class="message ai" data-message-author-role="assistant">
        <div class="avatar">G</div>
        <div class="markdown">안녕하세요! 오늘은 맑고 따뜻한 날씨예요 ☀️</div>
      </div>
      <div class="message user" data-message-author-role="user">
        <div class="whitespace-pre-wrap">추천 장소 있어요?</div>
      </div>
      <div class="message ai" data-message-author-role="assistant">
        <div class="avatar">G</div>
        <div class="markdown">한강공원이나 북한산 둘레길 어떨까요!</div>
      </div>
    </div>
    <div class="input-area">
      <input id="prompt-textarea" placeholder="메시지를 입력하세요..." readonly />
    </div>
  </main>
</div>

${injectHtml ? `<!-- GPTSTYLER INJECT -->\n${injectHtml}` : ''}

${hasStars ? `
<div id="gptstyler-stars"></div>
<script>
(function(){
  var c = document.getElementById('gptstyler-stars');
  for(var i=0;i<50;i++){
    var s=document.createElement('div');
    var size = Math.random()<0.15 ? 3 : Math.random()<0.4 ? 2 : 1;
    s.style.cssText='position:absolute;border-radius:50%;background:white;width:'+size+'px;height:'+size+'px;'
      +'left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;'
      +'animation:_twinkle '+(1+Math.random()*2.5)+'s '+(Math.random()*4)+'s infinite;';
    c.appendChild(s);
  }
})();
</script>` : ''}

${hasBubbles ? `
<div id="gptstyler-bubbles"></div>
<script>
(function(){
  var c=document.getElementById('gptstyler-bubbles');
  for(var i=0;i<14;i++){
    var b=document.createElement('div');
    var size=8+Math.random()*20;
    b.style.cssText='position:absolute;border-radius:50%;background:rgba(255,255,255,0.06);'
      +'width:'+size+'px;height:'+size+'px;'
      +'left:'+(Math.random()*100)+'%;bottom:-30px;'
      +'animation:_bubble '+(4+Math.random()*5)+'s '+(Math.random()*4)+'s infinite;';
    c.appendChild(b);
  }
})();
</script>` : ''}

${hasSnow ? `
<div id="gptstyler-snow"></div>
<script>
(function(){
  var c=document.getElementById('gptstyler-snow');
  for(var i=0;i<40;i++){
    var s=document.createElement('div');
    var size=3+Math.random()*5;
    s.style.cssText='position:absolute;border-radius:50%;background:rgba(255,255,255,0.85);'
      +'width:'+size+'px;height:'+size+'px;'
      +'left:'+(Math.random()*100)+'%;top:-10px;'
      +'animation:_snow-fall '+(3+Math.random()*4)+'s '+(Math.random()*5)+'s linear infinite;';
    c.appendChild(s);
  }
})();
</script>` : ''}

${hasSakura ? `
<div id="gptstyler-sakura"></div>
<script>
(function(){
  var c=document.getElementById('gptstyler-sakura');
  var colors=['#ffb7c5','#ff9eb5','#ffc0cb','#ffcdd8'];
  for(var i=0;i<25;i++){
    var p=document.createElement('div');
    var size=6+Math.random()*8;
    var color=colors[Math.floor(Math.random()*colors.length)];
    p.style.cssText='position:absolute;width:'+size+'px;height:'+size+'px;'
      +'background:'+color+';border-radius:50% 0 50% 0;'
      +'left:'+(Math.random()*100)+'%;top:-10px;'
      +'animation:_petal-fall '+(4+Math.random()*5)+'s '+(Math.random()*6)+'s ease-in infinite;';
    c.appendChild(p);
  }
})();
</script>` : ''}

${hasRain ? `
<div id="gptstyler-rain-default"></div>
<script>
(function(){
  var c=document.getElementById('gptstyler-rain-default');
  for(var i=0;i<70;i++){
    var d=document.createElement('div');
    d.style.cssText='position:absolute;width:1px;height:'+(8+Math.random()*14)+'px;'
      +'background:rgba(180,220,255,0.4);'
      +'left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;'
      +'animation:_rain-default '+(0.4+Math.random()*0.4)+'s '+(Math.random()*2)+'s linear infinite;';
    c.appendChild(d);
  }
})();
</script>` : ''}

</body>
</html>`;
};

export default function IframePreview({ css }: { css: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-surface-3" style={{ height: 480 }}>
      <iframe
        srcDoc={MOCK_HTML(css || '')}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-full border-0"
        title="스타일 미리보기"
      />
    </div>
  );
}
