<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  projectName: string
  preset: 'frontend' | 'fullstack'
}>()
const construction = ref<HTMLElement>()
const structure = ref<HTMLElement>()
const buildProgress = ref(0)
const treeProgress = ref(1)
const ready = ref(false)
const reducedMotion = ref(false)
const compactViewport = ref(false)
const staticPresentation = computed(function staticLayout() {
  return reducedMotion.value || compactViewport.value
})
let frame = 0
let observer: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined

const buildStyle = computed(function animationVariables() {
  const progress = staticPresentation.value ? 1 : buildProgress.value
  return {
    '--merge': Math.min(progress / 0.55, 1),
    '--assembled': Math.max(0, Math.min((progress - 0.48) / 0.2, 1)),
    '--built': Math.max(0, Math.min((progress - 0.68) / 0.22, 1)),
  }
})
const phase = computed(function currentPhase() {
  if (staticPresentation.value || buildProgress.value > 0.68) return '把共识，构建成项目。'
  if (buildProgress.value > 0.3) return '目标与执行，在这里汇合。'
  return '各有所长，一起向前。'
})
const rows = computed(function projectTree() {
  return [
    { path: `${props.projectName}/`, depth: 0, kind: 'root', note: '你的项目，从这里开始' },
    { path: 'AGENTS.md', depth: 1, kind: 'file', note: '人与 AI 的协作约定' },
    { path: 'apps/', depth: 1, kind: 'folder', note: '放进你选择的应用' },
    { path: 'frontend/', depth: 2, kind: 'folder', note: 'Vue · Vite · TypeScript' },
    { path: 'src/modules/', depth: 3, kind: 'folder', note: '让能力有清晰的边界' },
    { path: 'introduction/', depth: 4, kind: 'folder', note: '你正在看的项目介绍' },
    ...(props.preset === 'fullstack'
      ? [
          { path: 'health/', depth: 4, kind: 'folder', note: '前端服务状态展示' },
          { path: 'backend/', depth: 2, kind: 'folder', note: 'NestJS · Fastify · TypeScript' },
          { path: 'packages/api-contract/', depth: 1, kind: 'folder', note: '共享 Zod 运行时契约' },
        ]
      : []),
    { path: 'docs/', depth: 1, kind: 'folder', note: '把决定留下来' },
    { path: 'design/', depth: 2, kind: 'folder', note: '现行设计，是共同的地图' },
    { path: 'decisions/', depth: 2, kind: 'folder', note: '长期取舍，可追溯' },
    { path: 'plans/active/', depth: 2, kind: 'folder', note: '下一步，写成可执行的计划' },
    { path: 'ai-logs/', depth: 2, kind: 'folder', note: '保留协作过程与验证证据' },
    { path: 'archive/', depth: 2, kind: 'folder', note: '完成的工作，进入历史' },
    { path: 'scripts/', depth: 1, kind: 'folder', note: '让工程规则真正执行' },
    { path: 'pnpm-workspace.yaml', depth: 1, kind: 'file', note: '组织应用与共享包' },
  ]
})
const visibleRows = computed(function revealedRows() {
  if (!ready.value || staticPresentation.value) return rows.value.length
  return Math.min(rows.value.length, 1 + Math.floor(treeProgress.value * rows.value.length))
})
const selectedRow = computed(function highlightedRow() {
  return rows.value[Math.max(0, visibleRows.value - 1)]
})

function progressOf(section: HTMLElement | undefined): number {
  if (!section) return 0
  const height = window.innerHeight
  return Math.max(
    0,
    Math.min(1, -section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - height)),
  )
}
function updateProgress(): void {
  frame = 0
  compactViewport.value = window.innerHeight <= 570
  buildProgress.value = progressOf(construction.value)
  treeProgress.value = progressOf(structure.value)
}
function scheduleProgress(): void {
  if (!frame && !reducedMotion.value) frame = window.requestAnimationFrame(updateProgress)
}
function updateMotionPreference(): void {
  reducedMotion.value = motionQuery?.matches ?? false
  if (reducedMotion.value && frame) {
    window.cancelAnimationFrame(frame)
    frame = 0
  }
  updateProgress()
}
onMounted(function startIntroduction() {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotionPreference()
  ready.value = true
  motionQuery.addEventListener('change', updateMotionPreference)
  window.addEventListener('scroll', scheduleProgress, { passive: true })
  window.addEventListener('resize', scheduleProgress)
  observer = new ResizeObserver(scheduleProgress)
  if (construction.value) observer.observe(construction.value)
  if (structure.value) observer.observe(structure.value)
})
onUnmounted(function stopIntroduction() {
  window.removeEventListener('scroll', scheduleProgress)
  window.removeEventListener('resize', scheduleProgress)
  motionQuery?.removeEventListener('change', updateMotionPreference)
  observer?.disconnect()
  if (frame) window.cancelAnimationFrame(frame)
})
</script>

<template>
  <div class="forge-intro" :class="{ 'is-reduced': staticPresentation }">
    <a class="skip-link" href="#project-structure">跳到项目目录</a>
    <header class="masthead">
      <a class="wordmark" href="#intro-top" aria-label="CoAIForge 首页">
        <span class="brand-mark" aria-hidden="true">↗</span> CoAIForge<span class="brand-dot"
          >®</span
        >
      </a>
      <span class="masthead-note">人机协作 · 工程起点</span>
      <a
        class="source-link"
        href="https://github.com/tanghaojie/CoAIForge"
        target="_blank"
        rel="noopener noreferrer"
        >GitHub ↗</a
      >
    </header>

    <main id="intro-top">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-kicker"><span class="status-dot"></span> BUILT TOGETHER, FROM DAY ONE</div>
        <h1 id="hero-title">
          <span class="hero-ai">AI</span><span class="hero-plus">+</span
          ><span class="hero-human">人<span class="human-spark" aria-hidden="true">✳</span></span>
        </h1>
        <div class="hero-bottom">
          <div>
            <h2>一起想清楚。<br />一起构建出来。</h2>
            <p>
              你带来目标与判断，AI 带来探索与执行。<br />CoAIForge，让协作从一个清晰的工程开始。
            </p>
          </div>
          <a class="scroll-cue" href="#construction"
            ><span>向下滚动，看看如何开始</span
            ><span class="scroll-arrow" aria-hidden="true">↓</span></a
          >
        </div>
        <div class="hero-footnote">
          <span>01 — HUMAN × ARTIFICIAL INTELLIGENCE</span><span>少一点重复。多一点创造。</span>
        </div>
      </section>

      <section
        id="construction"
        ref="construction"
        class="scroll-chapter construction"
        :style="buildStyle"
        aria-labelledby="construction-title"
      >
        <div class="sticky-stage build-stage">
          <div class="chapter-heading">
            <span class="section-index">01 / 共创</span>
            <h2 id="construction-title">{{ phase }}</h2>
            <p>由人确定方向，让 AI 推进实现。</p>
          </div>
          <div class="assembly-visual" aria-hidden="true">
            <div class="orbit orbit-outer"></div>
            <div class="orbit orbit-inner"></div>
            <div class="axis-line"></div>
            <div class="collaborator ai-node">
              <span class="node-caption">探索 · 执行</span>
              <div class="node-face">
                <svg viewBox="0 0 80 80">
                  <rect x="19" y="23" width="42" height="38" rx="9" />
                  <path d="M40 14v9M31 43h1m16 0h1M32 52h16M12 36v14m56-14v14" />
                  <circle cx="40" cy="12" r="2" />
                </svg>
              </div>
              <strong>AI</strong>
            </div>
            <span class="assembly-plus">+</span>
            <div class="collaborator human-node">
              <span class="node-caption">目标 · 判断</span>
              <div class="node-face">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="29" r="11" />
                  <path d="M20 63v-5a20 20 0 0 1 40 0v5M18 17l-4-4m48 4 4-4M40 9V3" />
                </svg>
              </div>
              <strong>人</strong>
            </div>
            <div class="fusion-core"><span>↗</span></div>
            <div class="project-result">
              <span class="result-label">共同构建</span><strong>{{ projectName }}</strong
              ><span>清晰的规则。可运行的起点。</span>
              <div class="result-tags">
                <span>AGENTS.md</span><span>工程</span><span>文档</span>
              </div>
            </div>
          </div>
          <div class="build-steps" aria-label="构建过程">
            <span :class="{ active: buildProgress < 0.3 && !staticPresentation }">各有所长</span
            ><i></i
            ><span
              :class="{
                active: buildProgress >= 0.3 && buildProgress <= 0.68 && !staticPresentation,
              }"
              >达成共识</span
            ><i></i
            ><span :class="{ active: buildProgress > 0.68 || staticPresentation }">开始构建</span>
          </div>
        </div>
      </section>

      <section
        id="project-structure"
        ref="structure"
        class="scroll-chapter structure"
        aria-labelledby="structure-title"
      >
        <div class="sticky-stage structure-stage">
          <div class="structure-copy">
            <span class="section-index">02 / 展开</span>
            <h2 id="structure-title">好协作，<br />有迹可循。</h2>
            <p>从一份协作约定，到可运行的应用。<br />每一层目录，都有它的职责。</p>
            <div class="preset-badge">
              <span class="status-dot"></span
              >{{ preset === 'fullstack' ? '全栈工程 / FULLSTACK' : '前端工程 / FRONTEND' }}
            </div>
            <div class="directory-caption" aria-hidden="true">
              <span class="caption-number"
                >{{ String(visibleRows).padStart(2, '0') }} / {{ rows.length }}</span
              ><strong>{{ selectedRow?.note }}</strong
              ><span>随滚动展开项目结构 ↓</span>
            </div>
          </div>
          <div class="tree-window">
            <div class="tree-toolbar">
              <span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span
              ><span>PROJECT EXPLORER</span
              ><span class="tree-indicator">{{ preset === 'fullstack' ? 'FE + BE' : 'FE' }}</span>
            </div>
            <ol class="directory-tree" aria-label="项目主要目录（非完整文件清单）">
              <li
                v-for="(row, index) in rows"
                :key="row.path"
                :class="{ revealed: index < visibleRows, current: index === visibleRows - 1 }"
                :style="{ '--depth': row.depth }"
              >
                <span class="row-number" aria-hidden="true">{{
                  String(index + 1).padStart(2, '0')
                }}</span
                ><span class="tree-branch" aria-hidden="true"></span
                ><svg
                  v-if="row.kind !== 'file'"
                  class="file-icon"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M2 5h6l2 2h8v10H2Z" /></svg
                ><svg v-else class="file-icon" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5 2h7l4 4v12H5Z M12 2v5h4" /></svg
                ><code>{{ row.path }}</code
                ><span class="row-note">{{ row.note }}</span>
              </li>
            </ol>
            <div class="tree-bottom">
              <span>规则 → 实现 → 记录</span><span>主要目录 · 按所选工程生成</span>
            </div>
          </div>
        </div>
      </section>

      <section class="start-section" aria-labelledby="start-title">
        <span class="section-index">03 / 开始</span>
        <h2 id="start-title">下一个想法，<br />从这里开始<span>↗</span></h2>
        <div class="start-bottom">
          <p>
            <strong>{{ projectName }}</strong
            ><br />工程已就位，把你的想法带进来。
          </p>
          <a class="primary-link" href="#project-structure"
            >再看一次项目目录 <span aria-hidden="true">↑</span></a
          >
        </div>
        <div v-if="$slots.service" class="service-panel">
          <div class="service-heading">
            <span class="status-dot"></span>全栈连接 / SERVICE STATUS
          </div>
          <slot name="service"></slot>
        </div>
      </section>
    </main>
    <footer class="intro-footer">
      <span>CoAIForge / 人与 AI，一起构建。</span><span>OPEN SOURCE · MIT</span>
    </footer>
  </div>
</template>

<style>
:root {
  color: #24241f;
  background: #f6f5ef;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-synthesis: none;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
}
html {
  scroll-behavior: smooth;
}
.forge-intro {
  --paper: #f6f5ef;
  --ink: #24241f;
  --muted: #74746b;
  --accent: #e95830;
  --line: #dcdcd3;
  overflow: clip;
}
.forge-intro a {
  color: inherit;
  text-decoration: none;
}
.forge-intro a:focus-visible,
.forge-intro button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 6px;
}
.skip-link {
  position: fixed;
  z-index: 20;
  top: 12px;
  left: 16px;
  padding: 12px 20px;
  background: var(--paper);
  border: 1px solid var(--ink);
  transform: translateY(-160%);
}
.skip-link:focus {
  transform: none;
}
.masthead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 92px;
  margin: 0 5vw;
  border-bottom: 1px solid var(--line);
}
.wordmark {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  font-weight: 750;
  letter-spacing: -1px;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: var(--accent);
  color: var(--paper);
  border-radius: 50%;
  font-size: 24px;
}
.brand-dot {
  align-self: flex-start;
  font-size: 10px;
  margin-left: -6px;
}
.masthead-note,
.source-link {
  font-size: 12px;
  letter-spacing: 1px;
}
.source-link {
  padding: 10px 0;
  border-bottom: 1px solid var(--ink);
}
.hero {
  padding: 48px 5vw 0;
  min-height: calc(100svh - 92px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.hero-kicker,
.section-index,
.hero-footnote,
.node-caption,
.result-label,
.preset-badge,
.tree-toolbar,
.tree-bottom,
.caption-number,
.service-heading,
.intro-footer {
  font-family: 'Consolas', 'SFMono-Regular', monospace;
  font-size: 11px;
  letter-spacing: 1.1px;
}
.hero-kicker {
  display: flex;
  gap: 12px;
  align-items: center;
}
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--accent);
  border-radius: 50%;
  flex: none;
}
.hero h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5vw;
  margin: 34px 0 28px;
  font-weight: 600;
  line-height: 1;
  font-size: clamp(120px, 22vw, 310px);
  letter-spacing: -0.06em;
}
.hero-ai {
  font-family: 'Bahnschrift', 'Helvetica Neue', sans-serif;
  font-weight: 700;
}
.hero-plus {
  color: #99998d;
  font-size: 0.5em;
  font-weight: 200;
}
.hero-human {
  position: relative;
  color: var(--accent);
  font-weight: 500;
}
.human-spark {
  position: absolute;
  top: -0.12em;
  right: -0.42em;
  color: var(--ink);
  font-size: 0.23em;
}
.hero-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 40px;
}
.hero h2 {
  font-size: clamp(25px, 3vw, 39px);
  font-weight: 500;
  letter-spacing: -1px;
  line-height: 1.45;
  margin: 0 0 18px;
}
.hero p,
.chapter-heading p,
.structure-copy p {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.9;
  margin: 0;
}
.scroll-cue {
  display: flex;
  align-items: center;
  gap: 22px;
  font-size: 12px;
}
.scroll-arrow {
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 50%;
  width: 52px;
  height: 52px;
  font-size: 24px;
  transition: transform 200ms;
}
.scroll-cue:hover .scroll-arrow {
  transform: translateY(5px);
}
.hero-footnote {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 10px;
}
.scroll-chapter {
  position: relative;
  height: 260vh;
  scroll-margin-top: 0;
}
.sticky-stage {
  position: sticky;
  top: 0;
  min-height: 100svh;
  height: 100svh;
  padding: 7vh 5vw 5vh;
}
.build-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background: #eeeee5;
  border-block: 1px solid var(--line);
}
.chapter-heading {
  text-align: center;
}
.section-index {
  color: var(--muted);
  display: inline-block;
  margin-bottom: 20px;
}
.chapter-heading h2 {
  font-size: clamp(25px, 3.5vw, 46px);
  font-weight: 500;
  letter-spacing: -1.5px;
  margin: 0 0 14px;
}
.assembly-visual {
  position: relative;
  width: min(100%, 980px);
  height: min(48vh, 410px);
  min-height: 260px;
}
.orbit {
  position: absolute;
  left: 50%;
  top: 47%;
  border: 1px solid #d7d7cc;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.orbit-outer {
  width: min(42vw, 370px);
  aspect-ratio: 1;
}
.orbit-inner {
  width: min(28vw, 240px);
  aspect-ratio: 1;
}
.axis-line {
  position: absolute;
  top: 47%;
  left: 5%;
  width: 90%;
  height: 1px;
  background: var(--line);
}
.collaborator {
  --travel: clamp(100px, 23vw, 270px);
  position: absolute;
  left: 50%;
  top: 47%;
  width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  opacity: calc(1 - var(--assembled));
}
.ai-node {
  transform: translate(calc(-50% - var(--travel) * (1 - var(--merge))), -50%)
    scale(calc(1 - var(--merge) * 0.2));
}
.human-node {
  transform: translate(calc(-50% + var(--travel) * (1 - var(--merge))), -50%)
    scale(calc(1 - var(--merge) * 0.2));
}
.node-caption {
  color: var(--muted);
}
.node-face {
  width: 114px;
  height: 114px;
  display: grid;
  place-items: center;
  background: var(--ink);
  border-radius: 28px;
  color: var(--paper);
  box-shadow: 0 16px 28px #24241f12;
}
.human-node .node-face {
  background: var(--accent);
  border-radius: 50%;
}
.node-face svg {
  width: 72px;
  height: 72px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.collaborator strong {
  font-size: 24px;
  font-weight: 500;
}
.assembly-plus {
  position: absolute;
  left: 50%;
  top: 47%;
  transform: translate(-50%, -50%);
  font-size: 45px;
  font-weight: 200;
  color: #a5a598;
  opacity: calc(1 - var(--merge));
}
.fusion-core {
  position: absolute;
  left: 50%;
  top: 47%;
  display: grid;
  place-items: center;
  width: 112px;
  height: 112px;
  background: var(--accent);
  border-radius: 28px;
  transform: translate(-50%, -50%) rotate(calc((1 - var(--assembled)) * -45deg))
    scale(calc(0.65 + var(--assembled) * 0.35));
  opacity: var(--assembled);
  box-shadow: 0 12px 65px #e9583029;
}
.fusion-core span {
  font-size: 80px;
  color: var(--paper);
  line-height: 1;
}
.project-result {
  position: absolute;
  left: 50%;
  top: calc(47% + 76px);
  transform: translate(-50%, calc((1 - var(--built)) * 18px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  opacity: var(--built);
}
.result-label {
  color: var(--accent);
}
.project-result strong {
  font-family: 'Bahnschrift', 'Consolas', sans-serif;
  font-size: clamp(25px, 3vw, 39px);
  letter-spacing: -1px;
  max-width: 100%;
  overflow-wrap: anywhere;
  text-align: center;
  line-height: 1.15;
}
.project-result > span:last-of-type {
  font-size: 12px;
  color: var(--muted);
}
.result-tags {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.result-tags span {
  border: 1px solid #ccccc0;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 10px;
}
.build-steps {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
  color: #929284;
  margin-top: 50px;
}
.build-steps i {
  width: 44px;
  height: 1px;
  background: #cccdbf;
}
.build-steps .active {
  color: var(--accent);
}
.structure {
  height: 290vh;
}
.structure-stage {
  display: grid;
  grid-template-columns: 0.8fr 1.6fr;
  align-items: center;
  gap: 7vw;
  max-width: 1500px;
  margin: auto;
}
.structure-copy h2 {
  font-size: clamp(34px, 4.8vw, 66px);
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -2px;
  margin: 0 0 24px;
}
.preset-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  font-size: 10px;
}
.directory-caption {
  border-top: 1px solid var(--line);
  margin-top: 50px;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.caption-number {
  color: var(--accent);
}
.directory-caption strong {
  font-size: 17px;
  font-weight: 500;
}
.directory-caption > span:last-child {
  font-size: 11px;
  color: var(--muted);
}
.tree-window {
  border: 1px solid #d8d8ce;
  border-radius: 12px;
  background: #fcfcf8;
  box-shadow: 0 24px 60px #28282108;
  overflow: hidden;
}
.tree-toolbar {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #eeeee7;
  border-bottom: 1px solid var(--line);
  padding: 16px 20px;
  font-size: 9px;
  color: var(--muted);
}
.window-dots {
  display: flex;
  gap: 5px;
}
.window-dots i {
  width: 7px;
  height: 7px;
  border: 1px solid #bcbcaf;
  border-radius: 50%;
}
.window-dots i:first-child {
  border-color: var(--accent);
  background: var(--accent);
}
.tree-indicator {
  margin-left: auto;
}
.directory-tree {
  list-style: none;
  margin: 0;
  padding: 16px 0;
}
.directory-tree li {
  display: flex;
  align-items: center;
  height: 30px;
  gap: 8px;
  padding-right: 16px;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 220ms,
    transform 220ms,
    background 220ms;
}
.directory-tree li.revealed {
  opacity: 1;
  transform: none;
}
.directory-tree li.current {
  background: #f1f1e8;
}
.row-number {
  width: 42px;
  text-align: center;
  font:
    9px 'Consolas',
    monospace;
  color: #a2a295;
  flex: none;
}
.tree-branch {
  width: calc(var(--depth) * 12px);
  flex: none;
}
.file-icon {
  width: 15px;
  height: 15px;
  flex: none;
  fill: none;
  stroke: var(--muted);
  stroke-width: 1.2;
}
.directory-tree li:nth-child(2) .file-icon,
.directory-tree li.current .file-icon {
  stroke: var(--accent);
}
.directory-tree code {
  font:
    12px 'Consolas',
    'SFMono-Regular',
    monospace;
  white-space: nowrap;
}
.directory-tree li:first-child code {
  color: var(--accent);
  font-weight: 700;
  overflow-wrap: anywhere;
  white-space: normal;
}
.directory-tree li:first-child {
  height: auto;
  min-height: 30px;
  padding-block: 4px;
}
.row-note {
  margin-left: auto;
  font-size: 10px;
  color: #8a8a7e;
  text-align: right;
}
.tree-bottom {
  padding: 13px 20px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 9px;
  letter-spacing: 0;
}
.start-section {
  background: var(--ink);
  color: var(--paper);
  padding: 70px 8vw;
}
.start-section .section-index {
  color: #aaa99d;
}
.start-section h2 {
  font-size: clamp(42px, 6.5vw, 90px);
  line-height: 1.3;
  font-weight: 500;
  letter-spacing: -3px;
  margin: 20px 0 50px;
}
.start-section h2 > span {
  color: var(--accent);
  margin-left: 0.3em;
}
.start-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}
.start-bottom p {
  color: #b7b7a8;
  font-size: 13px;
  line-height: 1.9;
  margin: 0;
}
.start-bottom strong {
  color: var(--paper);
  font-weight: 500;
  overflow-wrap: anywhere;
}
.primary-link {
  background: var(--accent);
  padding: 17px 22px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  gap: 38px;
  flex: none;
  transition: background 180ms;
}
.primary-link:hover {
  background: #ce4824;
}
.service-panel {
  margin-top: 46px;
  border-top: 1px solid #525248;
  padding-top: 26px;
}
.service-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b7b7a8;
  font-size: 10px;
  margin-bottom: 18px;
}
.service-panel p {
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}
.service-panel .success {
  color: #a8d9b4;
}
.service-panel .failure {
  color: #ffab8d;
}
.service-panel button {
  color: var(--paper);
  background: transparent;
  border: 1px solid #868679;
  padding: 10px 18px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.service-panel button:disabled {
  opacity: 0.5;
  cursor: wait;
}
.intro-footer {
  margin: 0 5vw;
  padding: 25px 0;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: 0.5px;
}
.is-reduced .scroll-chapter {
  height: auto;
}
.is-reduced .sticky-stage {
  position: relative;
  height: auto;
  min-height: 760px;
}
.is-reduced .directory-tree li {
  opacity: 1;
  transform: none;
  transition: none;
}
@media (min-width: 1600px) {
  .hero {
    padding-top: 65px;
  }
  .hero h1 {
    font-size: 330px;
  }
}
@media (max-width: 1100px) {
  .row-note {
    display: none;
  }
  .structure-stage {
    gap: 4vw;
    grid-template-columns: 0.85fr 1.3fr;
  }
}
@media (max-width: 700px) {
  .masthead {
    height: 74px;
    margin-inline: 6vw;
  }
  .masthead-note {
    display: none;
  }
  .wordmark {
    font-size: 19px;
  }
  .hero {
    padding: 36px 6vw 0;
    min-height: calc(100svh - 74px);
  }
  .hero-kicker {
    font-size: 9px;
    letter-spacing: 0.8px;
  }
  .hero h1 {
    font-size: 24vw;
    margin-block: 60px;
    gap: 6vw;
  }
  .hero-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 28px;
  }
  .hero p {
    font-size: 12px;
  }
  .scroll-arrow {
    width: 40px;
    height: 40px;
  }
  .hero-footnote span:last-child {
    display: none;
  }
  .hero-footnote {
    font-size: 8px;
  }
  .sticky-stage {
    padding: 5vh 6vw 4vh;
  }
  .chapter-heading h2 {
    letter-spacing: -1px;
    font-size: 25px;
  }
  .chapter-heading p {
    font-size: 12px;
  }
  .section-index {
    margin-bottom: 14px;
    font-size: 10px;
  }
  .collaborator {
    --travel: 27vw;
    width: 110px;
    gap: 12px;
  }
  .node-face {
    width: 88px;
    height: 88px;
    border-radius: 23px;
  }
  .node-face svg {
    width: 58px;
    height: 58px;
  }
  .node-caption {
    font-size: 9px;
  }
  .orbit-outer {
    width: 70vw;
  }
  .orbit-inner {
    width: 44vw;
  }
  .fusion-core {
    width: 88px;
    height: 88px;
    border-radius: 23px;
  }
  .fusion-core span {
    font-size: 64px;
  }
  .project-result {
    top: calc(47% + 65px);
  }
  .build-steps {
    gap: 12px;
  }
  .build-steps i {
    width: 22px;
  }
  .structure-stage {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    gap: 22px;
  }
  .structure-copy {
    position: relative;
  }
  .structure-copy h2 {
    font-size: 30px;
    letter-spacing: -1px;
    margin: 0;
  }
  .structure-copy h2 br {
    display: none;
  }
  .structure-copy p,
  .directory-caption {
    display: none;
  }
  .preset-badge {
    margin-top: 14px;
    font-size: 9px;
  }
  .tree-toolbar {
    padding: 13px 14px;
    gap: 10px;
  }
  .directory-tree {
    padding-block: 12px;
  }
  .directory-tree li {
    height: 27px;
    gap: 6px;
  }
  .directory-tree code {
    font-size: 11px;
  }
  .row-number {
    width: 30px;
  }
  .tree-branch {
    width: calc(var(--depth) * 9px);
  }
  .tree-bottom {
    padding: 12px;
    font-size: 8px;
  }
  .start-section {
    padding: 50px 6vw;
  }
  .start-section h2 {
    letter-spacing: -2px;
  }
  .start-bottom {
    align-items: flex-start;
    flex-direction: column;
  }
  .intro-footer {
    margin-inline: 6vw;
    font-size: 8px;
  }
  .is-reduced .sticky-stage {
    min-height: 620px;
  }
}
@media (max-height: 820px) {
  .sticky-stage {
    padding-top: 26px;
    padding-bottom: 20px;
  }
  .chapter-heading .section-index {
    margin-bottom: 12px;
  }
  .assembly-visual {
    min-height: 210px;
    height: 40vh;
  }
  .build-steps {
    margin-top: 65px;
  }
  .directory-tree li {
    height: 23px;
  }
  .directory-tree {
    padding-block: 8px;
  }
  .structure-stage {
    gap: 18px;
  }
  .tree-toolbar,
  .tree-bottom {
    padding-block: 10px;
  }
}
@media (max-height: 570px) {
  .scroll-chapter {
    height: auto;
  }
  .sticky-stage {
    position: relative;
    height: auto;
    min-height: 640px;
  }
  .directory-tree li {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .forge-intro *,
  .forge-intro *::before,
  .forge-intro *::after {
    transition: none !important;
  }
  .scroll-chapter {
    height: auto;
  }
  .sticky-stage {
    position: relative;
    height: auto;
  }
  .directory-tree li {
    opacity: 1;
    transform: none;
  }
  .scroll-cue:hover .scroll-arrow {
    transform: none;
  }
}
</style>
