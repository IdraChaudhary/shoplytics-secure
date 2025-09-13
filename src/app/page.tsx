import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🛡️ Shoplytics Secure
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Privacy-first, AI-assisted multi-tenant Shopify insights platform 
            designed for enterprise retailers who take data security seriously.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon="🔐"
            title="End-to-End Encryption"
            description="AES-256 encryption for all sensitive data with automatic key rotation"
          />
          <FeatureCard
            icon="🏢"
            title="Multi-Tenant Architecture"
            description="Complete data isolation between stores with role-based access control"
          />
          <FeatureCard
            icon="🤖"
            title="AI-Powered Insights"
            description="Customer churn prediction, anomaly detection, and personalized recommendations"
          />
          <FeatureCard
            icon="📊"
            title="Real-Time Analytics"
            description="Beautiful dashboards with live data and customizable reports"
          />
          <FeatureCard
            icon="🔔"
            title="Smart Alerts"
            description="Automated notifications for unusual patterns and security events"
          />
          <FeatureCard
            icon="✅"
            title="GDPR Compliant"
            description="Built-in privacy controls and audit trails for regulatory compliance"
          />
        </div>

        {/* Architecture Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Enterprise-Grade Architecture
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Built for Scale & Security
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Next.js 14 with TypeScript for type-safe development</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>PostgreSQL with Drizzle ORM for reliable data management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>JWT authentication with role-based permissions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Docker containerization for easy deployment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Comprehensive audit logging and monitoring</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Data Flow</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Shopify Webhook → Secure Processing
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  Data Encryption → Database Storage
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  AI Analysis → Insights Generation
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  Dashboard Display → User Access
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Secure Your Shopify Data?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join enterprise retailers who trust Shoplytics Secure with their most sensitive data.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
