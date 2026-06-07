import { Tag } from 'antd';
import {
  FileText, Clock, XCircle, Star,
  Wrench, RefreshCw, CheckCircle, Search,
  UserPlus, Users, Shield, Settings,
  Mail, Phone,
} from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';

const HELP_CONTENT = {
  requestor: [
    {
      icon: FileText,
      title: 'Reportar una Falla',
      desc: 'Registra un nuevo ticket de soporte técnico para reportar cualquier incidencia.',
      steps: [
        'En tu panel principal, haz clic en "Reportar Falla".',
        'Completa el formulario con: título, descripción, categoría y ubicación.',
        'Si el problema está asociado a un equipo, búscalo en el inventario.',
        'Envía el formulario. El ticket quedará en estado "Abierto".',
      ],
    },
    {
      icon: Clock,
      title: 'Ver mi Historial',
      desc: 'Consulta el estado y seguimiento de todos tus tickets registrados.',
      steps: [
        'Accede a la sección "Historial" desde el menú lateral.',
        'Usa los filtros por estado o rango de fechas para buscar tickets.',
        'Haz clic en "Ver" para ver el detalle completo del ticket.',
      ],
    },
    {
      icon: XCircle,
      title: 'Anular un Ticket',
      desc: 'Cancela un ticket que esté en estado "Abierto" si ya no es necesario.',
      steps: [
        'Ve a tu lista de tickets activos desde el panel o historial.',
        'Busca el ticket con estado "Abierto" y haz clic en "Anular".',
        'Indica el motivo de la anulación y confirma.',
      ],
    },
    {
      icon: Star,
      title: 'Calificar Atención',
      desc: 'Evalúa la calidad del servicio recibido una vez resuelto tu ticket.',
      steps: [
        'Cuando tu ticket esté "Resuelto", aparecerá una opción para calificar.',
        'Selecciona una puntuación del 1 al 5.',
        'Opcionalmente, añade un comentario sobre la atención recibida.',
      ],
    },
  ],
  technician: [
    {
      icon: Wrench,
      title: 'Atender Tickets',
      desc: 'Gestiona los tickets que te han sido asignados desde tu panel principal.',
      steps: [
        'En tu dashboard, selecciona "Mis Tickets Asignados" de la fila de métricas.',
        'Haz clic en "Atender" en el ticket que deseas gestionar.',
        'Revisa los detalles y comienza con la atención del caso.',
      ],
    },
    {
      icon: RefreshCw,
      title: 'Cambiar Estado',
      desc: 'Actualiza el progreso de un ticket a medida que avanza su resolución.',
      steps: [
        'Desde el espacio de trabajo del ticket, usa el selector de estado.',
        'Puedes avanzar a "En Proceso" o "Pendiente" según sea necesario.',
        'Añade notas o comentarios sobre las acciones realizadas.',
      ],
    },
    {
      icon: CheckCircle,
      title: 'Resolver Tickets',
      desc: 'Cierra un ticket una vez que la incidencia ha sido solucionada.',
      steps: [
        'Cuando completes la atención, haz clic en "Resolver Ticket".',
        'Ingresa las notas técnicas del trabajo realizado.',
        'Indica el estado final del equipo (operativo, en observación, etc.).',
        'Confirma la resolución para notificar al solicitante.',
      ],
    },
    {
      icon: Search,
      title: 'Consultar Inventario',
      desc: 'Busca equipos registrados para consultar su ficha técnica.',
      steps: [
        'Accede a "Inventario" desde el menú lateral.',
        'Usa el buscador por código, marca o modelo.',
        'Haz clic en el ojo para ver la ficha técnica completa del equipo.',
      ],
    },
  ],
  admin: [],
};

const ADMIN_EXTRA = [
  {
    icon: UserPlus,
    title: 'Asignar Tickets',
    desc: 'Asigna manualmente tickets a técnicos o administradores disponibles.',
    steps: [
      'Ve a la sección "Asignación" desde el menú lateral.',
      'Revisa la tabla de tickets pendientes.',
      'Selecciona un técnico del menú desplegable en cada ticket.',
      'Haz clic en "Asignar" para confirmar la asignación.',
    ],
  },
  {
    icon: Users,
    title: 'Gestionar Usuarios',
    desc: 'Administra las cuentas de usuario del sistema.',
    steps: [
      'Accede a "Usuarios" desde el menú de administración.',
      'Usa el buscador para filtrar por nombre o departamento.',
      'Haz clic en el ícono de lápiz para editar un usuario existente.',
      'Usa el botón "Registrar Usuario" para crear nuevas cuentas.',
    ],
  },
  {
    icon: Shield,
    title: 'Auditar el Sistema',
    desc: 'Revisa el registro completo de actividades del sistema.',
    steps: [
      'Ve a "Auditoría" desde el menú de administración.',
      'Filtra por rango de fechas, usuario o tipo de movimiento.',
      'Haz clic en el ojo para ver los detalles completos del cambio.',
    ],
  },
  {
    icon: Settings,
    title: 'Configuración',
    desc: 'Gestiona los departamentos y umbrales del sistema.',
    steps: [
      'Accede a "Configuración" desde el menú de administración.',
      'Agrega, edita o elimina departamentos según sea necesario.',
      'Los umbrales SLA y categorías estarán disponibles próximamente.',
    ],
  },
];

export default function HelpSupport() {
  const { user } = useAuth();
  const role = user?.role || 'requestor';
  const roleLabel = ROLE_LABELS[role] || role;

  const baseHelps = HELP_CONTENT[role] || [];
  const extraHelps = role === 'admin' ? ADMIN_EXTRA : [];
  const helps = [...baseHelps, ...extraHelps];

  return (
    <div className="help-support-page">
      <div className="help-header">
        <h2 className="page-title" style={{ marginBottom: 4 }}>AYUDA Y SOPORTE</h2>
        <div className="help-subtitle-row">
          <p className="help-subtitle">Centro de ayuda del sistema de gestión de tickets.</p>
          <Tag color="blue" className="help-role-badge">{roleLabel}</Tag>
        </div>
      </div>

      <div className="help-grid">
        {helps.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="help-card">
              <div className="card-icon">
                <Icon size={32} />
              </div>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              <ul className="help-steps">
                {item.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="bottom-contact-card">
        <div className="contact-section">
          <h4>Departamento de Tecnología, Información y Comunicación</h4>
          <p className="contact-subtitle">Facultad de Odontología · Universidad del Zulia</p>
        </div>
        <div className="contact-items">
          <div className="contact-item">
            <Mail size={16} />
            <span>tic.odontologia@luz.edu.ve</span>
          </div>
          <div className="contact-item">
            <Phone size={16} />
            <span>+58 261 759 1234</span>
          </div>
        </div>
      </div>
    </div>
  );
}
