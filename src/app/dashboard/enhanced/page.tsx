'use client';

import React from 'react';
import { EnhancedDashboard } from '@/components/dashboard/enhanced-dashboard';

export default function EnhancedDashboardPage() {
  // Demo tenant ID - in production this would come from authentication/context
  const tenantId = 'demo-store-001';

  return <EnhancedDashboard tenantId={tenantId} />;
}
