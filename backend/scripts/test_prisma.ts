import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  console.log("Testing Prisma Connection...");
  try {
    const count = await prisma.user.count();
    console.log(`Total users: ${count}`);

    const admin = await prisma.user.findFirst({
      where: { email: "admin@shivfurniture.com" },
    });

    if (admin) {
      console.log("✅ Admin user found:", admin.id);
    } else {
      console.log("❌ Admin user NOT found");
    }
  } catch (e) {
    console.error("❌ Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
