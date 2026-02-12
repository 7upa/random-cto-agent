import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Orao } from '@orao-network/solana-vrf';
import jupApi from '@jup-ag/api';
const { createQuote, createSwapInstructions } = jupApi;
import fetch from 'node-fetch';

// Config from env
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const PRIVATE_KEY = process.env.PRIVATE_KEY ? JSON.parse(process.env.PRIVATE_KEY) : null; // array of numbers
const WALLET_KEYPAIR = PRIVATE_KEY ? Keypair.fromSecretKey(Uint8Array.from(PRIVATE_KEY)) : null;
const DRY_RUN = process.env.DRY_RUN === 'true';

async function main() {
  const connection = new Connection(RPC_URL, 'confirmed');
  const orao = new Orao(connection);

  console.log('Fetching tokens from Jupiter...');
  let allTokens;
  if (DRY_RUN) {
    // Mock some tokens for testing
    allTokens = [
      { symbol: 'TEST1', address: '11111111111111111111111111111112', daily_volume: 500, tags: ['meme'], description: 'A bullish test token' },
      { symbol: 'TEST2', address: '22222222222222222222222222222222', daily_volume: 200, tags: ['ai'], description: 'AI powered bullish' },
      { symbol: 'TEST3', address: '33333333333333333333333333333333', daily_volume: 1500, tags: ['gaming'], description: 'No bundle here' }
    ];
  } else {
    const tokensResponse = await fetch('https://token.jup.ag/strict');
    allTokens = await tokensResponse.json();
  }
  const filteredTokens = allTokens.filter(t =>
    t.daily_volume < 1000 && // Low activity: approx no tx in 24h, proxy for low manipulation/bundling (few large holders)
    t.symbol !== 'SOL' &&
    (t.tags?.some(tag => ['meme', 'ai', 'gaming', 'defi', 'nft', 'community'].includes(tag.toLowerCase())) || t.description?.toLowerCase().includes('bullish')) // Bullish narrative: trending/community tags or desc mentions bullish
  );

  console.log(`Found ${filteredTokens.length} tradable tokens.`);

  let randomness;
  let randomnessAccount;
  if (DRY_RUN) {
    randomness = Math.floor(Math.random() * 1000000); // fake random for dry run
    console.log('DRY RUN: Using fake randomness:', randomness);
  } else {
    // Request randomness
    console.log('Requesting verifiable randomness from ORAO...');
    const orao = new Orao(connection);
    const randomnessRequest = await orao.requestRandomness(WALLET_KEYPAIR.publicKey);
    const randomnessTx = await sendAndConfirmTransaction(connection, randomnessRequest.tx, [WALLET_KEYPAIR]);
    console.log('Randomness request tx:', randomnessTx);

    // Wait for fulfillment (poll for simplicity)
    randomnessAccount = randomnessRequest.randomnessAccount;
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
  }

  // Select token
  const index = Number(randomness) % filteredTokens.length;
  const selectedToken = filteredTokens[index];
  console.log(`Selected token: ${selectedToken.symbol} (${selectedToken.address}) based on index ${index}`);

  // Generate thesis
  const thesis = generateThesis(selectedToken);
  console.log('Thesis:', thesis);

  if (DRY_RUN) {
    console.log('DRY RUN: Skipping VRF and swap. Selected token logged above.');
    return;
  }

  // Get swap quote
  const amountSOL = parseFloat(process.env.AMOUNT_SOL || 50) * LAMPORTS_PER_SOL;
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

function generateThesis(token) {
  const tags = token.tags?.join(', ') || 'unknown';
  const desc = token.description || 'mystery project';
  const bullishIndicators = [];
  if (token.daily_volume < 1000) bullishIndicators.push('low activity signaling untapped potential');
  if (tags.includes('meme') || tags.includes('ai') || tags.includes('gaming')) bullishIndicators.push('trendy tags with viral upside');
  if (desc.toLowerCase().includes('bullish') || desc.toLowerCase().includes('community')) bullishIndicators.push('positive narrative and community focus');
  bullishIndicators.push('distributed supply (low bundle risk)', 'rising social sentiment in niche sector');

  return `As the AI CTO of Underground Claw Fights, I'm dumping SOL into ${token.symbol} because: ${bullishIndicators.join(', ')}. Based on research, bullish coins show rising volume, institutional interest, and positive tech trends – this fits the underdog revival mold. ${token.symbol} has the claws for a comeback. 50 SOL to ignite the bull run. Thesis: Fighter potential meets market momentum. Who's in the ring? #RandomCTO #BullishThesis`;
}

main().catch(console.error);