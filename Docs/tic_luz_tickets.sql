-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS tic_luz_tickets;
USE tic_luz_tickets;

-- Tabla de Departamentos
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Administrador', 'Técnico', 'Solicitante') NOT NULL,
    department_id UUID,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Tabla de Equipos
CREATE TABLE equipment (
    id UUID PRIMARY KEY,
    inventory_code VARCHAR(50) UNIQUE,
    -- Enum con tipos habituales de equipos
    equipment_type ENUM('Computadora de Escritorio', 'Laptop', 'Impresora', 'Monitor', 'Servidor', 'Router/Switch', 'Escáner', 'Otro') NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    technical_specifications JSON,
    status ENUM('Operativo', 'En Mantenimiento', 'Dañado', 'Desincorporado') DEFAULT 'Operativo',
    department_id UUID,
    user_assigned UUID NULL,
    entry_date DATE DEFAULT CURRENT_DATE,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    out_date DATE,
    FOREIGN KEY (user_assigned) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Tabla de Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    priority ENUM('Baja', 'Media', 'Alta', 'Crítica') DEFAULT 'Media',
    status ENUM('Abierto', 'En Proceso', 'Resuelto', 'Cerrado') DEFAULT 'Abierto',
    category ENUM('Hardware', 'Software', 'Redes', 'Telecomunicaciones', 'Otro'),
    requester_id UUID,
    assigned_technician_id UUID,
    equipment_id UUID,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (assigned_technician_id) REFERENCES users(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Tabla de Historial de Tickets
CREATE TABLE ticket_history (
    id UUID PRIMARY KEY,
    ticket_id UUID,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    technical_action TEXT,
    technical_comment TEXT,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
);

-- Tabla de Logs de Auditoría
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    action VARCHAR(100),
    affected_table VARCHAR(50),
    record_id UUID,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);