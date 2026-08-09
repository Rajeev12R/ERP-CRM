import prisma from '../config/prisma.js';

async function seedDemoData() {
  console.log("Starting DB seed for demo video...");

  try {
    // 1. Get an existing user to act as the creator
    let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) {
      adminUser = await prisma.user.findFirst();
    }
    
    if (!adminUser) {
      console.log("No users found. Creating a default admin user.");
      adminUser = await prisma.user.create({
        data: {
          name: 'Demo Admin',
          email: 'admin@minierp.com',
          password: 'hashed_password_placeholder', // Usually we hash it, but this is just for relations
          role: 'ADMIN'
        }
      });
    }

    const userId = adminUser.id;

    // 2. Create Customers
    console.log("Creating customers...");
    const customersData = [
      { name: "TechNova Solutions", mobile: "9876543210", email: "procurement@technova.in", businessName: "TechNova Pvt Ltd", gstNumber: "27AADCB2230M1Z2", type: "WHOLESALE", address: "Sector 14, Navi Mumbai", status: "ACTIVE" },
      { name: "Reliance Digital", mobile: "9876543211", email: "orders@reliancedigital.in", businessName: "Reliance Retail Ltd", gstNumber: "27AADCR2230M1Z2", type: "DISTRIBUTOR", address: "Goregaon East, Mumbai", status: "ACTIVE" },
      { name: "Sharma Electronics", mobile: "9876543212", email: "sharma@gmail.com", type: "RETAIL", address: "Karol Bagh, New Delhi", status: "ACTIVE" },
      { name: "Apex Enterprises", mobile: "9876543213", email: "apex@apex.com", businessName: "Apex Enterpises", type: "WHOLESALE", address: "Whitefield, Bangalore", status: "LEAD" },
      { name: "Global Infotech", mobile: "9876543214", email: "info@globalinfo.net", type: "WHOLESALE", address: "Cyber City, Gurgaon", status: "ACTIVE" }
    ];

    const createdCustomers = [];
    for (const c of customersData) {
      const customer = await prisma.customer.create({ data: c });
      createdCustomers.push(customer);
    }

    // 3. Create Products
    console.log("Creating products...");
    const productsData = [
      { name: "MacBook Pro M3 14-inch", sku: "APP-MBP-M3-14", category: "Laptops", unitPrice: 149000, minStockAlert: 5, location: "A1-Rack1" },
      { name: "Dell XPS 15", sku: "DELL-XPS-15", category: "Laptops", unitPrice: 135000, minStockAlert: 3, location: "A1-Rack2" },
      { name: "iPhone 15 Pro", sku: "APP-IP15P-256", category: "Phones", unitPrice: 115000, minStockAlert: 10, location: "B1-Rack1" },
      { name: "Samsung Galaxy S24 Ultra", sku: "SAM-S24U-256", category: "Phones", unitPrice: 125000, minStockAlert: 8, location: "B1-Rack2" },
      { name: "Sony WH-1000XM5", sku: "SONY-WHXM5", category: "Accessories", unitPrice: 28000, minStockAlert: 15, location: "C1-Rack1" },
      { name: "AirPods Pro (2nd Gen)", sku: "APP-AIRPOD-P2", category: "Accessories", unitPrice: 21000, minStockAlert: 20, location: "C1-Rack2" },
      { name: "Logitech MX Master 3S", sku: "LOGI-MXM3S", category: "Accessories", unitPrice: 8500, minStockAlert: 10, location: "C2-Rack1" },
      { name: "LG 27-inch 4K Monitor", sku: "LG-27UK650", category: "Monitors", unitPrice: 32000, minStockAlert: 5, location: "D1-Rack1" }
    ];

    const createdProducts = [];
    for (const p of productsData) {
      // Create product with 0 stock initially
      const product = await prisma.product.create({
        data: { ...p, currentStock: 0 }
      });
      createdProducts.push(product);
      
      // Stock IN movement to give it initial inventory
      const initialStock = Math.floor(Math.random() * 40) + 15; // random 15 to 54
      
      await prisma.$transaction([
        prisma.stockMovement.create({
          data: {
            productId: product.id,
            quantity: initialStock,
            type: "IN",
            reason: "Initial Inventory Import",
            createdBy: userId
          }
        }),
        prisma.product.update({
          where: { id: product.id },
          data: { currentStock: initialStock }
        })
      ]);
      
      // Keep track of the updated product for challans
      product.currentStock = initialStock; 
    }

    // Update some products to trigger Low Stock alerts for the demo
    console.log("Setting some products to low stock...");
    const lowStockProduct1 = createdProducts[0]; // MacBook
    await prisma.$transaction([
        prisma.stockMovement.create({
          data: { productId: lowStockProduct1.id, quantity: lowStockProduct1.currentStock - 2, type: "OUT", reason: "Bulk adjustment to demo low stock", createdBy: userId }
        }),
        prisma.product.update({
          where: { id: lowStockProduct1.id },
          data: { currentStock: 2 } // min stock is 5, so this triggers alert
        })
    ]);

    const lowStockProduct2 = createdProducts[6]; // Logitech Mouse
    await prisma.$transaction([
        prisma.stockMovement.create({
          data: { productId: lowStockProduct2.id, quantity: lowStockProduct2.currentStock - 4, type: "OUT", reason: "Bulk adjustment to demo low stock", createdBy: userId }
        }),
        prisma.product.update({
          where: { id: lowStockProduct2.id },
          data: { currentStock: 4 } // min stock is 10
        })
    ]);

    // 4. Create Challans
    console.log("Creating Sales Challans...");
    
    // Confirmed Challan 1
    const confChallan1 = await prisma.salesChallan.create({
        data: {
            challanNo: `SC-${Date.now() - 100000}`,
            customerId: createdCustomers[0].id,
            createdBy: userId,
            status: "CONFIRMED",
            totalQty: 10,
            createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
            items: {
                create: [
                    { productId: createdProducts[2].id, quantity: 5, unitPrice: createdProducts[2].unitPrice, productName: createdProducts[2].name, sku: createdProducts[2].sku },
                    { productId: createdProducts[5].id, quantity: 5, unitPrice: createdProducts[5].unitPrice, productName: createdProducts[5].name, sku: createdProducts[5].sku }
                ]
            }
        },
        include: { items: true }
    });

    // Deduct stock for the confirmed challan manually to keep db consistent
    for(const item of confChallan1.items) {
        await prisma.stockMovement.create({
            data: { productId: item.productId, quantity: item.quantity, type: "OUT", reason: `Sales Challan ${confChallan1.challanNo}`, createdBy: userId }
        });
        await prisma.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
        });
    }

    // Confirmed Challan 2
    const confChallan2 = await prisma.salesChallan.create({
        data: {
            challanNo: `SC-${Date.now() - 50000}`,
            customerId: createdCustomers[1].id,
            createdBy: userId,
            status: "CONFIRMED",
            totalQty: 2,
            createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
            items: {
                create: [
                    { productId: createdProducts[1].id, quantity: 2, unitPrice: createdProducts[1].unitPrice, productName: createdProducts[1].name, sku: createdProducts[1].sku }
                ]
            }
        },
        include: { items: true }
    });
    for(const item of confChallan2.items) {
        await prisma.stockMovement.create({
            data: { productId: item.productId, quantity: item.quantity, type: "OUT", reason: `Sales Challan ${confChallan2.challanNo}`, createdBy: userId }
        });
        await prisma.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
        });
    }

    // Draft Challan 1
    await prisma.salesChallan.create({
        data: {
            challanNo: `SC-${Date.now() - 10000}`,
            customerId: createdCustomers[2].id,
            createdBy: userId,
            status: "DRAFT",
            totalQty: 3,
            items: {
                create: [
                    { productId: createdProducts[3].id, quantity: 1, unitPrice: createdProducts[3].unitPrice, productName: createdProducts[3].name, sku: createdProducts[3].sku },
                    { productId: createdProducts[4].id, quantity: 2, unitPrice: createdProducts[4].unitPrice, productName: createdProducts[4].name, sku: createdProducts[4].sku }
                ]
            }
        }
    });

    // Draft Challan 2
    await prisma.salesChallan.create({
        data: {
            challanNo: `SC-${Date.now()}`,
            customerId: createdCustomers[4].id,
            createdBy: userId,
            status: "DRAFT",
            totalQty: 1,
            items: {
                create: [
                    { productId: createdProducts[7].id, quantity: 1, unitPrice: createdProducts[7].unitPrice, productName: createdProducts[7].name, sku: createdProducts[7].sku }
                ]
            }
        }
    });

    console.log("Database seeded successfully! Your demo should look great.");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
