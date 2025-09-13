import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { db, checkDatabaseConnection } from '@/lib/database/connection';
import { stores, products, productVariants, customers, orders, orderLineItems, orderEvents } from '@/lib/database/schemas';

// Prevent static prerendering of this route
export const dynamic = 'force-dynamic';
import { encryptData } from '@/lib/encryption/crypto';

// Demo data templates
const DEMO_PRODUCTS = [
  {
    id: 'demo-001',
    handle: 'classic-white-cotton-shirt',
    title: 'Classic White Cotton Shirt',
    description: 'A timeless white cotton shirt perfect for any occasion. Made from 100% premium cotton with a comfortable fit.',
    vendor: 'Urban Elite',
    product_type: 'Shirts',
    tags: 'cotton,classic,formal,business',
    images: [
      { src: '/api/placeholder/600/800', alt: 'White Cotton Shirt Front' },
      { src: '/api/placeholder/600/800', alt: 'White Cotton Shirt Back' }
    ],
    options: [
      { name: 'Color', values: ['White', 'Light Blue', 'Navy'] },
      { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] }
    ],
    variants: [
      { id: 'var-001', title: 'White / S', option1: 'White', option2: 'S', price: '24.99', inventory_quantity: 15 },
      { id: 'var-002', title: 'White / M', option1: 'White', option2: 'M', price: '24.99', inventory_quantity: 25 },
      { id: 'var-003', title: 'White / L', option1: 'White', option2: 'L', price: '24.99', inventory_quantity: 30 },
      { id: 'var-004', title: 'Light Blue / M', option1: 'Light Blue', option2: 'M', price: '26.99', inventory_quantity: 20 },
      { id: 'var-005', title: 'Navy / L', option1: 'Navy', option2: 'L', price: '26.99', inventory_quantity: 18 },
    ]
  },
  {
    id: 'demo-002',
    handle: 'vintage-denim-jacket',
    title: 'Vintage Denim Jacket',
    description: 'A classic vintage-style denim jacket that never goes out of style. Perfect for layering.',
    vendor: 'Denim Co.',
    product_type: 'Jackets',
    tags: 'denim,vintage,casual,outerwear',
    images: [
      { src: '/api/placeholder/600/800', alt: 'Denim Jacket' }
    ],
    options: [
      { name: 'Color', values: ['Classic Blue', 'Black', 'Light Wash'] },
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] }
    ],
    variants: [
      { id: 'var-006', title: 'Classic Blue / M', option1: 'Classic Blue', option2: 'M', price: '79.99', inventory_quantity: 12 },
      { id: 'var-007', title: 'Classic Blue / L', option1: 'Classic Blue', option2: 'L', price: '79.99', inventory_quantity: 8 },
      { id: 'var-008', title: 'Black / M', option1: 'Black', option2: 'M', price: '84.99', inventory_quantity: 6 },
    ]
  },
  {
    id: 'demo-003',
    handle: 'elegant-floral-summer-dress',
    title: 'Elegant Floral Summer Dress',
    description: 'A beautiful floral dress perfect for summer occasions. Lightweight and comfortable.',
    vendor: 'Flora Fashion',
    product_type: 'Dresses',
    tags: 'floral,summer,elegant,lightweight',
    images: [
      { src: '/api/placeholder/600/800', alt: 'Floral Summer Dress' }
    ],
    options: [
      { name: 'Color', values: ['Pink Floral', 'White Floral', 'Yellow Floral'] },
      { name: 'Size', values: ['XS', 'S', 'M', 'L'] }
    ],
    variants: [
      { id: 'var-009', title: 'Pink Floral / S', option1: 'Pink Floral', option2: 'S', price: '45.99', inventory_quantity: 20 },
      { id: 'var-010', title: 'Pink Floral / M', option1: 'Pink Floral', option2: 'M', price: '45.99', inventory_quantity: 25 },
      { id: 'var-011', title: 'White Floral / S', option1: 'White Floral', option2: 'S', price: '45.99', inventory_quantity: 15 },
    ]
  },
  {
    id: 'demo-004',
    handle: 'premium-leather-sneakers',
    title: 'Premium Leather Sneakers',
    description: 'High-quality leather sneakers combining comfort and style. Perfect for everyday wear.',
    vendor: 'Step Style',
    product_type: 'Footwear',
    tags: 'leather,sneakers,premium,comfortable',
    images: [
      { src: '/api/placeholder/600/800', alt: 'Leather Sneakers' }
    ],
    options: [
      { name: 'Color', values: ['White', 'Black', 'Brown'] },
      { name: 'Size', values: ['7', '8', '9', '10', '11', '12'] }
    ],
    variants: [
      { id: 'var-012', title: 'White / 9', option1: 'White', option2: '9', price: '89.99', inventory_quantity: 10 },
      { id: 'var-013', title: 'White / 10', option1: 'White', option2: '10', price: '89.99', inventory_quantity: 12 },
      { id: 'var-014', title: 'Black / 9', option1: 'Black', option2: '9', price: '89.99', inventory_quantity: 8 },
      { id: 'var-015', title: 'Brown / 10', option1: 'Brown', option2: '10', price: '94.99', inventory_quantity: 5 },
    ]
  },
  {
    id: 'demo-005',
    handle: 'comfortable-jogger-pants',
    title: 'Comfortable Jogger Pants',
    description: 'Super comfortable jogger pants perfect for workouts or casual wear.',
    vendor: 'Comfort Zone',
    product_type: 'Pants',
    tags: 'joggers,comfortable,casual,workout',
    images: [
      { src: '/api/placeholder/600/800', alt: 'Jogger Pants' }
    ],
    options: [
      { name: 'Color', values: ['Gray', 'Navy', 'Black'] },
      { name: 'Size', values: ['S', 'M', 'L', 'XL'] }
    ],
    variants: [
      { id: 'var-016', title: 'Gray / M', option1: 'Gray', option2: 'M', price: '34.99', inventory_quantity: 30 },
      { id: 'var-017', title: 'Gray / L', option1: 'Gray', option2: 'L', price: '34.99', inventory_quantity: 25 },
      { id: 'var-018', title: 'Navy / M', option1: 'Navy', option2: 'M', price: '34.99', inventory_quantity: 20 },
      { id: 'var-019', title: 'Black / L', option1: 'Black', option2: 'L', price: '39.99', inventory_quantity: 15 },
    ]
  },
  {
    id: 'demo-006',
    handle: 'silk-evening-blouse',
    title: 'Silk Evening Blouse',
    description: 'Luxurious silk blouse perfect for evening occasions. Elegant and sophisticated.',
    vendor: 'Elegance',
    product_type: 'Tops',
    tags: 'silk,evening,luxury,elegant',
    images: [
      { src: '/api/placeholder/600/800', alt: 'Silk Evening Blouse' }
    ],
    options: [
      { name: 'Color', values: ['Black', 'Navy', 'Burgundy'] },
      { name: 'Size', values: ['XS', 'S', 'M', 'L'] }
    ],
    variants: [
      { id: 'var-020', title: 'Black / S', option1: 'Black', option2: 'S', price: '68.99', inventory_quantity: 8 },
      { id: 'var-021', title: 'Black / M', option1: 'Black', option2: 'M', price: '68.99', inventory_quantity: 12 },
      { id: 'var-022', title: 'Navy / S', option1: 'Navy', option2: 'S', price: '68.99', inventory_quantity: 6 },
      { id: 'var-023', title: 'Burgundy / M', option1: 'Burgundy', option2: 'M', price: '72.99', inventory_quantity: 4 },
    ]
  }
];

const DEMO_CUSTOMERS = [
  {
    id: 'cust-001',
    email: 'sarah.johnson@email.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    phone: '+1-555-0123',
    accepts_marketing: true,
    created_at: '2024-01-15T10:30:00Z',
    orders_count: 5,
    total_spent: 285.43
  },
  {
    id: 'cust-002',
    email: 'michael.chen@email.com',
    first_name: 'Michael',
    last_name: 'Chen',
    phone: '+1-555-0124',
    accepts_marketing: false,
    created_at: '2024-02-03T14:22:00Z',
    orders_count: 3,
    total_spent: 189.97
  },
  {
    id: 'cust-003',
    email: 'emma.williams@email.com',
    first_name: 'Emma',
    last_name: 'Williams',
    phone: '+1-555-0125',
    accepts_marketing: true,
    created_at: '2024-02-20T09:15:00Z',
    orders_count: 8,
    total_spent: 542.18
  },
  {
    id: 'cust-004',
    email: 'david.rodriguez@email.com',
    first_name: 'David',
    last_name: 'Rodriguez',
    phone: '+1-555-0126',
    accepts_marketing: true,
    created_at: '2024-03-10T16:45:00Z',
    orders_count: 2,
    total_spent: 124.98
  },
  {
    id: 'cust-005',
    email: 'lisa.thompson@email.com',
    first_name: 'Lisa',
    last_name: 'Thompson',
    phone: '+1-555-0127',
    accepts_marketing: false,
    created_at: '2024-03-25T11:30:00Z',
    orders_count: 1,
    total_spent: 45.99
  },
  {
    id: 'cust-006',
    email: 'james.anderson@email.com',
    first_name: 'James',
    last_name: 'Anderson',
    phone: '+1-555-0128',
    accepts_marketing: true,
    created_at: '2024-04-05T13:20:00Z',
    orders_count: 6,
    total_spent: 378.45
  },
];

import { DemoCustomer, DemoProduct, DemoOrder } from '@/types/demo';

// Generate realistic order data
const generateOrders = (storeId: string, customers: DemoCustomer[], products: DemoProduct[]): DemoOrder[] => {
  const orders: DemoOrder[] = [];
  let orderIdCounter = 1001;

  customers.forEach(customer => {
    const orderCount = customer.orders_count;
    const avgOrderValue = customer.total_spent / orderCount;

    for (let i = 0; i < orderCount; i++) {
      const orderDate = new Date(customer.created_at);
      orderDate.setDate(orderDate.getDate() + (i * 15) + Math.floor(Math.random() * 10));

      const lineItems = [];
      const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      let orderTotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 quantity
        const price = parseFloat(variant.price);
        const lineTotal = price * quantity;
        orderTotal += lineTotal;

        lineItems.push({
          id: `line-${orderIdCounter}-${j}`,
          product_id: product.id,
          variant_id: variant.id,
          title: product.title,
          variant_title: variant.title,
          sku: `SKU-${variant.id}`,
          vendor: product.vendor,
          product_type: product.product_type,
          quantity,
          price: price.toFixed(2),
          total_discount: '0.00',
          requires_shipping: true,
          taxable: true,
          grams: 500,
        });
      }

      const tax = orderTotal * 0.08; // 8% tax
      const shipping = orderTotal > 50 ? 0 : 9.99;
      const finalTotal = orderTotal + tax + shipping;

      orders.push({
        id: `order-${orderIdCounter}`,
        name: `#${orderIdCounter}`,
        order_number: orderIdCounter,
        customer: {
          id: customer.id,
          email: customer.email,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          accepts_marketing: customer.accepts_marketing,
          created_at: customer.created_at,
          updated_at: customer.created_at,
        },
        total_price: finalTotal.toFixed(2),
        subtotal_price: orderTotal.toFixed(2),
        total_tax: tax.toFixed(2),
        total_discounts: '0.00',
        currency: 'USD',
        financial_status: 'paid',
        fulfillment_status: i === orderCount - 1 ? 'unfulfilled' : 'fulfilled',
        billing_address: {
          first_name: customer.first_name,
          last_name: customer.last_name,
          address1: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          province: 'NY',
          country: 'United States',
          zip: `${Math.floor(Math.random() * 90000) + 10000}`,
        },
        shipping_address: {
          first_name: customer.first_name,
          last_name: customer.last_name,
          address1: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          province: 'NY',
          country: 'United States',
          zip: `${Math.floor(Math.random() * 90000) + 10000}`,
        },
        line_items: lineItems,
        source_identifier: 'web',
        tags: Math.random() > 0.8 ? 'vip,priority' : '',
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString(),
        processed_at: orderDate.toISOString(),
        store_id: storeId,
      });

      orderIdCounter++;
    }
  });

  return orders;
};

export async function POST(request: NextRequest) {
  try {
    // Prevent caching
    noStore();

    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Verify database connection before proceeding
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    const results = {
      products: 0,
      variants: 0,
      customers: 0,
      orders: 0,
      lineItems: 0,
    };

    // Generate demo encryption key for this demo
    const storeKey = process.env.DEMO_ENCRYPTION_KEY || 'demo-key-for-development';

    // Insert products
    for (const productData of DEMO_PRODUCTS) {
      // Create product
      const product = await db.insert(products).values({
        storeId,
        shopifyProductId: productData.id,
        handle: productData.handle,
        title: productData.title,
        description: productData.description,
        vendor: productData.vendor,
        productType: productData.product_type,
        status: 'active',
        isPublished: true,
        publishedAt: new Date(),
        tags: productData.tags.split(','),
        images: productData.images,
        featuredImage: productData.images[0]?.src,
        options: productData.options,
        totalSold: Math.floor(Math.random() * 50) + 10,
        totalRevenue: (Math.random() * 5000 + 1000).toFixed(2),
        averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 rating
        reviewsCount: Math.floor(Math.random() * 100) + 20,
        popularityScore: (Math.random() * 5).toFixed(2),
        trendingStatus: Math.random() > 0.7 ? 'trending' : 'stable',
        shopifyCreatedAt: new Date('2024-01-01'),
        shopifyUpdatedAt: new Date(),
      }).returning();

      results.products++;

      // Create variants
      for (const variantData of productData.variants) {
        await db.insert(productVariants).values({
          productId: product[0].id,
          storeId,
          shopifyVariantId: variantData.id,
          sku: `SKU-${variantData.id}`,
          title: variantData.title,
          option1: variantData.option1,
          option2: variantData.option2,
          price: variantData.price,
          inventoryQuantity: variantData.inventory_quantity,
          inventoryPolicy: 'deny',
          inventoryManagement: 'shopify',
          weight: '500',
          weightUnit: 'g',
          requiresShipping: true,
          taxable: true,
          position: 1,
          totalSold: Math.floor(Math.random() * 20) + 5,
          revenue: (Math.random() * 1000 + 200).toFixed(2),
          shopifyCreatedAt: new Date('2024-01-01'),
          shopifyUpdatedAt: new Date(),
        });

        results.variants++;
      }
    }

    // Insert customers
    const customerIds = [];
    for (const customerData of DEMO_CUSTOMERS) {
      // Determine customer segment based on spending
      let segmentTag = 'new';
      let churnRiskScore = 0.1;
      
      if (customerData.total_spent > 300) {
        segmentTag = 'high-value';
        churnRiskScore = 0.05;
      } else if (customerData.orders_count === 1) {
        segmentTag = 'new';
        churnRiskScore = 0.3;
      } else if (customerData.total_spent < 100) {
        segmentTag = 'at-risk';
        churnRiskScore = 0.7;
      } else {
        segmentTag = 'regular';
        churnRiskScore = 0.2;
      }

      const customer = await db.insert(customers).values({
        storeId,
        shopifyCustomerId: customerData.id,
        email: encryptData(customerData.email, storeKey),
        firstName: encryptData(customerData.first_name, storeKey),
        lastName: encryptData(customerData.last_name, storeKey),
        phone: encryptData(customerData.phone, storeKey),
        acceptsMarketing: customerData.accepts_marketing,
        emailVerified: true,
        totalOrders: customerData.orders_count,
        totalSpent: customerData.total_spent.toFixed(2),
        averageOrderValue: (customerData.total_spent / customerData.orders_count).toFixed(2),
        firstOrderAt: new Date(customerData.created_at),
        lastOrderAt: new Date(),
        customerLifetimeValue: customerData.total_spent.toFixed(2),
        churnRiskScore: churnRiskScore.toFixed(2),
        segmentTag,
        dataProcessingConsent: true,
        consentGivenAt: new Date(customerData.created_at),
        shopifyCreatedAt: new Date(customerData.created_at),
        shopifyUpdatedAt: new Date(),
      }).returning();

      customerIds.push({ ...customerData, dbId: customer[0].id });
      results.customers++;
    }

    // Generate and insert orders
    const orderData = generateOrders(storeId, DEMO_CUSTOMERS, DEMO_PRODUCTS);
    
    for (const orderInfo of orderData) {
      // Find the customer DB ID
      const customerRecord = customerIds.find(c => c.id === orderInfo.customer.id);
      
      const order = await db.insert(orders).values({
        storeId,
        customerId: customerRecord?.dbId,
        shopifyOrderId: orderInfo.id,
        orderNumber: orderInfo.order_number.toString(),
        name: orderInfo.name,
        totalPrice: orderInfo.total_price,
        subtotalPrice: orderInfo.subtotal_price,
        totalTax: orderInfo.total_tax,
        totalDiscounts: orderInfo.total_discounts,
        currency: orderInfo.currency,
        financialStatus: orderInfo.financial_status,
        fulfillmentStatus: orderInfo.fulfillment_status,
        orderStatus: 'open',
        customerEmail: encryptData(orderInfo.customer.email, storeKey),
        billingAddress: encryptData(JSON.stringify(orderInfo.billing_address), storeKey),
        shippingAddress: encryptData(JSON.stringify(orderInfo.shipping_address), storeKey),
        tags: orderInfo.tags ? orderInfo.tags.split(',') : [],
        sourceIdentifier: orderInfo.source_identifier,
        processedAt: new Date(orderInfo.processed_at),
        lineItemsCount: orderInfo.line_items.length,
        uniqueProductsCount: new Set(orderInfo.line_items.map(item => item.product_id)).size,
        riskScore: (Math.random() * 0.2).toFixed(2),
        customerSegment: 'regular',
        orderPattern: 'regular',
        shopifyCreatedAt: new Date(orderInfo.created_at),
        shopifyUpdatedAt: new Date(orderInfo.updated_at),
      }).returning();

      results.orders++;

      // Insert line items
      for (const lineItem of orderInfo.line_items) {
        await db.insert(orderLineItems).values({
          orderId: order[0].id,
          storeId,
          shopifyLineItemId: lineItem.id,
          productId: lineItem.product_id,
          variantId: lineItem.variant_id,
          productTitle: lineItem.title,
          variantTitle: lineItem.variant_title,
          sku: lineItem.sku,
          vendor: lineItem.vendor,
          productType: lineItem.product_type,
          quantity: lineItem.quantity,
          price: lineItem.price,
          totalDiscount: lineItem.total_discount,
          requiresShipping: lineItem.requires_shipping,
          taxable: lineItem.taxable,
          grams: lineItem.grams,
        });

        results.lineItems++;
      }

      // Create order event
      await db.insert(orderEvents).values({
        orderId: order[0].id,
        storeId,
        eventType: 'created',
        eventData: { source: 'demo_generator' },
        message: `Demo order ${orderInfo.name} created`,
        occurredAt: new Date(orderInfo.created_at),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data generated successfully',
      results,
      storeId,
    });

  } catch (error: unknown) {
    console.error('Error generating demo data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Handle different types of errors with appropriate status codes
    if (errorMessage.includes('connect ECONNREFUSED') || errorMessage.includes('database connection')) {
      return NextResponse.json(
        { error: 'Database connection failed', details: 'Could not connect to the database. Please check your database configuration.' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('permission denied') || errorMessage.includes('access denied')) {
      return NextResponse.json(
        { error: 'Database access denied', details: 'Invalid database credentials or insufficient permissions.' },
        { status: 403 }
      );
    }

    if (errorMessage.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Data conflict', details: 'Some of the demo data already exists in the database.' },
        { status: 409 }
      );
    }

    // Default error response
    return NextResponse.json(
      { error: 'Failed to generate demo data', details: errorMessage },
      { status: 500 }
    );
  }
}
