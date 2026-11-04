<script setup lang="ts">
import { computed } from 'vue'
import type { Card, Flag, ScanPage } from '../../features/breviariumGothicum/data'

defineOptions({ name: 'BgCard' })

const props = defineProps<{
  card: Card
  blocks: Record<string, string>
  showNotes: boolean
  nested?: boolean
}>()

const emit = defineEmits<{ scan: [pages: ScanPage[], index: number], note: [flag: Flag] }>()

const ESCAPE: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }

// A paragraph that is a printed title: psalm titles and headings are set in capitals
function isTitle(paragraph: string): boolean {
  const letters = paragraph.replace(/[^A-Za-zÀ-ÿĀ-žÆæŒœ]/g, '')
  return letters.length >= 4 && paragraph.length < 160 && letters.replace(/[^A-ZÀ-ÞĀ-ŽÆŒ]/g, '').length / letters.length > 0.85
}

// Red in the book: the response marks R. (Responsio), P. (Pressa), V./℣. (Versus), the
// antiphon mark Aña., and the mediant of a psalm verse, printed as an asterisk (the reading
// text writes it " / ").
function render(text: string): string {
  return text.trim()
    // a psalm title run into its antiphon by the OCR ("PSALMVS DAVID.Aña. Dixi")
    .replace(/([A-ZÆŒ]\.)(Aña\.)/g, '$1\n\n$2')
    .split(/\n\s*\n/).map((paragraph) => {
      const html = paragraph
        .replace(/[&<>"]/g, c => ESCAPE[c])
        .replace(/(^|\s)(R\.|P\.|V\.|℣\.?|℟\.?|Aña\.)(?=\s)/g, '$1<span class="bg-mark">$2</span>')
        .replace(/ \/ ?/g, ' <span class="bg-mark">*</span> ')
        .replace(/\n/g, '<br>')
      return isTitle(paragraph) ? `<p class="bg-title">${html}</p>` : `<p>${html}</p>`
    }).join('')
}

const text = computed(() => {
  const raw = props.card.b ? props.blocks[props.card.b] : props.card.inline
  return raw ? render(raw) : ''
})

const pages = computed(() => props.card.pages || [])
</script>

<template>
  <section class="bg-card" :class="{ 'is-frame': card.frame, 'is-nested': nested }">
    <header class="bg-card-head">
      <span class="bg-label-line">
        <span class="bg-label" lang="la">{{ card.label }}</span>
        <button v-for="mark in card.marks || []" :key="mark.note + mark.label" type="button" class="bg-mark-tag" lang="zh-CN" :title="mark.title || '查看说明'" @click="emit('note', mark)">{{ mark.label }}</button>
      </span>
      <span v-if="pages.length" class="bg-folios no-print" lang="zh-CN">
        <button v-for="(page, index) in pages" :key="page.n" type="button" class="bg-folio" :title="`查看原书扫描页（PDF 第 ${page.n} 页）`" @click="emit('scan', pages, index)">
          {{ page.f || `p. ${page.n}` }}
        </button>
      </span>
    </header>
    <div v-if="text" class="bg-text" lang="la" v-html="text" />
    <p v-else-if="card.missing" class="bg-missing" lang="zh-CN">{{ card.missing }}</p>
    <p v-if="card.trail" class="bg-trail" lang="la">{{ card.trail }}</p>

    <template v-for="(ref, r) in card.refs || []" :key="r">
      <details v-if="ref.targets?.length" class="bg-ref" open>
        <summary lang="zh-CN">{{ ref.summary }}</summary>
        <BgCard v-for="(target, t) in ref.targets" :key="t" :card="target" :blocks="blocks" :show-notes="showNotes" nested @scan="(p, i) => emit('scan', p, i)" @note="flag => emit('note', flag)" />
      </details>
      <p v-else class="bg-see" lang="zh-CN">
        <span>{{ ref.summary.replace(/\s*·\s*扫描页.*$/, '') }}</span>
        <button v-if="ref.pages?.length" type="button" class="bg-folio" @click="emit('scan', ref.pages!, 0)">扫描页</button>
      </p>
    </template>

    <div v-if="showNotes && (card.notes?.length || card.explain?.length)" class="bg-card-notes" lang="zh-CN">
      <p v-for="(note, n) in card.notes || []" :key="`n${n}`">{{ note }}</p>
      <details v-for="(box, e) in card.explain || []" :key="`e${e}`">
        <summary>{{ box.summary }}</summary>
        <p>{{ box.text }}</p>
      </details>
    </div>
  </section>
</template>

<style scoped>
.bg-card {
  margin: 1.1rem 0;
}

.bg-card.is-nested {
  margin: 0.8rem 0 0.8rem 0.2rem;
  padding-left: 0.9rem;
  border-left: 2px solid color-mix(in srgb, var(--bg-red) 25%, transparent);
}

.bg-card-head {
  display: flex;
  gap: 0.6rem;
  align-items: baseline;
  justify-content: space-between;
}

.bg-label {
  color: var(--bg-red);
  font-size: 0.9em;
  font-variant: small-caps;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.bg-label-line {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.5rem;
  align-items: baseline;
}

.bg-mark-tag {
  padding: 0 0.45rem;
  border: 1px solid color-mix(in srgb, var(--bg-amber) 55%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-amber) 12%, transparent);
  color: var(--va-c-text);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.7rem;
  cursor: help;
}

.is-frame .bg-label {
  color: var(--va-c-text-light);
}

.bg-folios {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: flex-end;
}

.bg-folio {
  padding: 0 0.2rem;
  border: 0;
  background: none;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.72rem;
  text-decoration: underline dotted;
  text-underline-offset: 2px;
  cursor: zoom-in;
  white-space: nowrap;
}

.bg-folio:hover {
  color: var(--bg-red);
}

.bg-text {
  line-height: 1.7;
  overflow-wrap: break-word;
}

.bg-text :deep(p) {
  margin: 0.3rem 0;
}

.bg-text :deep(.bg-title) {
  margin: 0.9rem 0 0.4rem;
  color: var(--bg-heading);
  font-size: 0.82em;
  letter-spacing: 0.04em;
  text-align: center;
}

.bg-text :deep(.bg-mark),
.bg-trail {
  color: var(--bg-red);
}

.bg-trail {
  margin: 0.2rem 0 0;
  font-size: 0.85em;
  font-style: italic;
}

.bg-missing,
.bg-see,
.bg-card-notes {
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
}

.bg-see {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: baseline;
  margin: 0.3rem 0;
}

.bg-ref > summary {
  margin-top: 0.3rem;
  color: var(--va-c-text-light);
  font-family: var(--va-font-sans, system-ui, sans-serif);
  font-size: 0.78rem;
  cursor: pointer;
}

.bg-card-notes {
  margin-top: 0.4rem;
  padding: 0.35rem 0.6rem;
  border-left: 3px solid var(--bg-amber);
  background: color-mix(in srgb, var(--bg-amber) 8%, transparent);
}

.bg-card-notes p {
  margin: 0.2rem 0;
}

.bg-card-notes summary {
  cursor: pointer;
}

@media print {
  .bg-ref > summary {
    display: none;
  }
}
</style>
