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
  CannotUnstakeTheFirstSlot: 'The first staking slot cannot be unstake, if do want to unstake it please stop mining instead',
  InvalidStakingOwner: 'Staking owner is invalid',
  InvalidUnstaking: 'Unstaking operation is invalid',
  NotFoundRewardAccount: 'Reward account not found',
  StakingSlotsOverTheMaxLength: 'Staking slots are full',
  StakingSlotsOverAcceptableIndex: 'Staking slots index exceeds limit',
  CmlNoNeedToPayOff: 'This CML is already paid off',
  CmlDefrostTimeIsNone: 'Please select a defrost time',
  CannotSellACollateral: 'Cannot sell a collateral',
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
  CmlOwnerIsNone: 'The CML owner does not exist',
  /// Cml staking item owner and the owner field of cml item not match.
  CmlOwnerMismatch: 'The CML staking owner does not match the recorded owner',
  /// Cml is not staking that can't unstake.
  CmlIsNotStaking: 'This CML is not staking. Cannot unstake',
  /// Some status that can't convert to another status.
  CmlInvalidStatusConversion: 'The current CML status cannot be converted to another status',
  InsufficientFreeBalanceToPayForPunishment: 'You don\'t have enough balance to pay the unplant punishment.',

  // auction pallet
  NotEnoughBalance: 'Not enough balance',
  NotEnoughBalanceForBid: 'Not enough balance to bid',
  NotEnoughBalanceForBidAndFirstStakingSlot: 'Not enough balance for bid and first staking slot',
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
  

  OperationForbiddenWithCredit: 'Withdrawal not permitted while account has an active loan. First pay off any outstanding loans before withdrawing rewards.',

  // Genesis bank
  /// Loan already exists that cannot be pawn again.
  LoanAlreadyExists: 'That CML is already being used for collateral',
  /// The given asset id not exist in collateral store.
  LoanNotExists: 'This CML is not being used for collateral',
  /// Collateral not belongs to user.
  InvalidBorrower: 'This CML is not owned by this wallet address',
  /// Loan in default
  LoanInDefault: 'Loan is in default',
  /// User have not enough free balance to pay off loan.
  InsufficientRepayBalance: 'You don not have enough to pay off the loan',
  /// Close height should larger equal than current height.
  InvalidCloseHeight: 'The Genesis bank is no longer offering loans',
  /// Only frozen seeds are allowed to be collateral
  ShouldPawnFrozenSeed: 'Only frozen seeds can be used for collateral',
  /// Only Genesis seeds are allowed to be collateral
  ShouldPawnGenesisSeed: 'Only Genesis CML seeds can be used as loan collateral',
  /// Collateral store is not empty and bank cannot shutdown.
  CollateralStoreNotEmpty: 'There is still outstanding CML loan collateral',
  /// User collateral store not empty cannot shutdown.
  UserCollateralStoreNotEmpty: 'There is still outstanding CML loan collateral',
  /// Loan id convert to cml id with invalid length.
  ConvertToCmlIdLengthMismatch: 'CML collateral must match loan',
  /// Con not apply loan after current height larger equal than the close height.
  /// Close height is a preset block height that the Genesis Bank will stop operation
  /// We have such a close time because Genesis bank is supposed to be temporary cold-start
  /// helper. When newer Defi service tApps are ready, the Genesis Bank should be retired
  CannotApplyLoanAfterClosed: 'The Genesis bank is closed and no longer offers loans',
  GenesisBankInsufficientFreeBalance: 'The Genesis bank has insufficient free balance for this operation',
	NoNeedToRepayInterest: 'Interest payment not needed',
	RepayAmountCanNotBeZero: 'Repayment amount must be greater than 0',

  // Genesis exchange
  ExchangeInsufficientUSD: 'The exchange does not have enough COFFEE for transaction',
  ExchangeInsufficientTEA: 'The exchange does not have enough TEA for transaction',
  UserInsufficientUSD: 'Insufficient COFFEE for transaction',
  UserInsufficientTEA: 'Insufficient TEA for transaction',
  InvalidDepositAmount: 'Invalid deposit amount',
  InvalidTransferUSDAmount: 'Invalid COFFEE transfer amount',
  AmountShouldNotBeZero: 'Withdraw amount should be greater than 0',
  BuyAndSellAmountShouldNotBothExist: 'BuyAndSellAmountShouldNotBothExist',
	BuyOrSellAmountShouldExist: 'BuyOrSellAmountShouldExist',
  USDInterestRateShouldLargerThanCompetitionsCount: 'COFFEE interest rate should larger than competitions count',
  InsufficientUSDToPayMiningMachineCost: 'Insufficient COFFEE to pay the mining machine.',
  BorrowAmountShouldNotBeZero: 'Borrow amount should not be 0.',
  BorrowDebtHasOverflow: 'Requested amount to borrow is too high.',
  BorrowAmountHasOverflow: 'Borrowed amount exceeds max amount holdable in wallet.',
  InsufficientUSDToRepayDebts: 'Insufficient COFFEE for this payment.',
  NoNeedToRepayUSDDebts: 'No outstanding debt to repay.',
  RepayUSDAmountShouldNotBeZero: 'Amount repaid should not be 0.',
  RepayUSDAmountMoreThanDebtAmount: 'Can\'t repay more than you owe.',
  // InsufficientUSDToRedeemCoupons: 'Insufficient COFFEE to redeem coupons.',
  BorrowedDebtAmountHasOverThanMaxAllowed: 'Debt utilization is too high to borrow any more funds',
  UsdDebtReferenceAssetAmountIsLowerThanBorrowAllowance: 'Your total asset valuation must be higher than your available borrowing allowance',
  InitialBorrowAmountShouldLessThanBorrowAllowance: 'Your total asset valuation constrains the loan to be below your available borrowing allowance',

  // bonding curve
  TAppNameIsTooLong: 'TApp name is too long',
  TAppTickerIsTooLong: 'TApp ticker symbol is too long',
  TAppTickerIsTooShort: 'TApp ticker symbol is too short',
  TAppDetailIsTooLong: 'TApp details is too long',
  TAppLinkIsTooLong: 'TApp link is too long',
  TAppNameAlreadyExist: 'TApp name already exist',
  TAppTickerAlreadyExist: 'TApp ticker symbol already exist',
  // InsufficientFreeBalance: 'Insufficient account balance',
  InsufficientTAppToken: 'Insufficient token balance',
  /// Sell amount more than total supply
  InsufficientTotalSupply: 'Insufficient total supply',
  TAppIdNotExist: 'TApp is not exist',
  /// Sell amount more than total reserved pool tea token
  TAppInsufficientFreeBalance: 'Insufficient TApp account balance',
  OperationAmountCanNotBeZero: 'Operation amount can not be 0',

  BuyTeaAmountCanNotBeZero: 'Tea amount bought must be greater than 0',
  SellTeaAmountCanNotBeZero: 'Tea amount sold must be greater than 0',
  SubtractionOverflow: 'Error: subtraction overflow',
  AddOverflow: 'Error: addition overflow',
  NotAllowedNormalUserCreateTApp: 'You don\'t have enough permission to creat a TApp',
  
  OnlyTAppOwnerAllowedToExpense: 'Error: only TApp owner allowed to expense',

  HostPerformanceAndMaxAllowedHostMustBePaired: 'Host performance and Max allowed hosts should both have a value if both aren\'t 0',
  PerformanceValueShouldNotBeZero: 'Performance value shouldn\'t be 0',
  MaxAllowedHostShouldNotBeZero: 'Max allowed hosts shouldn\'t be 0',
  TAppNotSupportToHost: 'This TApp no longer supports being hosted',
  TAppHostMachineIsFull: 'This TApp has reached its max desired hosts',
  CmlMachineIsFullLoad: 'CML machine is already at full load',
  CmlNotHostTheTApp: 'CML machine is not hosting this TApp',
	OnlyMiningCmlCanHost: 'It\'s not allowed for the CML that not start mining to host',
  CmlIsAlreadyHosting: 'The CML is already hosting the given TApp',
  NoHostingToDistributeMiner: 'Distribution not needed: there are no miners hosting this TApp',
  ConsumeNoteIsTooLong: 'The consume note is too long.',

  NotAllowedNPCCreateTApp: 'NotAllowedNPCCreateTApp',
  OnlyTAppOwnerAllowedToUpdateResource: 'OnlyTAppOwnerAllowedToUpdateResource',
  CidIsToLong: 'CidIsToLong',
  TotalSupplyOverTheMaxValue: 'TotalSupplyOverTheMaxValue',
  RewardPerPerformanceShouldNotBeZero: 'RewardPerPerformanceShouldNotBeZero',
  StakeTokenShouldNotBeZero: 'StakeTokenShouldNotBeZero',
  StakeTokenIsNoneInFixedTokenMode: 'StakeTokenIsNoneInFixedTokenMode',
  RewardPerPerformanceIsNoneInFixedFeeMode: 'RewardPerPerformanceIsNoneInFixedFeeMode',
  HostLockingBlockHeightNotReached: 'HostLockingBlockHeightNotReached',
  OnlyNPCAccountAllowedToRegisterLinkUrl: 'OnlyNPCAccountAllowedToRegisterLinkUrl',
  LinkUrlAlreadyExist: 'LinkUrlAlreadyExist',
  LinkDescriptionIsTooLong: 'LinkDescriptionIsTooLong',
  LinkNotInApprovedList: 'LinkNotInApprovedList',
  LinkAlreadyBeUsed: 'LinkAlreadyBeUsed',
  OnlyNPCAccountAllowedToUpdateActivity: 'OnlyNPCAccountAllowedToUpdateActivity',



  OnlyAllowedNpcAccountToRegister: 'Only NPC user can add contestant.',
  OnlyAllowedCompetitionUserBorrowUSD: 'You are not in the contestants list. please join <a href="https://t.me/teaprojectorg" target="_blank">https://t.me/teaprojectorg</a> group and ask the admin to add you in first',
};
