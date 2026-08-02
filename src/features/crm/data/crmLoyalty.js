export const crmLoyaltyTiers = [
  { id: "bronze", label: "Bronze", minimumSpend: 0, cashbackPercent: 0 },
  { id: "silver", label: "Silver", minimumSpend: 0, cashbackPercent: 0 },
  { id: "gold", label: "Gold", minimumSpend: 0, cashbackPercent: 0 },
  { id: "platinum", label: "Platinum", minimumSpend: 0, cashbackPercent: 0 },
];

export const crmLoyaltyProfiles = [];
export const crmLoyaltyTransactions = [];

export const getCustomerLoyaltyProfile = (customerId, customer = null) => ({
  customerId,
  tierId: customer?.loyaltyLevel || "bronze",
  points: 0,
  bonus: Number(customer?.bonus || 0),
  cashback: Number(customer?.cashback || 0),
  totalSpent: Number(customer?.totalSpent || 0),
});

export const getCustomerLoyaltyTransactions = (customerId) =>
  crmLoyaltyTransactions.filter(
    (transaction) => String(transaction.customerId) === String(customerId),
  );

export const calculateLoyaltyProgress = (profile) => ({
  currentTier: crmLoyaltyTiers.find((tier) => tier.id === profile?.tierId) || crmLoyaltyTiers[0],
  nextTier: null,
  progress: 0,
  remainingSpend: 0,
});
