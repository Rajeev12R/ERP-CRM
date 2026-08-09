import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up data for race condition test...");

  // 1. Create a dummy user, customer, and product
  const user = await prisma.user.upsert({
    where: { email: 'race@test.com' },
    update: {},
    create: { name: 'Race Tester', email: 'race@test.com', password: 'password', role: 'SALES' }
  });

  const customer = await prisma.customer.create({
    data: { name: 'Race Customer', mobile: '1234567890', address: '123 Test St', type: 'RETAIL' }
  });

  const product = await prisma.product.create({
    data: {
      name: 'Race Condition Product',
      sku: `RACE-${Date.now()}`,
      category: 'TEST',
      unitPrice: 100,
      currentStock: 10,
      location: 'A1'
    }
  });

  // 2. Create 3 draft challans that each ask for 5 stock.
  // Since currentStock is 10, only 2 should succeed if run concurrently.
  const challans = [];
  for (let i = 0; i < 3; i++) {
    const challan = await prisma.salesChallan.create({
      data: {
        challanNo: `RC-${Date.now()}-${i}`,
        customerId: customer.id,
        createdBy: user.id,
        status: 'DRAFT',
        totalQty: 5,
        items: {
          create: [{
            productId: product.id,
            quantity: 5,
            productName: product.name,
            sku: product.sku,
            unitPrice: product.unitPrice
          }]
        }
      }
    });
    challans.push(challan);
  }

  console.log(`Created Product ${product.id} with Stock 10`);
  console.log(`Created 3 Draft Challans (5 qty each): ${challans.map(c => c.id).join(', ')}`);

  // 3. Attempt to confirm all 3 concurrently using the logic from the controller
  console.log("Firing concurrent confirmations...");
  
  const results = await Promise.allSettled(
    challans.map(challan => confirmChallanAtomic(challan.id, user.id))
  );

  console.log("\nResults of concurrent confirmations:");
  results.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      console.log(`Challan ${challans[index].id}: SUCCESS`);
    } else {
      console.log(`Challan ${challans[index].id}: FAILED - ${res.reason.message}`);
    }
  });

  // 4. Verify Final Stock
  const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
  console.log(`\nFinal Product Stock: ${finalProduct.currentStock}`);
  
  if (finalProduct.currentStock === 0) {
    console.log("RACE CONDITION TEST PASSED: Stock did not drop below 0.");
  } else {
    console.log("RACE CONDITION TEST FAILED: Stock is unexpected.");
  }

  // Cleanup
  await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
  await prisma.salesChallanItem.deleteMany({ where: { productId: product.id } });
  await prisma.salesChallan.deleteMany({ where: { id: { in: challans.map(c => c.id) } } });
  await prisma.product.delete({ where: { id: product.id } });
  await prisma.customer.delete({ where: { id: customer.id } });
}

// Emulates the confirmChallan controller logic exactly
async function confirmChallanAtomic(challanId, userId) {
    return await prisma.$transaction(async (tx) => {
        const challan = await tx.salesChallan.findUnique({
            where: { id: challanId },
            include: { items: true }
        });
        
        if (!challan || challan.status !== "DRAFT") {
            throw new Error("CHALLAN_NOT_DRAFT");
        }

        for (const item of challan.items) {
            const updated = await tx.product.updateMany({
                where: {
                    id: item.productId,
                    currentStock: { gte: item.quantity }
                },
                data: {
                    currentStock: { decrement: item.quantity }
                }
            });

            if (updated.count === 0) {
                throw new Error(`INSUFFICIENT_STOCK:${item.productId}:${item.quantity}`);
            }

            await tx.stockMovement.create({
                data: {
                    productId: item.productId,
                    quantity: item.quantity,
                    type: "OUT",
                    reason: `Sales Challan ${challan.challanNo}`,
                    createdBy: userId
                }
            });
        }

        return await tx.salesChallan.update({
            where: { id: challanId },
            data: { status: "CONFIRMED" }
        });
    });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
