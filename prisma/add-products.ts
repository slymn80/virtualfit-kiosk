import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const p = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

const PRODUCTS = [
  // ─── MEN SUITS ───
  { id: "prod_m_suit01", gender: "men", categoryId: "cat_m_suits", name: "Navy Blue Classic Suit", nameEn: "Navy Blue Classic Suit", nameTr: "Lacivert Klasik Takım Elbise", nameRu: "Классический тёмно-синий костюм", nameKk: "Классикалық қара-көк костюм", brand: "ZARA Man", color: "Navy Blue", garmentImageUrl: p(6764990) },
  { id: "prod_m_suit02", gender: "men", categoryId: "cat_m_suits", name: "Charcoal Grey Slim Suit", nameEn: "Charcoal Grey Slim Suit", nameTr: "Antrasit Gri Slim Takım", nameRu: "Антрацитовый серый slim костюм", nameKk: "Антрацит сұр slim костюм", brand: "Reserved", color: "Charcoal", garmentImageUrl: p(3812433) },
  { id: "prod_m_suit03", gender: "men", categoryId: "cat_m_suits", name: "Black Formal Suit", nameEn: "Black Formal Suit", nameTr: "Siyah Resmi Takım Elbise", nameRu: "Чёрный официальный костюм", nameKk: "Қара ресми костюм", brand: "Mango Man", color: "Black", garmentImageUrl: p(4940756) },

  // ─── MEN T-SHIRTS ───
  { id: "prod_m_tee01", gender: "men", categoryId: "cat_m_shirts", name: "White Classic T-Shirt", nameEn: "White Classic T-Shirt", nameTr: "Beyaz Klasik Tişört", nameRu: "Белая классическая футболка", nameKk: "Ақ классикалық футболка", brand: "H&M", color: "White", garmentImageUrl: p(12039633) },
  { id: "prod_m_tee02", gender: "men", categoryId: "cat_m_shirts", name: "Black Basic T-Shirt", nameEn: "Black Basic T-Shirt", nameTr: "Siyah Basic Tişört", nameRu: "Чёрная базовая футболка", nameKk: "Қара базалық футболка", brand: "Pull&Bear", color: "Black", garmentImageUrl: p(5746100) },
  { id: "prod_m_tee03", gender: "men", categoryId: "cat_m_shirts", name: "Grey Oversized T-Shirt", nameEn: "Grey Oversized T-Shirt", nameTr: "Gri Oversize Tişört", nameRu: "Серая оверсайз футболка", nameKk: "Сұр oversize футболка", brand: "Bershka", color: "Grey", garmentImageUrl: p(4169370) },

  // ─── MEN SHIRTS ───
  { id: "prod_m_shirt01", gender: "men", categoryId: "cat_m_shirts", name: "White Oxford Dress Shirt", nameEn: "White Oxford Dress Shirt", nameTr: "Beyaz Oxford Gömlek", nameRu: "Белая оксфордская рубашка", nameKk: "Ақ оксфорд жейдесі", brand: "ZARA Man", color: "White", garmentImageUrl: p(28576623) },
  { id: "prod_m_shirt02", gender: "men", categoryId: "cat_m_shirts", name: "Blue Slim Fit Shirt", nameEn: "Blue Slim Fit Shirt", nameTr: "Mavi Slim Fit Gömlek", nameRu: "Синяя рубашка slim fit", nameKk: "Көк slim fit жейде", brand: "Massimo Dutti", color: "Blue", garmentImageUrl: p(10558182) },
  { id: "prod_m_shirt03", gender: "men", categoryId: "cat_m_shirts", name: "Black Formal Shirt", nameEn: "Black Formal Shirt", nameTr: "Siyah Resmi Gömlek", nameRu: "Чёрная официальная рубашка", nameKk: "Қара ресми жейде", brand: "Reserved", color: "Black", garmentImageUrl: p(3965545) },

  // ─── MEN PANTS ───
  { id: "prod_m_pants01", gender: "men", categoryId: "cat_m_pants", name: "Slim Fit Blue Jeans", nameEn: "Slim Fit Blue Jeans", nameTr: "Slim Fit Mavi Kot", nameRu: "Синие джинсы slim fit", nameKk: "Slim fit көк джинс", brand: "Levi's", color: "Blue", garmentImageUrl: p(4109797) },
  { id: "prod_m_pants02", gender: "men", categoryId: "cat_m_pants", name: "Black Chino Pants", nameEn: "Black Chino Pants", nameTr: "Siyah Chino Pantolon", nameRu: "Чёрные брюки чинос", nameKk: "Қара чино шалбары", brand: "Mango Man", color: "Black", garmentImageUrl: p(2129970) },
  { id: "prod_m_pants03", gender: "men", categoryId: "cat_m_pants", name: "Dark Wash Straight Jeans", nameEn: "Dark Wash Straight Jeans", nameTr: "Koyu Yıkamalı Düz Paça Kot", nameRu: "Прямые джинсы тёмного окраса", nameKk: "Қою жуылған тік джинс", brand: "Levi's", color: "Dark Blue", garmentImageUrl: p(16390578) },

  // ─── WOMEN DRESSES ───
  { id: "prod_w_dress01", gender: "women", categoryId: "cat_w_dresses", name: "Floral Midi Dress", nameEn: "Floral Midi Dress", nameTr: "Çiçekli Midi Elbise", nameRu: "Цветочное миди платье", nameKk: "Гүлді миди көйлек", brand: "Zara", color: "Multicolor", garmentImageUrl: p(5405644) },
  { id: "prod_w_dress02", gender: "women", categoryId: "cat_w_dresses", name: "Black Evening Dress", nameEn: "Black Evening Dress", nameTr: "Siyah Gece Elbisesi", nameRu: "Чёрное вечернее платье", nameKk: "Қара кешкі көйлек", brand: "Mango", color: "Black", garmentImageUrl: p(14577586) },
  { id: "prod_w_dress03", gender: "women", categoryId: "cat_w_dresses", name: "White Linen Summer Dress", nameEn: "White Linen Summer Dress", nameTr: "Beyaz Keten Yaz Elbisesi", nameRu: "Белое льняное летнее платье", nameKk: "Ақ зығыр жазғы көйлек", brand: "H&M", color: "White", garmentImageUrl: p(6069079) },

  // ─── WOMEN TOPS ───
  { id: "prod_w_top01", gender: "women", categoryId: "cat_w_tops", name: "White Basic Top", nameEn: "White Basic Top", nameTr: "Beyaz Basic Üst", nameRu: "Белый базовый топ", nameKk: "Ақ базалық үстіңгі киім", brand: "H&M", color: "White", garmentImageUrl: p(12039633) },
  { id: "prod_w_top02", gender: "women", categoryId: "cat_w_tops", name: "Striped Casual Top", nameEn: "Striped Casual Top", nameTr: "Çizgili Casual Üst", nameRu: "Полосатый кежуал топ", nameKk: "Жолақты кежуал үстіңгі киім", brand: "Bershka", color: "Blue/White", garmentImageUrl: p(4169370) },
  { id: "prod_w_top03", gender: "women", categoryId: "cat_w_tops", name: "Black Ribbed Tank Top", nameEn: "Black Ribbed Tank Top", nameTr: "Siyah Fitilli Kolsuz Üst", nameRu: "Чёрный рифлёный топ", nameKk: "Қара қабырғалы жеңсіз үстіңгі", brand: "Pull&Bear", color: "Black", garmentImageUrl: p(5746100) },

  // ─── WOMEN BLOUSES/SHIRTS ───
  { id: "prod_w_blouse01", gender: "women", categoryId: "cat_w_tops", name: "White Silk Blouse", nameEn: "White Silk Blouse", nameTr: "Beyaz İpek Bluz", nameRu: "Белая шёлковая блуза", nameKk: "Ақ жібек блузка", brand: "Massimo Dutti", color: "White", garmentImageUrl: p(28576623) },
  { id: "prod_w_blouse02", gender: "women", categoryId: "cat_w_tops", name: "Floral Chiffon Blouse", nameEn: "Floral Chiffon Blouse", nameTr: "Çiçekli Şifon Bluz", nameRu: "Цветочная шифоновая блуза", nameKk: "Гүлді шифон блузка", brand: "Zara", color: "Multicolor", garmentImageUrl: p(10558182) },
  { id: "prod_w_blouse03", gender: "women", categoryId: "cat_w_tops", name: "Navy Linen Shirt", nameEn: "Navy Linen Shirt", nameTr: "Lacivert Keten Gömlek", nameRu: "Тёмно-синяя льняная рубашка", nameKk: "Қара-көк зығыр жейде", brand: "Mango", color: "Navy", garmentImageUrl: p(3965545) },

  // ─── WOMEN BOTTOMS ───
  { id: "prod_w_bottom01", gender: "women", categoryId: "cat_w_bottoms", name: "High Waist Black Jeans", nameEn: "High Waist Black Jeans", nameTr: "Yüksek Bel Siyah Kot", nameRu: "Чёрные джинсы с высокой талией", nameKk: "Жоғары белді қара джинс", brand: "Levi's", color: "Black", garmentImageUrl: p(4109797) },
  { id: "prod_w_bottom02", gender: "women", categoryId: "cat_w_bottoms", name: "Wide Leg White Trousers", nameEn: "Wide Leg White Trousers", nameTr: "Geniş Paça Beyaz Pantolon", nameRu: "Широкие белые брюки", nameKk: "Кең балақты ақ шалбар", brand: "Zara", color: "White", garmentImageUrl: p(2129970) },
  { id: "prod_w_bottom03", gender: "women", categoryId: "cat_w_bottoms", name: "Floral Pleated Midi Skirt", nameEn: "Floral Pleated Midi Skirt", nameTr: "Çiçekli Pileli Midi Etek", nameRu: "Цветочная плиссированная юбка миди", nameKk: "Гүлді қатпарлы миди юбка", brand: "Mango", color: "Multicolor", garmentImageUrl: p(1598507) },

  // ─── CHILDREN DRESSES/SETS ───
  { id: "prod_k_dress01", gender: "children", categoryId: "cat_k_dresses", name: "Girls Pink Party Dress", nameEn: "Girls Pink Party Dress", nameTr: "Kız Çocuk Pembe Parti Elbisesi", nameRu: "Розовое платье для девочки", nameKk: "Қыздарға арналған қызғылт той көйлегі", brand: "Zara Kids", color: "Pink", garmentImageUrl: p(5982376) },
  { id: "prod_k_dress02", gender: "children", categoryId: "cat_k_dresses", name: "Girls Floral Print Dress", nameEn: "Girls Floral Print Dress", nameTr: "Kız Çocuk Çiçekli Elbise", nameRu: "Платье с цветочным принтом для девочки", nameKk: "Қыздарға арналған гүлді басылымды көйлек", brand: "H&M Kids", color: "Multicolor", garmentImageUrl: p(14577586) },
  { id: "prod_k_dress03", gender: "children", categoryId: "cat_k_dresses", name: "Boys Formal Suit Set", nameEn: "Boys Formal Suit Set", nameTr: "Erkek Çocuk Resmi Takım", nameRu: "Официальный костюм для мальчика", nameKk: "Ұлдарға арналған ресми костюм", brand: "Reserved Kids", color: "Navy", garmentImageUrl: p(6764990) },

  // ─── CHILDREN T-SHIRTS ───
  { id: "prod_k_tee01", gender: "children", categoryId: "cat_k_tops", name: "Boys Striped T-Shirt", nameEn: "Boys Striped T-Shirt", nameTr: "Erkek Çocuk Çizgili Tişört", nameRu: "Полосатая футболка для мальчика", nameKk: "Ұлдарға арналған жолақты футболка", brand: "H&M Kids", color: "Blue/White", garmentImageUrl: p(12039633) },
  { id: "prod_k_tee02", gender: "children", categoryId: "cat_k_tops", name: "Girls Pink T-Shirt", nameEn: "Girls Pink T-Shirt", nameTr: "Kız Çocuk Pembe Tişört", nameRu: "Розовая футболка для девочки", nameKk: "Қыздарға арналған қызғылт футболка", brand: "Zara Kids", color: "Pink", garmentImageUrl: p(5746100) },
  { id: "prod_k_tee03", gender: "children", categoryId: "cat_k_tops", name: "Unisex Graphic Tee", nameEn: "Unisex Graphic Tee", nameTr: "Unisex Baskılı Tişört", nameRu: "Унисекс футболка с принтом", nameKk: "Унисекс басылымды футболка", brand: "Adidas Kids", color: "White", garmentImageUrl: p(4169370) },

  // ─── CHILDREN SHIRTS ───
  { id: "prod_k_shirt01", gender: "children", categoryId: "cat_k_tops", name: "Boys Checkered Shirt", nameEn: "Boys Checkered Shirt", nameTr: "Erkek Çocuk Kareli Gömlek", nameRu: "Клетчатая рубашка для мальчика", nameKk: "Ұлдарға арналған торлы жейде", brand: "H&M Kids", color: "Blue/White", garmentImageUrl: p(28576623) },
  { id: "prod_k_shirt02", gender: "children", categoryId: "cat_k_tops", name: "Girls White Blouse", nameEn: "Girls White Blouse", nameTr: "Kız Çocuk Beyaz Bluz", nameRu: "Белая блуза для девочки", nameKk: "Қыздарға арналған ақ блузка", brand: "Zara Kids", color: "White", garmentImageUrl: p(10558182) },
  { id: "prod_k_shirt03", gender: "children", categoryId: "cat_k_tops", name: "Boys Cotton Polo Shirt", nameEn: "Boys Cotton Polo Shirt", nameTr: "Erkek Çocuk Pamuklu Polo", nameRu: "Хлопковое поло для мальчика", nameKk: "Ұлдарға арналған мақта поло", brand: "Ralph Lauren Kids", color: "Navy", garmentImageUrl: p(3812433) },

  // ─── CHILDREN PANTS ───
  { id: "prod_k_pants01", gender: "children", categoryId: "cat_k_tops", name: "Boys Slim Jeans", nameEn: "Boys Slim Jeans", nameTr: "Erkek Çocuk Slim Jean", nameRu: "Slim джинсы для мальчика", nameKk: "Ұлдарға арналған slim джинс", brand: "H&M Kids", color: "Blue", garmentImageUrl: p(4109797) },
  { id: "prod_k_pants02", gender: "children", categoryId: "cat_k_tops", name: "Girls Floral Leggings", nameEn: "Girls Floral Leggings", nameTr: "Kız Çocuk Çiçekli Tayt", nameRu: "Цветочные леггинсы для девочки", nameKk: "Қыздарға арналған гүлді легинс", brand: "Zara Kids", color: "Multicolor", garmentImageUrl: p(2129970) },
  { id: "prod_k_pants03", gender: "children", categoryId: "cat_k_tops", name: "Boys Cargo Pants", nameEn: "Boys Cargo Pants", nameTr: "Erkek Çocuk Kargo Pantolon", nameRu: "Карго брюки для мальчика", nameKk: "Ұлдарға арналған карго шалбар", brand: "Reserved Kids", color: "Khaki", garmentImageUrl: p(16390578) },
];

async function main() {
  console.log(`Adding ${PRODUCTS.length} products...`);
  let created = 0;
  let skipped = 0;

  for (const prod of PRODUCTS) {
    const exists = await db.product.findUnique({ where: { id: prod.id } });
    if (exists) { skipped++; continue; }
    await db.product.create({
      data: { ...prod, storeId: "store_default", thumbnailUrl: prod.garmentImageUrl, isActive: true },
    });
    created++;
    process.stdout.write(`  ✓ ${prod.name}\n`);
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
