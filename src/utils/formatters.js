// Utility formatters for token numbers and metrics

export const formatTokenNumber = (num, compact = false) => {
  if (num === null || num === undefined) return "0";
  
  if (compact) {
    if (Math.abs(num) >= 1000000) {
      return (num / 1000000).toFixed(2).replace(/\.00$/, '') + "M";
    }
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
  }

  return new Intl.NumberFormat('en-US').format(num);
};

export const getStatusBadge = (percent) => {
  if (percent >= 95) {
    return {
      label: "Exhausted / Critical",
      colorClass: "bg-red-500/20 text-red-400 border-red-500/30",
      progressClass: "bg-red-500",
      status: "critical"
    };
  }
  if (percent >= 85) {
    return {
      label: "High Warning",
      colorClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      progressClass: "bg-amber-500",
      status: "warning"
    };
  }
  if (percent >= 70) {
    return {
      label: "Moderate Usage",
      colorClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      progressClass: "bg-yellow-400",
      status: "moderate"
    };
  }
  return {
    label: "Normal",
    colorClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    progressClass: "bg-emerald-500",
    status: "normal"
  };
};

export const calculateTotals = (annualPool, useCases, allocations, usage, selectedMonth = "Oct") => {
  let totalAllocatedYearly = 0;
  let totalConsumedYearly = 0;

  let selectedMonthAllocated = 0;
  let selectedMonthConsumed = 0;

  useCases.forEach(uc => {
    Object.keys(allocations[uc.id] || {}).forEach(m => {
      totalAllocatedYearly += allocations[uc.id][m] || 0;
      totalConsumedYearly += (usage[uc.id] && usage[uc.id][m]) || 0;
    });

    if (allocations[uc.id] && allocations[uc.id][selectedMonth]) {
      selectedMonthAllocated += allocations[uc.id][selectedMonth];
    }
    if (usage[uc.id] && usage[uc.id][selectedMonth]) {
      selectedMonthConsumed += usage[uc.id][selectedMonth];
    }
  });

  const remainingYearlyPool = annualPool - totalAllocatedYearly;
  const unallocatedYearlyPercent = Math.max(0, ((remainingYearlyPool / annualPool) * 100).toFixed(1));

  return {
    totalAllocatedYearly,
    totalConsumedYearly,
    remainingYearlyPool,
    unallocatedYearlyPercent,
    selectedMonthAllocated,
    selectedMonthConsumed,
    selectedMonthRemaining: selectedMonthAllocated - selectedMonthConsumed,
    selectedMonthPercent: selectedMonthAllocated > 0 ? Math.min(100, Math.round((selectedMonthConsumed / selectedMonthAllocated) * 100)) : 0
  };
};
