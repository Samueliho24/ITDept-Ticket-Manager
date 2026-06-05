import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import Login from '../pages/common/Login';
import RequestorDashboard from '../pages/requestor/Dashboard';
import RequestorHistory from '../pages/requestor/History';

function RoleDashboard() {
  return <RequestorDashboard />;
}

function RoleHistory() {
  return <RequestorHistory />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']} />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']}><RoleDashboard /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute allowedRoles={['admin', 'technician']}><div>Inventario</div></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']}><RoleHistory /></ProtectedRoute>} />
          <Route path="/assign" element={<ProtectedRoute allowedRoles={['admin']}><div>Asignación</div></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><div>Usuarios</div></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute allowedRoles={['admin']}><div>Auditoría</div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><div>Configuración</div></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute allowedRoles={['admin', 'technician', 'requestor']}><div>Ayuda</div></ProtectedRoute>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
