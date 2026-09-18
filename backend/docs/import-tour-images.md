# Local tour image importer

Run from `backend/` after placing images in `seed-assets/tours/<exact-tour-slug>/`. The folder name must exactly match a `Tour.slug`. The script is separate from the normal Prisma seed and does not create tours.

1. Preview and validate with `npm run import:tour-images -- --dry-run`.
2. Review the complete output. If it is correct, run `npm run import:tour-images` yourself.

The dry run reads the database and files but does not upload, insert, or delete anything. The real run uploads sequentially to `safar-pk/tours/<tour-slug>/`, storing secure URLs and public IDs. Files sort naturally (for example, `01.jpg`, `02.jpg`, `03.jpg`) and receive `sortOrder` 0, 1, 2. Alt text uses the database tour title. JPEG, PNG, and WebP files up to 5 MiB are supported; extensions and signatures must agree. Hidden files, `Thumbs.db`, and `desktop.ini` are ignored.

Preflight checks every database tour and folder before any upload. Missing matches, counts other than three, unsupported entries, invalid signatures, oversized files, or ambiguous filename order stop the entire run. A tour with existing images is skipped on both dry and real runs. There is no `--force` mode or automatic replacement.

On a failure within one tour, the importer deletes assets and rows it created for that tour. It leaves pre-existing rows untouched. If cleanup itself fails, it reports the Cloudinary public ID or database row ID for manual recovery and exits with a failure status. It does not hold a database transaction open during network calls or delete source files.

At the time of the initial read-only dry run, the configured database contained **20 tours**, with **20 matching folders** and **60 valid images**. This includes the draft `sharan-forest-camping-tour` and archived `gorakh-hill-weekend-tour`. The brief expected 18 tours/54 images, so review whether those two should also receive images before running the real command. The importer never changes their status.
