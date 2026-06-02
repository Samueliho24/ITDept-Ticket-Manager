import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import Login from '../pages/common/Login';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
