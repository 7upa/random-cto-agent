# Random CTO Agent

This agent randomly dumps 50 SOL into a token on Solana using verifiable randomness from ORAO VRF.

## Features
- Verifiable randomness via ORAO Network (~0.001 SOL fee)
- Token selection from Jupiter's high-liquidity list
- Swap via Jupiter aggregator
- Proof logged on-chain

## Setup
1. Install deps: `npm install`
2. Set env vars:
   - `RPC_URL`: Solana RPC (e.g., Helius or QuickNode)
   - `PRIVATE_KEY`: JSON array of your wallet's secret key bytes (NEVER commit this!)
3. Run: `npm start`

## Risks
- Random = potential for shitcoins
- Slippage set to 1% – adjust if needed
- Test on devnet first!

## Verification
Check the randomness account on Solscan to verify the proof.