import 'dotenv/config';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { CloudinaryService } from '../src/cloudinary/cloudinary.service.js';

const assetsPath = fileURLToPath(
  new URL('../seed-assets/tours/', import.meta.url),
);
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const maxImageBytes = 5 * 1024 * 1024;
const filenameOrder = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});

type Tour = {
  id: string;
  slug: string;
  title: string;
  _count: { images: number };
};
type ImageFile = { name: string; path: string; size: number };
type ImportPlan = { tour: Tour; images: ImageFile[] };
type CreatedImage = { id: string; publicId: string };

function safeError(error: unknown): string {
  let message = error instanceof Error ? error.message : String(error);
  for (const secret of [
    process.env.DIRECT_URL,
    process.env.DATABASE_URL,
    process.env.CLOUDINARY_URL,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ]) {
    if (secret) message = message.replaceAll(secret, '[redacted]');
  }
  return message;
}

function validSignature(bytes: Buffer, extension: string): boolean {
  if (extension === '.jpg' || extension === '.jpeg') {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }
  if (extension === '.png') {
    return (
      bytes.length >= 8 &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  return (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  );
}

function ignoredFile(name: string): boolean {
  return name.startsWith('.') || /^(?:Thumbs\.db|desktop\.ini)$/i.test(name);
}

async function preflight(prisma: PrismaClient): Promise<ImportPlan[] | null> {
  const tours = await prisma.tour.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      _count: { select: { images: true } },
    },
  });
  const tourBySlug = new Map(tours.map((tour) => [tour.slug, tour]));
  const issues: string[] = [];
  const plans: ImportPlan[] = [];
  const entries = await readdir(assetsPath, { withFileTypes: true });
  const folders = entries.filter(
    (entry) => entry.isDirectory() && !ignoredFile(entry.name),
  );
  const folderNames = new Set(folders.map((folder) => folder.name));
  if (tours.length === 0 || folders.length === 0) {
    issues.push('Expected at least one database tour and one image folder');
  }

  for (const entry of entries) {
    if (!entry.isDirectory() && !ignoredFile(entry.name)) {
      issues.push(`Unexpected entry in seed-assets/tours: ${entry.name}`);
    }
  }
  for (const tour of tours) {
    if (!folderNames.has(tour.slug))
      issues.push(`Tour without folder: ${tour.slug}`);
  }

  let imageCount = 0;
  for (const folder of folders.sort((a, b) => a.name.localeCompare(b.name))) {
    const tour = tourBySlug.get(folder.name);
    if (!tour) issues.push(`Folder without matching Tour.slug: ${folder.name}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folder.name)) {
      issues.push(`Invalid Cloudinary folder slug: ${folder.name}`);
    }

    const folderEntries = await readdir(join(assetsPath, folder.name), {
      withFileTypes: true,
    });
    const visible = folderEntries.filter((entry) => !ignoredFile(entry.name));
    const imageEntries = visible.filter(
      (entry) =>
        entry.isFile() && extensions.has(extname(entry.name).toLowerCase()),
    );
    if (imageEntries.length !== 3) {
      issues.push(
        `${folder.name}: expected 3 images, found ${imageEntries.length}`,
      );
    }
    for (const entry of visible) {
      if (
        !entry.isFile() ||
        !extensions.has(extname(entry.name).toLowerCase())
      ) {
        issues.push(`${folder.name}: unsupported entry ${entry.name}`);
      }
    }

    imageEntries.sort(
      (a, b) =>
        filenameOrder.compare(a.name, b.name) || a.name.localeCompare(b.name),
    );
    for (let i = 1; i < imageEntries.length; i++) {
      if (
        filenameOrder.compare(
          imageEntries[i - 1].name,
          imageEntries[i].name,
        ) === 0
      ) {
        issues.push(
          `${folder.name}: ambiguous order for ${imageEntries[i - 1].name} and ${imageEntries[i].name}`,
        );
      }
    }

    const images: ImageFile[] = [];
    for (const entry of imageEntries) {
      const path = join(assetsPath, folder.name, entry.name);
      const fileStat = await stat(path);
      if (fileStat.size === 0 || fileStat.size > maxImageBytes) {
        issues.push(
          `${folder.name}/${entry.name}: must be between 1 byte and 5 MiB`,
        );
        continue;
      }
      const bytes = await readFile(path);
      if (!validSignature(bytes, extname(entry.name).toLowerCase())) {
        issues.push(
          `${folder.name}/${entry.name}: file signature does not match extension`,
        );
        continue;
      }
      images.push({ name: entry.name, path, size: fileStat.size });
      imageCount++;
    }
    if (tour) plans.push({ tour, images });
  }

  console.log('Pre-flight validation');
  console.log(`Database tours: ${tours.length}`);
  console.log(`Image folders: ${folders.length}`);
  console.log(`Images validated: ${imageCount}`);
  console.log(
    `Folders without tours: ${folders.filter((folder) => !tourBySlug.has(folder.name)).length}`,
  );
  console.log(
    `Tours without folders: ${tours.filter((tour) => !folderNames.has(tour.slug)).length}`,
  );
  if (issues.length) {
    for (const issue of issues) console.error(`  ERROR ${issue}`);
    console.error(
      `Pre-flight failed with ${issues.length} issue(s). No images were uploaded.`,
    );
    return null;
  }
  console.log('Pre-flight passed.');
  return plans;
}

async function rollbackTour(
  prisma: PrismaClient,
  cloudinary: CloudinaryService,
  created: CreatedImage[],
): Promise<number> {
  let rolledBack = 0;
  for (const image of [...created].reverse()) {
    try {
      await cloudinary.deleteImage(image.publicId);
    } catch (error) {
      console.error(
        `  CLEANUP FAILED for ${image.publicId}: ${safeError(error)}; database row retained`,
      );
      continue;
    }
    try {
      await prisma.tourImage.delete({ where: { id: image.id } });
      rolledBack++;
    } catch (error) {
      console.error(
        `  CLEANUP FAILED for image row ${image.id}: ${safeError(error)}; Cloudinary asset is gone`,
      );
    }
  }
  return rolledBack;
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--dry-run')) {
    throw new Error(
      'Only --dry-run is supported. Existing images are never force-replaced.',
    );
  }
  const dryRun = args.includes('--dry-run');
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString)
    throw new Error('DIRECT_URL is required for the importer.');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    const plans = await preflight(prisma);
    if (!plans) {
      process.exitCode = 1;
      return;
    }

    if (dryRun)
      console.log(
        '\nDry run: no Cloudinary uploads or database writes will occur.',
      );
    else console.log('\nImporting...');
    const cloudinary = dryRun
      ? null
      : new CloudinaryService(new ConfigService());
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    let uploaded = 0;
    let rolledBack = 0;

    for (const [index, plan] of plans.entries()) {
      const { tour, images } = plan;
      // Recheck at execution time so a rerun does not append to a populated tour.
      const existing = await prisma.tourImage.count({
        where: { tourId: tour.id },
      });
      if (existing > 0) {
        console.log(
          `[${index + 1}/${plans.length}] SKIP ${tour.slug} — already has ${existing} image(s)`,
        );
        skipped++;
        continue;
      }
      console.log(
        `[${index + 1}/${plans.length}] ${dryRun ? 'WOULD IMPORT' : 'IMPORT'} ${tour.slug}`,
      );
      if (dryRun) {
        for (const [order, image] of images.entries()) {
          console.log(
            `  ${image.name} → sortOrder ${order}, ${tour.title} - image ${order + 1}`,
          );
        }
        continue;
      }

      const created: CreatedImage[] = [];
      try {
        for (const [order, image] of images.entries()) {
          const bytes = await readFile(image.path);
          if (
            bytes.length !== image.size ||
            !validSignature(bytes, extname(image.name).toLowerCase())
          ) {
            throw new Error(
              `${image.name} changed after pre-flight; aborting this tour`,
            );
          }
          const result = await cloudinary!.uploadTourImage(bytes, tour.slug);
          uploaded++;
          try {
            const row = await prisma.tourImage.create({
              data: {
                tourId: tour.id,
                url: result.url,
                publicId: result.publicId,
                altText: `${tour.title} - image ${order + 1}`,
                sortOrder: order,
              },
            });
            created.push({ id: row.id, publicId: result.publicId });
          } catch (error) {
            try {
              await cloudinary!.deleteImage(result.publicId);
              rolledBack++;
            } catch (cleanupError) {
              console.error(
                `  CLEANUP FAILED for newly uploaded ${result.publicId}: ${safeError(cleanupError)}`,
              );
            }
            throw error;
          }
          console.log(`  ✓ ${image.name}`);
        }
        imported++;
      } catch (error) {
        failed++;
        console.error(`  FAILED ${tour.slug}: ${safeError(error)}`);
        rolledBack += await rollbackTour(prisma, cloudinary!, created);
      }
    }

    console.log('\nSummary');
    console.log(`Tours discovered: ${plans.length}`);
    console.log(`Tours imported: ${imported}`);
    console.log(`Tours skipped: ${skipped}`);
    console.log(`Tours failed: ${failed}`);
    console.log(`Images uploaded: ${uploaded}`);
    console.log(`Images cleaned up: ${rolledBack}`);
    if (dryRun) console.log(`Tours ready to import: ${plans.length - skipped}`);
    if (failed) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((error: unknown) => {
  console.error(`Import stopped: ${safeError(error)}`);
  process.exitCode = 1;
});
