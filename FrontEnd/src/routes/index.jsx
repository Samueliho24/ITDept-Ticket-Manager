import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import Login from '../pages/common/Login';
import NotFound from '../pages/common/NotFound';
import PublicReport from '../pages/public/PublicReport';
import PublicTicketView from '../pages/public/PublicTicketView';
import RequestorDashboard from '../pages/requestor/Dashboard';
import RequestorHistory from '../pages/requestor/History';
import TechnicianDashboard from '../pages/technician/Dashboard';
import TechnicianHistory from '../pages/technician/History';
import Workspace from '../pages/technician/Workspace';
import EquipmentInventory from '../pages/technician/EquipmentInventory';
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/users/UserManagement';
import AuditLog from '../pages/admin/AuditLog';
import AdminHistory from '../pages/admin/History';
import Settings from '../pages/admin/settings/Settings';
import TicketAssignment from '../pages/admin/TicketAssignment';
import HelpSupport from '../pages/common/HelpSupport';
import { useAuth } from '../context/AuthContext';

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'technician') return <TechnicianDashboard />;
  return <RequestorDashboard />;
}

function RoleHistory() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminHistory />;
  if (user?.role === 'technician') return <TechnicianHistory />;
  return <RequestorHistory />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reportar" element={<PublicReport />} />
      <Route path="/reportar/:ticketNumber" element={<PublicTicketView />} />

      <Route element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']} />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']}><RoleDashboard /></ProtectedRoute>} />
          <Route path="/workspace/:ticketId" element={<ProtectedRoute allowedRoles={['admin', 'technician']}><Workspace /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute allowedRoles={['admin', 'technician']}><EquipmentInventory /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']}><RoleHistory /></ProtectedRoute>} />
          <Route path="/assign" element={<ProtectedRoute allowedRoles={['admin']}><TicketAssignment /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute allowedRoles={['admin']}><AuditLog /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']}><HelpSupport /></ProtectedRoute>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
