import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const company = await db.company.upsert({
    where: { slug: "demo-company" },
    update: {},
    create: {
      id: "company_demo",
      name: "Demo Fashion Group",
      slug: "demo-company",
      contactEmail: "admin@demo.com",
    },
  });

  const store = await db.store.upsert({
    where: { id: "store_default" },
    update: {},
    create: {
      id: "store_default",
      companyId: company.id,
      name: "VirtualFit Demo Store",
      slug: "demo-store",
      city: "Almaty",
      country: "KZ",
      defaultLanguage: "en",
      n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? "",
      n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET ?? "secret",
      sessionTtlMinutes: 60,
      autoDeleteMinutes: 30,
    },
  });

  await db.languageSettings.upsert({
    where: { id: "lang_default" },
    update: {},
    create: {
      id: "lang_default",
      storeId: store.id,
      enabledLocales: "en,tr,ru,kk",
      defaultLocale: "en",
    },
  });

  await db.kioskDevice.upsert({
    where: { deviceCode: "DEMO-01" },
    update: {},
    create: {
      id: "device_demo_01",
      storeId: store.id,
      name: "Kiosk 1",
      deviceCode: "DEMO-01",
      status: "ONLINE",
    },
  });

  // --- Categories (gender-based) ---
  const categories = [
    // Women
    {
      id: "cat_w_dresses",
      gender: "women",
      name: "Dresses",
      nameEn: "Dresses", nameTr: "Elbiseler", nameRu: "Платья", nameKk: "Көйлектер",
      imageUrl: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",
      sortOrder: 0,
    },
    {
      id: "cat_w_tops",
      gender: "women",
      name: "Tops & Blouses",
      nameEn: "Tops & Blouses", nameTr: "Üstler & Bluzlar", nameRu: "Топы и блузы", nameKk: "Жоғарғы киімдер",
      imageUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",
      sortOrder: 1,
    },
    {
      id: "cat_w_jackets",
      gender: "women",
      name: "Jackets & Coats",
      nameEn: "Jackets & Coats", nameTr: "Ceketler & Montlar", nameRu: "Куртки и пальто", nameKk: "Куртка және пальто",
      imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
      sortOrder: 2,
    },
    {
      id: "cat_w_bottoms",
      gender: "women",
      name: "Skirts & Pants",
      nameEn: "Skirts & Pants", nameTr: "Etekler & Pantolonlar", nameRu: "Юбки и брюки", nameKk: "Юбкалар мен шалбарлар",
      imageUrl: "https://images.unsplash.com/photo-1619603364853-4f1c7b9e4e47?w=400&q=80",
      sortOrder: 3,
    },
    // Men
    {
      id: "cat_m_shirts",
      gender: "men",
      name: "Shirts & T-Shirts",
      nameEn: "Shirts & T-Shirts", nameTr: "Gömlekler & Tişörtler", nameRu: "Рубашки и футболки", nameKk: "Жейделер мен футболкалар",
      imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80",
      sortOrder: 0,
    },
    {
      id: "cat_m_jackets",
      gender: "men",
      name: "Jackets & Coats",
      nameEn: "Jackets & Coats", nameTr: "Ceketler & Montlar", nameRu: "Куртки и пальто", nameKk: "Куртка және пальто",
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
      sortOrder: 1,
    },
    {
      id: "cat_m_pants",
      gender: "men",
      name: "Pants & Jeans",
      nameEn: "Pants & Jeans", nameTr: "Pantolonlar & Kotlar", nameRu: "Брюки и джинсы", nameKk: "Шалбарлар мен джинстар",
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
      sortOrder: 2,
    },
    {
      id: "cat_m_suits",
      gender: "men",
      name: "Suits",
      nameEn: "Suits", nameTr: "Takım Elbiseler", nameRu: "Костюмы", nameKk: "Іскерлік киімдер",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
      sortOrder: 3,
    },
    // Children
    {
      id: "cat_k_tops",
      gender: "children",
      name: "Tops & T-Shirts",
      nameEn: "Tops & T-Shirts", nameTr: "Üstler & Tişörtler", nameRu: "Верх и футболки", nameKk: "Жоғарғы киімдер",
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80",
      sortOrder: 0,
    },
    {
      id: "cat_k_dresses",
      gender: "children",
      name: "Dresses & Sets",
      nameEn: "Dresses & Sets", nameTr: "Elbiseler & Takımlar", nameRu: "Платья и комплекты", nameKk: "Көйлектер мен жиынтықтар",
      imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80",
      sortOrder: 1,
    },
    {
      id: "cat_k_jackets",
      gender: "children",
      name: "Jackets & Outerwear",
      nameEn: "Jackets & Outerwear", nameTr: "Ceketler & Dış Giyim", nameRu: "Куртки и верхняя одежда", nameKk: "Сыртқы киімдер",
      imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80",
      sortOrder: 2,
    },
  ];

  for (const cat of categories) {
    await db.productCategory.upsert({
      where: { id: cat.id },
      update: { gender: cat.gender },
      create: { ...cat, storeId: store.id },
    });
  }

  // --- Products ---
  const products = [
    // === WOMEN (5) ===
    {
      id: "prod_w01",
      gender: "women",
      categoryId: "cat_w_dresses",
      name: "Floral Summer Dress",
      nameEn: "Floral Summer Dress", nameTr: "Çiçekli Yaz Elbisesi", nameRu: "Цветочное летнее платье", nameKk: "Гүлді жазғы көйлек",
      brand: "Zara",
      color: "Multicolor",
      garmentImageUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=300&q=80",
    },
    {
      id: "prod_w02",
      gender: "women",
      categoryId: "cat_w_dresses",
      name: "Red Evening Dress",
      nameEn: "Red Evening Dress", nameTr: "Kırmızı Gece Elbisesi", nameRu: "Красное вечернее платье", nameKk: "Қызыл кешкі көйлек",
      brand: "Reserved",
      color: "Red",
      garmentImageUrl: "https://images.unsplash.com/photo-1566479179817-44900ba70fa0?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1566479179817-44900ba70fa0?w=300&q=80",
    },
    {
      id: "prod_w03",
      gender: "women",
      categoryId: "cat_w_tops",
      name: "White Classic Blouse",
      nameEn: "White Classic Blouse", nameTr: "Beyaz Klasik Bluz", nameRu: "Белая классическая блуза", nameKk: "Ақ классикалық блузка",
      brand: "H&M",
      color: "White",
      garmentImageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&q=80",
    },
    {
      id: "prod_w04",
      gender: "women",
      categoryId: "cat_w_tops",
      name: "Navy Blue Blouse",
      nameEn: "Navy Blue Blouse", nameTr: "Lacivert Bluz", nameRu: "Тёмно-синяя блуза", nameKk: "Қара-көк блузка",
      brand: "Mango",
      color: "Navy",
      garmentImageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&q=80",
    },
    {
      id: "prod_w05",
      gender: "women",
      categoryId: "cat_w_jackets",
      name: "Beige Trench Coat",
      nameEn: "Beige Trench Coat", nameTr: "Bej Trençkot", nameRu: "Бежевый тренч", nameKk: "Бежевый тренч",
      brand: "Mango",
      color: "Beige",
      garmentImageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&q=80",
    },

    // === MEN (5) ===
    {
      id: "prod_m01",
      gender: "men",
      categoryId: "cat_m_shirts",
      name: "White Oxford Shirt",
      nameEn: "White Oxford Shirt", nameTr: "Beyaz Oxford Gömlek", nameRu: "Белая оксфордская рубашка", nameKk: "Ақ оксфорд жейдесі",
      brand: "ZARA Man",
      color: "White",
      garmentImageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&q=80",
    },
    {
      id: "prod_m02",
      gender: "men",
      categoryId: "cat_m_shirts",
      name: "Black Slim Turtleneck",
      nameEn: "Black Slim Turtleneck", nameTr: "Siyah Slim Balıkçı", nameRu: "Чёрная водолазка slim", nameKk: "Қара slim водолазка",
      brand: "Pull&Bear",
      color: "Black",
      garmentImageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&q=80",
    },
    {
      id: "prod_m03",
      gender: "men",
      categoryId: "cat_m_jackets",
      name: "Black Leather Jacket",
      nameEn: "Black Leather Jacket", nameTr: "Siyah Deri Ceket", nameRu: "Чёрная кожаная куртка", nameKk: "Қара былғары куртка",
      brand: "Pull&Bear",
      color: "Black",
      garmentImageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80",
    },
    {
      id: "prod_m04",
      gender: "men",
      categoryId: "cat_m_pants",
      name: "Slim Fit Blue Jeans",
      nameEn: "Slim Fit Blue Jeans", nameTr: "Slim Fit Mavi Kot", nameRu: "Синие джинсы slim fit", nameKk: "Slim fit көк джинс",
      brand: "Levi's",
      color: "Blue",
      garmentImageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80",
    },
    {
      id: "prod_m05",
      gender: "men",
      categoryId: "cat_m_suits",
      name: "Charcoal Business Suit",
      nameEn: "Charcoal Business Suit", nameTr: "Antrasit İş Takımı", nameRu: "Антрацитовый деловой костюм", nameKk: "Антрацит іскерлік костюм",
      brand: "Reserved",
      color: "Charcoal",
      garmentImageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80",
    },

    // === CHILDREN (5) ===
    {
      id: "prod_k01",
      gender: "children",
      categoryId: "cat_k_tops",
      name: "Kids Striped T-Shirt",
      nameEn: "Kids Striped T-Shirt", nameTr: "Çocuk Çizgili Tişört", nameRu: "Детская полосатая футболка", nameKk: "Балалар жолақты футболкасы",
      brand: "H&M Kids",
      color: "Blue/White",
      garmentImageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&q=80",
    },
    {
      id: "prod_k02",
      gender: "children",
      categoryId: "cat_k_tops",
      name: "Girls Floral Top",
      nameEn: "Girls Floral Top", nameTr: "Kız Çocuk Çiçekli Üst", nameRu: "Детский цветочный топ", nameKk: "Қыздар гүлді үстіңгі киім",
      brand: "Zara Kids",
      color: "Pink",
      garmentImageUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=300&q=80",
    },
    {
      id: "prod_k03",
      gender: "children",
      categoryId: "cat_k_dresses",
      name: "Girls Summer Dress",
      nameEn: "Girls Summer Dress", nameTr: "Kız Çocuk Yaz Elbisesi", nameRu: "Детское летнее платье", nameKk: "Қыздар жазғы көйлегі",
      brand: "Reserved Kids",
      color: "Yellow",
      garmentImageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&q=80",
    },
    {
      id: "prod_k04",
      gender: "children",
      categoryId: "cat_k_dresses",
      name: "Boys Tracksuit Set",
      nameEn: "Boys Tracksuit Set", nameTr: "Erkek Çocuk Eşofman Takımı", nameRu: "Детский спортивный костюм", nameKk: "Ұлдар спорт костюмі",
      brand: "Adidas Kids",
      color: "Navy",
      garmentImageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&q=80",
    },
    {
      id: "prod_k05",
      gender: "children",
      categoryId: "cat_k_jackets",
      name: "Kids Puffer Jacket",
      nameEn: "Kids Puffer Jacket", nameTr: "Çocuk Şişme Mont", nameRu: "Детская куртка-пуховик", nameKk: "Балалар пуховик куртка",
      brand: "H&M Kids",
      color: "Red",
      garmentImageUrl: "https://images.unsplash.com/photo-1467043198406-dc953a3defa0?w=600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1467043198406-dc953a3defa0?w=300&q=80",
    },
  ];

  for (const prod of products) {
    await db.product.upsert({
      where: { id: prod.id },
      update: { gender: prod.gender },
      create: { ...prod, storeId: store.id },
    });
  }

  await db.adminUser.upsert({
    where: { email: "admin@virtualfit.io" },
    update: {},
    create: {
      id: "admin_default",
      email: "admin@virtualfit.io",
      name: "Store Admin",
      role: "STORE_MANAGER",
      companyId: company.id,
      storeId: store.id,
      password: "admin123",
    },
  });

  console.log("✓ Seeding complete!");
  console.log(`  Categories: ${categories.length} (women: 4, men: 4, children: 3)`);
  console.log(`  Products: ${products.length} (women: 5, men: 5, children: 5)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
