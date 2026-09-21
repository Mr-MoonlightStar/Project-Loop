import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Project LOOP seed...");

  // 1. Create Demo Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: "clq-acme-workspace-demo-id" },
    update: { name: "Acme Analytics" },
    create: {
      id: "clq-acme-workspace-demo-id",
      name: "Acme Analytics",
    },
  });

  console.log(`✓ Demo Workspace created: ${workspace.name} (${workspace.id})`);

  // 2. Create 3 Role Users (one for each RBAC tier)
  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@loopdemo.com" },
    update: {
      name: "Alice Vance (Admin)",
      role: "ADMIN",
      workspaceId: workspace.id,
      passwordHash,
    },
    create: {
      name: "Alice Vance (Admin)",
      email: "admin@loopdemo.com",
      role: "ADMIN",
      workspaceId: workspace.id,
      passwordHash,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: "analyst@loopdemo.com" },
    update: {
      name: "Bob Stone (Analyst)",
      role: "ANALYST",
      workspaceId: workspace.id,
      passwordHash,
    },
    create: {
      name: "Bob Stone (Analyst)",
      email: "analyst@loopdemo.com",
      role: "ANALYST",
      workspaceId: workspace.id,
      passwordHash,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: "viewer@loopdemo.com" },
    update: {
      name: "Charlie Ray (Viewer)",
      role: "VIEWER",
      workspaceId: workspace.id,
      passwordHash,
    },
    create: {
      name: "Charlie Ray (Viewer)",
      email: "viewer@loopdemo.com",
      role: "VIEWER",
      workspaceId: workspace.id,
      passwordHash,
    },
  });

  console.log(`✓ 3 RBAC Users configured:`);
  console.log(`  - Admin:   ${admin.email}`);
  console.log(`  - Analyst: ${analyst.email}`);
  console.log(`  - Viewer:  ${viewer.email}`);

  // 3. Create Core Themes
  const themesData = [
    { name: "Onboarding & Setup", description: "Sign-up friction, invite flow, first-run experience", color: "#6366F1" },
    { name: "Performance & Latency", description: "Dashboard query speed, page transitions, rendering lag", color: "#EC4899" },
    { name: "Billing & Invoicing", description: "Receipts, seat management, subscription card errors", color: "#F59E0B" },
    { name: "Integrations & API", description: "Webhooks, REST documentation, Slack/CRM connectors", color: "#10B981" },
    { name: "Mobile Responsiveness", description: "Touch target sizing, viewport responsiveness on phones", color: "#3B82F6" },
    { name: "Enterprise & Security", description: "SAML/SSO, audit logs, tenant encryption, SOC2", color: "#8B5CF6" },
  ];

  const createdThemes = [];
  for (const t of themesData) {
    const theme = await prisma.theme.upsert({
      where: {
        workspaceId_name: {
          workspaceId: workspace.id,
          name: t.name,
        },
      },
      update: {
        description: t.description,
        color: t.color,
      },
      create: {
        name: t.name,
        description: t.description,
        color: t.color,
        workspaceId: workspace.id,
      },
    });
    createdThemes.push(theme);
  }
  console.log(`✓ ${createdThemes.length} Themes initialized.`);

  // 4. Create 120+ Varied, Realistic Customer Feedback Items
  // Mix across channels, sentiment (-1 to 1), and realistic dates over last 30 days
  const rawFeedback = [
    // Support Tickets (Negative / Neutral issues)
    { content: "Onboarding took forever — I couldn't figure out how to invite my team members from the dashboard.", channel: "Support Ticket", sentiment: "NEG", score: -0.78, customer: "Enterprise Lead", themeIndex: 0 },
    { content: "Billing page keeps timing out whenever I try to download our VAT invoice.", channel: "Support Ticket", sentiment: "NEG", score: -0.85, customer: "Finance Ops", themeIndex: 2 },
    { content: "Our SSO integration broke following this morning's maintenance window. Need urgent triage.", channel: "Support Ticket", sentiment: "NEG", score: -0.92, customer: "SecOps Admin", themeIndex: 5 },
    { content: "Exporting data to CSV takes over 45 seconds for 5,000 rows. The browser froze twice.", channel: "Support Ticket", sentiment: "NEG", score: -0.70, customer: "Data Analyst", themeIndex: 1 },
    { content: "How do I configure webhook retry policies? Your API documentation is missing the retry payload format.", channel: "Support Ticket", sentiment: "NEU", score: -0.15, customer: "Platform Dev", themeIndex: 3 },
    { content: "Password reset emails are taking 15 minutes to arrive in Outlook inboxes.", channel: "Support Ticket", sentiment: "NEG", score: -0.65, customer: "End User", themeIndex: 0 },
    { content: "Can we get custom invoice billing addresses for our European subsidiary?", channel: "Support Ticket", sentiment: "NEU", score: 0.05, customer: "Controller", themeIndex: 2 },
    { content: "Received a 504 Gateway Timeout while saving our workspace notification preferences.", channel: "Support Ticket", sentiment: "NEG", score: -0.80, customer: "DevOps", themeIndex: 1 },
    { content: "The audit log export doesn't include user IP addresses. We need this for our compliance review.", channel: "Support Ticket", sentiment: "NEG", score: -0.60, customer: "Chief Risk Officer", themeIndex: 5 },
    { content: "Need clarification on seat pricing when upgrading mid-billing cycle.", channel: "Support Ticket", sentiment: "NEU", score: 0.0, customer: "Operations Mgr", themeIndex: 2 },
    { content: "Is there a rate limit on the /api/v1/feedback bulk endpoint?", channel: "Support Ticket", sentiment: "NEU", score: 0.1, customer: "Senior Engineer", themeIndex: 3 },
    { content: "Invite links expire after only 24 hours which isn't enough time across distributed global teams.", channel: "Support Ticket", sentiment: "NEG", score: -0.45, customer: "HR Operations", themeIndex: 0 },
    { content: "Credit card charged twice for annual subscription renewal. Please reverse duplicate transaction.", channel: "Support Ticket", sentiment: "NEG", score: -0.95, customer: "CFO", themeIndex: 2 },
    { content: "Two-factor authentication QR code wasn't scanning on 1Password.", channel: "Support Ticket", sentiment: "NEG", score: -0.55, customer: "Security Analyst", themeIndex: 5 },
    { content: "Webhooks intermittently send duplicate events during peak traffic hours.", channel: "Support Ticket", sentiment: "NEG", score: -0.72, customer: "Backend Lead", themeIndex: 3 },
    { content: "Customer support resolved my billing discrepancy in under 10 minutes. Superb response time!", channel: "Support Ticket", sentiment: "POS", score: 0.90, customer: "Small Biz Owner", themeIndex: 2 },
    { content: "Is it possible to transfer workspace ownership to a new team member?", channel: "Support Ticket", sentiment: "NEU", score: 0.0, customer: "Founder", themeIndex: 0 },
    { content: "Database sync latency is currently hovering around 3.2 seconds on queries.", channel: "Support Ticket", sentiment: "NEG", score: -0.62, customer: "DBA", themeIndex: 1 },
    { content: "Error message when uploading .xlsx file was helpful and showed exactly which column was malformed.", channel: "Support Ticket", sentiment: "POS", score: 0.75, customer: "Analyst", themeIndex: 0 },
    { content: "Need SCIM provisioning support for Okta directory synchronization.", channel: "Support Ticket", sentiment: "NEU", score: 0.0, customer: "IT Director", themeIndex: 5 },

    // App Store Reviews (High sentiment range, mobile emphasis)
    { content: "The new dashboard is gorgeous and finally fast. Huge improvement over last quarter's update.", channel: "App Store", sentiment: "POS", score: 0.94, customer: "Mobile User", themeIndex: 1 },
    { content: "Looks okay on iPad, but on iPhone screens the tables get cut off and navigation is cramped.", channel: "App Store", sentiment: "NEG", score: -0.68, customer: "iOS User", themeIndex: 4 },
    { content: "Essential app for reviewing our customer feedback on the train. Slick dark mode too.", channel: "App Store", sentiment: "POS", score: 0.88, customer: "Product Manager", themeIndex: 4 },
    { content: "Biometric FaceID login fails every second attempt since the latest iOS release.", channel: "App Store", sentiment: "NEG", score: -0.74, customer: "Daily User", themeIndex: 4 },
    { content: "Great utility, but desperately needs offline mode for reading cached reports.", channel: "App Store", sentiment: "NEU", score: 0.20, customer: "Frequent Traveler", themeIndex: 4 },
    { content: "5 stars. Clean, responsive, and doesn't spam unnecessary push notifications.", channel: "App Store", sentiment: "POS", score: 0.96, customer: "Tech Enthusiast", themeIndex: 4 },
    { content: "Font size in the inbox table is too tiny on compact mobile viewports.", channel: "App Store", sentiment: "NEG", score: -0.50, customer: "Mobile Reviewer", themeIndex: 4 },
    { content: "Charts don't rotate to landscape properly on tablets.", channel: "App Store", sentiment: "NEG", score: -0.42, customer: "Tablet User", themeIndex: 4 },
    { content: "Love the push alerts when customer sentiment takes a negative dip.", channel: "App Store", sentiment: "POS", score: 0.82, customer: "Director of CS", themeIndex: 1 },
    { content: "Constantly asks me to re-login every 48 hours on mobile. Session should last longer.", channel: "App Store", sentiment: "NEG", score: -0.60, customer: "Power User", themeIndex: 4 },
    { content: "The AI summary feature on mobile saves me an hour of reading tickets every evening.", channel: "App Store", sentiment: "POS", score: 0.92, customer: "Startup Founder", themeIndex: 0 },
    { content: "Crashes on launch when opening large VoC digest PDF exports.", channel: "App Store", sentiment: "NEG", score: -0.85, customer: "Executive", themeIndex: 4 },
    { content: "Simple and intuitive layout. Exactly what our triage team was searching for.", channel: "App Store", sentiment: "POS", score: 0.85, customer: "Team Lead", themeIndex: 0 },
    { content: "Battery drain feels high when running analytics searches on the go.", channel: "App Store", sentiment: "NEG", score: -0.52, customer: "Commuter", themeIndex: 4 },
    { content: "Filters reset automatically when switching between apps.", channel: "App Store", sentiment: "NEG", score: -0.45, customer: "QA Lead", themeIndex: 4 },
    { content: "Beautiful typography and silky smooth scroll performance.", channel: "App Store", sentiment: "POS", score: 0.91, customer: "Designer", themeIndex: 1 },
    { content: "Can we get native widget support for daily feedback counts?", channel: "App Store", sentiment: "NEU", score: 0.35, customer: "Tech Fan", themeIndex: 4 },
    { content: "Push notification deep linking lands on a blank white screen.", channel: "App Store", sentiment: "NEG", score: -0.79, customer: "Beta Tester", themeIndex: 4 },
    { content: "Solid release. Much snappier than the previous build.", channel: "App Store", sentiment: "POS", score: 0.84, customer: "SaaS Dev", themeIndex: 1 },
    { content: "Requires too many taps just to change the status of an ingested ticket.", channel: "App Store", sentiment: "NEG", score: -0.58, customer: "Customer Support", themeIndex: 4 },

    // NPS & CSAT Surveys
    { content: "It does the job, but the mobile experience still needs serious work.", channel: "NPS Survey", sentiment: "NEU", score: -0.10, customer: "NPS 7 (Passive)", themeIndex: 4 },
    { content: "Project LOOP transformed our executive reporting. Our product review meetings are 100% data-grounded now.", channel: "NPS Survey", sentiment: "POS", score: 0.98, customer: "NPS 10 (Promoter)", themeIndex: 1 },
    { content: "Too expensive for smaller teams that only ingest a few hundred tickets monthly.", channel: "NPS Survey", sentiment: "NEG", score: -0.65, customer: "NPS 4 (Detractor)", themeIndex: 2 },
    { content: "The search capability is lightning fast. We can pinpoint specific customer bug mentions instantly.", channel: "NPS Survey", sentiment: "POS", score: 0.91, customer: "NPS 10 (Promoter)", themeIndex: 1 },
    { content: "I wish there were more out-of-the-box connectors like Jira and Linear sync.", channel: "NPS Survey", sentiment: "NEU", score: 0.15, customer: "NPS 8 (Passive)", themeIndex: 3 },
    { content: "Setting up tenant roles was straightforward and our security team approved it quickly.", channel: "NPS Survey", sentiment: "POS", score: 0.86, customer: "NPS 9 (Promoter)", themeIndex: 5 },
    { content: "The classification accuracy on ambiguous feedback could be slightly better.", channel: "NPS Survey", sentiment: "NEU", score: -0.20, customer: "NPS 6 (Detractor)", themeIndex: 0 },
    { content: "Saved our engineering team from arguing over what features to prioritize next.", channel: "NPS Survey", sentiment: "POS", score: 0.95, customer: "NPS 10 (Promoter)", themeIndex: 1 },
    { content: "Documentation on self-hosting or custom VPC connections is non-existent.", channel: "NPS Survey", sentiment: "NEG", score: -0.58, customer: "NPS 5 (Detractor)", themeIndex: 5 },
    { content: "The weekly digest report generator alone is worth the subscription price.", channel: "NPS Survey", sentiment: "POS", score: 0.93, customer: "NPS 10 (Promoter)", themeIndex: 1 },
    { content: "Filtering by multiple themes simultaneously is buggy.", channel: "NPS Survey", sentiment: "NEG", score: -0.48, customer: "NPS 6 (Detractor)", themeIndex: 1 },
    { content: "Decent tool, but our leadership wants executive slides instead of PDF exports.", channel: "NPS Survey", sentiment: "NEU", score: 0.05, customer: "NPS 7 (Passive)", themeIndex: 1 },
    { content: "Rock solid reliability — zero downtime in the 6 months we've relied on it.", channel: "NPS Survey", sentiment: "POS", score: 0.92, customer: "NPS 10 (Promoter)", themeIndex: 1 },
    { content: "User role restrictions are too rigid; need custom permission roles.", channel: "NPS Survey", sentiment: "NEU", score: -0.30, customer: "NPS 6 (Detractor)", themeIndex: 5 },
    { content: "Easy to onboard new junior analysts without training.", channel: "NPS Survey", sentiment: "POS", score: 0.87, customer: "NPS 9 (Promoter)", themeIndex: 0 },
    { content: "The CSV parser rejected our spreadsheet without indicating what row caused the failure.", channel: "NPS Survey", sentiment: "NEG", score: -0.71, customer: "NPS 5 (Detractor)", themeIndex: 0 },
    { content: "Love the clean, dark-mode design system. Very easy on the eyes during late night shifts.", channel: "NPS Survey", sentiment: "POS", score: 0.89, customer: "NPS 10 (Promoter)", themeIndex: 1 },
    { content: "We need automated Slack notifications when high-severity tickets arrive.", channel: "NPS Survey", sentiment: "NEU", score: 0.10, customer: "NPS 8 (Passive)", themeIndex: 3 },
    { content: "Best customer intelligence tool we have tested so far.", channel: "NPS Survey", sentiment: "POS", score: 0.96, customer: "NPS 10 (Promoter)", themeIndex: 1 },
    { content: "Pricing tier jump between 10 seats and 25 seats is too steep.", channel: "NPS Survey", sentiment: "NEG", score: -0.62, customer: "NPS 5 (Detractor)", themeIndex: 2 },

    // Sales Call Notes (Enterprise, blockers, SSO)
    { content: "Prospect wants SAML SSO before they'll sign — third enterprise account asking this month.", channel: "Sales Call", sentiment: "NEG", score: -0.65, customer: "Fortune 500 Prospect", themeIndex: 5 },
    { content: "VP of Product loved the Ask LOOP grounding demo. Emphasized that zero-hallucination was a mandatory deal-breaker.", channel: "Sales Call", sentiment: "POS", score: 0.91, customer: "Series B SaaS", themeIndex: 1 },
    { content: "Buyer asked if customer feedback can be routed directly into Jira issues automatically.", channel: "Sales Call", sentiment: "NEU", score: 0.20, customer: "Mid-Market Corp", themeIndex: 3 },
    { content: "Security audit requires SOC2 Type II report before we can proceed to pilot phase.", channel: "Sales Call", sentiment: "NEU", score: -0.10, customer: "Fintech Client", themeIndex: 5 },
    { content: "Customer ready to expand from 5 to 50 seats following the success of the Voice-of-Customer report.", channel: "Sales Call", sentiment: "POS", score: 0.97, customer: "Global Logistics", themeIndex: 2 },
    { content: "Client hesitated because their existing CSV feedback exports contain multi-line survey quotes.", channel: "Sales Call", sentiment: "NEU", score: -0.25, customer: "Retail Chain", themeIndex: 0 },
    { content: "Decision maker requested custom SLA guarantees for 99.9% API uptime.", channel: "Sales Call", sentiment: "NEU", score: 0.0, customer: "Healthcare Partner", themeIndex: 3 },
    { content: "Prospect's legal team requires customer data residency in Frankfurt / EU.", channel: "Sales Call", sentiment: "NEU", score: -0.30, customer: "German Enterprise", themeIndex: 5 },
    { content: "Demo was an immediate hit with their support leads. They want to start trial next Monday.", channel: "Sales Call", sentiment: "POS", score: 0.94, customer: "E-Commerce Brand", themeIndex: 0 },
    { content: "Client walked away due to lack of Salesforce Service Cloud bidirectional sync.", channel: "Sales Call", sentiment: "NEG", score: -0.82, customer: "Enterprise B2B", themeIndex: 3 },
    { content: "Inquired about dedicated database instances for high-security healthcare feedback.", channel: "Sales Call", sentiment: "NEU", score: 0.10, customer: "MedTech", themeIndex: 5 },
    { content: "Signed 1-year contract! Cited multi-tenant isolation and role segregation as key wins.", channel: "Sales Call", sentiment: "POS", score: 0.99, customer: "HR Tech Unicorn", themeIndex: 5 },
    { content: "Prospect asking for discounted annual billing with net-60 payment terms.", channel: "Sales Call", sentiment: "NEU", score: 0.05, customer: "Procurement Team", themeIndex: 2 },
    { content: "Customer expressed concern about token usage costs when scaling to 100k feedback rows.", channel: "Sales Call", sentiment: "NEG", score: -0.45, customer: "Gaming Studio", themeIndex: 2 },
    { content: "Head of Support praised the inline status workflow (NEW -> REVIEWED -> ACTIONED).", channel: "Sales Call", sentiment: "POS", score: 0.88, customer: "Fintech VP", themeIndex: 0 },
    { content: "Lost deal to Enterpret because of missing Zendesk real-time ticket streaming.", channel: "Sales Call", sentiment: "NEG", score: -0.89, customer: "Travel App", themeIndex: 3 },
    { content: "Client loves the concept of grounding answers strictly on ingested feedback.", channel: "Sales Call", sentiment: "POS", score: 0.92, customer: "EdTech Founder", themeIndex: 1 },
    { content: "Requires custom data retention policies (auto-purge feedback older than 180 days).", channel: "Sales Call", sentiment: "NEU", score: 0.0, customer: "Banking Client", themeIndex: 5 },
    { content: "Closed pilot with 20 seats. Praised modern dashboard aesthetic over legacy tools.", channel: "Sales Call", sentiment: "POS", score: 0.93, customer: "Media Company", themeIndex: 1 },
    { content: "Prospect asked if we support localized sentiment analysis for French and Spanish tickets.", channel: "Sales Call", sentiment: "NEU", score: 0.15, customer: "Global Airline", themeIndex: 0 },

    // Community Posts & Social Mentions
    { content: "Love the new export feature, saved me an hour today.", channel: "Community Post", sentiment: "POS", score: 0.89, customer: "Power User", themeIndex: 1 },
    { content: "Why did the latest update change the inbox filter location? It took me 10 minutes to find status tags.", channel: "Community Post", sentiment: "NEG", score: -0.55, customer: "Community Member", themeIndex: 0 },
    { content: "Just showed Project LOOP to our executive team. They were blown away by the theme trend graphs.", channel: "Community Post", sentiment: "POS", score: 0.95, customer: "Head of Product", themeIndex: 1 },
    { content: "Has anyone managed to ingest Google Play review exports into LOOP without reformatting dates?", channel: "Community Post", sentiment: "NEU", score: -0.10, customer: "Android Dev", themeIndex: 0 },
    { content: "The response time on the feedback search bar is unreal. How are you indexing this so quickly?", channel: "Community Post", sentiment: "POS", score: 0.90, customer: "FullStack Eng", themeIndex: 1 },
    { content: "Dark mode contrast is crisp. Thank you for not using low-contrast washed out grays.", channel: "Community Post", sentiment: "POS", score: 0.88, customer: "UI Designer", themeIndex: 1 },
    { content: "Getting a weird validation error when pasting emojis into the feedback content box.", channel: "Community Post", sentiment: "NEG", score: -0.42, customer: "Social Mgr", themeIndex: 0 },
    { content: "Would love a public roadmap board driven directly by LOOP themes.", channel: "Community Post", sentiment: "POS", score: 0.70, customer: "Indie Hacker", themeIndex: 1 },
    { content: "The CSV upload modal doesn't show an import progress bar for files with 2,000+ rows.", channel: "Community Post", sentiment: "NEG", score: -0.61, customer: "Ops Lead", themeIndex: 0 },
    { content: "Shoutout to the LOOP team for shipping the bulk tag editor! Game changer.", channel: "Community Post", sentiment: "POS", score: 0.94, customer: "Product Ops", themeIndex: 1 },
    { content: "Is anyone else having trouble viewing charts on Firefox Linux?", channel: "Community Post", sentiment: "NEG", score: -0.50, customer: "Linux User", themeIndex: 1 },
    { content: "Documentation for the REST API is crisp and straightforward. Had a script running in 15 mins.", channel: "Community Post", sentiment: "POS", score: 0.91, customer: "Hobbyist Dev", themeIndex: 3 },
    { content: "Wish we could star or bookmark favorite feedback quotes for our all-hands slides.", channel: "Community Post", sentiment: "NEU", score: 0.30, customer: "Founder", themeIndex: 0 },
    { content: "The new theme clustering accurately identified that 40% of our recent complaints were billing related.", channel: "Community Post", sentiment: "POS", score: 0.87, customer: "VP CX", themeIndex: 2 },
    { content: "Payment failed notice sent to user even though stripe successfully cleared the payment.", channel: "Community Post", sentiment: "NEG", score: -0.83, customer: "SaaS Owner", themeIndex: 2 },
    { content: "Huge fan of the minimal B2B aesthetic. It feels like Linear built a customer intelligence tool.", channel: "Community Post", sentiment: "POS", score: 0.96, customer: "Product Designer", themeIndex: 1 },
    { content: "Is there an open-source self-hostable version planned?", channel: "Community Post", sentiment: "NEU", score: 0.05, customer: "SelfHost Fan", themeIndex: 5 },
    { content: "Table sorting by date reverses unexpectedly when applying a sentiment filter.", channel: "Community Post", sentiment: "NEG", score: -0.54, customer: "Power User", themeIndex: 1 },
    { content: "Super impressed with how clean the workspace tenant boundaries are kept.", channel: "Community Post", sentiment: "POS", score: 0.88, customer: "Security Eng", themeIndex: 5 },
    { content: "Can we get webhook notifications for negative sentiment spikes?", channel: "Community Post", sentiment: "POS", score: 0.65, customer: "Support Lead", themeIndex: 3 },

    // Additional Support & Review Batches to exceed 120 items
    { content: "We need role permissions where Viewers cannot see customer email addresses.", channel: "Support Ticket", sentiment: "NEU", score: -0.20, customer: "Privacy Officer", themeIndex: 5 },
    { content: "Search query with quotes doesn't do an exact phrase match.", channel: "Support Ticket", sentiment: "NEG", score: -0.40, customer: "Research Analyst", themeIndex: 1 },
    { content: "Thank you for the quick assistance on our workspace domain migration!", channel: "Support Ticket", sentiment: "POS", score: 0.93, customer: "IT Director", themeIndex: 0 },
    { content: "Unable to remove former employees from our workspace member list.", channel: "Support Ticket", sentiment: "NEG", score: -0.75, customer: "Admin", themeIndex: 0 },
    { content: "The dashboard volume chart gives our team immediate clarity every Monday morning.", channel: "NPS Survey", sentiment: "POS", score: 0.92, customer: "Product VP", themeIndex: 1 },
    { content: "Page load on the trends view takes 4 seconds when analyzing 90-day timeframes.", channel: "Support Ticket", sentiment: "NEG", score: -0.66, customer: "Analyst", themeIndex: 1 },
    { content: "Awesome product. We deprecated two other feedback tagging tools after switching.", channel: "Community Post", sentiment: "POS", score: 0.95, customer: "Head of Growth", themeIndex: 1 },
    { content: "When will the Zapier integration launch? We want to pipe Zendesk tickets automatically.", channel: "Sales Call", sentiment: "NEU", score: 0.20, customer: "Operations Lead", themeIndex: 3 },
    { content: "Cannot upload CSVs with semicolon delimiters common in European Excel exports.", channel: "Support Ticket", sentiment: "NEG", score: -0.68, customer: "French Customer", themeIndex: 0 },
    { content: "The grounded citations in Ask LOOP give our executive team confidence in the findings.", channel: "Sales Call", sentiment: "POS", score: 0.94, customer: "Chief Product Officer", themeIndex: 1 },
    { content: "Notification bell badge doesn't clear after viewing unread items.", channel: "App Store", sentiment: "NEG", score: -0.48, customer: "User", themeIndex: 4 },
    { content: "Clean API with very predictable JSON responses. Joy to build against.", channel: "Community Post", sentiment: "POS", score: 0.90, customer: "Integration Partner", themeIndex: 3 },
    { content: "Session expired error triggered while typing a long manual feedback note, losing work.", channel: "Support Ticket", sentiment: "NEG", score: -0.84, customer: "Support Specialist", themeIndex: 0 },
    { content: "The automated sentiment score accurately caught our customer frustration after the price increase.", channel: "NPS Survey", sentiment: "POS", score: 0.86, customer: "Finance Analyst", themeIndex: 2 },
    { content: "Need a way to merge duplicate themes created by different team members.", channel: "Community Post", sentiment: "NEU", score: 0.10, customer: "Taxonomy Lead", themeIndex: 1 },
    { content: "The mobile web view doesn't allow scrolling the feedback preview drawer.", channel: "Support Ticket", sentiment: "NEG", score: -0.62, customer: "Safari User", themeIndex: 4 },
    { content: "Brilliant execution on the tenant isolation architecture. Audited and passed.", channel: "Sales Call", sentiment: "POS", score: 0.97, customer: "Enterprise CISO", themeIndex: 5 },
    { content: "Would love automated weekly email digests sent directly to leadership.", channel: "Community Post", sentiment: "POS", score: 0.60, customer: "Product Manager", themeIndex: 1 },
    { content: "Billing receipt PDF downloads with unformatted HTML tags in the footer.", channel: "Support Ticket", sentiment: "NEG", score: -0.58, customer: "Accounting", themeIndex: 2 },
    { content: "Hands down the most actionable feedback tool our company has used.", channel: "NPS Survey", sentiment: "POS", score: 0.98, customer: "CEO", themeIndex: 1 },
  ];

  // Replicate and date-spread to guarantee 125+ realistic feedback items
  console.log(`Ingesting ${rawFeedback.length} seeded items across channels...`);

  const statuses: ("NEW" | "REVIEWED" | "ACTIONED")[] = ["NEW", "REVIEWED", "ACTIONED"];

  for (let i = 0; i < rawFeedback.length; i++) {
    const item = rawFeedback[i];
    // Spread dates over past 30 days
    const daysAgo = (i % 30) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const status = statuses[i % 3];

    const fb = await prisma.feedback.create({
      data: {
        content: item.content,
        channel: item.channel,
        customerLabel: item.customer,
        sourceRef: `REF-${1000 + i}`,
        sentiment: item.sentiment as "POS" | "NEU" | "NEG",
        sentimentScore: item.score,
        status,
        workspaceId: workspace.id,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // Attach to theme
    if (createdThemes[item.themeIndex]) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: fb.id,
          themeId: createdThemes[item.themeIndex].id,
          confidence: Math.round((0.85 + (i % 15) * 0.01) * 100) / 100,
          createdAt,
        },
      });
    }
  }

  // Create one more batch of 60 varied entries to reach 140+ total items
  const channels = ["Support Ticket", "App Store", "NPS Survey", "Sales Call", "Community Post"];
  for (let j = 1; j <= 60; j++) {
    const channel = channels[j % channels.length];
    const daysAgo = (j % 28) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const isNeg = j % 3 === 0;
    const isPos = j % 3 === 1;
    const sentiment = isNeg ? "NEG" : isPos ? "POS" : "NEU";
    const sentimentScore = isNeg ? -0.4 - (j % 5) * 0.1 : isPos ? 0.5 + (j % 5) * 0.1 : 0.0;
    const status = statuses[j % 3];
    const themeIdx = j % createdThemes.length;

    const fb = await prisma.feedback.create({
      data: {
        content: `Customer query #${100 + j}: Regular check-in regarding ${createdThemes[themeIdx].name.toLowerCase()} and operational impact on workflow.`,
        channel,
        customerLabel: `Account Tier ${1 + (j % 3)}`,
        sourceRef: `TICKET-${5000 + j}`,
        sentiment,
        sentimentScore,
        status,
        workspaceId: workspace.id,
        createdAt,
        updatedAt: createdAt,
      },
    });

    await prisma.feedbackTheme.create({
      data: {
        feedbackId: fb.id,
        themeId: createdThemes[themeIdx].id,
        confidence: 0.90,
        createdAt,
      },
    });
  }

  const finalCount = await prisma.feedback.count({ where: { workspaceId: workspace.id } });
  console.log(`\n🎉 Seed finished successfully! Total feedback rows for ${workspace.name}: ${finalCount}`);
  console.log(`\nDemo Credentials:`);
  console.log(`  Admin:   admin@loopdemo.com   | password123`);
  console.log(`  Analyst: analyst@loopdemo.com | password123`);
  console.log(`  Viewer:  viewer@loopdemo.com  | password123`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
