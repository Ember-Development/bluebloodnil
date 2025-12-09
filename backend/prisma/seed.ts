import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🗑️  Cleaning existing data...");
  await prisma.todo.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.scenarioIdea.deleteMany();
  await prisma.athleteInterest.deleteMany();
  await prisma.athleteSocialProfile.deleteMany();
  await prisma.parentContact.deleteMany();
  await prisma.content.deleteMany();
  await prisma.campaignParticipant.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.athleteProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create test athletes for onboarding
  console.log("👤 Creating test athletes...");

  // Athlete 1: New athlete - needs onboarding (profileComplete: false)
  const athlete1 = await prisma.user.create({
    data: {
      email: "athlete1@test.com",
      role: "ATHLETE",
      externalId: "bomber-001",
      athlete: {
        create: {
          name: "Anabella Abdullah",
          firstName: "Anabella",
          lastName: "Abdullah",
          position1: "Shortstop",
          position2: "Second Base",
          teamName: "Texas Bombers Gold 18U",
          jerseyNumber: 12,
          gradYear: 2027,
          classYear: 2027,
          ageGroup: "18U",
          address: "123 Main St, Houston, TX 77001",
          profileComplete: false, // Incomplete - will trigger onboarding
        },
      },
    },
    include: {
      athlete: true,
    },
  });

  // Add parent contact for athlete 1
  if (athlete1.athlete) {
    await prisma.parentContact.create({
      data: {
        athleteId: athlete1.athlete.id,
        firstName: "Sara",
        lastName: "Abdullah",
        email: "sara.abdullah@example.com",
        phone: "555-0100",
        relationship: "Mother",
      },
    });
  }

  console.log(
    `✅ Created athlete 1: ${athlete1.email} (User ID: ${athlete1.id})`
  );

  // Athlete 2: Another new athlete
  const athlete2 = await prisma.user.create({
    data: {
      email: "athlete2@test.com",
      role: "ATHLETE",
      externalId: "bomber-002",
      athlete: {
        create: {
          name: "Marcus Johnson",
          firstName: "Marcus",
          lastName: "Johnson",
          position1: "Pitcher",
          position2: "First Base",
          teamName: "Texas Bombers Gold 18U",
          jerseyNumber: 24,
          gradYear: 2026,
          classYear: 2026,
          ageGroup: "18U",
          address: "456 Oak Ave, Dallas, TX 75201",
          profileComplete: false,
        },
      },
    },
    include: {
      athlete: true,
    },
  });

  console.log(
    `✅ Created athlete 2: ${athlete2.email} (User ID: ${athlete2.id})`
  );

  // Athlete 3: Partially complete profile (has some data but still needs onboarding)
  const athlete3 = await prisma.user.create({
    data: {
      email: "athlete3@test.com",
      role: "ATHLETE",
      externalId: "bomber-003",
      athlete: {
        create: {
          name: "Emma Rodriguez",
          firstName: "Emma",
          lastName: "Rodriguez",
          position1: "Catcher",
          teamName: "Texas Bombers Gold 18U",
          jerseyNumber: 7,
          gradYear: 2028,
          classYear: 2028,
          ageGroup: "16U",
          address: "789 Pine Rd, Austin, TX 78701",
          sport: "Softball", // Some onboarding data already filled
          location: "Austin, TX",
          profileComplete: false,
        },
      },
    },
    include: {
      athlete: true,
    },
  });

  // Add a social profile to athlete 3 (partially complete)
  if (athlete3.athlete) {
    await prisma.athleteSocialProfile.create({
      data: {
        athleteId: athlete3.athlete.id,
        platform: "instagram",
        handle: "@emma.softball",
        followers: 5000,
        avgEngagementRate: 6.5,
        avgViews: 2000,
        postingCadence: "3-4 posts per week",
      },
    });
  }

  console.log(
    `✅ Created athlete 3: ${athlete3.email} (User ID: ${athlete3.id})`
  );

  // Athlete 4: Fully complete profile (for testing already completed profiles)
  const athlete4 = await prisma.user.create({
    data: {
      email: "athlete4@test.com",
      role: "ATHLETE",
      externalId: "bomber-004",
      athlete: {
        create: {
          name: "Jordan Smith",
          firstName: "Jordan",
          lastName: "Smith",
          position1: "Outfielder",
          position2: "Third Base",
          teamName: "Texas Bombers Gold 18U",
          jerseyNumber: 5,
          gradYear: 2025,
          classYear: 2025,
          ageGroup: "18U",
          address: "321 Elm St, San Antonio, TX 78201",
          sport: "Softball",
          primaryPosition: "Center Field",
          location: "San Antonio, TX",
          bio: "Passionate softball player with a love for the game and helping others grow. Always working on improving my skills and building community.",
          avatarUrl:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=400",
          nilScore: 85,
          profileComplete: true, // Already completed
        },
      },
    },
    include: {
      athlete: true,
    },
  });

  // Add social profiles for complete athlete
  if (athlete4.athlete) {
    await prisma.athleteSocialProfile.createMany({
      data: [
        {
          athleteId: athlete4.athlete.id,
          platform: "instagram",
          handle: "@jordan.softball",
          followers: 8500,
          avgEngagementRate: 7.2,
          avgViews: 3500,
          postingCadence: "4-5 posts per week",
        },
        {
          athleteId: athlete4.athlete.id,
          platform: "tiktok",
          handle: "@jordansmith",
          followers: 12000,
          avgEngagementRate: 8.5,
          avgViews: 5000,
          postingCadence: "3-4 videos per week",
        },
      ],
    });

    // Add interests
    await prisma.athleteInterest.createMany({
      data: [
        {
          athleteId: athlete4.athlete.id,
          label: "Strength Training",
          color: "#e9c46a",
        },
        {
          athleteId: athlete4.athlete.id,
          label: "Photography",
          color: "#d4a373",
        },
        {
          athleteId: athlete4.athlete.id,
          label: "Community Service",
          color: "#2a9d8f",
        },
      ],
    });
  }

  console.log(
    `✅ Created athlete 4 (complete): ${athlete4.email} (User ID: ${athlete4.id})`
  );

  // Create admin users
  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      role: "ADMIN",
    },
  });

  console.log(`✅ Created admin: ${admin.email} (User ID: ${admin.id})`);

  // Create main admin user
  const mainAdmin = await prisma.user.create({
    data: {
      email: "gunnarsmith3@gmail.com",
      role: "ADMIN",
      firstName: "Gunnar",
      lastName: "Smith",
    },
  });

  console.log(
    `✅ Created main admin: ${mainAdmin.email} (User ID: ${mainAdmin.id})`
  );

  console.log("\n📝 Test User IDs (for localStorage userId):");
  console.log("  Athlete 1 (incomplete):", athlete1.id);
  console.log("  Athlete 2 (incomplete):", athlete2.id);
  console.log("  Athlete 3 (partial):   ", athlete3.id);
  console.log("  Athlete 4 (complete):  ", athlete4.id);
  console.log("  Admin (test):         ", admin.id);
  console.log("  Admin (main):          ", mainAdmin.id);

  console.log("\n✨ Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
