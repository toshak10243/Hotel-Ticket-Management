import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { GuestLayout } from './layouts/GuestLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Guest Pages
import { GuestRequestPage } from './pages/GuestRequestPage';
import { RequestConfirmationPage } from './pages/RequestConfirmationPage';
import { TrackRequestPage } from './pages/TrackRequestPage';
import { QrGeneratorPage } from './pages/QrGeneratorPage';

// Staff & Auth Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { RequestManagementPage } from './pages/RequestManagementPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { ManagerMonitoringPage } from './pages/ManagerMonitoringPage';
import { StaffManagementPage } from './pages/StaffManagementPage';

function App() {
  return (
    <Routes>
      {/* Root redirect to guest request portal */}
      <Route path="/" element={<Navigate to="/guest/request" replace />} />

      {/* Guest Public Portal */}
      <Route path="/guest" element={<GuestLayout />}>
        <Route index element={<Navigate to="/guest/request" replace />} />
        <Route path="request" element={<GuestRequestPage />} />
        <Route path="confirmation" element={<RequestConfirmationPage />} />
        <Route path="track" element={<TrackRequestPage />} />
        <Route path="qr-generator" element={<QrGeneratorPage />} />
      </Route>

      {/* Staff Authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Staff Dashboard Area */}
      <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Staff']} />}>
        <Route path="/dashboard" element={<StaffLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="requests" element={<RequestManagementPage />} />
          <Route path="requests/:id" element={<RequestDetailPage />} />

          {/* Manager & Admin Features */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager']} />}>
            <Route path="manager" element={<ManagerMonitoringPage />} />
          </Route>

          {/* Admin Exclusive Features */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="staff-management" element={<StaffManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/guest/request" replace />} />
    </Routes>
  );
}

export default App;
