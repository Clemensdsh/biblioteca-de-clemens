# Reproducibility

- Generated: 2026-07-21T04:32:26.861Z
- Root manifest hash: 0a8919a3b371095ea8296dcf268dfbd373c7adb59f563caf87652b29d1e6a12c
- Year manifest hash: 5a151f1c90e53db036d2ce251ecdb366c509c52cc5abc5ffe5d4089b6c453b8e
- Shared manifest hash: 1185d1766a1454649d13277ad4ae99ddf4d0c4902b32c9beb8d6cc1c67c5a6db
- Calendar hash: 326931dff9f8d60a11f17436cafce0e94cfcb12705d0dee189d016d6b59e47fb
- Allowed variable fields: generatedAt, report generatedAt, runtime duration fields
- Conclusion: Release packaging is deterministic for stable cached structured exports; a resume rebuild repackages identical source cache with stable schema, block IDs, checksums, and references except generatedAt/report timing fields.
