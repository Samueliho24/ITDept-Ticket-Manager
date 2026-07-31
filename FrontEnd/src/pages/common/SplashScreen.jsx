import './SplashScreen.scss';
import logoLUZ from '../../assets/Logo_LUZ.png';
import logoFac from '../../assets/Logo_FacoLuz.png';

export default function SplashScreen() {
  return (
    <div className="splash-screen login-gradient-bg">
      <div className="splash-card">
        <div className="splash-logos">
          <img src={logoLUZ} alt="Logo LUZ" className="splash-logo splash-logo--luz" />
          <div className="splash-divider" />
          <img src={logoFac} alt="Logo Facultad de Odontología" className="splash-logo splash-logo--fac" />
        </div>

        <div className="splash-texts">
          <h1 className="splash-title">Sistema de Gestión de Tickets</h1>
          <p className="splash-dept">Departamento de Tecnología, Información y Comunicación</p>
          <p className="splash-subtitle">Facultad de Odontología · Universidad del Zulia</p>
        </div>

        <div className="splash-progress-track">
          <div className="splash-progress-bar" />
        </div>
      </div>
    </div>
  );
}
