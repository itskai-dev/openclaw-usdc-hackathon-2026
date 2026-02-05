/**
 * Agent B (Performer) - Provides services and receives USDC payments
 * 
 * This agent runs an HTTP server with x402 payment protection.
 * It offers three types of services:
 * 1. Data fetching ($0.01 USDC)
 * 2. Computation ($0.05 USDC)
 * 3. Content generation ($0.10 USDC)
 */

import express from 'express';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import { x402HTTPResourceServer } from '@x402/core/http';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = parseInt(process.env.AGENT_B_PORT || '3001');
const agentName = process.env.AGENT_B_NAME || 'Agent Beta';

// Parse JSON bodies
app.use(express.json());

/**
 * Initialize x402 resource server
 */
async function setupX402Server() {
  const recipientAddress = process.env.AGENT_B_ADDRESS;
  if (!recipientAddress) {
    throw new Error('AGENT_B_ADDRESS not set in .env');
  }

  console.log(`💰 Payment recipient: ${recipientAddress}`);

  // Connect to Coinbase x402 facilitator
  const facilitatorClient = new HTTPFacilitatorClient({
    url: process.env.FACILITATOR_URL || 'https://x402.coinbase.com/v1',
  });

  // Create resource server with EVM payment scheme
  const resourceServer = new x402ResourceServer(facilitatorClient)
    .register('eip155:*', new ExactEvmScheme());

  // Initialize (fetches supported payment types from facilitator)
  await resourceServer.initialize();

  console.log('✓ x402 resource server initialized');

  // Define routes with payment requirements
  const routes = {
    'POST /task/fetch': {
      accepts: {
        scheme: 'exact' as const,
        network: (process.env.NETWORK || 'eip155:84532') as `${string}:${string}`,
        payTo: recipientAddress,
        price: '$0.01',
        asset: 'USDC',
      },
      description: 'Data fetch service - fetches data from any URL',
      mimeType: 'application/json',
    },
    'POST /task/compute': {
      accepts: {
        scheme: 'exact' as const,
        network: (process.env.NETWORK || 'eip155:84532') as `${string}:${string}`,
        payTo: recipientAddress,
        price: '$0.05',
        asset: 'USDC',
      },
      description: 'Computation service - performs calculations',
      mimeType: 'application/json',
    },
    'POST /task/generate': {
      accepts: {
        scheme: 'exact' as const,
        network: (process.env.NETWORK || 'eip155:84532') as `${string}:${string}`,
        payTo: recipientAddress,
        price: '$0.10',
        asset: 'USDC',
      },
      description: 'Content generation service - creates text content',
      mimeType: 'application/json',
    },
  };

  const httpServer = new x402HTTPResourceServer(resourceServer, routes);

  return { httpServer, routes };
}

/**
 * Helper to check and verify payment using new x402 API
 */
async function checkPayment(
  httpServer: x402HTTPResourceServer,
  req: express.Request,
  res: express.Response
): Promise<boolean> {
  try {
    // Create HTTP adapter for Express
    const adapter = {
      getHeader: (name: string) => req.header(name),
      getMethod: () => req.method,
      getPath: () => req.path,
      getUrl: () => req.url,
      getAcceptHeader: () => req.header('Accept') || '*/*',
      getUserAgent: () => req.header('User-Agent') || 'unknown',
    };

    // Process HTTP request with x402
    const result = await httpServer.processHTTPRequest({
      adapter,
      path: req.path,
      method: req.method,
      paymentHeader: req.header('PAYMENT-SIGNATURE'),
    });

    if (result.type === 'payment-error') {
      // Payment was invalid or had an error
      res.status(result.response.status)
        .set(result.response.headers)
        .json(result.response.body);
      return false;
    }

    if (result.type === 'payment-verified') {
      // Payment verified successfully
      console.log(`✓ Payment verified from: ${JSON.stringify(result.paymentPayload).substring(0, 100)}...`);
      
      // Process settlement
      const settlement = await httpServer.processSettlement(
        result.paymentPayload,
        result.paymentRequirements
      );
      
      if (settlement.success) {
        console.log(`✓ Payment settled successfully`);
        return true;
      } else {
        console.error(`❌ Settlement failed: ${settlement.errorReason}`);
        res.status(500).json({
          error: 'Settlement failed',
          message: settlement.errorReason,
        });
        return false;
      }
    }

    // No payment required (shouldn't happen for our protected routes)
    return true;
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Start the Agent B server
 */
async function startAgent() {
  console.log(`╔════════════════════════════════════════════════╗`);
  console.log(`║  ${agentName} - Service Provider Agent           ║`);
  console.log(`╚════════════════════════════════════════════════╝\n`);

  try {
    const { httpServer, routes } = await setupX402Server();

    // Info endpoint (free, no payment required)
    app.get('/info', (req, res) => {
      res.json({
        agent: agentName,
        type: 'service-provider',
        services: [
          { path: '/task/fetch', price: '$0.01 USDC', description: 'Fetch data from any URL' },
          { path: '/task/compute', price: '$0.05 USDC', description: 'Perform calculations' },
          { path: '/task/generate', price: '$0.10 USDC', description: 'Generate text content' },
        ],
        network: process.env.NETWORK || 'eip155:84532',
        paymentMethod: 'x402 protocol',
      });
    });

    // Service 1: Data Fetch ($0.01 USDC)
    app.post('/task/fetch', async (req, res) => {
      console.log('\n📥 Received fetch request...');
      
      if (!await checkPayment(httpServer, req, res)) {
        return;
      }

      try {
        const { url } = req.body;
        
        if (!url) {
          res.status(400).json({ error: 'Missing required field: url' });
          return;
        }

        console.log(`   Fetching: ${url}`);
        
        const response = await axios.get(url, { timeout: 10000 });
        
        res.json({
          success: true,
          service: 'data-fetch',
          result: {
            url,
            status: response.status,
            contentType: response.headers['content-type'],
            data: response.data,
          },
          agent: agentName,
          timestamp: new Date().toISOString(),
        });

        console.log(`✓ Task completed successfully`);
      } catch (error) {
        console.error('   Error:', error);
        res.status(500).json({
          error: 'Task execution failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Service 2: Computation ($0.05 USDC)
    app.post('/task/compute', async (req, res) => {
      console.log('\n🧮 Received computation request...');
      
      if (!await checkPayment(httpServer, req, res)) {
        return;
      }

      try {
        const { operation, values } = req.body;
        
        if (!operation || !values || !Array.isArray(values)) {
          res.status(400).json({ 
            error: 'Missing required fields: operation, values',
            example: { operation: 'sum', values: [1, 2, 3, 4, 5] }
          });
          return;
        }

        console.log(`   Operation: ${operation} on ${values.length} values`);
        
        let result;
        switch (operation) {
          case 'sum':
            result = values.reduce((a, b) => a + b, 0);
            break;
          case 'average':
            result = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'max':
            result = Math.max(...values);
            break;
          case 'min':
            result = Math.min(...values);
            break;
          case 'product':
            result = values.reduce((a, b) => a * b, 1);
            break;
          default:
            res.status(400).json({ 
              error: 'Unknown operation',
              supported: ['sum', 'average', 'max', 'min', 'product']
            });
            return;
        }

        res.json({
          success: true,
          service: 'computation',
          result: {
            operation,
            input: values,
            output: result,
          },
          agent: agentName,
          timestamp: new Date().toISOString(),
        });

        console.log(`✓ Computation completed: ${result}`);
      } catch (error) {
        console.error('   Error:', error);
        res.status(500).json({
          error: 'Computation failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Service 3: Content Generation ($0.10 USDC)
    app.post('/task/generate', async (req, res) => {
      console.log('\n✍️  Received content generation request...');
      
      if (!await checkPayment(httpServer, req, res)) {
        return;
      }

      try {
        const { prompt, type = 'description' } = req.body;
        
        if (!prompt) {
          res.status(400).json({ 
            error: 'Missing required field: prompt',
            example: { prompt: 'a futuristic city', type: 'description' }
          });
          return;
        }

        console.log(`   Type: ${type}, Prompt: "${prompt}"`);
        
        // Simulate content generation (in real scenario, would call an LLM)
        let content;
        switch (type) {
          case 'description':
            content = `Generated description based on "${prompt}": This concept explores the intersection of technology and creativity, offering unique perspectives on ${prompt}. The synthesis of various elements creates a compelling narrative that captivates the imagination.`;
            break;
          case 'summary':
            content = `Summary of "${prompt}": Key points include innovation, transformation, and forward-thinking approaches to modern challenges.`;
            break;
          case 'analysis':
            content = `Analysis of "${prompt}": This topic demonstrates significant potential for growth and development. Current trends suggest increasing relevance across multiple domains.`;
            break;
          default:
            content = `Content generated for "${prompt}": Exploring new possibilities and innovative solutions in this dynamic space.`;
        }

        res.json({
          success: true,
          service: 'content-generation',
          result: {
            prompt,
            type,
            content,
            wordCount: content.split(' ').length,
          },
          agent: agentName,
          timestamp: new Date().toISOString(),
        });

        console.log(`✓ Content generated (${content.split(' ').length} words)`);
      } catch (error) {
        console.error('   Error:', error);
        res.status(500).json({
          error: 'Content generation failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Start listening
    app.listen(port, () => {
      console.log(`\n✓ ${agentName} is running on http://localhost:${port}\n`);
      console.log('Available services:');
      console.log(`  GET  /info              - Agent information (free)`);
      console.log(`  POST /task/fetch        - Data fetch service ($0.01 USDC)`);
      console.log(`  POST /task/compute      - Computation service ($0.05 USDC)`);
      console.log(`  POST /task/generate     - Content generation ($0.10 USDC)`);
      console.log(`\n💰 Payment: USDC on Base Sepolia via x402 protocol`);
      console.log(`🔐 Recipient: ${process.env.AGENT_B_ADDRESS}\n`);
      console.log('Press Ctrl+C to stop\n');
    });

  } catch (error) {
    console.error('❌ Failed to start agent:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  startAgent();
}

export { app, startAgent };
