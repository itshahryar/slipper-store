import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Seeding database with Men, Women, Kids, and Care categories...");

  // Seed Admin User
  const adminEmail = "admin@slipperstore.com";
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.adminUser.create({
      data: {
        name: "Store Administrator",
        email: adminEmail,
        password: hashPassword("admin123"),
      },
    });
    console.log("Default admin created: admin@slipperstore.com / admin123");
  }

  // 1. Create Main Categories (Men, Women, Kids, Care & Accessories)
  const menCat = await prisma.category.upsert({
    where: { slug: "men" },
    update: { name: "MEN" },
    create: { name: "MEN", slug: "men", isActive: true },
  });

  const womenCat = await prisma.category.upsert({
    where: { slug: "women" },
    update: { name: "WOMEN" },
    create: { name: "WOMEN", slug: "women", isActive: true },
  });

  const kidsCat = await prisma.category.upsert({
    where: { slug: "kids" },
    update: { name: "KIDS" },
    create: { name: "KIDS", slug: "kids", isActive: true },
  });

  const careCat = await prisma.category.upsert({
    where: { slug: "care-accessories" },
    update: { name: "CARE & ACCESSORIES" },
    create: { name: "CARE & ACCESSORIES", slug: "care-accessories", isActive: true },
  });

  // 2. Create SubCategories under each category
  const leatherSub = await prisma.subCategory.upsert({
    where: { slug: "men-leather-slippers" },
    update: { categoryId: menCat.id },
    create: { name: "Leather Slippers", slug: "men-leather-slippers", categoryId: menCat.id, isActive: true },
  });

  const chappalSub = await prisma.subCategory.upsert({
    where: { slug: "men-chappal-sandals" },
    update: { categoryId: menCat.id },
    create: { name: "Chappal & Sandals", slug: "men-chappal-sandals", categoryId: menCat.id, isActive: true },
  });

  const peshawariSub = await prisma.subCategory.upsert({
    where: { slug: "men-peshawari" },
    update: { categoryId: menCat.id },
    create: { name: "Peshawari Chappal", slug: "men-peshawari", categoryId: menCat.id, isActive: true },
  });

  const womenPlushSub = await prisma.subCategory.upsert({
    where: { slug: "women-plush-slippers" },
    update: { categoryId: womenCat.id },
    create: { name: "Plush Home Slippers", slug: "women-plush-slippers", categoryId: womenCat.id, isActive: true },
  });

  const womenSlideSub = await prisma.subCategory.upsert({
    where: { slug: "women-comfort-slides" },
    update: { categoryId: womenCat.id },
    create: { name: "Comfort Slides", slug: "women-comfort-slides", categoryId: womenCat.id, isActive: true },
  });

  const kidsSlideSub = await prisma.subCategory.upsert({
    where: { slug: "kids-fun-slides" },
    update: { categoryId: kidsCat.id },
    create: { name: "Fun Slides & Slippers", slug: "kids-fun-slides", categoryId: kidsCat.id, isActive: true },
  });

  const polishSub = await prisma.subCategory.upsert({
    where: { slug: "polish-care-kits" },
    update: { categoryId: careCat.id },
    create: { name: "Polish & Care Kits", slug: "polish-care-kits", categoryId: careCat.id, isActive: true },
  });

  // Re-link any existing products to new subcategories
  await prisma.product.updateMany({
    data: { subCategoryId: leatherSub.id },
  });

  // Clean up legacy footwear category if exists
  await prisma.category.deleteMany({
    where: { slug: "footwear" },
  });

  // 3. Seed Products under SubCategories
  const productsData = [
    {
      name: "Executive Italian Calfskin Slipper",
      slug: "executive-italian-calfskin-slipper",
      description:
        "Crafted from full-grain Italian calfskin leather with a cushioned leather footbed and durable non-slip rubber sole. Handcrafted for supreme comfort and effortless luxury.",
      subCategoryId: leatherSub.id,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1582844245749-6fa6731995cb?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
      ],
      variants: [
        { size: "EU 41", color: "Chestnut Brown", sku: "SLP-EXEC-BRN-41", stock: 15, price: 12999 },
        { size: "EU 42", color: "Chestnut Brown", sku: "SLP-EXEC-BRN-42", stock: 20, price: 12999 },
        { size: "EU 43", color: "Chestnut Brown", sku: "SLP-EXEC-BRN-43", stock: 12, price: 12999 },
        { size: "EU 41", color: "Obsidian Black", sku: "SLP-EXEC-BLK-41", stock: 10, price: 12999 },
        { size: "EU 42", color: "Obsidian Black", sku: "SLP-EXEC-BLK-42", stock: 18, price: 12999 },
      ],
    },
    {
      name: "Traditional Handcrafted Peshawari Chappal",
      slug: "traditional-handcrafted-peshawari-chappal",
      description:
        "Authentic full-grain leather Peshawari chappal with tire sole and comfortable leather inner padding. Traditional elegance meets contemporary comfort.",
      subCategoryId: peshawariSub.id,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
      ],
      variants: [
        { size: "EU 41", color: "Mustard Tan", sku: "PESH-TAN-41", stock: 10, price: 8999 },
        { size: "EU 42", color: "Mustard Tan", sku: "PESH-TAN-42", stock: 14, price: 8999 },
        { size: "EU 43", color: "Deep Black", sku: "PESH-BLK-43", stock: 8, price: 8999 },
      ],
    },
    {
      name: "Plush Cloud Memory Foam Slipper",
      slug: "plush-cloud-memory-foam-slipper",
      description:
        "Step onto pure clouds with ultra-soft faux shearling lining and high-density memory foam support. Perfect for cold mornings and relaxed indoor living.",
      subCategoryId: womenPlushSub.id,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800",
      ],
      variants: [
        { size: "Medium (EU 39-41)", color: "Ivory Cream", sku: "SLP-PLSH-IVR-M", stock: 25, price: 4499 },
        { size: "Large (EU 42-44)", color: "Ivory Cream", sku: "SLP-PLSH-IVR-L", stock: 30, price: 4499 },
        { size: "Medium (EU 39-41)", color: "Charcoal Gray", sku: "SLP-PLSH-GRY-M", stock: 22, price: 4499 },
      ],
    },
    {
      name: "Modern Ergonomic Slide Sandal",
      slug: "modern-ergonomic-slide-sandal",
      description:
        "Water-resistant molded EVA slide with arch-contoured footbed. Engineered for modern casual wear, poolside relaxing, and easy quick slip-ons.",
      subCategoryId: chappalSub.id,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800",
      ],
      variants: [
        { size: "EU 40", color: "Navy Blue", sku: "SLP-SLD-NVY-40", stock: 15, price: 5499 },
        { size: "EU 41", color: "Navy Blue", sku: "SLP-SLD-NVY-41", stock: 20, price: 5499 },
        { size: "EU 42", color: "Navy Blue", sku: "SLP-SLD-NVY-42", stock: 16, price: 5499 },
      ],
    },
    {
      name: "Premium Leather Slipper Care & Polish Kit",
      slug: "premium-leather-slipper-care-polish-kit",
      description:
        "Keep your premium leather slippers supple and radiant. Includes natural beeswax polish, 100% horsehair shine brush, micro-fiber buffing cloth, and leather conditioner.",
      subCategoryId: polishSub.id,
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
      ],
      variants: [
        { size: "Standard Kit", color: "Natural Polish & Brush", sku: "SLP-CARE-KIT-01", stock: 50, price: 2799 },
      ],
    },
  ];

  for (const item of productsData) {
    const { variants, ...productData } = item;
    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...productData,
          variants: {
            create: variants,
          },
        },
      });
      console.log(`Created product: ${productData.name}`);
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: { subCategoryId: productData.subCategoryId },
      });
    }
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
