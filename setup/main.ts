import { defineAppSetup } from 'valaxy'
import { setupNavigationRecovery } from '../features/site/navigationRecovery'
import SaturdayMaryConcludingPrayers from '../components/saturday-mary-office/SaturdayMaryConcludingPrayers.vue'
import SaturdayMaryDaytimePsalmody from '../components/saturday-mary-office/SaturdayMaryDaytimePsalmody.vue'
import SaturdayMaryEligibilityNotice from '../components/saturday-mary-office/SaturdayMaryEligibilityNotice.vue'
import SaturdayMaryOpeningVerse from '../components/saturday-mary-office/SaturdayMaryOpeningVerse.vue'
import SaturdayMaryOfficeOptions from '../components/saturday-mary-office/SaturdayMaryOfficeOptions.vue'
import SaturdayMaryPsalmody from '../components/saturday-mary-office/SaturdayMaryPsalmody.vue'
import SaturdayMaryReadingTwo from '../components/saturday-mary-office/SaturdayMaryReadingTwo.vue'

const globalComponents = {
  SaturdayMaryConcludingPrayers,
  SaturdayMaryDaytimePsalmody,
  SaturdayMaryEligibilityNotice,
  SaturdayMaryOpeningVerse,
  SaturdayMaryOfficeOptions,
  SaturdayMaryPsalmody,
  SaturdayMaryReadingTwo,
}

export default defineAppSetup(({ app, router, isClient }) => {
  Object.entries(globalComponents).forEach(([name, component]) => {
    app.component(name, component)
  })
  // 站内点击跳转加载失败或太慢时，改为直接打开目标页（见 features/site/navigationRecovery.ts）
  if (isClient && router)
    setupNavigationRecovery(router)
})
