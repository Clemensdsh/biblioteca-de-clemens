<script lang="ts" setup>
// Overrides valaxy-theme-yun's YunPostActions (v0.28.11) with nothing.
// The original calls useCopyMarkdown(), which sends a HEAD request for `<route>.md` on every page
// and only shows its "Copy / View Markdown" menu if that file exists. The .md files are emitted
// only when `siteConfig.llms.files` is enabled, which this site does not do (and should not:
// it would publish raw text of noindex books), so the probe always 404s in the console
// and the menu never renders. Rendering nothing keeps the page identical without the 404.
</script>

<template>
  <!-- intentionally empty -->
</template>
