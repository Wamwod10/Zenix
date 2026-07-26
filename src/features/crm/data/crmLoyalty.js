export const crmLoyaltyTiers = [
  {
    id: "bronze",
    name: "Bronza",
    minimumSpend: 0,
    maximumSpend: 5_000_000,
    cashbackRate: 1,
    benefits: [
      "Har bir xariddan 1% cashback",
      "Maxsus takliflardan foydalanish",
    ],
  },
  {
    id: "silver",
    name: "Kumush",
    minimumSpend: 5_000_000,
    maximumSpend: 15_000_000,
    cashbackRate: 2,
    benefits: [
      "Har bir xariddan 2% cashback",
      "Shaxsiy chegirmalar",
      "Erta aksiyalardan foydalanish",
    ],
  },
  {
    id: "gold",
    name: "Oltin",
    minimumSpend: 15_000_000,
    maximumSpend: 35_000_000,
    cashbackRate: 3,
    benefits: [
      "Har bir xariddan 3% cashback",
      "Ustuvor mijozlarga xizmat",
      "Tug‘ilgan kun bonusi",
    ],
  },
  {
    id: "platinum",
    name: "Platina",
    minimumSpend: 35_000_000,
    maximumSpend: null,
    cashbackRate: 5,
    benefits: [
      "Har bir xariddan 5% cashback",
      "VIP mijozlarga xizmat",
      "Yopiq takliflar",
      "Shaxsiy CRM menejer",
    ],
  },
];

export const crmLoyaltyProfiles = [
  {
    customerId: "cus-001",
    tierId: "gold",
    qualifyingSpend: 24_680_000,
    points: 2_460,
    bonusBalance: 840_000,
    cashbackBalance: 326_000,
    lifetimeEarned: 2_940_000,
    lifetimeRedeemed: 1_774_000,
    joinedAt: "2024-02-12T09:20:00.000Z",
    lastActivityAt: "2026-07-12T15:40:00.000Z",
  },
  {
    customerId: "cus-002",
    tierId: "silver",
    qualifyingSpend: 9_850_000,
    points: 985,
    bonusBalance: 275_000,
    cashbackBalance: 148_000,
    lifetimeEarned: 1_180_000,
    lifetimeRedeemed: 757_000,
    joinedAt: "2024-08-21T11:15:00.000Z",
    lastActivityAt: "2026-07-08T12:10:00.000Z",
  },
  {
    customerId: "cus-003",
    tierId: "platinum",
    qualifyingSpend: 48_320_000,
    points: 4_832,
    bonusBalance: 1_540_000,
    cashbackBalance: 970_000,
    lifetimeEarned: 5_830_000,
    lifetimeRedeemed: 3_320_000,
    joinedAt: "2023-11-05T08:30:00.000Z",
    lastActivityAt: "2026-07-14T10:30:00.000Z",
  },
  {
    customerId: "cus-004",
    tierId: "bronze",
    qualifyingSpend: 2_460_000,
    points: 246,
    bonusBalance: 72_000,
    cashbackBalance: 28_000,
    lifetimeEarned: 310_000,
    lifetimeRedeemed: 210_000,
    joinedAt: "2025-05-18T14:45:00.000Z",
    lastActivityAt: "2026-06-29T09:05:00.000Z",
  },
];

export const crmLoyaltyTransactions = [
  {
    id: "loy-tx-001",
    customerId: "cus-001",
    type: "earned",
    source: "purchase",
    amount: 186_000,
    balanceAfter: 840_000,
    description: "Xarid uchun bonus hisoblandi",
    reference: "ORD-2026-1048",
    createdAt: "2026-07-12T15:40:00.000Z",
  },
  {
    id: "loy-tx-002",
    customerId: "cus-001",
    type: "cashback",
    source: "purchase",
    amount: 62_000,
    balanceAfter: 326_000,
    description: "Oltin daraja cashback’i",
    reference: "ORD-2026-1048",
    createdAt: "2026-07-12T15:40:00.000Z",
  },
  {
    id: "loy-tx-003",
    customerId: "cus-001",
    type: "redeemed",
    source: "purchase",
    amount: -320_000,
    balanceAfter: 654_000,
    description: "Buyurtma to‘lovida bonus ishlatildi",
    reference: "ORD-2026-0981",
    createdAt: "2026-06-28T11:25:00.000Z",
  },
  {
    id: "loy-tx-004",
    customerId: "cus-001",
    type: "adjustment",
    source: "manager",
    amount: 150_000,
    balanceAfter: 974_000,
    description: "Menejer tomonidan bonus qo‘shildi",
    reference: "CRM-ADJ-018",
    createdAt: "2026-06-17T09:10:00.000Z",
  },
  {
    id: "loy-tx-005",
    customerId: "cus-002",
    type: "earned",
    source: "purchase",
    amount: 94_000,
    balanceAfter: 275_000,
    description: "Xarid uchun bonus hisoblandi",
    reference: "ORD-2026-1022",
    createdAt: "2026-07-08T12:10:00.000Z",
  },
  {
    id: "loy-tx-006",
    customerId: "cus-002",
    type: "cashback",
    source: "purchase",
    amount: 38_000,
    balanceAfter: 148_000,
    description: "Kumush daraja cashback’i",
    reference: "ORD-2026-1022",
    createdAt: "2026-07-08T12:10:00.000Z",
  },
  {
    id: "loy-tx-007",
    customerId: "cus-003",
    type: "earned",
    source: "campaign",
    amount: 500_000,
    balanceAfter: 1_540_000,
    description: "VIP kampaniya bonusi",
    reference: "CMP-VIP-007",
    createdAt: "2026-07-14T10:30:00.000Z",
  },
  {
    id: "loy-tx-008",
    customerId: "cus-003",
    type: "redeemed",
    source: "purchase",
    amount: -740_000,
    balanceAfter: 1_040_000,
    description: "Xarid to‘lovida bonus ishlatildi",
    reference: "ORD-2026-1056",
    createdAt: "2026-07-01T13:50:00.000Z",
  },
  {
    id: "loy-tx-009",
    customerId: "cus-004",
    type: "earned",
    source: "purchase",
    amount: 72_000,
    balanceAfter: 72_000,
    description: "Birinchi xarid bonusi",
    reference: "ORD-2026-0914",
    createdAt: "2026-06-29T09:05:00.000Z",
  },
];

const getTierById = (tierId) =>
  crmLoyaltyTiers.find((tier) => tier.id === tierId) ?? crmLoyaltyTiers[0];

const getTierFromSpend = (spend = 0) =>
  [...crmLoyaltyTiers]
    .reverse()
    .find((tier) => spend >= tier.minimumSpend) ?? crmLoyaltyTiers[0];

export const getCustomerLoyaltyProfile = (customerId, customer = null) => {
  const storedProfile = crmLoyaltyProfiles.find(
    (profile) => profile.customerId === customerId,
  );

  if (storedProfile) {
    return {
      ...storedProfile,
      tier: getTierById(storedProfile.tierId),
    };
  }

  const qualifyingSpend = Number(customer?.totalSpent) || 0;
  const tier = getTierFromSpend(qualifyingSpend);

  return {
    customerId,
    tierId: tier.id,
    tier,
    qualifyingSpend,
    points: 0,
    bonusBalance: Number(customer?.bonus) || 0,
    cashbackBalance: Number(customer?.cashback) || 0,
    lifetimeEarned: 0,
    lifetimeRedeemed: 0,
    joinedAt: customer?.createdAt ?? null,
    lastActivityAt: null,
  };
};

export const getCustomerLoyaltyTransactions = (customerId) =>
  crmLoyaltyTransactions
    .filter((transaction) => transaction.customerId === customerId)
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );

export const calculateLoyaltyProgress = (profile) => {
  const currentTier = getTierById(profile?.tierId);
  const currentIndex = crmLoyaltyTiers.findIndex(
    (tier) => tier.id === currentTier.id,
  );
  const nextTier = crmLoyaltyTiers[currentIndex + 1] ?? null;
  const qualifyingSpend = Number(profile?.qualifyingSpend) || 0;

  if (!nextTier) {
    return {
      percentage: 100,
      remainingSpend: 0,
      nextTier: null,
      currentTier,
    };
  }

  const tierRange = nextTier.minimumSpend - currentTier.minimumSpend;
  const completedSpend = Math.max(
    qualifyingSpend - currentTier.minimumSpend,
    0,
  );

  return {
    percentage: Math.min(
      Math.round((completedSpend / tierRange) * 100),
      100,
    ),
    remainingSpend: Math.max(nextTier.minimumSpend - qualifyingSpend, 0),
    nextTier,
    currentTier,
  };
};