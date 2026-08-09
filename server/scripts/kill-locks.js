import prisma from '../config/prisma.js';

async function killHanging() {
  try {
    const activity = await prisma.$queryRaw`
      SELECT pid, state, query, wait_event_type, wait_event
      FROM pg_stat_activity
      WHERE state = 'active' OR state LIKE 'idle in transaction%';
    `;
    console.log("Activity:", activity);

    const hanging = await prisma.$queryRaw`
      SELECT pid FROM pg_stat_activity 
      WHERE state LIKE 'idle in transaction%' 
      AND pid <> pg_backend_pid();
    `;
    
    for (const row of hanging) {
      console.log("Killing pid", row.pid);
      await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(${row.pid})`);
    }

    console.log("Done.");
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

killHanging();
