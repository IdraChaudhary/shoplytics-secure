import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-provider';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-8 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">🛡️</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Shoplytics Secure</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">Enterprise Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/auth/signin"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-4xl pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Enterprise-ready with 99.9% uptime</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-gradient">
                Privacy-First
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">
                Shopify Analytics
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl leading-8 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-balance">
              Enterprise-grade insights platform with <strong className="text-slate-900 dark:text-white">end-to-end encryption</strong>, 
              AI-powered analytics, and complete multi-tenant data isolation. 
              Built for retailers who never compromise on security.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-300 hover:scale-105"
              >
                <span>Start Free Trial</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                href="#features" 
                className="group inline-flex items-center gap-2 text-base font-semibold leading-6 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span>Learn more</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-12">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">256-bit</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">AES Encryption</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">99.9%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">GDPR</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Compliant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">24/7</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Built from the ground up with security, privacy, and compliance at its core. 
              Every feature is designed to protect your most sensitive customer data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon="🔐"
              title="End-to-End Encryption"
              description="AES-256-GCM encryption for all sensitive data with automatic key rotation and zero-knowledge architecture"
              highlight="256-bit"
            />
            <FeatureCard
              icon="🏢"
              title="Multi-Tenant Architecture"
              description="Complete data isolation between stores with role-based access control and tenant-specific encryption keys"
              highlight="Isolated"
            />
            <FeatureCard
              icon="🤖"
              title="AI-Powered Insights"
              description="Customer churn prediction, anomaly detection, and personalized recommendations with privacy-preserving ML"
              highlight="Smart AI"
            />
            <FeatureCard
              icon="📊"
              title="Real-Time Analytics"
              description="Beautiful dashboards with live data streams, customizable reports, and encrypted data visualization"
              highlight="Live Data"
            />
            <FeatureCard
              icon="🔔"
              title="Smart Alerts"
              description="Automated notifications for unusual patterns, security events, and compliance violations"
              highlight="24/7 Watch"
            />
            <FeatureCard
              icon="✅"
              title="GDPR Compliant"
              description="Built-in privacy controls, comprehensive audit trails, and automated compliance reporting"
              highlight="Compliant"
            />
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="relative px-6 lg:px-8 py-24 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="card hover-lift">
            <div className="card-body">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                Enterprise-Grade Architecture
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    Built for Scale & Security
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">Next.js 14 with TypeScript</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Type-safe development with the latest React features</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">PostgreSQL with Drizzle ORM</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Reliable, encrypted data management at scale</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">Zero-trust security model</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">JWT authentication with comprehensive audit trails</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">Cloud-native deployment</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Docker containers with auto-scaling capabilities</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
                  <div className="card-body">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      Secure Data Flow
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">Webhook Reception</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Secure Shopify data ingestion</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">Data Encryption</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">AES-256 encryption before storage</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">AI Analysis</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Privacy-preserving insights generation</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">4</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">Dashboard Display</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Secure, role-based data access</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-12 shadow-2xl">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-xl" />
            
            <div className="relative text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Secure Your Shopify Data?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join enterprise retailers who trust Shoplytics Secure with their most sensitive customer data. 
                Start your free trial today.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <span>Start Free Trial</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  highlight 
}: { 
  icon: string; 
  title: string; 
  description: string;
  highlight?: string;
}) {
  return (
    <div className="group relative">
      <div className="card hover-lift h-full">
        <div className="card-body space-y-4">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              {icon}
            </div>
            {highlight && (
              <span className="badge badge-primary text-xs">
                {highlight}
              </span>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
          
          <div className="pt-2">
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 -z-10" />
    </div>
  );
}
