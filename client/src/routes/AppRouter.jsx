import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import AppLayout from '../components/shared/AppLayout';
import AuthLayout from '../components/shared/AuthLayout';

import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import DashboardPage from '../pages/dashboard/DashboardPage';
import UsersPage from '../pages/users/UsersPage';
import DepartmentsPage from '../pages/departments/DepartmentsPage';
import EmployeesPage from '../pages/employees/EmployeesPage';
import AssetsPage from '../pages/assets/AssetsPage';
import AssetDetailPage from '../pages/assets/AssetDetailPage';
import AssetFormPage from '../pages/assets/AssetFormPage';
import AllocationsPage from '../pages/allocations/AllocationsPage';
import TransfersPage from '../pages/transfers/TransfersPage';
import TransferDetailPage from '../pages/transfers/TransferDetailPage';
import BookingsPage from '../pages/bookings/BookingsPage';
import BookingCalendarPage from '../pages/bookings/BookingCalendarPage';
import MaintenancePage from '../pages/maintenance/MaintenancePage';
import MaintenanceDetailPage from '../pages/maintenance/MaintenanceDetailPage';
import AuditCyclesPage from '../pages/audit/AuditCyclesPage';
import AuditDetailPage from '../pages/audit/AuditDetailPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ReportsPage from '../pages/reports/ReportsPage';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          
          <Route element={<RoleRoute roles={['Admin']} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          
          <Route path="/departments" element={<DepartmentsPage />} />

          
          <Route path="/employees" element={<EmployeesPage />} />

          
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/new" element={<AssetFormPage />} />
          <Route path="/assets/:id" element={<AssetDetailPage />} />
          <Route path="/assets/:id/edit" element={<AssetFormPage />} />

          
          <Route path="/allocations" element={<AllocationsPage />} />

          
          <Route path="/transfers" element={<TransfersPage />} />
          <Route path="/transfers/:id" element={<TransferDetailPage />} />

          
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/calendar" element={<BookingCalendarPage />} />

          
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetailPage />} />

          
          <Route path="/audits" element={<AuditCyclesPage />} />
          <Route path="/audits/:id" element={<AuditDetailPage />} />

          
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
