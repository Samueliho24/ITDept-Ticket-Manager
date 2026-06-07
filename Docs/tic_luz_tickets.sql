-- ============================================
-- DDL - Sistema de Gesti�n de Tickets TIC
-- Facultad de Odontolog�a - Universidad del Zulia
-- Motor: MariaDB / MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS tic_luz_tickets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tic_luz_tickets;

-- ============================================
-- Tabla: departments
-- ============================================
CREATE TABLE departments (
    id          VARCHAR(36) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(3) NOT NULL UNIQUE COMMENT 'C�digo de 3 caracteres (ej: INF, ODO, ADM)',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at  DATETIME NULL COMMENT 'Soft-delete'
) ENGINE=InnoDB;

-- ============================================
-- Tabla: users
-- ============================================
CREATE TABLE users (
    id            VARCHAR(36) PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    lastname      VARCHAR(100) NOT NULL,
    username      VARCHAR(50) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
    role          VARCHAR(20) NOT NULL COMMENT 'admin | technician | requestor',
    active        BOOLEAN DEFAULT TRUE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    department_id VARCHAR(36) NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB;

-- ============================================
-- Tabla: equipment
-- ============================================
CREATE TABLE equipment (
    id                       VARCHAR(36) PRIMARY KEY,
    inventory_code           VARCHAR(100) NOT NULL UNIQUE,
    equipment_type           VARCHAR(50) NOT NULL COMMENT 'PC | Laptop | Impresora | Switch | Router | Otro',
    brand                    VARCHAR(100) NULL,
    model                    VARCHAR(100) NULL,
    technical_specifications JSON NULL COMMENT 'Especificaciones t�cnicas en JSON',
    status                   VARCHAR(50) DEFAULT 'Operativo' COMMENT 'Operativo | En Mantenimiento | Da�ado | Desincorporado',
    department_id            VARCHAR(36) NULL,
    assigned_person          VARCHAR(200) NULL COMMENT 'Persona asignada',
    entry_date               DATETIME DEFAULT CURRENT_TIMESTAMP,
    out_date                 DATETIME NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB;

-- ============================================
-- Tabla: tickets
-- ============================================
CREATE TABLE tickets (
    id                      VARCHAR(36) PRIMARY KEY,
    title                   VARCHAR(255) NOT NULL,
    description             VARCHAR(500) NULL,
    priority                ENUM('Baja','Media','Alta','Cr�tica') DEFAULT 'Media',
    status                  ENUM('Abierto','Asignado','En Proceso','Pendiente','Resuelto','Cerrado','Anulado') DEFAULT 'Abierto',
    category                VARCHAR(100) NULL COMMENT 'Hardware | Software | Redes | Telecomunicaciones | Otro',
    requester_id            VARCHAR(36) NOT NULL,
    assigned_technician_id  VARCHAR(36) NULL,
    equipment_id            VARCHAR(36) NULL,
    department_id           VARCHAR(36) NULL,
    rated                   BOOLEAN DEFAULT FALSE,
    daily_sequence          INT DEFAULT 0 COMMENT 'Secuencia num�rica diaria por departamento',
    opened_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at               DATETIME NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (assigned_technician_id) REFERENCES users(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB;

-- ============================================
-- Tabla: history_tickets (transiciones de estado)
-- ============================================
CREATE TABLE history_tickets (
    id               VARCHAR(36) PRIMARY KEY,
    ticket_id        VARCHAR(36) NOT NULL,
    previous_status  VARCHAR(50) NULL,
    new_status       VARCHAR(50) NULL,
    technical_comment VARCHAR(500) NULL,
    technical_action VARCHAR(100) NULL,
    reason           VARCHAR(255) NULL COMMENT 'Motivo de anulaci�n',
    change_date      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
) ENGINE=InnoDB;

-- ============================================
-- Tabla: ticket_ratings (calificaciones)
-- ============================================
CREATE TABLE ticket_ratings (
    id         VARCHAR(36) PRIMARY KEY,
    ticket_id  VARCHAR(36) NOT NULL UNIQUE,
    user_id    VARCHAR(36) NOT NULL,
    rating     INT NOT NULL COMMENT '1 a 5',
    comment    VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================
-- Tabla: notification_reads (notificaciones por usuario)
-- ============================================
CREATE TABLE notification_reads (
    id         VARCHAR(36) PRIMARY KEY,
    user_id    VARCHAR(36) NOT NULL,
    ticket_id  VARCHAR(36) NOT NULL,
    message    VARCHAR(255) NOT NULL,
    read_at    DATETIME NULL COMMENT 'NULL = no le�do',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
) ENGINE=InnoDB;

-- ============================================
-- Tabla: audit_logs (auditor�a de operaciones)
-- ============================================
CREATE TABLE audit_logs (
    id             VARCHAR(36) PRIMARY KEY,
    user_id        VARCHAR(36) NOT NULL,
    action         VARCHAR(100) NOT NULL COMMENT 'login | CREATE_USER | create_ticket | assign_ticket | etc.',
    affected_table VARCHAR(50) NULL,
    record_id      VARCHAR(36) NULL,
    details        JSON NULL COMMENT 'Detalles del cambio en JSON',
    timestamp      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================
-- Usuario administrador por defecto
-- password: admin (hash bcrypt)
-- ============================================
INSERT INTO departments (id, name, code, is_active)
VALUES ('d0000000-0000-0000-0000-000000000001', 'Tecnolog�a de Informaci�n y Comunicaci�n', 'TIC', TRUE);

INSERT INTO users (id, name, lastname, username, password, role, active, department_id)
VALUES (
    'u0000000-0000-0000-0000-000000000001',
    'Admin',
    'Sistema',
    'admin',
    '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1Qlq5GzGjKxJ7H0Z6t0y8G0q3Kjy',
    'admin',
    TRUE,
    'd0000000-0000-0000-0000-000000000001'
);
