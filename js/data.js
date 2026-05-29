// ============================================================
//  ChurnAI — Data Layer
//  Industry-specific customer data & ML model simulation
// ============================================================

const ChurnData = (() => {

  // ── Industry Configs ──────────────────────────────────────
  const industries = {
    telecom: {
      name: "Telecom",
      kpi: { churnRate: "12.4%", atRisk: "1,847", retention: "87.6%", revenue: "$284K" },
      formFields: [
        { id: "tenure",       label: "Tenure (months)",       type: "number", default: 24,   min: 0, max: 120 },
        { id: "monthlyCharge",label: "Monthly Charge ($)",    type: "number", default: 65,   min: 0, max: 200 },
        { id: "contract",     label: "Contract Type",         type: "select", options: ["Month-to-month", "One year", "Two year"] },
        { id: "techSupport",  label: "Tech Support",          type: "select", options: ["Yes", "No"] },
        { id: "numServices",  label: "Services Subscribed",   type: "number", default: 3,    min: 1, max: 8 },
        { id: "complaints",   label: "Complaints (90 days)",  type: "number", default: 0,    min: 0, max: 20 },
        { id: "dataUsageGB",  label: "Data Usage (GB/mo)",    type: "number", default: 12,   min: 0, max: 100 },
        { id: "paymentMethod",label: "Payment Method",        type: "select", options: ["Auto pay", "Manual", "Credit card", "Bank transfer"] },
      ],
      features: ["Contract Type", "Monthly Charge", "Tenure", "Tech Support", "Complaints", "Services Count", "Data Usage", "Payment Method"],
      segments: [
        { name: "High-Value Loyalists", icon: "👑", count: "4,218", churnRisk: "4%",  avgRevenue: "$89/mo",  clv: "$3,204",  color: "var(--green)" },
        { name: "Price Sensitives",     icon: "💸", count: "3,107", churnRisk: "28%", avgRevenue: "$42/mo",  clv: "$1,008",  color: "var(--yellow)" },
        { name: "Contract Endings",     icon: "⏳", count: "1,842", churnRisk: "51%", avgRevenue: "$55/mo",  clv: "$660",    color: "var(--orange)" },
        { name: "Service Dissatisfied", icon: "😤", count: "987",   churnRisk: "73%", avgRevenue: "$71/mo",  clv: "$284",    color: "var(--red)" },
      ],
    },
    saas: {
      name: "SaaS",
      kpi: { churnRate: "5.2%", atRisk: "423", retention: "94.8%", revenue: "$118K" },
      formFields: [
        { id: "daysActive",   label: "Days Since Signup",     type: "number", default: 180,  min: 0, max: 1000 },
        { id: "plan",         label: "Plan Tier",             type: "select", options: ["Free", "Starter", "Pro", "Enterprise"] },
        { id: "logins30",     label: "Logins (30 days)",      type: "number", default: 12,   min: 0, max: 60 },
        { id: "features",     label: "Features Used",         type: "number", default: 5,    min: 0, max: 20 },
        { id: "apiCalls",     label: "API Calls / Month",     type: "number", default: 500,  min: 0, max: 10000 },
        { id: "teamSize",     label: "Team Members",          type: "number", default: 3,    min: 1, max: 500 },
        { id: "ticketsOpen",  label: "Open Support Tickets",  type: "number", default: 0,    min: 0, max: 20 },
        { id: "paymentFail",  label: "Failed Payments (mo)",  type: "number", default: 0,    min: 0, max: 5 },
      ],
      features: ["Login Frequency", "Plan Tier", "Feature Adoption", "Tenure", "Team Size", "API Usage", "Support Tickets", "Payment History"],
      segments: [
        { name: "Power Users",       icon: "⚡", count: "1,204", churnRisk: "2%",  avgRevenue: "$299/mo", clv: "$10,764", color: "var(--green)" },
        { name: "Engaged Starters",  icon: "🚀", count: "2,891", churnRisk: "9%",  avgRevenue: "$49/mo",  clv: "$2,116",  color: "var(--accent)" },
        { name: "At-Risk Free",      icon: "🔋", count: "5,203", churnRisk: "34%", avgRevenue: "$0/mo",   clv: "$0",      color: "var(--yellow)" },
        { name: "Churning Soon",     icon: "🚨", count: "423",   churnRisk: "78%", avgRevenue: "$79/mo",  clv: "$237",    color: "var(--red)" },
      ],
    },
    gym: {
      name: "Gym / Fitness",
      kpi: { churnRate: "22.1%", atRisk: "612", retention: "77.9%", revenue: "$61K" },
      formFields: [
        { id: "memberMonths", label: "Membership Months",     type: "number", default: 8,    min: 0, max: 60 },
        { id: "visitsMonth",  label: "Visits (Last Month)",   type: "number", default: 6,    min: 0, max: 31 },
        { id: "plan",         label: "Membership Plan",       type: "select", options: ["Basic", "Standard", "Premium", "Corporate"] },
        { id: "classBookings",label: "Classes Booked",        type: "number", default: 3,    min: 0, max: 30 },
        { id: "ptSessions",   label: "PT Sessions",           type: "number", default: 0,    min: 0, max: 20 },
        { id: "pauseCount",   label: "Pause Requests",        type: "number", default: 0,    min: 0, max: 5 },
        { id: "joinMonth",    label: "Join Month",            type: "select", options: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
        { id: "appUsage",     label: "App Opens (30 days)",   type: "number", default: 10,   min: 0, max: 100 },
      ],
      features: ["Visit Frequency", "Class Engagement", "Membership Duration", "PT Investment", "App Usage", "Plan Tier", "Seasonal Factor", "Pause History"],
      segments: [
        { name: "Fitness Fanatics",  icon: "🏆", count: "891",   churnRisk: "3%",  avgRevenue: "$75/mo",  clv: "$2,700",  color: "var(--green)" },
        { name: "Occasional Goers",  icon: "🚶", count: "1,203", churnRisk: "19%", avgRevenue: "$39/mo",  clv: "$702",    color: "var(--yellow)" },
        { name: "New Members",       icon: "🌱", count: "744",   churnRisk: "41%", avgRevenue: "$55/mo",  clv: "$330",    color: "var(--orange)" },
        { name: "Ghost Members",     icon: "👻", count: "612",   churnRisk: "82%", avgRevenue: "$39/mo",  clv: "$78",     color: "var(--red)" },
      ],
    },
    subscription: {
      name: "Subscription App",
      kpi: { churnRate: "8.7%", atRisk: "2,341", retention: "91.3%", revenue: "$192K" },
      formFields: [
        { id: "daysInstalled",label: "Days Since Install",    type: "number", default: 90,   min: 0, max: 730 },
        { id: "plan",         label: "Plan",                  type: "select", options: ["Free", "Monthly", "Annual", "Lifetime"] },
        { id: "opensMo",      label: "App Opens (30 days)",   type: "number", default: 18,   min: 0, max: 200 },
        { id: "contentSaved", label: "Content Saved",         type: "number", default: 14,   min: 0, max: 500 },
        { id: "notifEnabled", label: "Notifications",         type: "select", options: ["Enabled", "Disabled"] },
        { id: "ratingGiven",  label: "App Rating (1-5)",      type: "number", default: 4,    min: 1, max: 5 },
        { id: "referrals",    label: "Friends Referred",      type: "number", default: 0,    min: 0, max: 20 },
        { id: "paymentFails", label: "Payment Failures",      type: "number", default: 0,    min: 0, max: 5 },
      ],
      features: ["Open Frequency", "Content Engagement", "Tenure", "Plan Type", "Notifications", "Rating", "Referrals", "Payment History"],
      segments: [
        { name: "Brand Advocates",   icon: "🌟", count: "3,421", churnRisk: "2%",  avgRevenue: "$14.99/mo", clv: "$539",   color: "var(--green)" },
        { name: "Passive Consumers", icon: "😐", count: "7,892", churnRisk: "14%", avgRevenue: "$9.99/mo",  clv: "$257",   color: "var(--yellow)" },
        { name: "Disengaged Users",  icon: "😴", count: "2,341", churnRisk: "62%", avgRevenue: "$9.99/mo",  clv: "$59",    color: "var(--orange)" },
        { name: "Trial Abandoners",  icon: "🏃", count: "1,104", churnRisk: "91%", avgRevenue: "$0/mo",     clv: "$0",     color: "var(--red)" },
      ],
    }
  };

  // ── At-Risk Customers Mock Data ───────────────────────────
  function getAtRiskCustomers(industry) {
    const names = [
      ["Sarah K.","Alex M.","Jordan P.","Taylor R.","Casey L.","Morgan B.","Riley S.","Quinn T."],
      ["Telecom","SaaS","Fitness","Subscription"],
    ];
    const baseData = {
      telecom: [
        { name: "Sarah K.",  segment: "Contract Ending",       tenure: "23 mo", risk: "high",   prob: 87 },
        { name: "Alex M.",   segment: "Service Dissatisfied",  tenure: "8 mo",  risk: "high",   prob: 79 },
        { name: "Jordan P.", segment: "Price Sensitive",        tenure: "14 mo", risk: "high",   prob: 71 },
        { name: "Taylor R.", segment: "Contract Ending",       tenure: "11 mo", risk: "medium", prob: 58 },
        { name: "Casey L.",  segment: "Price Sensitive",        tenure: "31 mo", risk: "medium", prob: 44 },
        { name: "Morgan B.", segment: "Service Dissatisfied",  tenure: "5 mo",  risk: "high",   prob: 93 },
      ],
      saas: [
        { name: "Acme Corp",    segment: "At-Risk Free",       tenure: "62 days", risk: "high",   prob: 82 },
        { name: "TechStart Inc",segment: "Churning Soon",      tenure: "180 days",risk: "high",   prob: 76 },
        { name: "DesignCo",     segment: "Engaged Starter",    tenure: "45 days", risk: "medium", prob: 51 },
        { name: "RetailPlus",   segment: "Churning Soon",      tenure: "220 days",risk: "high",   prob: 89 },
        { name: "HealthApp",    segment: "At-Risk Free",       tenure: "90 days", risk: "medium", prob: 63 },
        { name: "EduPlatform",  segment: "Churning Soon",      tenure: "310 days",risk: "high",   prob: 71 },
      ],
      gym: [
        { name: "Chris D.",  segment: "Ghost Member",          tenure: "4 mo",  risk: "high",   prob: 91 },
        { name: "Sam P.",    segment: "New Member",            tenure: "1 mo",  risk: "high",   prob: 68 },
        { name: "Pat L.",    segment: "Occasional Goer",       tenure: "9 mo",  risk: "medium", prob: 47 },
        { name: "Drew M.",   segment: "Ghost Member",          tenure: "6 mo",  risk: "high",   prob: 85 },
        { name: "Blake T.",  segment: "New Member",            tenure: "2 mo",  risk: "medium", prob: 55 },
        { name: "Jamie W.",  segment: "Ghost Member",          tenure: "11 mo", risk: "high",   prob: 78 },
      ],
      subscription: [
        { name: "User #4821", segment: "Trial Abandoner",     tenure: "12 days", risk: "high",   prob: 94 },
        { name: "User #2034", segment: "Disengaged",          tenure: "90 days", risk: "high",   prob: 73 },
        { name: "User #7711", segment: "Passive Consumer",    tenure: "45 days", risk: "medium", prob: 49 },
        { name: "User #0082", segment: "Trial Abandoner",     tenure: "7 days",  risk: "high",   prob: 88 },
        { name: "User #3309", segment: "Disengaged",          tenure: "120 days",risk: "medium", prob: 61 },
        { name: "User #5540", segment: "Disengaged",          tenure: "60 days", risk: "high",   prob: 77 },
      ]
    };
    return baseData[industry] || baseData.telecom;
  }

  // ── Churn Prediction Model (simulated) ───────────────────
  function predictChurn(formValues, industry) {
    // Weighted scoring model per industry
    const weights = {
      telecom: {
        tenure: -0.25, monthlyCharge: 0.18, contract: -0.30,
        techSupport: -0.12, numServices: -0.10, complaints: 0.35,
        dataUsageGB: -0.08, paymentMethod: -0.10
      },
      saas: {
        daysActive: -0.20, plan: -0.25, logins30: -0.28,
        features: -0.18, apiCalls: -0.12, teamSize: -0.08,
        ticketsOpen: 0.22, paymentFail: 0.38
      },
      gym: {
        memberMonths: -0.15, visitsMonth: -0.35, plan: -0.15,
        classBookings: -0.20, ptSessions: -0.18, pauseCount: 0.28,
        joinMonth: 0.05, appUsage: -0.12
      },
      subscription: {
        daysInstalled: -0.15, plan: -0.28, opensMo: -0.30,
        contentSaved: -0.15, notifEnabled: -0.12, ratingGiven: -0.22,
        referrals: -0.18, paymentFails: 0.35
      }
    };

    // Normalize each field and compute score
    const w = weights[industry] || weights.telecom;
    let score = 0.45; // base probability
    const factors = [];

    Object.entries(formValues).forEach(([key, val]) => {
      const weight = w[key] || 0;
      let normalizedVal = 0;
      const numVal = parseFloat(val);

      if (!isNaN(numVal)) {
        normalizedVal = Math.min(Math.max(numVal / 50, 0), 1);
      } else {
        // Encode select values
        const negativeOpts = ["month-to-month", "no", "manual", "free", "disabled"];
        normalizedVal = negativeOpts.some(o => val?.toLowerCase().includes(o)) ? 1 : 0;
      }

      const impact = weight * normalizedVal;
      score += impact;

      if (Math.abs(weight) > 0.1) {
        factors.push({
          name: key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()),
          impact: Math.round(Math.abs(impact) * 100),
          direction: impact > 0 ? "risk" : "safe",
          weight: Math.abs(weight)
        });
      }
    });

    // Clamp and add noise
    score = Math.min(Math.max(score + (Math.random() * 0.06 - 0.03), 0.04), 0.97);
    factors.sort((a, b) => b.impact - a.impact);

    return {
      probability: Math.round(score * 100),
      factors: factors.slice(0, 5),
      level: score > 0.7 ? "High Risk" : score > 0.4 ? "Medium Risk" : "Low Risk",
      levelColor: score > 0.7 ? "#ff4757" : score > 0.4 ? "#ff8c42" : "#00d68f",
      recommendation: score > 0.7
        ? "Immediate intervention required. Trigger retention campaign within 48 hours."
        : score > 0.4
        ? "Monitor closely. Enroll in proactive engagement program."
        : "Customer in good standing. Continue standard engagement."
    };
  }

  // ── Retention Campaigns ───────────────────────────────────
  function getRetentionCampaigns(industry) {
    const campaigns = {
      telecom: [
        {
          icon: "📱", iconBg: "rgba(124,58,237,0.15)",
          title: "Contract Upgrade Incentive",
          tag: "offer", tagLabel: "Offer",
          desc: "Offer 20% bill credit for upgrading to a 2-year contract. Target customers within 3 months of contract end.",
          metrics: { successRate: "34%", avgSave: "$67/mo", roi: "4.2×" }
        },
        {
          icon: "🎧", iconBg: "rgba(0,229,255,0.1)",
          title: "Proactive Support Outreach",
          tag: "sms", tagLabel: "SMS",
          desc: "Automated SMS check-in for customers with 2+ complaints. Connect to priority agent within 2 minutes.",
          metrics: { successRate: "41%", avgSave: "$71/mo", roi: "5.1×" }
        },
        {
          icon: "💰", iconBg: "rgba(255,209,102,0.1)",
          title: "Price Match Guarantee Email",
          tag: "email", tagLabel: "Email",
          desc: "Send personalized email showcasing our best available plan for their usage tier with a loyalty discount.",
          metrics: { successRate: "28%", avgSave: "$23/mo", roi: "2.8×" }
        },
        {
          icon: "🔔", iconBg: "rgba(0,214,143,0.1)",
          title: "Service Bundle Push",
          tag: "push", tagLabel: "Push",
          desc: "Recommend a discounted service bundle based on usage patterns. Offer free trial for 60 days.",
          metrics: { successRate: "22%", avgSave: "$18/mo", roi: "2.1×" }
        },
        {
          icon: "🏅", iconBg: "rgba(255,140,66,0.1)",
          title: "Loyalty Rewards Program",
          tag: "email", tagLabel: "Email",
          desc: "Enroll top customers in exclusive loyalty tier with early access to new features and bonus data.",
          metrics: { successRate: "19%", avgSave: "$31/mo", roi: "3.4×" }
        },
        {
          icon: "📊", iconBg: "rgba(124,58,237,0.15)",
          title: "Usage Insight Report",
          tag: "email", tagLabel: "Email",
          desc: "Monthly personalized usage analysis showing how they compare to similar users and where they can save.",
          metrics: { successRate: "15%", avgSave: "$12/mo", roi: "1.8×" }
        },
      ],
      saas: [
        {
          icon: "🎯", iconBg: "rgba(0,229,255,0.1)",
          title: "Feature Discovery Sequence",
          tag: "email", tagLabel: "Email",
          desc: "7-email drip campaign showcasing unused features based on their role and team size. Include video demos.",
          metrics: { successRate: "38%", avgSave: "$79/mo", roi: "6.2×" }
        },
        {
          icon: "👥", iconBg: "rgba(0,214,143,0.1)",
          title: "Success Manager Touchpoint",
          tag: "email", tagLabel: "Email",
          desc: "Personal outreach from a customer success manager for accounts with declining login frequency.",
          metrics: { successRate: "52%", avgSave: "$299/mo", roi: "8.4×" }
        },
        {
          icon: "🎁", iconBg: "rgba(255,209,102,0.1)",
          title: "Free Tier Upgrade Offer",
          tag: "offer", tagLabel: "Offer",
          desc: "Offer free users a 30-day Pro trial triggered by high engagement. Convert during trial peak.",
          metrics: { successRate: "24%", avgSave: "$49/mo", roi: "4.1×" }
        },
        {
          icon: "⚡", iconBg: "rgba(124,58,237,0.15)",
          title: "Integration Activation Push",
          tag: "push", tagLabel: "Push",
          desc: "Push notification showcasing one-click integrations with tools they already use (detected via metadata).",
          metrics: { successRate: "29%", avgSave: "$79/mo", roi: "3.7×" }
        },
        {
          icon: "📉", iconBg: "rgba(255,140,66,0.1)",
          title: "Win-Back Discount",
          tag: "sms", tagLabel: "SMS",
          desc: "SMS offer of 40% off next 3 months for accounts about to lapse. Urgency: 72-hour window.",
          metrics: { successRate: "18%", avgSave: "$49/mo", roi: "2.6×" }
        },
        {
          icon: "📚", iconBg: "rgba(0,229,255,0.1)",
          title: "Onboarding Re-Engagement",
          tag: "email", tagLabel: "Email",
          desc: "Re-send a simplified onboarding flow to users who never completed setup or used core features.",
          metrics: { successRate: "31%", avgSave: "$29/mo", roi: "3.2×" }
        },
      ],
      gym: [
        {
          icon: "💪", iconBg: "rgba(0,214,143,0.1)",
          title: "Fitness Goals Check-In",
          tag: "sms", tagLabel: "SMS",
          desc: "Automated SMS for members who haven't visited in 14 days. Offer a free PT session to re-engage.",
          metrics: { successRate: "44%", avgSave: "$55/mo", roi: "5.3×" }
        },
        {
          icon: "🏃", iconBg: "rgba(0,229,255,0.1)",
          title: "Class Challenge Campaign",
          tag: "push", tagLabel: "Push",
          desc: "30-day challenge with leaderboard. Push notifications for streaks. Offer free month for completing.",
          metrics: { successRate: "37%", avgSave: "$39/mo", roi: "4.1×" }
        },
        {
          icon: "🎽", iconBg: "rgba(255,209,102,0.1)",
          title: "Pause Conversion Offer",
          tag: "offer", tagLabel: "Offer",
          desc: "For members requesting pause: offer reduced rate pause ($10/mo) instead of full cancellation.",
          metrics: { successRate: "61%", avgSave: "$29/mo", roi: "7.8×" }
        },
        {
          icon: "🤝", iconBg: "rgba(124,58,237,0.15)",
          title: "Buddy Referral Program",
          tag: "email", tagLabel: "Email",
          desc: "Invite ghost members to bring a friend for free. Social accountability shown to 3× re-engagement.",
          metrics: { successRate: "28%", avgSave: "$39/mo", roi: "3.2×" }
        },
        {
          icon: "📱", iconBg: "rgba(255,140,66,0.1)",
          title: "App Workout Plans",
          tag: "push", tagLabel: "Push",
          desc: "Push personalized AI workout plans through the app to members with low visit frequency.",
          metrics: { successRate: "22%", avgSave: "$39/mo", roi: "2.4×" }
        },
        {
          icon: "⬇️", iconBg: "rgba(0,229,255,0.1)",
          title: "Plan Downgrade Save",
          tag: "sms", tagLabel: "SMS",
          desc: "Offer downgrade to basic plan before cancellation. Retain revenue rather than lose member entirely.",
          metrics: { successRate: "53%", avgSave: "$16/mo", roi: "4.9×" }
        },
      ],
      subscription: [
        {
          icon: "🌟", iconBg: "rgba(0,214,143,0.1)",
          title: "Re-Engagement Notification",
          tag: "push", tagLabel: "Push",
          desc: "Personalized push with new content highlights matching their past behavior. Triggered after 7-day inactivity.",
          metrics: { successRate: "35%", avgSave: "$9.99/mo", roi: "4.8×" }
        },
        {
          icon: "🎬", iconBg: "rgba(0,229,255,0.1)",
          title: "Annual Plan Migration",
          tag: "offer", tagLabel: "Offer",
          desc: "Offer 40% discount on annual plan to monthly subscribers showing churn signals. Locks in revenue.",
          metrics: { successRate: "29%", avgSave: "$9.99/mo", roi: "5.2×" }
        },
        {
          icon: "✉️", iconBg: "rgba(124,58,237,0.15)",
          title: "Cancellation Intervention",
          tag: "email", tagLabel: "Email",
          desc: "Email sequence triggered when unsubscribe is initiated. Offer pause, discount, or free month.",
          metrics: { successRate: "47%", avgSave: "$9.99/mo", roi: "6.1×" }
        },
        {
          icon: "🔔", iconBg: "rgba(255,209,102,0.1)",
          title: "Notification Win-Back",
          tag: "sms", tagLabel: "SMS",
          desc: "SMS re-permission campaign for users who disabled notifications. Highlight personalization benefits.",
          metrics: { successRate: "21%", avgSave: "$9.99/mo", roi: "2.9×" }
        },
        {
          icon: "🎁", iconBg: "rgba(255,140,66,0.1)",
          title: "Family Plan Upsell",
          tag: "push", tagLabel: "Push",
          desc: "Push offer to convert single-user plans to family plans. Increases stickiness and ARPU.",
          metrics: { successRate: "18%", avgSave: "$4.99/mo", roi: "2.3×" }
        },
        {
          icon: "💬", iconBg: "rgba(0,229,255,0.1)",
          title: "Feedback-to-Action Loop",
          tag: "email", tagLabel: "Email",
          desc: "Email collecting cancellation reason with instant resolution options for each feedback type.",
          metrics: { successRate: "33%", avgSave: "$9.99/mo", roi: "3.7×" }
        },
      ]
    };
    return campaigns[industry] || campaigns.telecom;
  }

  // ── Trend Data ────────────────────────────────────────────
  function getChurnTrend(industry) {
    const base = { telecom: 12, saas: 5, gym: 22, subscription: 9 };
    const b = base[industry] || 12;
    const months = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"];
    const churned = months.map((_, i) => Math.round(b + (Math.sin(i * 0.7) * 2) + (Math.random() * 1.5)));
    const retained = churned.map(c => 100 - c);
    return { months, churned, retained };
  }

  function getRoiProjection() {
    return {
      campaigns: ["Contract Incentive", "Support Outreach", "Price Match", "Bundle Push", "Loyalty Rewards", "Usage Report"],
      investment: [12000, 8000, 5000, 3000, 15000, 4000],
      returns: [50400, 40800, 14000, 6300, 51000, 7200],
    };
  }

  return { industries, getAtRiskCustomers, predictChurn, getRetentionCampaigns, getChurnTrend, getRoiProjection };
})();
