'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HeartIcon, ShoppingBagIcon, StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// Sample product data - in a real app this would come from your database
const SAMPLE_PRODUCTS = [
  {
    id: '1',
    title: 'Classic White Cotton Shirt',
    price: 2499,
    originalPrice: 3999,
    image: '/api/placeholder/300/400',
    rating: 4.3,
    reviews: 128,
    category: 'Shirts',
    brand: 'Urban Elite',
    colors: ['white', 'blue', 'black'],
    isNew: false,
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Vintage Denim Jacket',
    price: 3999,
    originalPrice: null,
    image: '/api/placeholder/300/400',
    rating: 4.7,
    reviews: 89,
    category: 'Jackets',
    brand: 'Denim Co.',
    colors: ['blue', 'black'],
    isNew: true,
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Elegant Floral Summer Dress',
    price: 2799,
    originalPrice: 4199,
    image: '/api/placeholder/300/400',
    rating: 4.5,
    reviews: 203,
    category: 'Dresses',
    brand: 'Flora Fashion',
    colors: ['pink', 'white', 'yellow'],
    isNew: false,
    isFavorite: true,
  },
  {
    id: '4',
    title: 'Premium Leather Sneakers',
    price: 4999,
    originalPrice: 6999,
    image: '/api/placeholder/300/400',
    rating: 4.6,
    reviews: 156,
    category: 'Footwear',
    brand: 'Step Style',
    colors: ['white', 'black', 'brown'],
    isNew: false,
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Comfortable Jogger Pants',
    price: 1899,
    originalPrice: null,
    image: '/api/placeholder/300/400',
    rating: 4.2,
    reviews: 67,
    category: 'Pants',
    brand: 'Comfort Zone',
    colors: ['gray', 'navy', 'black'],
    isNew: true,
    isFavorite: false,
  },
  {
    id: '6',
    title: 'Silk Evening Blouse',
    price: 3299,
    originalPrice: 4899,
    image: '/api/placeholder/300/400',
    rating: 4.8,
    reviews: 91,
    category: 'Tops',
    brand: 'Elegance',
    colors: ['black', 'navy', 'burgundy'],
    isNew: false,
    isFavorite: false,
  },
];

const CATEGORIES = [
  'All',
  'Shirts',
  'Dresses', 
  'Jackets',
  'Footwear',
  'Pants',
  'Tops'
];

// Placeholder image component for demo
const PlaceholderImage = ({ width, height, className }: { width: number; height: number; className?: string }) => (
  <div 
    className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
    style={{ width, height }}
  >
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-xs text-gray-500">Product Image</p>
    </div>
  </div>
);

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  colors: string[];
  isNew: boolean;
  isFavorite: boolean;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.isNew ? 1 : -1;
      default:
        return 0;
    }
  });

  const toggleFavorite = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isFavorite: !product.isFavorite }
        : product
    ));
  };

  const simulateOrder = async (product: Product) => {
    // Simulate creating an order - in real app would call API
    console.log('Simulating order for:', product.title);
    
    // For demo purposes, we'll just show an alert
    alert(`Added "${product.title}" to cart! This would normally create an order in the system.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">StyleHub</h1>
              <span className="ml-2 text-sm text-gray-500">Demo Store</span>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <HeartIcon className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <ShoppingBagIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <div className="mb-12 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl text-white p-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Summer Collection 2024</h2>
          <p className="text-xl mb-6 opacity-90">Discover the latest trends with up to 50% off</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
              {/* Product Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <PlaceholderImage 
                  width={300} 
                  height={400} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      NEW
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  {product.isFavorite ? (
                    <HeartIconSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>

                {/* Quick Add Button */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => simulateOrder(product)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Quick Add
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                  <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Colors */}
                <div className="mt-3 flex space-x-1">
                  {product.colors.slice(0, 3).map(color => (
                    <div
                      key={color}
                      className={`w-4 h-4 rounded-full border border-gray-300 ${
                        color === 'white' ? 'bg-white' :
                        color === 'black' ? 'bg-black' :
                        color === 'blue' ? 'bg-blue-500' :
                        color === 'gray' ? 'bg-gray-500' :
                        color === 'navy' ? 'bg-blue-900' :
                        color === 'pink' ? 'bg-pink-400' :
                        color === 'yellow' ? 'bg-yellow-400' :
                        color === 'brown' ? 'bg-amber-700' :
                        color === 'burgundy' ? 'bg-red-800' :
                        'bg-gray-400'
                      }`}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <span className="text-xs text-gray-500 ml-1">
                      +{product.colors.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Notice */}
        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🏪 Demo E-commerce Store
            </h3>
            <p className="text-blue-700 mb-4">
              This is a simulated storefront designed to generate sample data for the Shoplytics dashboard. 
              In a real implementation, this would be your actual Shopify store.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.open('/auth/signin', '_blank')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                View Analytics Dashboard
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/demo/generate-data', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ storeId: 'demo-store-001' }),
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      alert(`✅ Demo data generated successfully!\n\n` +
                            `📦 Products: ${result.results.products}\n` +
                            `👥 Customers: ${result.results.customers}\n` +
                            `🛒 Orders: ${result.results.orders}\n` +
                            `📋 Line Items: ${result.results.lineItems}\n\n` +
                            `Now you can view the analytics dashboard!`);
                    } else {
                      alert('❌ Error generating demo data: ' + result.error);
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    alert('❌ Network error generating demo data');
                  }
                }}
                className="bg-white text-blue-600 border border-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Generate Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
