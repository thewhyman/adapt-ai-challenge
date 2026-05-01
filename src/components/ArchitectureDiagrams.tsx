"use client";

import { useState } from "react";

const SVG_D1 = `<svg width="1100" height="420" viewBox="0 0 1100 420" xmlns="http://www.w3.org/2000/svg">
<defs>
  <marker id="arr-main" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
    <path d="M0,0 L0,10 L10,5 z" fill="#4b5563"/>
  </marker>
  <filter id="glow-orange" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="8" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glow-purple" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="8" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glow-teal" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="8" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="glow-soft">
    <feGaussianBlur stdDeviation="3" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<rect x="0" y="0" width="1100" height="420" rx="20" fill="#111113" stroke="#1f2937" stroke-width="1"/>
<rect x="0" y="0" width="1100" height="5" fill="#f97316"/>
<text x="550" y="40" text-anchor="middle" fill="#f9fafb" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="15" font-weight="700" letter-spacing="3">ADAPT AI — SYSTEM ARCHITECTURE</text>
<text x="550" y="62" text-anchor="middle" fill="#4b5563" font-family="-apple-system,sans-serif" font-size="10" letter-spacing="2">ONE KNOWLEDGE BASE. INFINITE CAMPAIGNS. ZERO REWORK.</text>
<rect x="50" y="95" width="290" height="240" rx="18" fill="#0f0f0f" stroke="#f97316" stroke-width="2" filter="url(#glow-orange)"/>
<rect x="50" y="95" width="290" height="6" rx="3" fill="#f97316"/>
<text x="195" y="138" text-anchor="middle" fill="#fb923c" font-family="-apple-system,sans-serif" font-size="14" font-weight="700" letter-spacing="2">INGESTION ENGINE</text>
<text x="195" y="163" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="11">Connects any source</text>
<rect x="80" y="178" width="110" height="24" rx="6" fill="#1c1008" stroke="#92400e" stroke-width="1"/>
<text x="135" y="194" text-anchor="middle" fill="#fb923c" font-family="-apple-system,sans-serif" font-size="10">Company Website</text>
<rect x="200" y="178" width="110" height="24" rx="6" fill="#1c1008" stroke="#92400e" stroke-width="1"/>
<text x="255" y="194" text-anchor="middle" fill="#fb923c" font-family="-apple-system,sans-serif" font-size="10">Docs &amp; PDFs</text>
<rect x="80" y="210" width="110" height="24" rx="6" fill="#1c1008" stroke="#92400e" stroke-width="1"/>
<text x="135" y="226" text-anchor="middle" fill="#fb923c" font-family="-apple-system,sans-serif" font-size="10">Slack / Teams</text>
<rect x="200" y="210" width="110" height="24" rx="6" fill="#1c1008" stroke="#92400e" stroke-width="1"/>
<text x="255" y="226" text-anchor="middle" fill="#fb923c" font-family="-apple-system,sans-serif" font-size="10">Internal Wiki</text>
<rect x="80" y="242" width="110" height="24" rx="6" fill="#1c1008" stroke="#92400e" stroke-width="1"/>
<text x="135" y="258" text-anchor="middle" fill="#fb923c" font-family="-apple-system,sans-serif" font-size="10">API Feeds</text>
<rect x="200" y="242" width="110" height="24" rx="6" fill="#1c1008" stroke="#92400e" stroke-width="1"/>
<text x="255" y="258" text-anchor="middle" fill="#fb923c" font-family="-apple-system,sans-serif" font-size="10">Any Source ···</text>
<line x1="80" y1="284" x2="310" y2="284" stroke="#1f2937" stroke-width="1"/>
<text x="195" y="306" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="10">normalize · chunk · deduplicate</text>
<text x="195" y="322" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="10">version-track · index</text>
<line x1="340" y1="215" x2="390" y2="215" stroke="#4b5563" stroke-width="2" marker-end="url(#arr-main)"/>
<text x="365" y="207" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="9">structured</text>
<text x="365" y="225" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="9">knowledge</text>
<rect x="390" y="95" width="320" height="240" rx="18" fill="#0f0f0f" stroke="#7c3aed" stroke-width="2" filter="url(#glow-purple)"/>
<rect x="390" y="95" width="320" height="6" rx="3" fill="#7c3aed"/>
<text x="550" y="138" text-anchor="middle" fill="#a78bfa" font-family="-apple-system,sans-serif" font-size="14" font-weight="700" letter-spacing="2">EXTRACTION ENGINE</text>
<text x="550" y="158" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="11">Builds the Knowledge Graph</text>
<circle cx="550" cy="245" r="72" fill="#0c0818" stroke="#6d28d9" stroke-width="2"/>
<text x="550" y="235" text-anchor="middle" fill="#c4b5fd" font-family="-apple-system,sans-serif" font-size="13" font-weight="700">Knowledge</text>
<text x="550" y="253" text-anchor="middle" fill="#c4b5fd" font-family="-apple-system,sans-serif" font-size="13" font-weight="700">Graph</text>
<circle cx="550" cy="175" r="18" fill="#1a0a2e" stroke="#7c3aed" stroke-width="1.5"/>
<text x="550" y="179" text-anchor="middle" fill="#a78bfa" font-family="-apple-system,sans-serif" font-size="10">Sections</text>
<circle cx="614" cy="205" r="18" fill="#1a0a2e" stroke="#7c3aed" stroke-width="1.5"/>
<text x="614" y="209" text-anchor="middle" fill="#a78bfa" font-family="-apple-system,sans-serif" font-size="10">Concepts</text>
<circle cx="620" cy="270" r="18" fill="#1a0a2e" stroke="#7c3aed" stroke-width="1.5"/>
<text x="620" y="274" text-anchor="middle" fill="#a78bfa" font-family="-apple-system,sans-serif" font-size="10">Relations</text>
<circle cx="590" cy="310" r="18" fill="#1a0a2e" stroke="#7c3aed" stroke-width="1.5"/>
<text x="590" y="314" text-anchor="middle" fill="#a78bfa" font-family="-apple-system,sans-serif" font-size="10">Complexity</text>
<circle cx="486" cy="205" r="18" fill="#1a0a2e" stroke="#7c3aed" stroke-width="1.5"/>
<text x="486" y="209" text-anchor="middle" fill="#a78bfa" font-family="-apple-system,sans-serif" font-size="10">Orgs</text>
<line x1="550" y1="226" x2="550" y2="193" stroke="#4c1d95" stroke-width="1"/>
<line x1="561" y1="228" x2="598" y2="214" stroke="#4c1d95" stroke-width="1"/>
<line x1="567" y1="242" x2="603" y2="260" stroke="#4c1d95" stroke-width="1"/>
<line x1="539" y1="228" x2="504" y2="214" stroke="#4c1d95" stroke-width="1"/>
<rect x="410" y="336" width="280" height="20" rx="5" fill="#1e0050" stroke="#7c3aed" stroke-width="1"/>
<text x="550" y="350" text-anchor="middle" fill="#8b5cf6" font-family="-apple-system,sans-serif" font-size="9" font-weight="700" letter-spacing="1">LEARN ONCE · PUBLISH FOREVER</text>
<line x1="710" y1="215" x2="760" y2="215" stroke="#4b5563" stroke-width="2" marker-end="url(#arr-main)"/>
<text x="735" y="207" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="9">targeted</text>
<text x="735" y="225" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="9">content</text>
<rect x="760" y="95" width="290" height="240" rx="18" fill="#0f0f0f" stroke="#14b8a6" stroke-width="2" filter="url(#glow-teal)"/>
<rect x="760" y="95" width="290" height="6" rx="3" fill="#14b8a6"/>
<text x="905" y="138" text-anchor="middle" fill="#5eead4" font-family="-apple-system,sans-serif" font-size="14" font-weight="700" letter-spacing="2">DISTRIBUTION ENGINE</text>
<text x="905" y="158" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="11">Any audience · Any platform</text>
<rect x="780" y="172" width="122" height="44" rx="8" fill="#0a1525" stroke="#1d4ed8" stroke-width="1.5"/>
<text x="841" y="190" text-anchor="middle" fill="#93c5fd" font-family="-apple-system,sans-serif" font-size="10" font-weight="600">Audience Profile</text>
<text x="841" y="207" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="9">who · threshold</text>
<rect x="912" y="172" width="118" height="44" rx="8" fill="#0a1525" stroke="#0f766e" stroke-width="1.5"/>
<text x="971" y="190" text-anchor="middle" fill="#5eead4" font-family="-apple-system,sans-serif" font-size="10" font-weight="600">Output Format</text>
<text x="971" y="207" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="9">how · structure</text>
<rect x="835" y="228" width="140" height="36" rx="8" fill="#1a0a2e" stroke="#7c3aed" stroke-width="1.5"/>
<text x="905" y="246" text-anchor="middle" fill="#c4b5fd" font-family="-apple-system,sans-serif" font-size="10" font-weight="600">Voice Engine  ✦</text>
<text x="905" y="258" text-anchor="middle" fill="#6b7280" font-family="-apple-system,sans-serif" font-size="9">tone · brand voice</text>
<line x1="780" y1="274" x2="1030" y2="274" stroke="#1f2937" stroke-width="1"/>
<rect x="780" y="284" width="70" height="30" rx="6" fill="#0a1525" stroke="#1d4ed8" stroke-width="1"/>
<text x="815" y="304" text-anchor="middle" fill="#93c5fd" font-family="-apple-system,sans-serif" font-size="9">LinkedIn</text>
<rect x="858" y="284" width="58" height="30" rx="6" fill="#0e0e14" stroke="#374151" stroke-width="1"/>
<text x="887" y="304" text-anchor="middle" fill="#9ca3af" font-family="-apple-system,sans-serif" font-size="9">X / Twitter</text>
<rect x="924" y="284" width="50" height="30" rx="6" fill="#0f1a0a" stroke="#15803d" stroke-width="1"/>
<text x="949" y="304" text-anchor="middle" fill="#86efac" font-family="-apple-system,sans-serif" font-size="9">Email</text>
<rect x="782" y="322" width="50" height="30" rx="6" fill="#1a0a00" stroke="#92400e" stroke-width="1"/>
<text x="807" y="342" text-anchor="middle" fill="#fb923c" font-family="-apple-system,sans-serif" font-size="9">Blog</text>
<rect x="840" y="322" width="50" height="30" rx="6" fill="#0a0f1e" stroke="#4338ca" stroke-width="1"/>
<text x="865" y="342" text-anchor="middle" fill="#a5b4fc" font-family="-apple-system,sans-serif" font-size="9">Slack</text>
<rect x="898" y="322" width="80" height="30" rx="6" fill="#0a1a12" stroke="#065f46" stroke-width="1"/>
<text x="938" y="342" text-anchor="middle" fill="#6ee7b7" font-family="-apple-system,sans-serif" font-size="9">API / Custom</text>
<rect x="50" y="358" width="1000" height="40" rx="10" fill="#0d0d10" stroke="#1f2937" stroke-width="1"/>
<text x="550" y="374" text-anchor="middle" fill="#9ca3af" font-family="-apple-system,sans-serif" font-size="11" font-style="italic">"Every ChatGPT conversation forgets you. Adapt AI remembers everything —</text>
<text x="550" y="391" text-anchor="middle" fill="#d1d5db" font-family="-apple-system,sans-serif" font-size="11" font-style="italic">and gets smarter with every document you add."</text>
</svg>`;

const SVG_D2 = `<svg viewBox="0 0 1200 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="d2-arrowOrange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#f97316"/>
    </marker>
    <marker id="d2-arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#3b82f6"/>
    </marker>
    <marker id="d2-arrowPurple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c3aed"/>
    </marker>
    <filter id="d2-glowLLM" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="d2-glowKG" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="d2-kgGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b0dab"/>
      <stop offset="60%" stop-color="#1e0a5e"/>
      <stop offset="100%" stop-color="#0f0820"/>
    </radialGradient>
  </defs>
  <rect x="0.75" y="0.75" width="1198.5" height="558.5" fill="#111113" stroke="#f97316" stroke-width="1.5" rx="6"/>
  <rect x="0" y="0" width="1200" height="5" fill="#f97316"/>
  <text x="600" y="34" text-anchor="middle" fill="#f97316" font-size="14" font-weight="700" letter-spacing="3" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">INGESTION ENGINE</text>
  <text x="600" y="54" text-anchor="middle" fill="#9ca3af" font-size="10" letter-spacing="2" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">ANY SOURCE  ·  CONTINUOUSLY GROWING  ·  KNOWLEDGE BASE GROWS WITH EVERY DOCUMENT</text>
  <rect x="40" y="100" width="190" height="58" rx="12" fill="#1c1008" stroke="#f97316" stroke-width="2"/>
  <text x="135" y="125" text-anchor="middle" fill="#fed7aa" font-size="13" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Company Website</text>
  <text x="135" y="143" text-anchor="middle" fill="#fb923c" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">crawl · index</text>
  <rect x="40" y="185" width="190" height="58" rx="12" fill="#1c1008" stroke="#f97316" stroke-width="2"/>
  <text x="135" y="210" text-anchor="middle" fill="#fed7aa" font-size="13" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Docs &amp; PDFs</text>
  <text x="135" y="228" text-anchor="middle" fill="#fb923c" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Word · MD · Notion</text>
  <rect x="40" y="270" width="190" height="58" rx="12" fill="#1c1008" stroke="#f97316" stroke-width="2"/>
  <text x="135" y="295" text-anchor="middle" fill="#fed7aa" font-size="13" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Slack / Teams</text>
  <text x="135" y="313" text-anchor="middle" fill="#fb923c" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">internal comms</text>
  <rect x="40" y="355" width="190" height="58" rx="12" fill="#1c1008" stroke="#f97316" stroke-width="2"/>
  <text x="135" y="380" text-anchor="middle" fill="#fed7aa" font-size="13" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Internal Wiki</text>
  <text x="135" y="398" text-anchor="middle" fill="#fb923c" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Confluence · GitBook</text>
  <rect x="40" y="440" width="190" height="58" rx="12" fill="#1c1008" stroke="#f97316" stroke-width="2"/>
  <text x="135" y="465" text-anchor="middle" fill="#fed7aa" font-size="13" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">API Feeds</text>
  <text x="135" y="483" text-anchor="middle" fill="#fb923c" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">CRM · product data</text>
  <line x1="230" y1="129" x2="270" y2="215" stroke="#f97316" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#d2-arrowOrange)"/>
  <line x1="230" y1="214" x2="270" y2="238" stroke="#f97316" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#d2-arrowOrange)"/>
  <line x1="230" y1="299" x2="270" y2="270" stroke="#f97316" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#d2-arrowOrange)"/>
  <line x1="230" y1="384" x2="270" y2="302" stroke="#f97316" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#d2-arrowOrange)"/>
  <line x1="230" y1="469" x2="270" y2="325" stroke="#f97316" stroke-width="1.8" stroke-dasharray="5,3" marker-end="url(#d2-arrowOrange)"/>
  <rect x="270" y="190" width="210" height="160" rx="14" fill="#0c1a2e" stroke="#1d4ed8" stroke-width="2"/>
  <text x="375" y="225" text-anchor="middle" fill="#93c5fd" font-size="13" font-weight="700" letter-spacing="2" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">COLLECTOR</text>
  <line x1="305" y1="240" x2="445" y2="240" stroke="#1d4ed8" stroke-width="1" opacity="0.5"/>
  <text x="375" y="270" text-anchor="middle" fill="#6b7280" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">normalize format</text>
  <text x="375" y="293" text-anchor="middle" fill="#6b7280" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">chunk · clean · tag</text>
  <text x="375" y="316" text-anchor="middle" fill="#6b7280" font-size="10" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">deduplicate · version-track</text>
  <line x1="480" y1="270" x2="546" y2="270" stroke="#3b82f6" stroke-width="2.5" marker-end="url(#d2-arrowBlue)"/>
  <g filter="url(#d2-glowLLM)">
    <circle cx="620" cy="270" r="70" fill="#0f0f11" stroke="#6366f1" stroke-width="3"/>
  </g>
  <text x="620" y="278" text-anchor="middle" fill="#818cf8" font-size="16" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">LLM Engine</text>
  <line x1="690" y1="270" x2="811" y2="270" stroke="#7c3aed" stroke-width="2.5" marker-end="url(#d2-arrowPurple)"/>
  <circle cx="960" cy="270" r="156" fill="none" stroke="#4c1d95" stroke-width="1.5" opacity="0.3"/>
  <g filter="url(#d2-glowKG)">
    <circle cx="960" cy="270" r="145" fill="url(#d2-kgGradient)" stroke="#7c3aed" stroke-width="3"/>
  </g>
  <text x="960" y="255" text-anchor="middle" fill="#c4b5fd" font-size="18" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Knowledge Graph</text>
  <text x="960" y="280" text-anchor="middle" fill="#8b5cf6" font-size="11" letter-spacing="1" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Company Knowledge Base</text>
  <text x="960" y="300" text-anchor="middle" fill="#8b5cf6" font-size="9" font-style="italic" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">permanent · queryable · audience-agnostic</text>
  <text x="960" y="330" text-anchor="middle" fill="#4b5563" font-size="9" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">← grows with every document</text>
  <text x="600" y="540" text-anchor="middle" fill="#6b7280" font-size="10" letter-spacing="3" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">STEP 1 OF 3  ·  INGESTION ENGINE  ·  ADAPT AI</text>
</svg>`;

const SVG_D3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 640" width="1100" height="640">
  <defs>
    <filter id="d3-llmGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="d3-kgGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="d3-satGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="d3-kgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2a0870"/>
      <stop offset="100%" stop-color="#0d0520"/>
    </radialGradient>
    <marker id="d3-arrowDashed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c3aed"/>
    </marker>
    <marker id="d3-arrowSolid" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#7c3aed"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="1100" height="640" fill="#111113" stroke="#7c3aed" stroke-width="1.5"/>
  <rect x="0" y="0" width="1100" height="5" fill="#7c3aed"/>
  <text x="550" y="32" text-anchor="middle" fill="#8b5cf6" font-size="14" font-weight="700" letter-spacing="3">EXTRACTION ENGINE</text>
  <text x="550" y="50" text-anchor="middle" fill="#6b7280" font-size="10" letter-spacing="2">READ ONCE  ·  UNDERSTAND EVERYTHING  ·  SERVE ANY AUDIENCE FOREVER</text>
  <rect x="30" y="250" width="165" height="160" rx="12" fill="#0e1116" stroke="#374151" stroke-width="1.5"/>
  <text x="112.5" y="278" text-anchor="middle" fill="#9ca3af" font-size="11" font-weight="700" letter-spacing="1.5">DOCUMENT</text>
  <line x1="50" y1="290" x2="175" y2="290" stroke="#1f2937" stroke-width="1"/>
  <text x="112.5" y="313" text-anchor="middle" fill="#6b7280" font-size="10">Product Spec</text>
  <text x="112.5" y="332" text-anchor="middle" fill="#6b7280" font-size="10">Technical Paper</text>
  <text x="112.5" y="351" text-anchor="middle" fill="#6b7280" font-size="10">Internal Report</text>
  <text x="112.5" y="370" text-anchor="middle" fill="#6b7280" font-size="10">Blog Post</text>
  <text x="112.5" y="400" text-anchor="middle" fill="#10b981" font-size="9" font-style="italic">← from Ingestion Engine</text>
  <line x1="195" y1="330" x2="240" y2="330" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#d3-arrowDashed)"/>
  <g filter="url(#d3-llmGlow)">
    <circle cx="300" cy="330" r="58" fill="#0f0f11" stroke="#6366f1" stroke-width="2.5"/>
  </g>
  <text x="300" y="335" text-anchor="middle" fill="#818cf8" font-size="14" font-weight="700">LLM Engine</text>
  <line x1="358" y1="330" x2="462" y2="330" stroke="#7c3aed" stroke-width="2.5" marker-end="url(#d3-arrowSolid)"/>
  <circle cx="620" cy="330" r="168" fill="none" stroke="#4c1d95" stroke-width="1" opacity="0.1"/>
  <circle cx="620" cy="330" r="158" fill="none" stroke="#6d28d9" stroke-width="1" opacity="0.1"/>
  <line x1="620" y1="175" x2="620" y2="140" stroke="#4c1d95" stroke-width="1.5" opacity="0.8"/>
  <line x1="754" y1="253" x2="785" y2="235" stroke="#4c1d95" stroke-width="1.5" opacity="0.8"/>
  <line x1="754" y1="407" x2="785" y2="425" stroke="#4c1d95" stroke-width="1.5" opacity="0.8"/>
  <line x1="620" y1="485" x2="620" y2="520" stroke="#4c1d95" stroke-width="1.5" opacity="0.8"/>
  <line x1="486" y1="407" x2="455" y2="425" stroke="#4c1d95" stroke-width="1.5" opacity="0.8"/>
  <line x1="486" y1="253" x2="455" y2="235" stroke="#4c1d95" stroke-width="1.5" opacity="0.8"/>
  <g filter="url(#d3-kgGlow)">
    <circle cx="620" cy="330" r="155" fill="url(#d3-kgGrad)" stroke="#7c3aed" stroke-width="3"/>
  </g>
  <text x="620" y="315" text-anchor="middle" fill="#c4b5fd" font-size="18" font-weight="700">Knowledge</text>
  <text x="620" y="338" text-anchor="middle" fill="#c4b5fd" font-size="18" font-weight="700">Graph</text>
  <text x="620" y="358" text-anchor="middle" fill="#8b5cf6" font-size="10" font-weight="600" letter-spacing="0.5">Company Knowledge Base</text>
  <text x="620" y="374" text-anchor="middle" fill="#8b5cf6" font-size="9" font-style="italic">Structure × Concepts × Relationships</text>
  <text x="620" y="386" text-anchor="middle" fill="#8b5cf6" font-size="9" font-style="italic">× Depth Score × Sources</text>
  <g filter="url(#d3-satGlow)">
    <circle cx="620" cy="100" r="40" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
  </g>
  <text x="620" y="98" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="600">Structure</text>
  <text x="620" y="114" text-anchor="middle" fill="#a78bfa" font-size="9">intro · body · CTA</text>
  <g filter="url(#d3-satGlow)">
    <circle cx="819" cy="215" r="40" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
  </g>
  <text x="819" y="213" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="600">Concepts</text>
  <text x="819" y="229" text-anchor="middle" fill="#a78bfa" font-size="9">entities · terms</text>
  <g filter="url(#d3-satGlow)">
    <circle cx="819" cy="445" r="40" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
  </g>
  <text x="819" y="443" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="600">Relationships</text>
  <text x="819" y="459" text-anchor="middle" fill="#a78bfa" font-size="9">how ideas connect</text>
  <g filter="url(#d3-satGlow)">
    <circle cx="620" cy="560" r="40" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
  </g>
  <text x="620" y="558" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="600">Depth Score</text>
  <text x="620" y="574" text-anchor="middle" fill="#a78bfa" font-size="9">exec → technical</text>
  <g filter="url(#d3-satGlow)">
    <circle cx="421" cy="445" r="40" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
  </g>
  <text x="421" y="443" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="600">Sources</text>
  <text x="421" y="459" text-anchor="middle" fill="#a78bfa" font-size="9">who said it</text>
  <g filter="url(#d3-satGlow)">
    <circle cx="421" cy="215" r="40" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
  </g>
  <text x="421" y="213" text-anchor="middle" fill="#a78bfa" font-size="11" font-weight="600">Context</text>
  <text x="421" y="229" text-anchor="middle" fill="#a78bfa" font-size="9">when · where · why</text>
  <rect x="0" y="618" width="1100" height="22" fill="#0a0612"/>
  <text x="550" y="630" text-anchor="middle" fill="#6b7280" font-size="10" font-weight="700" letter-spacing="3">UNDERSTAND ONCE  ·  PUBLISH FOREVER  ·  ZERO REWORK</text>
</svg>`;

const SVG_D4 = `<svg width="1200" height="680" viewBox="0 0 1200 680" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="d4-kgGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b0dab"/>
      <stop offset="100%" stop-color="#0f0820"/>
    </radialGradient>
    <filter id="d4-kgGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="d4-traverseGlow" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <marker id="d4-arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#3b82f6"/>
    </marker>
    <marker id="d4-arrowPurple" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#8b5cf6"/>
    </marker>
    <marker id="d4-arrowTealConfig" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#14b8a6"/>
    </marker>
    <marker id="d4-arrowPurpleDashed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#8b5cf6"/>
    </marker>
    <marker id="d4-arrowTealAdapter" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="#14b8a6"/>
    </marker>
  </defs>
  <rect x="0" y="0" width="1200" height="680" fill="#111113" stroke="#14b8a6" stroke-width="1.5"/>
  <rect x="0" y="0" width="1200" height="5" fill="#14b8a6"/>
  <text x="600" y="30" fill="#14b8a6" font-size="13" font-weight="bold" letter-spacing="3" text-anchor="middle">DISTRIBUTION ENGINE</text>
  <text x="600" y="50" fill="#6b7280" font-size="10" letter-spacing="1.5" text-anchor="middle">DEFINE YOUR AUDIENCE ONCE. PUBLISH EVERYWHERE. AUTOMATICALLY.</text>
  <rect x="260" y="75" width="220" height="120" rx="12" fill="#0c1a2e" stroke="#1d4ed8" stroke-width="2"/>
  <text x="370" y="100" fill="#93c5fd" font-size="11" font-weight="bold" text-anchor="middle" letter-spacing="1">AUDIENCE PROFILE</text>
  <text x="370" y="125" fill="#60a5fa" font-size="10" text-anchor="middle">Name · Role</text>
  <text x="370" y="143" fill="#60a5fa" font-size="10" text-anchor="middle">Complexity Threshold</text>
  <text x="370" y="161" fill="#60a5fa" font-size="10" text-anchor="middle">Domain Assumptions</text>
  <text x="370" y="184" fill="#60a5fa" font-size="8" font-weight="bold" text-anchor="middle" letter-spacing="1">DEFINED ONCE · REUSED FOREVER</text>
  <rect x="490" y="75" width="220" height="120" rx="12" fill="#1a0a2e" stroke="#7c3aed" stroke-width="2"/>
  <text x="600" y="100" fill="#c4b5fd" font-size="11" font-weight="bold" text-anchor="middle" letter-spacing="1">VOICE ENGINE  ✦</text>
  <text x="600" y="125" fill="#a78bfa" font-size="10" text-anchor="middle">Brand Tone · Register</text>
  <text x="600" y="143" fill="#a78bfa" font-size="10" text-anchor="middle">Vocabulary Rules</text>
  <text x="600" y="161" fill="#a78bfa" font-size="10" text-anchor="middle">Persona Calibration</text>
  <text x="600" y="184" fill="#c4b5fd" font-size="8" font-weight="bold" text-anchor="middle" letter-spacing="1">SHARED: ADAPT + DISTRIBUTION</text>
  <rect x="720" y="75" width="220" height="120" rx="12" fill="#0a1e1a" stroke="#0f766e" stroke-width="2"/>
  <text x="830" y="100" fill="#5eead4" font-size="11" font-weight="bold" text-anchor="middle" letter-spacing="1">OUTPUT FORMAT</text>
  <text x="830" y="125" fill="#2dd4bf" font-size="10" text-anchor="middle">Format · Structure</text>
  <text x="830" y="143" fill="#2dd4bf" font-size="10" text-anchor="middle">Length · Sections</text>
  <text x="830" y="161" fill="#2dd4bf" font-size="10" text-anchor="middle">Call-to-Action</text>
  <text x="830" y="184" fill="#2dd4bf" font-size="8" font-weight="bold" text-anchor="middle" letter-spacing="1">DEFINED ONCE · REUSED FOREVER</text>
  <line x1="370" y1="197" x2="370" y2="228" stroke="#3b82f6" stroke-width="2" marker-end="url(#d4-arrowBlue)"/>
  <line x1="600" y1="197" x2="600" y2="228" stroke="#8b5cf6" stroke-width="2" marker-end="url(#d4-arrowPurple)"/>
  <line x1="830" y1="197" x2="830" y2="228" stroke="#14b8a6" stroke-width="2" marker-end="url(#d4-arrowTealConfig)"/>
  <circle cx="155" cy="285" r="96" fill="none" stroke="#4c1d95" stroke-width="1.5" opacity="0.3"/>
  <circle cx="155" cy="285" r="88" fill="url(#d4-kgGradient)" stroke="#7c3aed" stroke-width="2.5" filter="url(#d4-kgGlow)"/>
  <text x="155" y="278" fill="#c4b5fd" font-size="14" font-weight="bold" text-anchor="middle">Knowledge</text>
  <text x="155" y="296" fill="#c4b5fd" font-size="14" font-weight="bold" text-anchor="middle">Graph</text>
  <text x="155" y="318" fill="#a78bfa" font-size="9" text-anchor="middle">Company Knowledge Base</text>
  <text x="155" y="340" fill="#6b7280" font-size="8" text-anchor="middle">← from Extraction Engine</text>
  <line x1="243" y1="285" x2="258" y2="285" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#d4-arrowPurpleDashed)"/>
  <rect x="260" y="225" width="840" height="120" rx="14" fill="#0a1a1a" stroke="#14b8a6" stroke-width="2.5" filter="url(#d4-traverseGlow)"/>
  <text x="680" y="265" fill="#5eead4" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">CONTENT ENGINE</text>
  <text x="680" y="286" fill="#6b7280" font-size="10" text-anchor="middle">KnowledgeGraph × AudienceProfile × OutputFormat × Voice</text>
  <text x="680" y="303" fill="#0f766e" font-size="10" text-anchor="middle">filter by threshold · apply voice · structure output · flag gaps</text>
  <text x="680" y="320" fill="#374151" font-size="9" font-style="italic" text-anchor="middle">add new persona or format → zero re-ingestion</text>
  <line x1="330" y1="345" x2="330" y2="358" stroke="#14b8a6" stroke-width="1.8" marker-end="url(#d4-arrowTealAdapter)"/>
  <line x1="470" y1="345" x2="470" y2="358" stroke="#14b8a6" stroke-width="1.8" marker-end="url(#d4-arrowTealAdapter)"/>
  <line x1="610" y1="345" x2="610" y2="358" stroke="#14b8a6" stroke-width="1.8" marker-end="url(#d4-arrowTealAdapter)"/>
  <line x1="750" y1="345" x2="750" y2="358" stroke="#14b8a6" stroke-width="1.8" marker-end="url(#d4-arrowTealAdapter)"/>
  <line x1="890" y1="345" x2="890" y2="358" stroke="#14b8a6" stroke-width="1.8" marker-end="url(#d4-arrowTealAdapter)"/>
  <line x1="1030" y1="345" x2="1030" y2="358" stroke="#14b8a6" stroke-width="1.8" marker-end="url(#d4-arrowTealAdapter)"/>
  <rect x="265" y="360" width="130" height="110" rx="10" fill="#0a1525" stroke="#1d4ed8" stroke-width="1.5"/>
  <text x="330" y="385" fill="#93c5fd" font-size="12" font-weight="bold" text-anchor="middle">LinkedIn</text>
  <text x="330" y="412" fill="#6b7280" font-size="9" text-anchor="middle">hook + thread</text>
  <text x="330" y="430" fill="#6b7280" font-size="9" text-anchor="middle">char limit</text>
  <text x="330" y="448" fill="#6b7280" font-size="9" text-anchor="middle">post + carousel</text>
  <rect x="405" y="360" width="130" height="110" rx="10" fill="#0e0e14" stroke="#374151" stroke-width="1.5"/>
  <text x="470" y="385" fill="#9ca3af" font-size="12" font-weight="bold" text-anchor="middle">X / Twitter</text>
  <text x="470" y="412" fill="#6b7280" font-size="9" text-anchor="middle">280-char thread</text>
  <text x="470" y="430" fill="#6b7280" font-size="9" text-anchor="middle">hook-first</text>
  <text x="470" y="448" fill="#6b7280" font-size="9" text-anchor="middle">thread adapter</text>
  <rect x="545" y="360" width="130" height="110" rx="10" fill="#0f1a0a" stroke="#15803d" stroke-width="1.5"/>
  <text x="610" y="385" fill="#86efac" font-size="12" font-weight="bold" text-anchor="middle">Email</text>
  <text x="610" y="412" fill="#6b7280" font-size="9" text-anchor="middle">subject + preview</text>
  <text x="610" y="430" fill="#6b7280" font-size="9" text-anchor="middle">HTML output</text>
  <text x="610" y="448" fill="#6b7280" font-size="9" text-anchor="middle">CTA block</text>
  <rect x="685" y="360" width="130" height="110" rx="10" fill="#1a0a00" stroke="#92400e" stroke-width="1.5"/>
  <text x="750" y="385" fill="#fb923c" font-size="12" font-weight="bold" text-anchor="middle">Blog</text>
  <text x="750" y="412" fill="#6b7280" font-size="9" text-anchor="middle">SEO + H2s</text>
  <text x="750" y="430" fill="#6b7280" font-size="9" text-anchor="middle">full markdown</text>
  <text x="750" y="448" fill="#6b7280" font-size="9" text-anchor="middle">Substack / Medium</text>
  <rect x="825" y="360" width="130" height="110" rx="10" fill="#0a0f1e" stroke="#4338ca" stroke-width="1.5"/>
  <text x="890" y="385" fill="#a5b4fc" font-size="12" font-weight="bold" text-anchor="middle">Slack / Teams</text>
  <text x="890" y="412" fill="#6b7280" font-size="9" text-anchor="middle">internal digest</text>
  <text x="890" y="430" fill="#6b7280" font-size="9" text-anchor="middle">block kit</text>
  <text x="890" y="448" fill="#6b7280" font-size="9" text-anchor="middle">channel-aware</text>
  <rect x="965" y="360" width="130" height="110" rx="10" fill="#0a1a12" stroke="#065f46" stroke-width="1.5"/>
  <text x="1030" y="385" fill="#6ee7b7" font-size="12" font-weight="bold" text-anchor="middle">API / Custom</text>
  <text x="1030" y="412" fill="#6b7280" font-size="9" text-anchor="middle">webhook · JSON</text>
  <text x="1030" y="430" fill="#6b7280" font-size="9" text-anchor="middle">any downstream</text>
  <text x="1030" y="448" fill="#6b7280" font-size="9" text-anchor="middle">extensible</text>
  <rect x="40" y="488" width="1120" height="80" rx="10" fill="#0d0d10" stroke="#1f2937" stroke-width="1"/>
  <text x="600" y="512" fill="#9ca3af" font-size="9" font-weight="bold" letter-spacing="3" text-anchor="middle">EXAMPLE · ARM MALI GPU LAUNCH</text>
  <text x="600" y="532" fill="#6b7280" font-size="10" text-anchor="middle">Datacenter CTO (depth 5)  →  Whitepaper + API adapter</text>
  <text x="600" y="550" fill="#6b7280" font-size="10" text-anchor="middle">Developer (depth 3)  →  LinkedIn Thread adapter</text>
  <text x="600" y="566" fill="#10b981" font-size="11" font-style="italic" font-weight="bold" text-anchor="middle">Same Knowledge Graph. Three passes. Zero re-ingestion. Three campaigns.</text>
  <text x="600" y="640" fill="#4b5563" font-size="9" letter-spacing="2" text-anchor="middle">DISTRIBUTION ENGINE · ADAPT AI · Step 3 of 3</text>
</svg>`;

const FORMULAS = [
  {
    step: "1. Extract Once",
    equation: "Document → Claude → KnowledgeGraph",
    description: "Read the document once. Store its structure forever. Never touch the raw text again.",
    accent: "#f97316",
  },
  {
    step: "2. Model Your Audience",
    equation: "AudienceType → AudienceProfile Node",
    description: "Define who reads it — once. Reuse across every document you ever upload.",
    accent: "#7c3aed",
  },
  {
    step: "3. Traverse, Don't Translate",
    equation: "KnowledgeGraph × AudienceProfile × OutputFormat → AdaptedDocument",
    description: "Filter the graph by what this audience can access. Pass only those nodes to Claude. Write from structure, not from memory.",
    accent: "#14b8a6",
  },
];

const SOUNDBITE = `"Extract once. Model your audience once. Traverse the graph to produce the output. Three steps — none of them are 'paste the document into ChatGPT and hope.'"`;

const TABS = [
  { id: "exec",         label: "Product Overview",      accent: "#5b8fff", svg: null,   formula: null },
  { id: "overview",    label: "System Overview",        accent: "#f97316", svg: SVG_D1, formula: null },
  { id: "ingestion",   label: "1 · Ingestion",          accent: "#f97316", svg: SVG_D2, formula: FORMULAS[0] },
  { id: "extraction",  label: "2 · Extraction",         accent: "#7c3aed", svg: SVG_D3, formula: FORMULAS[1] },
  { id: "distribution",label: "3 · Distribution",       accent: "#14b8a6", svg: SVG_D4, formula: FORMULAS[2] },
];

function FormulaCard({ formula, large = false }: { formula: typeof FORMULAS[0]; large?: boolean }) {
  return (
    <div className={`rounded-xl border bg-zinc-900/60 p-5 ${large ? "p-6" : ""}`}
         style={{ borderColor: formula.accent + "40" }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: formula.accent }}>
        {formula.step}
      </p>
      <p className="font-mono text-sm font-bold text-zinc-100 mb-2 leading-snug" style={{ color: formula.accent }}>
        {formula.equation}
      </p>
      <p className="text-zinc-400 text-sm leading-relaxed">{formula.description}</p>
    </div>
  );
}

function ProductOverview() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-3">
        {FORMULAS.map((f) => <FormulaCard key={f.step} formula={f} large />)}
      </div>
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-6 text-center">
        <p className="text-zinc-300 text-base italic leading-relaxed max-w-3xl mx-auto">{SOUNDBITE}</p>
      </div>
    </div>
  );
}

function makeSvgResponsive(svg: string) {
  return svg
    .replace(/^<svg /, '<svg style="width:100%;height:auto;" ')
    .replace(/ width="\d+(\.\d+)?"/, "")
    .replace(/ height="\d+(\.\d+)?"/, "");
}

export default function ArchitectureDiagrams() {
  const [active, setActive] = useState("exec");
  const current = TABS.find((t) => t.id === active)!;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-zinc-50 mb-2">How It Works</h2>
        <p className="text-zinc-400 text-base">One knowledge base. Infinite campaigns. Zero rework.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              active === tab.id
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            style={active === tab.id ? { borderBottom: `2px solid ${tab.accent}` } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Overview — exec one-pager */}
      {active === "exec" && <ProductOverview />}

      {/* Diagram tabs */}
      {active !== "exec" && current.svg && (
        <div key={active} className="animate-fade-in">
          {/* Formula banner above diagram */}
          {current.formula && (
            <div className="mb-4">
              <FormulaCard formula={current.formula} />
            </div>
          )}
          {/* SVG diagram */}
          <div className="rounded-xl overflow-hidden bg-transparent">
            <div
              dangerouslySetInnerHTML={{ __html: makeSvgResponsive(current.svg) }}
              style={{ display: "block", lineHeight: 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
