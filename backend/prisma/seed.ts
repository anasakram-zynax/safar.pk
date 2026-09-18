import "dotenv/config";
import { PrismaClient, TourStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("Starting database seed...");

    const passwordHash = await bcrypt.hash("Password123!", 12);

    const admin = await prisma.user.upsert({
        where: {
            email: "admin@safar.pk",
        },
        update: {},
        create: {
            email: "admin@safar.pk",
            passwordHash,
            firstName: "Safar",
            lastName: "Admin",
            role: UserRole.ADMIN,
        },
    });

    const customer = await prisma.user.upsert({
        where: {
            email: "customer@safar.pk",
        },
        update: {},
        create: {
            email: "customer@safar.pk",
            passwordHash,
            firstName: "Test",
            lastName: "Customer",
            role: UserRole.CUSTOMER,
        },
    });

    console.log(`Admin created: ${admin.email}`);
    console.log(`Customer created: ${customer.email}`);

    const tagData = [
        { name: "Adventure", slug: "adventure" },
        { name: "Family", slug: "family" },
        { name: "Nature", slug: "nature" },
        { name: "Cultural", slug: "cultural" },
        { name: "Hiking", slug: "hiking" },
        { name: "Weekend", slug: "weekend" },
        { name: "Sightseeing", slug: "sightseeing" },
        { name: "Camping", slug: "camping" },
    ];

    const tags = new Map<string, string>();

    for (const tag of tagData) {
        const createdTag = await prisma.tag.upsert({
            where: {
                slug: tag.slug,
            },
            update: {
                name: tag.name,
            },
            create: tag,
        });

        tags.set(tag.slug, createdTag.id);
    }

    console.log(`${tags.size} tags seeded.`);
    const tours = [
        {
            title: "Hunza Valley Adventure",
            slug: "hunza-valley-adventure",
            description:
                "Explore the breathtaking landscapes of Hunza Valley, visit historic forts, experience local culture, and enjoy panoramic mountain views.",
            location: "Hunza, Gilgit-Baltistan",
            price: 45000,
            durationDays: 5,
            status: TourStatus.PUBLISHED,
            tags: ["adventure", "nature", "sightseeing"],
        },
        {
            title: "Skardu Explorer",
            slug: "skardu-explorer",
            description:
                "Discover Skardu's dramatic mountain scenery, beautiful lakes, valleys, and some of the most memorable landscapes in northern Pakistan.",
            location: "Skardu, Gilgit-Baltistan",
            price: 52000,
            durationDays: 6,
            status: TourStatus.PUBLISHED,
            tags: ["adventure", "nature", "sightseeing"],
        },
        {
            title: "Fairy Meadows Adventure",
            slug: "fairy-meadows-adventure",
            description:
                "Experience Fairy Meadows with spectacular views of Nanga Parbat, scenic hiking routes, and an unforgettable mountain environment.",
            location: "Fairy Meadows, Gilgit-Baltistan",
            price: 48000,
            durationDays: 5,
            status: TourStatus.PUBLISHED,
            tags: ["adventure", "hiking", "camping"],
        },
        {
            title: "Swat Valley Escape",
            slug: "swat-valley-escape",
            description:
                "Enjoy the rivers, green valleys, mountain scenery, and popular attractions of the beautiful Swat Valley.",
            location: "Swat, Khyber Pakhtunkhwa",
            price: 32000,
            durationDays: 4,
            status: TourStatus.PUBLISHED,
            tags: ["family", "nature", "sightseeing"],
        },
        {
            title: "Lahore Heritage Tour",
            slug: "lahore-heritage-tour",
            description:
                "Explore Lahore's historic landmarks, architecture, cultural streets, and famous heritage locations on a guided city experience.",
            location: "Lahore, Punjab",
            price: 8500,
            durationDays: 1,
            status: TourStatus.PUBLISHED,
            tags: ["cultural", "family", "sightseeing"],
        },
        {
            title: "Murree Weekend Getaway",
            slug: "murree-weekend-getaway",
            description:
                "Spend a relaxing weekend in Murree surrounded by pine-covered hills, viewpoints, local attractions, and cool mountain weather.",
            location: "Murree, Punjab",
            price: 18000,
            durationDays: 2,
            status: TourStatus.PUBLISHED,
            tags: ["weekend", "family", "nature"],
        },
        {
            title: "Neelum Valley Discovery",
            slug: "neelum-valley-discovery",
            description:
                "Travel through Neelum Valley and discover riverside scenery, mountain villages, forests, and peaceful natural landscapes.",
            location: "Neelum Valley, Azad Kashmir",
            price: 38000,
            durationDays: 5,
            status: TourStatus.PUBLISHED,
            tags: ["nature", "family", "sightseeing"],
        },
        {
            title: "Naran Kaghan Adventure",
            slug: "naran-kaghan-adventure",
            description:
                "Discover the spectacular scenery of Naran and Kaghan with mountain views, valleys, lakes, and popular sightseeing destinations.",
            location: "Naran, Khyber Pakhtunkhwa",
            price: 35000,
            durationDays: 4,
            status: TourStatus.PUBLISHED,
            tags: ["adventure", "nature", "family"],
        },
        {
            title: "Shogran and Siri Paye Escape",
            slug: "shogran-siri-paye-escape",
            description:
                "Visit Shogran and the beautiful Siri Paye meadows for mountain views, green landscapes, and a refreshing short escape.",
            location: "Shogran, Khyber Pakhtunkhwa",
            price: 26000,
            durationDays: 3,
            status: TourStatus.PUBLISHED,
            tags: ["nature", "weekend", "adventure"],
        },
        {
            title: "Kalam Valley Tour",
            slug: "kalam-valley-tour",
            description:
                "Explore Kalam and its surrounding natural attractions with forests, rivers, mountain scenery, and memorable viewpoints.",
            location: "Kalam, Khyber Pakhtunkhwa",
            price: 34000,
            durationDays: 4,
            status: TourStatus.PUBLISHED,
            tags: ["nature", "family", "adventure"],
        },
        {
            title: "Chitral Explorer",
            slug: "chitral-explorer",
            description:
                "Discover the landscapes, communities, historical sites, and mountain scenery surrounding the beautiful Chitral region.",
            location: "Chitral, Khyber Pakhtunkhwa",
            price: 49000,
            durationDays: 6,
            status: TourStatus.PUBLISHED,
            tags: ["cultural", "nature", "adventure"],
        },
        {
            title: "Kalash Valley Cultural Tour",
            slug: "kalash-valley-cultural-tour",
            description:
                "Experience the distinctive cultural heritage and mountain landscapes of the Kalash valleys while exploring local communities respectfully.",
            location: "Kalash Valley, Khyber Pakhtunkhwa",
            price: 42000,
            durationDays: 5,
            status: TourStatus.PUBLISHED,
            tags: ["cultural", "nature", "sightseeing"],
        },
        {
            title: "Deosai Plains Adventure",
            slug: "deosai-plains-adventure",
            description:
                "Journey across the vast landscapes of Deosai National Park and experience high-altitude plains, wildlife habitats, and dramatic scenery.",
            location: "Deosai, Gilgit-Baltistan",
            price: 55000,
            durationDays: 5,
            status: TourStatus.PUBLISHED,
            tags: ["adventure", "nature", "camping"],
        },
        {
            title: "Khunjerab Pass Expedition",
            slug: "khunjerab-pass-expedition",
            description:
                "Travel along the Karakoram Highway toward Khunjerab Pass while enjoying extraordinary mountain scenery and iconic northern landmarks.",
            location: "Khunjerab, Gilgit-Baltistan",
            price: 58000,
            durationDays: 6,
            status: TourStatus.PUBLISHED,
            tags: ["adventure", "nature", "sightseeing"],
        },
        {
            title: "Naltar Valley Escape",
            slug: "naltar-valley-escape",
            description:
                "Explore the colorful lakes, forests, and mountain surroundings of Naltar Valley on a peaceful northern Pakistan getaway.",
            location: "Naltar Valley, Gilgit-Baltistan",
            price: 37000,
            durationDays: 4,
            status: TourStatus.PUBLISHED,
            tags: ["nature", "adventure", "family"],
        },
        {
            title: "Ratti Gali Lake Trek",
            slug: "ratti-gali-lake-trek",
            description:
                "Take an adventurous journey toward Ratti Gali Lake through beautiful alpine scenery and rewarding mountain landscapes.",
            location: "Neelum Valley, Azad Kashmir",
            price: 39000,
            durationDays: 4,
            status: TourStatus.PUBLISHED,
            tags: ["hiking", "adventure", "nature"],
        },
        {
            title: "Kumrat Valley Adventure",
            slug: "kumrat-valley-adventure",
            description:
                "Experience Kumrat Valley's forests, rivers, mountains, and camping environments on an adventurous trip into northern Pakistan.",
            location: "Kumrat Valley, Khyber Pakhtunkhwa",
            price: 36000,
            durationDays: 4,
            status: TourStatus.PUBLISHED,
            tags: ["camping", "adventure", "nature"],
        },
        {
            title: "Islamabad City Explorer",
            slug: "islamabad-city-explorer",
            description:
                "Discover major attractions across Islamabad with a convenient city tour covering landmarks, viewpoints, and cultural destinations.",
            location: "Islamabad",
            price: 9500,
            durationDays: 1,
            status: TourStatus.PUBLISHED,
            tags: ["family", "sightseeing", "cultural"],
        },

        // Useful for testing admin-only draft visibility later.
        {
            title: "Sharan Forest Camping Tour",
            slug: "sharan-forest-camping-tour",
            description:
                "A planned forest camping experience featuring natural surroundings, outdoor activities, and a peaceful mountain environment.",
            location: "Sharan Forest, Khyber Pakhtunkhwa",
            price: 29000,
            durationDays: 3,
            status: TourStatus.DRAFT,
            tags: ["camping", "nature", "adventure"],
        },

        // Useful for testing archived tours later.
        {
            title: "Gorakh Hill Weekend Tour",
            slug: "gorakh-hill-weekend-tour",
            description:
                "A weekend trip to Gorakh Hill featuring elevated landscapes, scenic views, and an escape from the surrounding plains.",
            location: "Gorakh Hill, Sindh",
            price: 24000,
            durationDays: 2,
            status: TourStatus.ARCHIVED,
            tags: ["weekend", "nature", "adventure"],
        },
    ];

    for (const tourData of tours) {
        const { tags: tourTags, ...data } = tourData;

        const tour = await prisma.tour.upsert({
            where: {
                slug: data.slug,
            },

            update: {
                ...data,
            },

            create: {
                ...data,
            },
        });

        // Make the seed repeatable.
        await prisma.tourTag.deleteMany({
            where: {
                tourId: tour.id,
            },
        });

        await prisma.tourTag.createMany({
            data: tourTags.map((tagSlug) => ({
                tourId: tour.id,
                tagId: tags.get(tagSlug)!,
            })),
        });
    }

    console.log(`${tours.length} tours seeded.`);
    console.log("Database seeding completed successfully.");
}

main()
    .catch((error) => {
        console.error("Database seeding failed:");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });