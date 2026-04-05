const MEMBERSHIP_TIERS = [
  {
    code: 'S-NULL',
    minTotalSpent: 0,
    maxTotalSpent: 3000000,
  },
  {
    code: 'S-NEW',
    minTotalSpent: 3000000,
    maxTotalSpent: 15000000,
  },
  {
    code: 'S-MEM',
    minTotalSpent: 15000000,
    maxTotalSpent: 50000000,
  },
  {
    code: 'S-VIP',
    minTotalSpent: 50000000,
    maxTotalSpent: Number.POSITIVE_INFINITY,
  },
];

const TIER_TRANSITION_REWARDS = {
  'S-NULL->S-NEW': {
    voucherName: 'Voucher thang hang S-NEW 50K',
    voucherCode: 'UP_SNEW_50K',
    discountType: 'fixed',
    discountValue: 50000,
    maxDiscountAmount: 0,
    minOrderValue: 0,
  },
  'S-NEW->S-MEM': {
    voucherName: 'Voucher thang hang S-MEM 100K',
    voucherCode: 'UP_SMEM_100K',
    discountType: 'fixed',
    discountValue: 100000,
    maxDiscountAmount: 0,
    minOrderValue: 0,
  },
  'S-MEM->S-VIP': {
    voucherName: 'Voucher thang hang S-VIP 300K',
    voucherCode: 'UP_SVIP_300K',
    discountType: 'fixed',
    discountValue: 300000,
    maxDiscountAmount: 0,
    minOrderValue: 0,
  },
};

const getTierIndexByCode = (tierCode) => {
  const index = MEMBERSHIP_TIERS.findIndex((tier) => tier.code === tierCode);
  return index >= 0 ? index : 0;
};

const resolveMembershipTierBySpent = (totalSpent) => {
  const spentValue = Number(totalSpent || 0);

  const matchedTier = MEMBERSHIP_TIERS.find(
    (tier) => spentValue >= tier.minTotalSpent && spentValue < tier.maxTotalSpent
  );

  return matchedTier || MEMBERSHIP_TIERS[MEMBERSHIP_TIERS.length - 1];
};

const buildTransitionKey = (fromTierCode, toTierCode) => `${fromTierCode}->${toTierCode}`;

const getTierTransitions = (fromTierCode, toTierCode) => {
  const fromIndex = getTierIndexByCode(fromTierCode);
  const toIndex = getTierIndexByCode(toTierCode);

  if (toIndex <= fromIndex) {
    return [];
  }

  const transitions = [];

  for (let index = fromIndex + 1; index <= toIndex; index += 1) {
    const previousTier = MEMBERSHIP_TIERS[index - 1];
    const nextTier = MEMBERSHIP_TIERS[index];
    const key = buildTransitionKey(previousTier.code, nextTier.code);

    transitions.push({
      key,
      fromTierCode: previousTier.code,
      toTierCode: nextTier.code,
      reward: TIER_TRANSITION_REWARDS[key] || null,
    });
  }

  return transitions;
};

module.exports = {
  MEMBERSHIP_TIERS,
  TIER_TRANSITION_REWARDS,
  getTierIndexByCode,
  resolveMembershipTierBySpent,
  buildTransitionKey,
  getTierTransitions,
};
