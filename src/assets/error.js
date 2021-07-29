export default {
  WithoutCoupon: 'Cannot find coupon to redeem',
  NotEnoughCoupon: 'Your coupon is insufficient for this transaction',
  InvalidCouponAmount: 'The coupon amount is invalid. It might be because of a computing overflow',
  NotEnoughDrawSeeds: 'The Genesis seed pool has run out',
  SeedsNotOutdatedYet: 'The Seeds are not expired yet',
  CouponsHasOutdated: 'Coupons are expired',
  NoNeedToCleanOutdatedSeeds: 'No need to clean up expired seeds',
  NotFoundCML: 'CML not found',
  CMLOwnerInvalid: 'The CML owner is invalid',
  CmlIsNotSeed: 'The CML is not a seed',
  SeedNotValid: 'The seed is invalid',
  InsufficientFreeBalance: 'Insufficient account balance',
  InsufficientReservedBalance: 'Insufficient reserved balance',
  MinerAlreadyExist: 'Miner already exists',
  NotFoundMiner: 'Miner not found',
  InvalidCreditAmount: 'Credit amount is invalid',
  InvalidMiner: 'Miner is invalid',
  InvalidMinerIp: 'Miner IP is invalid',
  InvalidStaker: 'InvalidStaker',
  InvalidStakee: 'InvalidStakee',
  InvalidStakingIndex: 'Staking slot index is invalid',
  InvalidStakingOwner: 'Staker owner is invalid',
  InvalidUnstaking: 'Unstaking operation is invalid',
  NotFoundRewardAccount: 'Reward account not found',
  StakingSlotsOverTheMaxLength: 'Staking slots are full',
  StakingSlotsOverAcceptableIndex: 'Staking slots index exceeds limit',
  // auction pallet
  NotEnoughBalance: 'Not enough balance.',
  NotEnoughBalanceForBid: 'Not enough balance to bid.',
  NotEnoughBalanceForAuction: 'Not enough balance to start an auction.',
  AuctionNotExist: 'Auction does not exist.',
  InvalidBidPrice: 'Bid price is invalid.',
  NoNeedBid: 'NoNeedBid.',
  BidSelfBelongs: 'Bid on the items that you owned is not allowed.',
  AuctionOwnerInvalid: 'The auction owner is invalid',
  AuctionOwnerHasCredit: 'You have to pay off your debt before adding CML to the marketplace.',
  NotFoundBid: 'Bid not found.',
  NotAllowQuitBid: 'Cannot quit bid at this moment.',
  NotInWindowBlock: 'Not in window block',
  LockableInvalid: 'Lockable is invalid',
  NotAllowToAuction: 'Not allowed to an auction',
  BalanceReserveOrUnreserveError: 'Account balance reserve or unreserve error.',
  NotEnoughBalanceForPenalty: 'Security deposit is not neough',
  BuyNowPriceShouldHigherThanStartingPrice: 'Buy now price should higher than starting price.',
  CmlNoNeedToPayOff: 'There is no credit of user, no need to pay for it.',
  CmlDefrostTimeIsNone: 'Defrost time should have value when defrost.',
  /// 
  CmlShouldBeFrozenSeed: 'CML should be frozen seed.',
  /// 
  CmlStillInFrozenLockedPeriod: 'Defrost time is not yet to come. Cannot defrost now.',
  /// 
  CmlShouldBeFreshSeed: 'CML should be fresh seed.',
  /// 
  CmlFreshSeedExpired: 'CML in fresh seed state cannot last too long. It has expired.',
  /// CML is tree means that cannot be frozen seed or fresh seed 
  CmlShouldBeTree: 'CML should be in "Tree" status.',
  /// Cml has over the lifespan
  CmlShouldDead: "CML should have been dead.",
  /// Cml is mining that can start mining again.
  CmlIsMiningAlready: 'CML has been in mining already',
  /// Cml is staking that can't staking again or start mining.
  CmlIsStaking: 'CML has been in staking already',
  /// Before start mining staking slot should be empty.
  CmlStakingSlotNotEmpty: 'CML staking slots should be empty before start mining',
  /// Means we cannot decide staking type from given params.
  ConfusedStakingType: 'Staking options should be either TEA or CML, but not both or none',
  /// Cml is not mining that can't stake to.
  CmlIsNotMining: 'CML is not in mining. Stakes on a non-mining CML is invalid',
  /// Cml is not staking to current miner that can't unstake.
  CmlIsNotStakingToCurrentMiner: 'CML is not in staking. Cannot unstake.',
  /// Cml staking index over than staking slot length, that means point to not exist staking.
  CmlStakingIndexOverflow: 'The staking slots are full, cannot take stakes any more.',
  /// Cml staking item owner is none, that can't identify staking belongs.
  CmlOwnerIsNone: 'CML staking owner not exists.',
  /// Cml staking item owner and the owner field of cml item not match.
  CmlOwnerMismatch: 'CML staking owner doesnot match CML record.',
  /// Cml is not staking that can't unstake.
  CmlIsNotStaking: 'CML is not staking. Cannot unstake.',
  /// Some status that can't convert to another status.
  CmlInvalidStatusConversion: 'CML current status cannot convert to another status',

  OperationForbiddenWithCredit: 'Withdrawing reward not allowed with staking debt balance.',
};
