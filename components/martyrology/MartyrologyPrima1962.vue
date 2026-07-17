<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MartyrologyDay } from '../../features/martyrology/parser'
import type { BilingualLiturgicalBlock as BilingualLiturgicalBlockData, Prima1962Resolution } from '../../features/prima1962/types'
import BilingualLiturgicalBlock from './BilingualLiturgicalBlock.vue'
import BilingualPsalm from './BilingualPsalm.vue'
import MartyrologyReadingBody from './MartyrologyReadingBody.vue'

type MovableFeast = {
  id: string
  name: string
  text: string
}

const props = defineProps<{
  resolution: Prima1962Resolution | null
  fixedDay: MartyrologyDay | null
  movableFeast: MovableFeast | null
  omitted: boolean
  targetKey: string
  bilingual: boolean
}>()

const hasPriestPresiding = ref(false)

const openingBlocks = computed(() => {
  if (!props.resolution)
    return []
  const acclamation = props.resolution.blocks.find(item => item.id === `common.${props.resolution?.openingAcclamation}`)
  return [
    ...props.resolution.blocks.filter(item => item.id.startsWith('opening.')),
    block('opening.gloria-patri', 'verse', '℣. Glória Patri, et Fílio, et Spirítui Sancto.', '愿光荣归于父、及子、及圣神。'),
    block('opening.sicut-erat', 'response', '℟. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.', '起初如何，今日亦然，直到永远。阿们。'),
    ...(acclamation ? [{ ...acclamation, type: 'prayer' as const }] : []),
  ]
})

const chapterBlocks = computed(() => props.resolution?.blocks.filter(item => item.id.startsWith('chapter.')) || [])
const isTriduum = computed(() => props.resolution?.temporalKey === 'triduum')
const hymnBlocks = computed(() => {
  const seen = new Set<string>()
  return (props.resolution?.hymn || []).filter((item) => {
    if (seen.has(item.id))
      return false
    seen.add(item.id)
    return true
  })
})

function block(id: string, type: BilingualLiturgicalBlockData['type'], latin: string, chinese: string): BilingualLiturgicalBlockData {
  return {
    id,
    type,
    latin,
    chinese,
    translationStatus: 'temporary-translation',
    sourceRefs: [],
  }
}

function lectioBrevisTitle(resolution: Prima1962Resolution) {
  const key = resolution.lectioBrevis.id.replace('lectio.', '')
  const labels: Record<string, string> = {
    'per-annum': '常年',
    adv: '将临期',
    nat: '圣诞期',
    epi: '主显期',
    asc: '耶稣升天后',
    quad: '四旬期',
    quad5: '苦难期',
    pasch: '复活期',
    pent: '圣神降临期',
  }
  const latin: Record<string, string> = {
    'per-annum': 'Per Annum',
    adv: 'Adventus',
    nat: 'Nativitas',
    epi: 'Epiphania',
    asc: 'Tempus Ascensionis',
    quad: 'Quadragesima',
    quad5: 'Tempus Passionis',
    pasch: 'Tempus Paschale',
    pent: 'Tempus Pentecostes',
  }
  return `8. 短读经〔${labels[key] || '本日'}〕 / Lectio brevis {${latin[key] || key}}`
}

const triduumOratioBlocks = computed(() => {
  if (!props.resolution)
    return []
  const isHolyThursday = props.resolution.officeTitle.includes('Cena Domini')
  const christusLatin = isHolyThursday
    ? '℣. Christus factus est pro nobis obédiens usque ad mortem.'
    : '℣. Christus factus est pro nobis obédiens usque ad mortem, mortem autem crucis.'
  const christusChinese = isHolyThursday
    ? '领：基督为了我们，服从至死。'
    : '领：基督为了我们，服从至死，且死在十字架上。'
  return [
    block('triduum.christus-factus', 'verse', christusLatin, christusChinese),
    block('triduum.pater-rubric', 'notice', 'Pater noster dicitur secreto.', '天主经默念。'),
    block('triduum.respice', 'prayer', 'Réspice, quǽsumus, Dómine, super hanc famíliam tuam, pro qua Dóminus noster Iesus Christus non dubitávit mánibus tradi nocéntium, et crucis subíre torméntum.', '上主，求你垂顾你的家庭；我们的主耶稣基督为了她，甘愿被交在恶人手中，并承受十字架的苦刑。'),
  ]
})
</script>

<template>
  <section class="martyrology-panel prima-notice">
    <h2>混合礼文 / Forma mixta</h2>
    <p>
      本页采用1962年《罗马日课经》第一时辰经的结构及1960年规程，并配用本站现有的新礼《罗马殉道录》文本；并非1962年礼书的完整原样复刻。
    </p>
  </section>

  <section v-if="!resolution" class="martyrology-panel">
    正在解析 Prima……
  </section>

  <template v-else>
    <section v-if="resolution.warnings.length" class="martyrology-panel">
      <details open>
        <summary>Resolver warning</summary>
        <p v-for="warning in resolution.warnings" :key="warning" class="inline-help">
          {{ warning }}
        </p>
      </details>
    </section>

    <section class="martyrology-panel prima-office">
      <h2>第一时辰经 / Ad Primam</h2>
      <p class="inline-help">
        日期：{{ resolution.officeDate }}；等级：{{ resolution.officeRank }}；圣人录宣报：{{ resolution.martyrologyDate }}
      </p>
    </section>

    <section v-if="!isTriduum" class="martyrology-panel prima-office" id="incipit">
      <h2>1. 开端词</h2>
      <BilingualLiturgicalBlock
        v-for="item in openingBlocks"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />
    </section>

    <section v-if="!isTriduum" class="martyrology-panel prima-office" id="hymnus">
      <h2>2. 赞美诗 / Hymnus</h2>
      <BilingualLiturgicalBlock
        v-for="item in hymnBlocks"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />
    </section>

    <section class="martyrology-panel prima-office" id="psalmi">
      <h2>3. 圣咏〔依本日圣咏集〕 / Psalmi {ex Psalterio secundum diem}</h2>
      <template v-if="!isTriduum">
        <h3>对经 / Antiphona</h3>
        <BilingualLiturgicalBlock :block="resolution.antiphon" :bilingual="bilingual" />
      </template>
      <BilingualPsalm
        v-for="psalm in resolution.psalms"
        :key="`${psalm.number}:${psalm.verses || ''}`"
        :title="`Psalmus ${psalm.number}`"
        :number="psalm.number"
        :verses="psalm.verses"
        :text="psalm.text"
        :bilingual="bilingual"
        :omit-gloria="resolution.psalmGloriaOmitted"
      />
      <BilingualLiturgicalBlock v-if="!isTriduum" :block="{ ...resolution.antiphon, latin: `Ant. ${resolution.antiphon.latin}` }" :bilingual="bilingual" />
      <section v-if="resolution.includeQuicumque && resolution.quicumque" class="quicumque-notice">
        <h3>不拘谁信经 / Symbolum Quicumque</h3>
        <BilingualLiturgicalBlock
          v-for="item in resolution.quicumque"
          :key="item.id"
          :block="item"
          :bilingual="bilingual"
        />
      </section>
    </section>

    <section v-if="!isTriduum" class="martyrology-panel prima-office" id="capitulum-responsorium-versus">
      <h2>4. 短章、短答咏与短句〔依本日圣咏集〕 / Capitulum Responsorium Versus {ex Psalterio secundum diem}</h2>
      <h3>短章 / Capitulum</h3>
      <p class="inline-help">1 Tim 1,17</p>
      <BilingualLiturgicalBlock :block="resolution.capitulum" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('capitulum.deo-gratias', 'response', '℟. Deo grátias.', '感谢天主。')" :bilingual="bilingual" />

      <h3>短答咏 / Responsorium breve</h3>
      <BilingualLiturgicalBlock
        v-for="item in resolution.responsory.blocks"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />

      <h3>短句 / Versus</h3>
      <BilingualLiturgicalBlock
        v-for="item in resolution.blocks.filter(block => block.id === 'responsory.exsurge' || block.id === 'responsory.libera')"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />
    </section>

    <section v-if="isTriduum" class="martyrology-panel prima-office" id="oratio">
      <h2>5. 祷词 / Oratio</h2>
      <BilingualLiturgicalBlock
        v-for="item in triduumOratioBlocks"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />
    </section>

    <section v-else class="martyrology-panel prima-office" id="oratio">
      <h2>5. 祷词 / Oratio</h2>
      <BilingualLiturgicalBlock :block="block('oratio.domine-exaudi.1', 'verse', '℣. Dómine, exáudi oratiónem meam.', '上主，求你俯听我的祈祷。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('oratio.clamor.1', 'response', '℟. Et clamor meus ad te véniat.', '愿我的呼声上达于你。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('oratio.oremus', 'prayer', 'Orémus.', '请大家祈祷。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="resolution.collect" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('oratio.domine-exaudi.2', 'verse', '℣. Dómine, exáudi oratiónem meam.', '上主，求你俯听我的祈祷。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('oratio.clamor.2', 'response', '℟. Et clamor meus ad te véniat.', '愿我的呼声上达于你。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('oratio.benedicamus', 'verse', '℣. Benedicámus Dómino.', '请赞美上主。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('oratio.deo-gratias', 'response', '℟. Deo grátias.', '感谢天主。')" :bilingual="bilingual" />
    </section>

    <section v-if="!isTriduum" class="martyrology-panel prima-office" id="martyrologium">
      <h2>6. 《罗马殉道录》（预读翌日） / Martyrologium {anticipatur}</h2>
      <MartyrologyReadingBody
        embedded
        :fixed-day="fixedDay"
        :movable-feast="movableFeast"
        :omitted="omitted || resolution.martyrologyOmitted"
        :target-key="targetKey"
      />
      <BilingualLiturgicalBlock :block="block('martyrology.et-alibi', 'verse', '℣. Et álibi aliórum plurimórum sanctórum Mártyrum et Confessórum, atque sanctárum Vírginum.', '在其他地方，还有许多圣殉道者、精修者及圣童贞女。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('martyrology.deo-gratias', 'response', '℟. Deo grátias.', '感谢天主。')" :bilingual="bilingual" />
      <span id="pretiosa" class="hidden-anchor" />
      <BilingualLiturgicalBlock
        v-for="item in resolution.blocks.filter(block => block.id.startsWith('martyrology.'))"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />
    </section>

    <section v-if="!isTriduum" class="martyrology-panel prima-office" id="officium-capituli">
      <h2>7. 会院日课 / De Officio Capituli</h2>
      <BilingualLiturgicalBlock
        v-for="item in chapterBlocks.slice(0, 8)"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />

      <BilingualLiturgicalBlock :block="chapterBlocks.find(item => item.id === 'chapter.kyrie')!" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="block('chapter.pater-rubric', 'notice', 'Pater noster dicitur secreto usque ad “Et ne nos indúcas in tentatiónem”.', '天主经默念，直到“不要让我们陷于诱惑”。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="chapterBlocks.find(item => item.id === 'chapter.pater-secret')!" :bilingual="bilingual" />

      <BilingualLiturgicalBlock
        v-for="item in chapterBlocks.filter(block => ['chapter.et-ne-nos', 'chapter.sed-libera', 'chapter.respice', 'chapter.respice.response'].includes(block.id))"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />
      <BilingualLiturgicalBlock :block="block('chapter.gloria-short', 'verse', '℣. Glória Patri, et Fílio, et Spirítui Sancto.', '愿光荣归于父、及子、及圣神。')" :bilingual="bilingual" />

      <BilingualLiturgicalBlock :block="block('chapter.oremus', 'prayer', 'Orémus.', '请大家祈祷。')" :bilingual="bilingual" />
      <BilingualLiturgicalBlock :block="chapterBlocks.find(item => item.id === 'chapter.dirigere')!" :bilingual="bilingual" />
    </section>

    <section v-if="!isTriduum" class="martyrology-panel prima-office" id="lectio-brevis">
      <h2>{{ lectioBrevisTitle(resolution) }}</h2>
      <label class="prima-inline-option">
        <input v-model="hasPriestPresiding" type="checkbox">
        有神父主礼
      </label>
      <BilingualLiturgicalBlock
        :block="hasPriestPresiding
          ? block('lectio.iube-domne', 'verse', 'Iube, domne, benedícere.', '请神父祝福。')
          : block('lectio.iube-domine', 'verse', 'Iube, Dómine, benedícere.', '上主，求你降福。')"
        :bilingual="bilingual"
      />

      <h3>降福 / Benedictio</h3>
      <BilingualLiturgicalBlock :block="block('lectio.benedictio', 'prayer', 'Dies et actus nostros in sua pace dispónat Dóminus omnípotens. Amen.', '愿全能的上主安排我们的时日和行为，使之安处于他的平安中。阿们。')" :bilingual="bilingual" />

      <p class="inline-help">2 Thess 3:5</p>
      <BilingualLiturgicalBlock :block="resolution.lectioBrevis" :bilingual="bilingual" />
      <BilingualLiturgicalBlock
        v-for="item in resolution.blocks.filter(block => block.id === 'lectio.tu-autem' || block.id === 'common.deo-gratias')"
        :key="item.id"
        :block="item"
        :bilingual="bilingual"
      />
    </section>

    <section v-if="!isTriduum" class="martyrology-panel prima-office" id="conclusio">
      <h2>9. 结束词 / Conclusio</h2>
      <template v-for="item in resolution.blocks.filter(block => block.id.startsWith('ending.') || block.id === 'common.amen')" :key="item.id">
        <h3 v-if="item.id === 'ending.dominus-nos'">降福 / Benedictio</h3>
        <BilingualLiturgicalBlock :block="item" :bilingual="bilingual" />
      </template>
    </section>
  </template>
</template>
