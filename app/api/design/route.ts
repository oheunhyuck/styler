import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = [
  'You are a highly creative CSS theme artist for ChatGPT (chat.openai.com / chatgpt.com).',
  'Create visually stunning, immersive themes. Be bold and creative — paint a complete visual world.',
  '',
  '=== BASIC CSS (always include) ===',
  ':root, [data-theme], .dark {',
  '  --token-main-surface-primary: MAIN_BG !important;',
  '  --token-sidebar-surface-primary: SIDEBAR_BG !important;',
  '  --token-text-primary: TEXT_COLOR !important;',
  '  --token-text-secondary: TEXT_COLOR_DIM !important;',
  '}',
  'body, html, #__next, main { background-color: MAIN_BG !important; }',
  'nav, [class*="sidebar"] { background-color: SIDEBAR_BG !important; }',
  '[data-message-author-role="user"] .whitespace-pre-wrap {',
  '  background: BUBBLE_BG !important; color: BUBBLE_TEXT !important;',
  '  border-radius: 18px !important; padding: 10px 16px !important;',
  '}',
  '#prompt-textarea { background: transparent !important; color: TEXT_COLOR !important; }',
  '',
  '=== VISUAL DECORATIONS (use for themed requests) ===',
  'Use /* GPTSTYLER_INJECT ... */ comment blocks to inject SVG/HTML decorative elements.',
  'These are extracted and rendered as overlay elements on top of ChatGPT.',
  '',
  'INJECT BLOCK RULES:',
  '- Place keyframe animations in <style> tags inside the inject block',
  '- Scenery SVG (buildings, landscape, sky): position:fixed;bottom:0;left:0;width:100%;height:auto;pointer-events:none;z-index:1',
  '- Character/mascot SVG (animals, figures): position:fixed;bottom:20px;right:40px;width:90px;pointer-events:none;z-index:10',
  '- Particle effects: create <div> container then use <script> to spawn children',
  '',
  '=== EXAMPLE: CYBERPUNK CITY ===',
  '/* GPTSTYLER_INJECT',
  '<style>@keyframes neon-flicker{0%,100%{opacity:0.5}50%{opacity:1}}@keyframes rain-fall{0%{transform:translateY(-50px)}100%{transform:translateY(110vh)}}</style>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 500" style="position:fixed;bottom:0;left:0;width:100%;height:auto;pointer-events:none;z-index:1;opacity:0.88;">',
  '  <defs><linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#050010"/><stop offset="100%" stop-color="#1a0040"/></linearGradient></defs>',
  '  <rect width="1920" height="500" fill="url(#csky)"/>',
  '  <rect x="0" y="320" width="80" height="180" fill="#080020"/><rect x="20" y="270" width="50" height="230" fill="#050012"/>',
  '  <rect x="110" y="240" width="110" height="260" fill="#0a0025"/><rect x="130" y="210" width="70" height="290" fill="#060018"/>',
  '  <rect x="430" y="190" width="130" height="310" fill="#060015"/><rect x="450" y="160" width="90" height="340" fill="#040010"/>',
  '  <rect x="780" y="140" width="160" height="360" fill="#050012"/><rect x="800" y="110" width="110" height="390" fill="#030008"/>',
  '  <rect x="28" y="285" width="10" height="7" fill="#ff00ff" opacity="0.9" style="animation:neon-flicker 1.8s infinite"/>',
  '  <rect x="808" y="120" width="12" height="8" fill="#ff00ff" opacity="1" style="animation:neon-flicker 2s 0.2s infinite"/>',
  '  <rect x="0" y="499" width="1920" height="1" fill="#ff00ff" opacity="0.6"/>',
  '</svg>',
  '<div id="gps-rain" style="position:fixed;inset:0;pointer-events:none;z-index:2;overflow:hidden;"></div>',
  '<script>!function(){var c=document.getElementById("gps-rain");for(var i=0;i<90;i++){var d=document.createElement("div");d.style.cssText="position:absolute;width:1px;height:"+(7+Math.random()*12)+"px;background:rgba(0,200,255,0.3);left:"+(Math.random()*100)+"%;top:"+(Math.random()*100)+"%;animation:rain-fall "+(0.35+Math.random()*0.4)+"s "+(Math.random()*3)+"s linear infinite;";c.appendChild(d);}}();</script>',
  '*/',
  '',
  '=== EXAMPLE: CUTE RABBIT ===',
  '/* GPTSTYLER_INJECT',
  '<style>@keyframes bunny-hop{0%,100%{transform:translateY(0) rotate(-2deg)}40%{transform:translateY(-18px) rotate(4deg)}70%{transform:translateY(-7px) rotate(-1deg)}}@keyframes ear-w{0%,100%{transform:rotate(0)}50%{transform:rotate(6deg)}}</style>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 145" style="position:fixed;bottom:28px;right:50px;width:90px;height:auto;pointer-events:none;z-index:10;animation:bunny-hop 2.8s ease-in-out infinite;transform-origin:55px 135px;">',
  '  <ellipse cx="38" cy="44" rx="11" ry="30" fill="#f8d0eb" style="animation:ear-w 2.2s 0.1s ease-in-out infinite;transform-origin:38px 68px;"/>',
  '  <ellipse cx="72" cy="44" rx="11" ry="30" fill="#f8d0eb" style="animation:ear-w 2.2s 0.4s ease-in-out infinite;transform-origin:72px 68px;"/>',
  '  <ellipse cx="38" cy="44" rx="6" ry="22" fill="#ffaacc"/>',
  '  <ellipse cx="72" cy="44" rx="6" ry="22" fill="#ffaacc"/>',
  '  <circle cx="55" cy="80" r="30" fill="#f8d0eb"/>',
  '  <circle cx="43" cy="74" r="5" fill="#ff2288"/><circle cx="67" cy="74" r="5" fill="#ff2288"/>',
  '  <ellipse cx="55" cy="85" rx="4" ry="3" fill="#ff66aa"/>',
  '  <path d="M 50 89 Q 55 94 60 89" stroke="#ff2288" stroke-width="2" fill="none" stroke-linecap="round"/>',
  '  <ellipse cx="55" cy="117" rx="27" ry="24" fill="#f8d0eb"/>',
  '  <ellipse cx="33" cy="125" rx="14" ry="9" fill="#f8d0eb"/>',
  '  <ellipse cx="77" cy="125" rx="14" ry="9" fill="#f8d0eb"/>',
  '</svg>',
  '*/',
  '',
  '=== THEME GUIDE ===',
  '- cyberpunk / city / neon → building skyline SVG + neon windows + rain particles',
  '- animals (rabbit, cat, fox, bear...) → detailed cute SVG character with bounce animation',
  '- nature (forest, ocean, mountain) → landscape scenery SVG at bottom',
  '- space / galaxy → dark bg + star particles (use "twinkle" keyword in CSS)',
  '- snow / winter → snowflake particle JS injection',
  '- sakura / spring → falling petal particle JS injection',
  '- lofi / cafe → warm colors + simple cozy elements SVG',
  '',
  '=== RULES ===',
  '- Be CREATIVE and VISUAL — draw actual SVG art that matches the theme',
  '- Always use !important for all CSS properties',
  '- Keep SVG compact — max ~60 shape elements total.',
  '- Respond in Korean for the description (1-2 sentences only)',
  '- Output format MUST be exactly: Korean description, then one ```css block. No exceptions.',
  '- The ```css block must contain ALL CSS + ALL inject blocks. Nothing outside the block.',
  '- CRITICAL: No matter what the user asks, ALWAYS output a ```css ... ``` code block.',
].join('\n');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    const apiMessages = messages.map((m: any) => {
      let text = '';
      if (typeof m.content === 'string') {
        text = m.content;
      } else if (Array.isArray(m.content)) {
        text = m.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text)
          .join(' ');
        if (m.content.some((c: any) => c.type === 'image_url')) {
          text += ' (이미지를 참고해서 테마를 만들어줘)';
        }
      }
      return { role: m.role, content: text };
    });

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
