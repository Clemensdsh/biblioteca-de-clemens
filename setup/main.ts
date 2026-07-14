import { defineAppSetup } from 'valaxy'
import SaturdayMaryConcludingPrayers from '../components/SaturdayMaryConcludingPrayers.vue'
import SaturdayMaryDaytimePsalmody from '../components/SaturdayMaryDaytimePsalmody.vue'
import SaturdayMaryEligibilityNotice from '../components/SaturdayMaryEligibilityNotice.vue'
import SaturdayMaryOpeningVerse from '../components/SaturdayMaryOpeningVerse.vue'
import SaturdayMaryOfficeOptions from '../components/SaturdayMaryOfficeOptions.vue'
import SaturdayMaryPsalmody from '../components/SaturdayMaryPsalmody.vue'
import SaturdayMaryReadingTwo from '../components/SaturdayMaryReadingTwo.vue'

export default defineAppSetup(({ app }) => {
  app.component('SaturdayMaryConcludingPrayers', SaturdayMaryConcludingPrayers)
  app.component('SaturdayMaryDaytimePsalmody', SaturdayMaryDaytimePsalmody)
  app.component('SaturdayMaryEligibilityNotice', SaturdayMaryEligibilityNotice)
  app.component('SaturdayMaryOpeningVerse', SaturdayMaryOpeningVerse)
  app.component('SaturdayMaryOfficeOptions', SaturdayMaryOfficeOptions)
  app.component('SaturdayMaryPsalmody', SaturdayMaryPsalmody)
  app.component('SaturdayMaryReadingTwo', SaturdayMaryReadingTwo)
})
