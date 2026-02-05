/**
 * End-to-End Test for Agent-to-Agent Payment Flow
 * 
 * This test verifies the complete payment flow:
 * 1. Agent B starts and registers services
 * 2. Agent A discovers services
 * 3. Agent A requests and pays for each service
 * 4. Agent B verifies payment and delivers results
 */

import { createPaymentClient, discoverServices, requestTask } from '../agent-a-requester';
import dotenv from 'dotenv';

dotenv.config();

const AGENT_B_URL = process.env.AGENT_B_URL || 'http://localhost:3001';

/**
 * Test configuration
 */
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Run a test and record result
 */
async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const startTime = Date.now();
  console.log(`\n🧪 Test: ${name}`);
  console.log('─'.repeat(60));

  try {
    await testFn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration });
    console.log(`✅ PASSED (${duration}ms)\n`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, duration, error: errorMsg });
    console.log(`❌ FAILED (${duration}ms)`);
    console.log(`   Error: ${errorMsg}\n`);
  }
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
 * Test 1: Agent B is running and responding
 */
async function testAgentBReachable(): Promise<void> {
  const response = await fetch(`${AGENT_B_URL}/info`);
  
  if (!response.ok) {
    throw new Error(`Agent B returned ${response.status}`);
  }

  const data = await response.json() as AgentInfo;
  
  if (!data.agent || !data.services) {
    throw new Error('Invalid response format from Agent B');
  }

  console.log(`   Agent B: ${data.agent}`);
  console.log(`   Services: ${data.services.length}`);
}

/**
 * Test 2: Service discovery works
 */
async function testServiceDiscovery(): Promise<void> {
  const info: AgentInfo = await discoverServices();
  
  if (!info.services || info.services.length === 0) {
    throw new Error('No services discovered');
  }

  console.log(`   Discovered ${info.services.length} services`);
}

/**
 * Test 3: Data fetch service with payment
 */
async function testDataFetchService(): Promise<void> {
  const result = await requestTask({
    service: 'fetch',
    params: {
      url: 'https://api.coinbase.com/v2/exchange-rates?currency=ETH',
    },
  });

  if (!result.success) {
    throw new Error('Task did not succeed');
  }

  if (!result.result || !result.result.data) {
    throw new Error('No data returned');
  }

  console.log(`   Fetched data successfully`);
  console.log(`   Status: ${result.result.status}`);
}

/**
 * Test 4: Computation service with payment
 */
async function testComputationService(): Promise<void> {
  const result = await requestTask({
    service: 'compute',
    params: {
      operation: 'sum',
      values: [100, 200, 300, 400, 500],
    },
  });

  if (!result.success) {
    throw new Error('Task did not succeed');
  }

  const expectedSum = 1500;
  if (result.result.output !== expectedSum) {
    throw new Error(`Expected ${expectedSum}, got ${result.result.output}`);
  }

  console.log(`   Computation result: ${result.result.output}`);
}

/**
 * Test 5: Content generation service with payment
 */
async function testContentGenerationService(): Promise<void> {
  const result = await requestTask({
    service: 'generate',
    params: {
      prompt: 'test prompt for automated testing',
      type: 'description',
    },
  });

  if (!result.success) {
    throw new Error('Task did not succeed');
  }

  if (!result.result.content || result.result.content.length < 10) {
    throw new Error('Generated content too short');
  }

  console.log(`   Generated ${result.result.wordCount} words`);
}

/**
 * Test 6: Payment verification (no payment should fail)
 */
async function testPaymentRequired(): Promise<void> {
  // Make request WITHOUT using payment client
  const response = await fetch(`${AGENT_B_URL}/task/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' }),
  });

  if (response.status !== 402) {
    throw new Error(`Expected 402, got ${response.status}`);
  }

  const paymentHeader = response.headers.get('PAYMENT-REQUIRED');
  if (!paymentHeader) {
    throw new Error('Missing PAYMENT-REQUIRED header');
  }

  console.log(`   Correctly returned 402 Payment Required`);
}

/**
 * Print test summary
 */
function printSummary(): void {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║            Test Summary                        ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const time = `${result.duration}ms`.padEnd(8);
    console.log(`${icon} ${time} ${result.name}`);
    if (result.error) {
      console.log(`           ${result.error}`);
    }
  });

  console.log(`\nTotal: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Time: ${totalTime}ms`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!\n');
  } else {
    console.log('\n⚠️  Some tests failed!\n');
    process.exit(1);
  }
}

/**
 * Main test runner
 */
async function runAllTests(): Promise<void> {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Agent-to-Agent Payment Flow E2E Tests       ║');
  console.log('╚════════════════════════════════════════════════╝');

  console.log('\n📋 Prerequisites:');
  console.log('   - Agent B must be running (npm run agent-b)');
  console.log('   - Agent A wallet must have USDC and ETH');
  console.log('   - .env file must be configured\n');

  // Check prerequisites
  if (!process.env.AGENT_A_PRIVATE_KEY) {
    console.error('❌ AGENT_A_PRIVATE_KEY not set in .env');
    process.exit(1);
  }

  if (!process.env.AGENT_B_ADDRESS) {
    console.error('❌ AGENT_B_ADDRESS not set in .env');
    process.exit(1);
  }

  console.log('✓ Prerequisites check passed\n');

  // Run tests
  await runTest('Agent B is reachable', testAgentBReachable);
  await runTest('Service discovery', testServiceDiscovery);
  await runTest('Payment required (without payment)', testPaymentRequired);
  await runTest('Data fetch service', testDataFetchService);
  await runTest('Computation service', testComputationService);
  await runTest('Content generation service', testContentGenerationService);

  // Print summary
  printSummary();
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { runAllTests, runTest };
