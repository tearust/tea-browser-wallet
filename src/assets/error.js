export default {
  WithoutCoupon: 'Cannot find coupon to redeem',
  NotEnoughCoupon: 'Your coupon is insufficient for this transaction',
  InvalidCouponAmount: 'The coupon amount is invalid. It might be because of a computing overflow',
  NotEnoughDrawSeeds: 'The Genesis seed pool has run out',
  SeedsNotOutdatedYet: 'The seeds are not expired yet',
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
  InvalidStaker: 'Invalid Staker',
  InvalidStakee: 'Invalid Stakee',
  InvalidStakingIndex: 'Staking slot index is invalid',
  InvalidStakingOwner: 'Staking owner is invalid',
  InvalidUnstaking: 'Unstaking operation is invalid',
  NotFoundRewardAccount: 'Reward account not found',
  StakingSlotsOverTheMaxLength: 'Staking slots are full',
  StakingSlotsOverAcceptableIndex: 'Staking slots index exceeds limit',
  // auction pallet
  NotEnoughBalance: 'Not enough balance',
  NotEnoughBalanceForBid: 'Not enough balance to bid',
  NotEnoughBalanceForAuction: 'Not enough balance to start an auction',
  AuctionNotExist: 'Auction does not exist',
  InvalidBidPrice: 'Bid price is invalid',
  NoNeedBid: 'No need to bid',
  BidSelfBelongs: 'Bidding on items you own is not allowed',
  AuctionOwnerInvalid: 'The auction owner is invalid',
  AuctionOwnerHasCredit: 'You have to pay off your debt before adding CML to the marketplace',
  NotFoundBid: 'Bid not found',
  NotAllowQuitBid: 'Cannot cancel bid at this moment',
  NotInWindowBlock: 'Not in window block',
  LockableInvalid: 'Not currently lockable',
  NotAllowToAuction: 'Not allowed to auction',
  BalanceReserveOrUnreserveError: 'Account balance reserve error',
  NotEnoughBalanceForPenalty: 'Security deposit is not neough',
  BuyNowPriceShouldHigherThanStartingPrice: 'Buy now price should be higher than starting price',
  CmlNoNeedToPayOff: 'This CML is already paid off',
  CmlDefrostTimeIsNone: 'Please select a defrost time',
  /// 
  CmlShouldBeFrozenSeed: 'The CML should be a frozen seed',
  /// 
  CmlStillInFrozenLockedPeriod: 'Defrost time is in the future. Cannot defrost now',
  /// 
  CmlShouldBeFreshSeed: 'The CML should be a fresh seed',
  /// 
  CmlFreshSeedExpired: 'CML in fresh seed state has a shelf life. This CML has expired',
  /// CML is tree means that cannot be frozen seed or fresh seed 
  CmlShouldBeTree: 'The CML should be in "Tree" status',
  /// Cml has over the lifespan
  CmlShouldDead: "This CML should have already reached its end of life",
  /// Cml is mining that can start mining again.
  CmlIsMiningAlready: 'This CML has been used to mine already',
  /// Cml is staking that can't staking again or start mining.
  CmlIsStaking: 'This CML has been used to stake already',
  /// Before start mining staking slot should be empty.
  CmlStakingSlotNotEmpty: 'CML staking slots should be empty before starting mining',
  /// Means we cannot decide staking type from given params.
  ConfusedStakingType: 'Staking options should be either TEA or CML, but not both or none',
  /// Cml is not mining that can't stake to.
  CmlIsNotMining: 'This CML is not being used for mining. Staking on a non-mining CML is not allowed',
  /// Cml is not staking to current miner that can't unstake.
  CmlIsNotStakingToCurrentMiner: 'This CML is not currently staking and cannot be unstaked',
  /// Cml staking index over than staking slot length, that means point to not exist staking.
  CmlStakingIndexOverflow: 'The staking slots are full, cannot take any more stakes',
  /// Cml staking item owner is none, that can't identify staking belongs.
  CmlOwnerIsNone: 'The CML staking owner does not exist',
  /// Cml staking item owner and the owner field of cml item not match.
  CmlOwnerMismatch: 'The CML staking owner does not match the recorded owner',
  /// Cml is not staking that can't unstake.
  CmlIsNotStaking: 'This CML is not staking. Cannot unstake',
  /// Some status that can't convert to another status.
  CmlInvalidStatusConversion: 'The current CML status cannot be converted to another status',

  OperationForbiddenWithCredit: 'Withdrawal not permitted while account has an active loan. First pay off any outstanding loans before withdrawing rewards.',

  // genesis bank
  /// Loan already exists that cannot be pawn again.
  LoanAlreadyExists: 'LoanAlreadyExists',
  /// The given asset id not exist in collateral store.
  LoanNotExists: 'LoanNotExists',
  /// Collateral not belongs to user.
  InvalidBorrower: 'InvalidBorrower',
  /// Loan in default
  LoanInDefault: 'LoanInDefault',
  /// User have not enough free balance to pay off loan.
  InsufficientRepayBalance: 'InsufficientRepayBalance',
  /// Close height should larger equal than current height.
  InvalidCloseHeight: 'InvalidCloseHeight',
  /// Only frozen seeds are allowed to be collateral
  ShouldPawnFrozenSeed: 'ShouldPawnFrozenSeed',
  /// Only genesis seeds are allowed to be collateral
  ShouldPawnGenesisSeed: 'ShouldPawnGenesisSeed',
  /// Collateral store is not empty and bank cannot shutdown.
  CollateralStoreNotEmpty: 'CollateralStoreNotEmpty',
  /// User collateral store not empty cannot shutdown.
  UserCollateralStoreNotEmpty: 'UserCollateralStoreNotEmpty',
  /// Loan id convert to cml id with invalid length.
  ConvertToCmlIdLengthMismatch: 'ConvertToCmlIdLengthMismatch',
  /// Con not apply loan after current height larger equal than the close height.
  /// Close height is a preset block height that the Genesis Bank will stop operation
  /// We have such a close time because Genesis bank is supposed to be temporary cold-start
  /// helper. When newer Defi service tApps are ready, the Genesis Bank should be retired
  CannotApplyLoanAfterClosed: 'CannotApplyLoanAfterClosed',

  // genesis exchange
  ExchangeInsufficientUSD: 'ExchangeInsufficientUSD',
  ExchangeInsufficientTEA: 'ExchangeInsufficientTEA',
  UserInsufficientUSD: 'UserInsufficientUSD',
  UserInsufficientTEA: 'UserInsufficientTEA',
  InvalidDepositAmount: 'InvalidDepositAmount',
  InvalidTransferUSDAmount: 'InvalidTransferUSDAmount',
  WithdrawAmountShouldNotBeZero: 'WithdrawAmountShouldNotBeZero',

};
