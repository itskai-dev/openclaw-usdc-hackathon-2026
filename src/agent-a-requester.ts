/**
 * Agent A (Requester) - Requests services and pays with USDC
 * 
 * This agent discovers services, makes payment-protected requests,
 * and automatically handles x402 payment flow.
 */

import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactEvmScheme } from '@x402/evm';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

const agentName = process.env.AGENT_A_NAME || 'Agent Alpha';
const agentBUrl = process.env.AGENT_B_URL || 'http://localhost:3001';

interface TaskRequest {
  service: 'fetch' | 'compute' | 'generate';
  params: any;
}

interface ServiceInfo {
  name: string;
  path: string;
  price: string;
  description: string;
}

interface AgentInfo {
  agent: string;
  services: ServiceInfo[];
}

/**
 * Create an x402-enabled fetch client that automatically handles payments
 */
async function createPaymentClient() {
  const privateKey = process.env.AGENT_A_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('AGENT_A_PRIVATE_KEY not set in .env');
  }

  // Create account from private key
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  
  // Create wallet client for Base Sepolia
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.RPC_URL),
  });

  console.log(`\n✓ Wallet initialized: ${account.address}`);
  console.log(`✓ Network: Base Sepolia (testnet)\n`);

  // Get balance - commented out as walletClient doesn't have getBalance method
  // Use publicClient if balance check is needed
  console.log(`💰 Wallet ready for transactions\n`);

  // Wrap fetch with automatic payment handling
  const fetchWithPayment = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [
      {
        network: (process.env.NETWORK || 'eip155:84532') as `${string}:${string}`,
        client: new ExactEvmScheme(account),
      },
      {
        network: 'eip155:*' as `${string}:${string}`, // Fallback for any EVM chain
        client: new ExactEvmScheme(account),
      },
    ],
  });

  return {
    fetch: fetchWithPayment,
    account,
    walletClient,
  };
}

/**
 * Discover available services from Agent B
 */
async function discoverServices(): Promise<AgentInfo> {
  console.log(`🔍 Discovering services from Agent B...\n`);
  
  try {
    const response = await fetch(`${agentBUrl}/info`);
    const info = await response.json() as AgentInfo;
    
    console.log(`✓ Found agent: ${info.agent}`);
    console.log(`✓ Services available: ${info.services.length}\n`);
    
    info.services.forEach((service: ServiceInfo, i: number) => {
      console.log(`  ${i + 1}. ${service.description}`);
      console.log(`     Path: ${service.path}`);
      console.log(`     Price: ${service.price}\n`);
    });
    
    return info;
  } catch (error) {
    console.error('❌ Failed to discover services:', error);
    throw error;
  }
}

/**
 * Request a task from Agent B with automatic payment
 */
async function requestTask(task: TaskRequest): Promise<any> {
  const client = await createPaymentClient();
  
  const serviceMap = {
    fetch: '/task/fetch',
    compute: '/task/compute',
    generate: '/task/generate',
  };

  const url = `${agentBUrl}${serviceMap[task.service]}`;
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📤 Requesting ${task.service} service...`);
  console.log(`   URL: ${url}`);
  console.log(`   Params:`, JSON.stringify(task.params, null, 2));
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  try {
    const response = await client.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.params),
    });

    console.log(`✓ Response: ${response.status} ${response.statusText}`);
    
    // Check for payment confirmation
    const paymentResponse = response.headers.get('PAYMENT-RESPONSE');
    if (paymentResponse) {
      console.log(`💰 Payment confirmed!\n`);
      try {
        const paymentData = JSON.parse(
          Buffer.from(paymentResponse, 'base64').toString('utf-8')
        );
        if (paymentData.transaction) {
          console.log(`   Transaction: ${paymentData.transaction}`);
          console.log(`   View on BaseScan: https://sepolia.basescan.org/tx/${paymentData.transaction}\n`);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    const result = await response.json();
    
    console.log(`\n📦 Result:`);
    console.log(JSON.stringify(result, null, 2));
    console.log(`\n✅ Task completed successfully!\n`);
    
    return result;
  } catch (error) {
    console.error(`\n❌ Task failed:`, error);
    throw error;
  }
}

/**
 * Interactive demo - shows all three services
 */
async function runDemo() {
  console.log(`╔════════════════════════════════════════════════╗`);
  console.log(`║  ${agentName} - Service Consumer Agent            ║`);
  console.log(`╚════════════════════════════════════════════════╝`);

  try {
    // Discover services
    await discoverServices();
    
    console.log(`\n🚀 Running demo with 3 example tasks...\n`);
    
    // Task 1: Data Fetch ($0.01 USDC)
    console.log(`\n[1/3] Data Fetch Example`);
    await requestTask({
      service: 'fetch',
      params: {
        url: 'https://api.coinbase.com/v2/exchange-rates?currency=ETH',
      },
    });
    
    // Wait a moment between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Task 2: Computation ($0.05 USDC)
    console.log(`\n[2/3] Computation Example`);
    await requestTask({
      service: 'compute',
      params: {
        operation: 'sum',
        values: [100, 200, 300, 400, 500],
      },
    });
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Task 3: Content Generation ($0.10 USDC)
    console.log(`\n[3/3] Content Generation Example`);
    await requestTask({
      service: 'generate',
      params: {
        prompt: 'the future of agent-to-agent economies',
        type: 'description',
      },
    });
    
    console.log(`\n╔════════════════════════════════════════════════╗`);
    console.log(`║  🎉 Demo completed successfully!                ║`);
    console.log(`║                                                 ║`);
    console.log(`║  Total spent: $0.16 USDC                        ║`);
    console.log(`║  Transactions: 3                                ║`);
    console.log(`║  Services used: fetch, compute, generate        ║`);
    console.log(`╚════════════════════════════════════════════════╝\n`);

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

/**
 * CLI interface for single task execution
 */
async function runCLI() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: npm run agent-a -- <command> [options]

Commands:
  discover              List available services from Agent B
  fetch <url>          Request data fetch service
  compute <op> <nums>  Request computation service
  generate <prompt>    Request content generation service
  demo                 Run full demo with all services

Examples:
  npm run agent-a -- discover
  npm run agent-a -- fetch https://api.example.com/data
  npm run agent-a -- compute sum 1,2,3,4,5
  npm run agent-a -- generate "AI agents working together"
  npm run agent-a -- demo
    `);
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'discover':
        await discoverServices();
        break;

      case 'fetch':
        if (!args[1]) {
          console.error('Error: URL required for fetch command');
          process.exit(1);
        }
        await requestTask({
          service: 'fetch',
          params: { url: args[1] },
        });
        break;

      case 'compute':
        if (!args[1] || !args[2]) {
          console.error('Error: Operation and values required');
          console.error('Example: compute sum 1,2,3,4,5');
          process.exit(1);
        }
        const values = args[2].split(',').map(Number);
        await requestTask({
          service: 'compute',
          params: {
            operation: args[1],
            values,
          },
        });
        break;

      case 'generate':
        if (!args[1]) {
          console.error('Error: Prompt required for generate command');
          process.exit(1);
        }
        const prompt = args.slice(1).join(' ');
        await requestTask({
          service: 'generate',
          params: {
            prompt,
            type: args[2] || 'description',
          },
        });
        break;

      case 'demo':
        await runDemo();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === 'demo') {
    runDemo();
  } else {
    runCLI();
  }
}

export { createPaymentClient, discoverServices, requestTask, runDemo };
