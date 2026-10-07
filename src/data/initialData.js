export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Enterprise Multi-Year Token Commitment Pools
export const DEFAULT_YEARLY_POOLS = {
  "2025": { total: 15000000, startMonth: "Jan", endMonth: "Dec" },
  "2026": { total: 20000000, startMonth: "Jan", endMonth: "Dec" },
  "2027": { total: 25000000, startMonth: "Apr", endMonth: "Mar" }
};

export const INITIAL_USE_CASES = [
  {
    id: "uc-1",
    code: "UC-GENAI-01",
    name: "Enterprise Customer Support AI Copilot",
    category: "Customer Operations & Support",
    model: "Gemini 1.5 Pro",
    costCenter: "CC-8041 (Customer Experience)",
    priority: "Tier 1 - Critical",
    owner: "Sarah Lin",
    ownerEmail: "sarah.lin@enterprise-stc.com",
    description: "24/7 autonomous customer inquiries resolution bot with real-time CRM integration & ticket triage.",
    color: "#4F46E5",
    status: "active",
    isFrozen: false,
    sharePercentage: 25,
  },
  {
    id: "uc-2",
    code: "UC-RAG-02",
    name: "Enterprise Knowledge Search & Vector RAG",
    category: "Corporate Productivity",
    model: "Text-Embedding-004 + Gemini 1.5 Flash",
    costCenter: "CC-9022 (IT & Infrastructure)",
    priority: "Tier 2 - High",
    owner: "David Chen",
    ownerEmail: "david.chen@enterprise-stc.com",
    description: "Semantic enterprise search over Confluence, SharePoint, and internal engineering SOP document stores.",
    color: "#7C3AED",
    status: "active",
    isFrozen: false,
    sharePercentage: 20,
  },
  {
    id: "uc-3",
    code: "UC-DEV-03",
    name: "Automated Code Review & PR Assistant",
    category: "Engineering & DevOps",
    model: "Claude 3.5 Sonnet",
    costCenter: "CC-1049 (Core R&D Engine)",
    priority: "Tier 1 - Critical",
    owner: "Alex Rivera",
    ownerEmail: "alex.rivera@enterprise-stc.com",
    description: "Automated Pull Request security scanning, code quality benchmarking, and CI/CD deployment assistant.",
    color: "#DB2777",
    status: "active",
    isFrozen: false,
    sharePercentage: 25,
  },
  {
    id: "uc-4",
    code: "UC-DOC-04",
    name: "Claims & Document Intelligence OCR",
    category: "Finance & Operations",
    model: "Document AI + Gemini 1.5 Flash",
    costCenter: "CC-3088 (Finance Operations)",
    priority: "Tier 3 - Medium",
    owner: "Elena Rostova",
    ownerEmail: "elena.rostova@enterprise-stc.com",
    description: "Automated invoice parsing, insurance claims extraction, and audit reconciliation workflow engine.",
    color: "#059669",
    status: "active",
    isFrozen: false,
    sharePercentage: 15,
  },
  {
    id: "uc-5",
    code: "UC-BI-05",
    name: "Executive BI & Natural Language SQL Bot",
    category: "Strategy & Analytics",
    model: "Gemini 1.5 Pro (BigQuery Studio)",
    costCenter: "CC-4011 (Executive Strategy)",
    priority: "Tier 2 - High",
    owner: "Marcus Vance",
    ownerEmail: "marcus.vance@enterprise-stc.com",
    description: "Weekly KPI board summarization, natural language query over BigQuery data warehouse & report generator.",
    color: "#D97706",
    status: "active",
    isFrozen: false,
    sharePercentage: 15,
  },
];

// Helper to get active months list between startMonth and endMonth
export const getMonthsRange = (startMonth, endMonth) => {
  const startIdx = MONTHS.indexOf(startMonth);
  const endIdx = MONTHS.indexOf(endMonth);

  if (startIdx === -1 || endIdx === -1) return MONTHS;
  if (startIdx <= endIdx) {
    return MONTHS.slice(startIdx, endIdx + 1);
  } else {
    // Crosses calendar year border (e.g. Nov to Apr)
    return [...MONTHS.slice(startIdx), ...MONTHS.slice(0, endIdx + 1)];
  }
};

// Multi-Year Allocations Generator
export const generateInitialAllocations = () => {
  const allocations = {};
  
  Object.keys(DEFAULT_YEARLY_POOLS).forEach(year => {
    allocations[year] = {};
    const annualTotal = DEFAULT_YEARLY_POOLS[year].total;

    INITIAL_USE_CASES.forEach(uc => {
      allocations[year][uc.id] = {};
      const targetYearly = annualTotal * (uc.sharePercentage / 100);
      const baseMonthly = Math.floor(targetYearly / 12 / 1000) * 1000;

      MONTHS.forEach(m => {
        allocations[year][uc.id][m] = baseMonthly;
      });
    });
  });

  return allocations;
};

// Multi-Year Usage Generator
export const generateInitialUsage = (allocations) => {
  const usage = {};

  Object.keys(DEFAULT_YEARLY_POOLS).forEach(year => {
    usage[year] = {};
    INITIAL_USE_CASES.forEach(uc => {
      usage[year][uc.id] = {};
      MONTHS.forEach((m, idx) => {
        if (year === "2025") {
          const allocated = (allocations[year] && allocations[year][uc.id] && allocations[year][uc.id][m]) || 300000;
          usage[year][uc.id][m] = Math.round(allocated * (0.85 + Math.random() * 0.1));
        } else if (year === "2026") {
          if (idx < 9) {
            const allocated = allocations[year][uc.id][m] || 300000;
            usage[year][uc.id][m] = Math.round(allocated * (0.80 + Math.random() * 0.15));
          } else if (idx === 9) {
            const allocated = allocations[year][uc.id][m] || 300000;
            let rate = 0.78;
            if (uc.id === "uc-1") rate = 0.89;
            if (uc.id === "uc-3") rate = 0.94;
            usage[year][uc.id][m] = Math.round(allocated * rate);
          } else {
            usage[year][uc.id][m] = 0;
          }
        } else {
          usage[year][uc.id][m] = 0;
        }
      });
    });
  });

  return usage;
};

// Audit Trail Transactions Initial Data
export const INITIAL_TRANSACTIONS = [
  {
    id: "tx-9941",
    year: "2026",
    month: "Oct",
    useCaseId: "uc-3",
    useCaseName: "Automated Code Review & PR Assistant",
    type: "TOPUP_GRANT",
    amount: 250000,
    performedBy: "admin@enterprise-stc.com",
    description: "Approved Q4 emergency quota expansion for release sprint PR code reviews.",
    timestamp: "2026-10-04 14:35"
  },
  {
    id: "tx-9942",
    year: "2026",
    month: "Oct",
    useCaseId: "uc-1",
    useCaseName: "Enterprise Customer Support AI Copilot",
    type: "CONSUMPTION",
    amount: -125000,
    performedBy: "Vertex API Gateway (Batch)",
    description: "Automated customer inquiry batch resolution (85K prompt + 40K completion tokens).",
    timestamp: "2026-10-05 08:20"
  },
  {
    id: "tx-9943",
    year: "2026",
    month: "Oct",
    useCaseId: "uc-2",
    useCaseName: "Enterprise Knowledge Search & Vector RAG",
    type: "ROLLOVER_CREDIT",
    amount: 125000,
    performedBy: "Policy Engine v2.4",
    description: "50% unused September token allocation rolled over into October operational pool.",
    timestamp: "2026-10-01 00:05"
  },
  {
    id: "tx-9944",
    year: "2026",
    month: "Sep",
    useCaseId: "uc-5",
    useCaseName: "Executive BI & Natural Language SQL Bot",
    type: "MONTHLY_ALLOCATION",
    amount: 375000,
    performedBy: "admin@enterprise-stc.com",
    description: "Standard monthly token allocation grant for September.",
    timestamp: "2026-09-01 09:00"
  }
];

export const INITIAL_TOPUP_REQUESTS = [
  {
    id: "req-801",
    useCaseId: "uc-3",
    useCaseName: "Automated Code Review & PR Assistant",
    requestedBy: "Alex Rivera (DevOps Lead)",
    requestedTokens: 250000,
    month: "Oct",
    reason: "Urgent sprint push for enterprise v3.0 release; heavy automated PR reviews required.",
    status: "approved",
    timestamp: "2026-10-04 14:30"
  },
  {
    id: "req-802",
    useCaseId: "uc-1",
    useCaseName: "Enterprise Customer Support AI Copilot",
    requestedBy: "Sarah Lin (Support Lead)",
    requestedTokens: 300000,
    month: "Oct",
    reason: "Unexpected 45% surge in customer ticket volume following new API deployment.",
    status: "pending",
    timestamp: "2026-10-05 09:15"
  }
];

export const INITIAL_ALERTS = [
  {
    id: "alt-801",
    type: "critical",
    title: "Critical Threshold (94%) Reached",
    message: "Automated Code Review & PR Assistant has consumed 94% of October token quota.",
    timestamp: "10 mins ago",
    useCaseId: "uc-3"
  },
  {
    id: "alt-802",
    type: "warning",
    title: "Warning Threshold (89%) Reached",
    message: "Enterprise Customer Support AI Copilot is at 89% of October quota.",
    timestamp: "1 hour ago",
    useCaseId: "uc-1"
  }
];

