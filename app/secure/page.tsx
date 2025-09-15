'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SecureLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validCredentials: Record<string, string> = {
    'admin@shoplytics.com': 'secure123',
    'demo@shoplytics.com': 'demo123',
    'test@xeno.com': 'test123',
    // Keep parity with existing demo
    'demo@shoplytics.com': 'demo123456',
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const valid = validCredentials[email] && validCredentials[email] === password
      if (valid) {
        router.push('/secure/dashboard')
      } else {
        setError('Invalid credentials. Try demo@shoplytics.com / demo123, admin@shoplytics.com / secure123, or test@xeno.com / test123')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="secure-body">
      <div className="login-container">
        <div className="login-card">
          <div className="logo">
            <div className="logo-icon">
              <i className="fas fa-chart-line" />
            </div>
            <h1>Shoplytics</h1>
            <p>Secure Multi-tenant Analytics</p>
          </div>

          <form onSubmit={onSubmit}>
            {error && (
              <div style={{marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca'}}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <i className="fas fa-envelope input-icon" />
                <input id="email" type="email" className="form-control" placeholder="Enter your email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock input-icon" />
                <input id="password" type="password" className="form-control" placeholder="Enter your password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              <span id="loginText" style={{display: loading ? 'none' : 'inline'}}>Sign In Securely</span>
              <span id="loginLoading" className="loading" style={{display: loading ? 'inline-block' : 'none'}} />
            </button>
            <div style={{marginTop: 16, fontSize: 12, color: '#6b7280'}}>
              Or use the existing flows: <Link href="/login" className="underline">/login</Link>
            </div>
          </form>
        </div>
      </div>
      <div className="security-badge pulse">
        <i className="fas fa-shield-alt" />
        SSL Secured
      </div>
    </div>
  )
}
