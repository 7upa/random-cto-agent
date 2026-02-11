import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Orao } from '@orao-network/solana-vrf';
import { createQuote, createSwapInstructions } from '@jup-ag/api';
import fetch from 'node-fetch';

// Config from env
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const PRIVATE_KEY = JSON.parse(process.env.PRIVATE_KEY); // array of numbers
const WALLET_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY));

async function main() {
  const connection = new Connection(RPC_URL, 'confirmed');
  const orao = new Orao(connection);

  console.log('Fetching tokens from Jupiter...');
  const tokensResponse = await fetch('https://token.jup.ag/strict');
  const allTokens = await tokensResponse.json();
  const filteredTokens = allTokens.filter(t =>
    t.daily_volume < 1000 && // Low activity: approx no tx in 24h (low volume = few tx)
    t.symbol !== 'SOL' &&
    !t.name?.toLowerCase().includes('bundle') && // No bundle in name
    (t.tags?.some(tag => ['meme', 'ai', 'gaming', 'defi', 'nft'].includes(tag.toLowerCase())) || t.description?.toLowerCase().includes('bullish')) // Bullish narrative: trending tags or desc mentions bullish
  );

  console.log(`Found ${filteredTokens.length} tradable tokens.`);

  // Request randomness
  console.log('Requesting verifiable randomness from ORAO...');
  const randomnessRequest = await orao.requestRandomness(WALLET_KEYPAIR.publicKey);
  const randomnessTx = await sendAndConfirmTransaction(connection, randomnessRequest.tx, [WALLET_KEYPAIR]);
  console.log('Randomness request tx:', randomnessTx);

  // Wait for fulfillment (poll for simplicity)
  const randomnessAccount = randomnessRequest.randomnessAccount;
  let randomness;
  let attempts = 0;
  while (!randomness && attempts < 60) { // wait up to 60s
    try {
      randomness = await orao.getRandomness(randomnessAccount);
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
  }
  if (!randomness) throw new Error('Randomness not fulfilled');

  console.log('Randomness value:', randomness.toString());

  // Select token
  const index = Number(randomness) % filteredTokens.length;
  const selectedToken = filteredTokens[index];
  console.log(`Selected token: ${selectedToken.symbol} (${selectedToken.address}) based on index ${index}`);

  // Get swap quote
  const amountSOL = 50 * LAMPORTS_PER_SOL;
  const quoteResponse = await createQuote({
    inputMint: new PublicKey('So11111111111111111111111111111111111111112'), // WSOL mint
    outputMint: new PublicKey(selectedToken.address),
    amount: amountSOL,
    slippageBps: 100, // 1%
  });
  console.log('Swap quote:', quoteResponse);

  // Create swap instructions
  const swapInstructions = await createSwapInstructions(quoteResponse, WALLET_KEYPAIR.publicKey);
  const swapTx = await sendAndConfirmTransaction(connection, swapInstructions.swapTransaction, [WALLET_KEYPAIR]);
  console.log('Swap transaction confirmed:', swapTx);

  console.log('Randomness proof account:', randomnessAccount.toBase58());
  console.log('All done – verify on Solscan or whatever.');
}

main().catch(console.error);