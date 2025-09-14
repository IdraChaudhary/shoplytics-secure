import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import winston from 'winston';
import { ShopifyTransformer } from './transformers';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/shopify-webhooks.log' })
  ]
});

export interface WebhookEvent {
  id: string;
  topic: string;
  tenantId: string;
  shopDomain: string;
  data: any;
  timestamp: Date;
  processed: boolean;
  error?: string;
}

export interface WebhookProcessor {
  topic: string;
  handler: (data: any, tenantId: string, prisma: PrismaClient) => Promise<void>;
}

export class ShopifyWebhookService {
  private prisma: PrismaClient;
  private processors: Map<string, WebhookProcessor['handler']> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.setupProcessors();
  }

  // Verify webhook signature
  private verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const calculatedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(calculatedSignature, 'base64')
      );
    } catch (error) {
      logger.error('Error verifying webhook signature', { error: error.message });
      return false;
    }
  }

  // Main webhook handler
  async handleWebhook(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Extract headers
      const topic = req.headers['x-shopify-topic'] as string;
      const shopDomain = req.headers['x-shopify-shop-domain'] as string;
      const signature = req.headers['x-shopify-hmac-sha256'] as string;
      
      if (!topic || !shopDomain || !signature) {
        logger.warn('Missing required webhook headers');
        res.status(400).json({ error: 'Missing required headers' });
        return;
      }

      // Get tenant by shop domain
      const tenant = await this.prisma.tenant.findFirst({
        where: { shopDomain }
      });

      if (!tenant) {
        logger.warn(`No tenant found for shop domain: ${shopDomain}`);
        res.status(404).json({ error: 'Tenant not found' });
        return;
      }

      // Verify webhook signature
      const payload = JSON.stringify(req.body);
      const isValid = this.verifyWebhookSignature(payload, signature, tenant.webhookSecret);

      if (!isValid) {
        logger.warn(`Invalid webhook signature for tenant: ${tenant.id}`, {
          topic,
          shopDomain
        });
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      // Create webhook event record
      const webhookEvent: WebhookEvent = {
        id: crypto.randomUUID(),
        topic,
        tenantId: tenant.id,
        shopDomain,
        data: req.body,
        timestamp: new Date(),
        processed: false
      };

      logger.info('Received webhook', {
        topic,
        shopDomain,
        tenantId: tenant.id,
        dataKeys: Object.keys(req.body || {})
      });

      // Process webhook asynchronously
      this.processWebhookAsync(webhookEvent);

      // Respond immediately to Shopify
      res.status(200).json({ 
        received: true, 
        topic,
        timestamp: webhookEvent.timestamp 
      });

      logger.info('Webhook acknowledged', {
        topic,
        tenantId: tenant.id,
        processingTime: Date.now() - startTime
      });

    } catch (error) {
      logger.error('Error handling webhook', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Process webhook asynchronously
  private async processWebhookAsync(webhookEvent: WebhookEvent): Promise<void> {
    try {
      logger.info('Processing webhook', {
        topic: webhookEvent.topic,
        tenantId: webhookEvent.tenantId
      });

      const processor = this.processors.get(webhookEvent.topic);
      
      if (processor) {
        await processor(webhookEvent.data, webhookEvent.tenantId, this.prisma);
        webhookEvent.processed = true;
        
        logger.info('Webhook processed successfully', {
          topic: webhookEvent.topic,
          tenantId: webhookEvent.tenantId
        });
      } else {
        logger.warn('No processor found for webhook topic', {
          topic: webhookEvent.topic
        });
      }

      // Store webhook event for audit
      await this.storeWebhookEvent(webhookEvent);

    } catch (error) {
      logger.error('Error processing webhook', {
        topic: webhookEvent.topic,
        tenantId: webhookEvent.tenantId,
        error: error.message
      });

      webhookEvent.error = error.message;
      await this.storeWebhookEvent(webhookEvent);
    }
  }

  // Store webhook event for audit and retry
  private async storeWebhookEvent(webhookEvent: WebhookEvent): Promise<void> {
    try {
      // Store in a webhook events table for audit trail
      // This would require adding a WebhookEvent model to your Prisma schema
      logger.info('Webhook event stored', {
        id: webhookEvent.id,
        topic: webhookEvent.topic,
        processed: webhookEvent.processed
      });
    } catch (error) {
      logger.error('Error storing webhook event', { error: error.message });
    }
  }

  // Setup webhook processors
  private setupProcessors(): void {
    // Customer webhooks
    this.processors.set('customers/create', this.processCustomerCreate.bind(this));
    this.processors.set('customers/update', this.processCustomerUpdate.bind(this));
    this.processors.set('customers/delete', this.processCustomerDelete.bind(this));

    // Product webhooks
    this.processors.set('products/create', this.processProductCreate.bind(this));
    this.processors.set('products/update', this.processProductUpdate.bind(this));
    this.processors.set('products/delete', this.processProductDelete.bind(this));

    // Order webhooks
    this.processors.set('orders/create', this.processOrderCreate.bind(this));
    this.processors.set('orders/updated', this.processOrderUpdate.bind(this));
    this.processors.set('orders/paid', this.processOrderPaid.bind(this));
    this.processors.set('orders/cancelled', this.processOrderCancelled.bind(this));
    this.processors.set('orders/fulfilled', this.processOrderFulfilled.bind(this));
    this.processors.set('orders/delete', this.processOrderDelete.bind(this));

    logger.info(`Registered ${this.processors.size} webhook processors`);
  }

  // Customer webhook processors
  private async processCustomerCreate(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      const transformedCustomer = ShopifyTransformer.transformCustomer(data, tenantId);
      
      await prisma.customer.upsert({
        where: {
          shopifyId_tenantId: {
            shopifyId: data.id.toString(),
            tenantId
          }
        },
        update: transformedCustomer,
        create: transformedCustomer
      });

      logger.info('Customer created via webhook', {
        customerId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing customer create webhook', {
        customerId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processCustomerUpdate(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      const transformedCustomer = ShopifyTransformer.transformCustomer(data, tenantId);
      
      await prisma.customer.upsert({
        where: {
          shopifyId_tenantId: {
            shopifyId: data.id.toString(),
            tenantId
          }
        },
        update: transformedCustomer,
        create: transformedCustomer
      });

      logger.info('Customer updated via webhook', {
        customerId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing customer update webhook', {
        customerId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processCustomerDelete(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      await prisma.customer.deleteMany({
        where: {
          shopifyId: data.id.toString(),
          tenantId
        }
      });

      logger.info('Customer deleted via webhook', {
        customerId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing customer delete webhook', {
        customerId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  // Product webhook processors
  private async processProductCreate(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      const transformedProduct = ShopifyTransformer.transformProduct(data, tenantId);
      
      await prisma.product.upsert({
        where: {
          shopifyId_tenantId: {
            shopifyId: data.id.toString(),
            tenantId
          }
        },
        update: transformedProduct,
        create: transformedProduct
      });

      logger.info('Product created via webhook', {
        productId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing product create webhook', {
        productId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processProductUpdate(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      const transformedProduct = ShopifyTransformer.transformProduct(data, tenantId);
      
      await prisma.product.upsert({
        where: {
          shopifyId_tenantId: {
            shopifyId: data.id.toString(),
            tenantId
          }
        },
        update: transformedProduct,
        create: transformedProduct
      });

      logger.info('Product updated via webhook', {
        productId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing product update webhook', {
        productId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processProductDelete(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      await prisma.product.deleteMany({
        where: {
          shopifyId: data.id.toString(),
          tenantId
        }
      });

      logger.info('Product deleted via webhook', {
        productId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing product delete webhook', {
        productId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  // Order webhook processors
  private async processOrderCreate(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      const { orders, lineItems, events } = ShopifyTransformer.transformOrdersBatch([data], tenantId);
      const transformedOrder = orders[0];

      await prisma.$transaction(async (tx) => {
        // Create order
        const savedOrder = await tx.order.upsert({
          where: {
            shopifyId_tenantId: {
              shopifyId: data.id.toString(),
              tenantId
            }
          },
          update: transformedOrder,
          create: transformedOrder
        });

        // Create line items
        if (lineItems.length > 0) {
          await tx.orderLineItem.createMany({
            data: lineItems.map(item => ({
              ...item,
              orderId: savedOrder.shopifyId
            }))
          });
        }

        // Create events
        if (events.length > 0) {
          await tx.orderEvent.createMany({
            data: events.map(event => ({
              ...event,
              orderId: savedOrder.shopifyId
            }))
          });
        }
      });

      logger.info('Order created via webhook', {
        orderId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing order create webhook', {
        orderId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processOrderUpdate(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      const { orders, lineItems, events } = ShopifyTransformer.transformOrdersBatch([data], tenantId);
      const transformedOrder = orders[0];

      await prisma.$transaction(async (tx) => {
        // Update order
        const savedOrder = await tx.order.upsert({
          where: {
            shopifyId_tenantId: {
              shopifyId: data.id.toString(),
              tenantId
            }
          },
          update: transformedOrder,
          create: transformedOrder
        });

        // Delete existing line items
        await tx.orderLineItem.deleteMany({
          where: {
            orderId: savedOrder.shopifyId,
            tenantId
          }
        });

        // Create updated line items
        if (lineItems.length > 0) {
          await tx.orderLineItem.createMany({
            data: lineItems.map(item => ({
              ...item,
              orderId: savedOrder.shopifyId
            }))
          });
        }

        // Add update event
        await tx.orderEvent.create({
          data: {
            orderId: savedOrder.shopifyId,
            tenantId,
            eventType: 'UPDATED',
            description: 'Order updated via webhook',
            metadata: {
              source: 'webhook',
              financial_status: data.financial_status,
              fulfillment_status: data.fulfillment_status
            }
          }
        });
      });

      logger.info('Order updated via webhook', {
        orderId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing order update webhook', {
        orderId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processOrderPaid(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      // Update order status
      await prisma.order.updateMany({
        where: {
          shopifyId: data.id.toString(),
          tenantId
        },
        data: {
          financialStatus: 'paid'
        }
      });

      // Add payment event
      await prisma.orderEvent.create({
        data: {
          orderId: data.id.toString(),
          tenantId,
          eventType: 'UPDATED',
          description: 'Order payment received',
          metadata: {
            source: 'webhook',
            event_type: 'payment'
          }
        }
      });

      logger.info('Order paid via webhook', {
        orderId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing order paid webhook', {
        orderId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processOrderCancelled(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      // Update order status
      await prisma.order.updateMany({
        where: {
          shopifyId: data.id.toString(),
          tenantId
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      });

      // Add cancellation event
      await prisma.orderEvent.create({
        data: {
          orderId: data.id.toString(),
          tenantId,
          eventType: 'CANCELLED',
          description: `Order cancelled: ${data.cancel_reason || 'No reason provided'}`,
          metadata: {
            source: 'webhook',
            cancel_reason: data.cancel_reason
          }
        }
      });

      logger.info('Order cancelled via webhook', {
        orderId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing order cancelled webhook', {
        orderId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processOrderFulfilled(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      // Update order status
      await prisma.order.updateMany({
        where: {
          shopifyId: data.id.toString(),
          tenantId
        },
        data: {
          status: 'FULFILLED',
          fulfillmentStatus: 'fulfilled'
        }
      });

      // Add fulfillment event
      await prisma.orderEvent.create({
        data: {
          orderId: data.id.toString(),
          tenantId,
          eventType: 'FULFILLED',
          description: 'Order fulfilled',
          metadata: {
            source: 'webhook',
            fulfillment_status: data.fulfillment_status
          }
        }
      });

      logger.info('Order fulfilled via webhook', {
        orderId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing order fulfilled webhook', {
        orderId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  private async processOrderDelete(data: any, tenantId: string, prisma: PrismaClient): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Delete line items
        await tx.orderLineItem.deleteMany({
          where: {
            orderId: data.id.toString(),
            tenantId
          }
        });

        // Delete events
        await tx.orderEvent.deleteMany({
          where: {
            orderId: data.id.toString(),
            tenantId
          }
        });

        // Delete order
        await tx.order.deleteMany({
          where: {
            shopifyId: data.id.toString(),
            tenantId
          }
        });
      });

      logger.info('Order deleted via webhook', {
        orderId: data.id,
        tenantId
      });
    } catch (error) {
      logger.error('Error processing order delete webhook', {
        orderId: data.id,
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  // Get webhook statistics
  async getWebhookStats(tenantId?: string): Promise<{
    totalReceived: number;
    totalProcessed: number;
    totalErrors: number;
    byTopic: Record<string, number>;
    recentEvents: any[];
  }> {
    // This would require a WebhookEvent table in your schema
    // For now, return placeholder data
    return {
      totalReceived: 0,
      totalProcessed: 0,
      totalErrors: 0,
      byTopic: {},
      recentEvents: []
    };
  }
}

// Middleware for webhook endpoint
export function createWebhookMiddleware(prisma: PrismaClient) {
  const webhookService = new ShopifyWebhookService(prisma);

  return async (req: Request, res: Response) => {
    await webhookService.handleWebhook(req, res);
  };
}

// Export service instance
export function createWebhookService(prisma: PrismaClient): ShopifyWebhookService {
  return new ShopifyWebhookService(prisma);
}
