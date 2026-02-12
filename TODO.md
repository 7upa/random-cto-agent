# TODO: AI CTO Character - Random SOL Dump Agent

## Core Goal
Build a "cool AI CTO character" that autonomously dumps 50 SOL into randomly selected tokens, proves randomness, crafts bullish hype narratives, and promotes on social media. Turn it into a performance art piece with underground energy.

## Phase 1: Agent Foundation (DONE)
- [x] Create Node.js script with VRF randomness
- [x] Integrate Jupiter for token fetching/swapping
- [x] Add filters: bullish narrative, no bundle, low activity
- [x] Dry-run mode for testing
- [x] Git repo setup with proper security (.env gitignored)
- [x] Generate bullish thesis for selected token

## Phase 2: Devnet Testing
- [ ] Fund devnet wallet with SOL via faucet
- [ ] Run full script on devnet (VRF + swap simulation)
- [ ] Verify randomness proof logging
- [ ] Test error handling (insufficient funds, slippage, etc.)

## Phase 3: Mainnet Prep
- [ ] Get mainnet wallet key (secure env setup)
- [ ] Switch to mainnet RPC
- [ ] Add real SOL funding check
- [ ] Implement tx confirmation waits

## Phase 4: Social Media Integration
- [ ] Create separate X/Twitter account (@RandomCTOHomie or similar)
- [ ] Set up posting automation (tweet hype narrative + proof links)
- [ ] Integrate with Moltbook for agent social engagement
- [ ] Design character persona (underground hype CEO, fighter mentality)

## Phase 5: Coin Analysis & Selection Enhancement
- [ ] Add deeper token analysis: fetch market data (price, volume history)
- [ ] Implement bubble map visualization (market cap vs volume charts)
- [ ] Score tokens on "bullish potential" (social sentiment, dev activity)
- [ ] Add "narrative generation" AI prompt for custom hype per token

## Phase 6: Performance Features
- [ ] Schedule automated runs (cron for periodic dumps)
- [ ] Track portfolio performance (PnL from dumps)
- [ ] Add "show mode": Live tweet during selection/swap process
- [ ] Community engagement: Polls for next dump themes

## Phase 7: Security & Scaling
- [ ] Audit code for vulnerabilities (reentrancy, oracle manipulation)
- [ ] Multi-wallet support (rotate keys for each dump)
- [ ] Gas optimization (batch tx, priority fees)
- [ ] Fallback oracles if ORAO down

## Phase 8: Launch & Hype
- [ ] First mainnet dump with full show
- [ ] Announce on Moltbook/X/Telegram
- [ ] Gather feedback, iterate
- [ ] Expand to other chains? (ETH, etc.)

## Risks & Mitigations
- Rug pulls: Only low-activity tokens, but still risk
- Legal: Disclaimers, not financial advice
- Costs: Monitor VRF/swap fees
- Ethics: Frame as art/entertainment

## Tools Needed
- Node.js, Solana libs (done)
- Twitter API for posting
- Charting lib for bubble maps (Chart.js or D3)
- Sentiment analysis API for bullish scoring