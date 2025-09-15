'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement, PointElement, LinearScale, CategoryScale,
  ArcElement, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ArcElement, Tooltip, Legend)

export default function SecureDashboard() {
  const router = useRouter()

  useEffect(()=>{
    // If you add real auth, check token here
  },[])

  const ordersData = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets: [{
      label: 'Orders',
      data: [12,18,9,22,15,28,20],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.2)',
      tension: 0.3,
      fill: true,
    }]
  }
  const revenueData = {
    labels: ['Online','Retail','Wholesale','Marketplace'],
    datasets: [{
      label: 'Revenue',
      data: [45,25,15,15],
      backgroundColor: ['#6366f1','#f59e0b','#10b981','#8b5cf6']
    }]
  }

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon"><i className="fas fa-chart-line" /></div>
            <div><h2>Shoplytics</h2></div>
          </div>
        </div>
        <div className="sidebar-nav">
          <a className="nav-item active" href="#"><i className="fas fa-tachometer-alt"/>Dashboard</a>
          <a className="nav-item" href="#"><i className="fas fa-users"/>Customers</a>
          <a className="nav-item" href="#"><i className="fas fa-shopping-cart"/>Orders</a>
          <a className="nav-item" href="#"><i className="fas fa-box"/>Products</a>
          <a className="nav-item" href="#"><i className="fas fa-chart-bar"/>Analytics</a>
          <a className="nav-item" href="#"><i className="fas fa-cog"/>Settings</a>
        </div>
      </nav>

      <div className="main-content">
        <div className="topbar">
          <h1 className="page-title">Dashboard Overview</h1>
          <div className="user-menu">
            <div className="user-avatar">JD</div>
            <button className="logout-btn" onClick={()=>router.push('/secure')}> <i className="fas fa-sign-out-alt"/> Logout</button>
          </div>
        </div>
        <div className="content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Customers</div>
                <div className="stat-icon customers"><i className="fas fa-users"/></div>
              </div>
              <div className="stat-value">12,847</div>
              <div className="stat-change positive"><i className="fas fa-arrow-up"/> +12.5% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Orders</div>
                <div className="stat-icon orders"><i className="fas fa-shopping-cart"/></div>
              </div>
              <div className="stat-value">8,432</div>
              <div className="stat-change positive"><i className="fas fa-arrow-up"/> +8.2% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Revenue</div>
                <div className="stat-icon revenue"><i className="fas fa-dollar-sign"/></div>
              </div>
              <div className="stat-value">$2,840,125</div>
              <div className="stat-change positive"><i className="fas fa-arrow-up"/> +15.3% from last month</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-title">Total Products</div>
                <div className="stat-icon products"><i className="fas fa-box"/></div>
              </div>
              <div className="stat-value">1,247</div>
              <div className="stat-change positive"><i className="fas fa-arrow-up"/> +3.7% from last month</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Orders Over Time</h3>
                <div className="date-filter">
                  <button className="filter-btn active">7D</button>
                  <button className="filter-btn">30D</button>
                  <button className="filter-btn">90D</button>
                </div>
              </div>
              <Line data={ordersData} options={{responsive:true, maintainAspectRatio:false}} />
            </div>
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">Revenue Distribution</h3>
              </div>
              <Doughnut data={revenueData} />
            </div>
          </div>

          <div className="customers-table">
            <div className="table-header">
              <h3 className="chart-title">Top 5 Customers by Spend</h3>
              <button className="filter-btn">View All</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Total Spend</th>
                  <th>Last Order</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {name:'John Doe', tag:'Premium Customer', email:'john.doe@email.com', orders:47, spend:'$12,847', last:'2 hours ago', initials:'JD'},
                  {name:'Alice Smith', tag:'VIP Customer', email:'alice.smith@email.com', orders:38, spend:'$9,632', last:'5 hours ago', initials:'AS'},
                  {name:'Bob Johnson', tag:'Regular Customer', email:'bob.johnson@email.com', orders:29, spend:'$7,245', last:'1 day ago', initials:'BJ'},
                  {name:'Carol Wilson', tag:'New Customer', email:'carol.wilson@email.com', orders:21, spend:'$5,892', last:'3 days ago', initials:'CW'},
                  {name:'David Miller', tag:'Regular Customer', email:'david.miller@email.com', orders:18, spend:'$4,567', last:'1 week ago', initials:'DM'},
                ].map((c)=> (
                  <tr key={c.email}>
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar">{c.initials}</div>
                        <div className="customer-details">
                          <h4>{c.name}</h4>
                          <p>{c.tag}</p>
                        </div>
                      </div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.orders}</td>
                    <td className="amount">{c.spend}</td>
                    <td>{c.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="security-badge pulse">
        <i className="fas fa-shield-alt" />
        SSL Secured
      </div>
    </div>
  )
}
