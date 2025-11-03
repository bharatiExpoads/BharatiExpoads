const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed Hoarding
  const hoarding = await prisma.hoarding.create({
    data: {
      location: 'Main Street',
      width: 20,
      height: 10,
      totalSqFt: 200,
      illumination: true,
      displayChargesPerMonth: 1000,
      oneTimePrintingCost: 200,
      oneTimeMountingCost: 100,
      totalCost: 1300,
      availability: 'IMMEDIATELY',
      mediaType: 'Hoarding',
      status: 'ACTIVE',
      adminId: (await prisma.user.findFirst({ where: { role: 'ADMIN' } })).id
    }
  });

  // Seed Enquiry
  await prisma.enquiry.create({
    data: {
      name: 'Demo Client',
      contactNumber: '9999999999',
      whatsappNumber: '9999999999',
      email: 'demo@client.com',
      companyName: 'Demo Co',
      type: 'Client',
      mediaRequirement: 'Hoarding',
      locationState: 'DemoState',
      locationCity: 'DemoCity',
      manualLocation: 'Near Park',
      tentativeStartDate: new Date().toISOString(),
      tentativeDuration: '2 months',
      progressStatus: 'NotStarted',
    }
  });

  console.log('Seeded demo data!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 