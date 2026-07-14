import { defineAppSetup } from 'valaxy'
import SaturdayMaryConcludingPrayers from '../components/saturday-mary-office/SaturdayMaryConcludingPrayers.vue'
import SaturdayMaryDaytimePsalmody from '../components/saturday-mary-office/SaturdayMaryDaytimePsalmody.vue'
import SaturdayMaryEligibilityNotice from '../components/saturday-mary-office/SaturdayMaryEligibilityNotice.vue'
import SaturdayMaryOpeningVerse from '../components/saturday-mary-office/SaturdayMaryOpeningVerse.vue'
import SaturdayMaryOfficeOptions from '../components/saturday-mary-office/SaturdayMaryOfficeOptions.vue'
import SaturdayMaryPsalmody from '../components/saturday-mary-office/SaturdayMaryPsalmody.vue'
import SaturdayMaryReadingTwo from '../components/saturday-mary-office/SaturdayMaryReadingTwo.vue'

export default defineAppSetup(({ app }) => {
  app.component('SaturdayMaryConcludingPrayers', SaturdayMaryConcludingPrayers)
  app.component('SaturdayMaryDaytimePsalmody', SaturdayMaryDaytimePsalmody)
  app.component('SaturdayMaryEligibilityNotice', SaturdayMaryEligibilityNotice)
  app.component('SaturdayMaryOpeningVerse', SaturdayMaryOpeningVerse)
  app.component('SaturdayMaryOfficeOptions', SaturdayMaryOfficeOptions)
  app.component('SaturdayMaryPsalmody', SaturdayMaryPsalmody)
  app.component('SaturdayMaryReadingTwo', SaturdayMaryReadingTwo)
})
