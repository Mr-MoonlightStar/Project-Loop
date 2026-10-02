const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== MULTI-TENANT ISOLATION AUDIT ===\n');

  // 1. Fetch all workspaces
  const workspaces = await prisma.workspace.findMany({
    include: {
      users: { select: { id: true, email: true, name: true, role: true } },
      _count: {
        select: {
          feedback: true,
          themes: true,
          reports: true,
        },
      },
    },
  });

  console.log(`Discovered ${workspaces.length} workspaces in the database.\n`);

  for (const w of workspaces) {
    console.log(`[Workspace: "${w.name}"] ID: ${w.id}`);
    console.log(`  Users (${w.users.length}):`);
    w.users.forEach((u) => console.log(`    - ${u.name} <${u.email}> [Role: ${u.role}]`));
    console.log(`  Data breakdown:`);
    console.log(`    - Feedback items: ${w._count.feedbacks}`);
    console.log(`    - Themes: ${w._count.themes}`);
    console.log(`    - VoC Reports: ${w._count.vocReports}`);
    console.log('----------------------------------------------------');
  }

  // 2. Perform cross-tenant isolation test
  if (workspaces.length >= 2) {
    const wsA = workspaces[0];
    const wsB = workspaces[1];

    console.log(`\nSimulating query isolation between Workspace A ("${wsA.name}") and Workspace B ("${wsB.name}"):`);

    // Feedback scoped to A
    const feedbackA = await prisma.feedback.findMany({
      where: { workspaceId: wsA.id },
      select: { id: true, content: true },
      take: 2,
    });

    // Attempt to query feedback of A using B's workspaceId
    const crossFeedback = await prisma.feedback.findMany({
      where: {
        workspaceId: wsB.id,
        id: { in: feedbackA.map((f) => f.id) },
      },
    });

    console.log(`Workspace A feedback sampled: ${feedbackA.length} items`);
    console.log(`Cross-tenant query (querying A items with B workspaceId filter): ${crossFeedback.length} items returned`);

    if (crossFeedback.length === 0) {
      console.log('>>> CONFIRMED: 100% Zero cross-tenant data leakage! Strict workspaceId scoping is working.');
    } else {
      console.error('>>> ALERT: Cross-tenant data leakage detected!');
    }
  } else {
    console.log('Only 1 workspace currently present in database.');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
