# API Contract — TIC Tickets LUZ

> **Versión:** 1.0.0  
> **Base URL:** `http://localhost:3006/api/v1`  
> **Formato:** JSON  
> **Autenticación:** `Authorization: Bearer <JWT>` (excepto `/auth/login`)

---

## Índice de Módulos

1. [Autenticación](#1-autenticación)
2. [Usuarios](#2-usuarios)
3. [Departamentos](#3-departamentos)
4. [Equipos (Inventario)](#4-equipos-inventario)
5. [Tickets](#5-tickets)
6. [Notificaciones](#6-notificaciones)
7. [Auditoría](#7-auditoría)

---

## 1. Autenticación

### `POST /auth/login`

**Propósito:** Inicio de sesión. Válida credenciales, verifica que la cuenta esté activa y retorna un JWT.

**Nivel de Acceso:** Público (no requiere token).

#### Request Body

```json
{
  "username": "jperez",
  "password": "MiClaveSegura2026"
}
```

| Campo      | Tipo   | Obligatorio | Descripción            |
|------------|--------|-------------|------------------------|
| `username` | string | Sí          | Nombre de usuario único |
| `password` | string | Sí          | Contraseña en texto plano |

#### Response — `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Payload del JWT (decodificado)

```json
{
  "sub": "uuid-del-usuario",
  "username": "jperez",
  "role": "admin",
  "active": true,
  "exp": 1717000000
}
```

| Claim      | Descripción                                |
|------------|--------------------------------------------|
| `sub`      | UUID del usuario (sujeto del token)        |
| `username` | Nombre de usuario para display en UI       |
| `role`     | `admin`, `technician` o `requestor`       |
| `active`   | Estado de la cuenta (`true`/`false`)        |
| `exp`      | Expiración en UNIX timestamp (60 min)       |

#### Errores Comunes

| Código | Cuerpo                                    | Causa                        |
|--------|-------------------------------------------|------------------------------|
| 401    | `{"detail": "Credenciales inválidas."}`    | Username o password erróneo  |
| 403    | `{"detail": "Cuenta de usuario inactiva..."}` | Cuenta desactivada por admin |

---

## 2. Usuarios

Todas las operaciones sobre usuarios requieren rol `admin`.

### `POST /users/`

**Propósito:** Registrar un nuevo usuario. Hashea la contraseña automáticamente. Asigna `active: true` por defecto.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "name": "Juan",
  "lastname": "Pérez",
  "username": "jperez",
  "password": "ClaveTemporal123",
  "role": "technician",
  "department_id": "uuid-del-departamento"
}
```

| Campo          | Tipo   | Obligatorio | Default      | Descripción                              |
|----------------|--------|-------------|--------------|------------------------------------------|
| `name`         | string | Sí          | —            | Nombre del usuario                       |
| `lastname`     | string | Sí          | —            | Apellido del usuario                     |
| `username`     | string | Sí          | —            | Debe ser único en el sistema             |
| `password`     | string | Sí          | —            | Mínimo 8 caracteres (validación cliente) |
| `role`         | string | No          | `"requestor"` | `admin`, `technician`, `requestor`     |
| `department_id`| string | No          | `null`       | UUID del departamento asociado           |

#### Response — `201 Created`

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Juan",
  "lastname": "Pérez",
  "username": "jperez",
  "role": "technician",
  "active": true,
  "department_id": "uuid-del-departamento",
  "created_at": "2026-05-25T12:00:00Z"
}
```

**Nota:** La contraseña NUNCA se incluye en la respuesta.

---

### `GET /users/`

**Propósito:** Listar todos los usuarios registrados. Ordenados por fecha de creación descendente. Respuesta paginada.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Query Parameters

| Parámetro | Tipo | Obligatorio | Default | Descripción |
|-----------|------|-------------|---------|-------------|
| `limit`   | int  | No          | `10`    | Registros por página (1-100) |
| `offset`  | int  | No          | `0`     | Desplazamiento desde el inicio |

#### Response — `200 OK`

```json
{
  "total": 45,
  "limit": 10,
  "offset": 0,
  "items": [
    {
      "id": "uuid-1",
      "name": "Ana",
      "lastname": "Martínez",
      "username": "amartinez",
      "role": "admin",
      "active": true,
      "department_id": "uuid-depto",
      "created_at": "2026-05-25T12:00:00Z"
    },
    {
      "id": "uuid-2",
      "name": "Carlos",
      "lastname": "López",
      "username": "clopez",
      "role": "technician",
      "active": true,
      "department_id": null,
      "created_at": "2026-05-24T10:00:00Z"
    }
  ]
}
```

---

### `GET /users/{user_id}`

**Propósito:** Obtener ficha completa de un usuario por su UUID.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Parámetros de URL

| Parámetro | Tipo   | Descripción           |
|-----------|--------|-----------------------|
| `user_id` | string | UUID del usuario (PK) |

#### Response — `200 OK`

Misma estructura que `POST /users/`.

#### Errores

| Código | Causa                     |
|--------|---------------------------|
| 404    | Usuario no encontrado     |

---

### `PUT /users/{user_id}`

**Propósito:** Editar datos de un usuario. Solo modifica los campos enviados (parcial). **No permite cambiar la contraseña.**

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "name": "Juan Carlos",
  "role": "admin",
  "department_id": "otro-uuid"
}
```

| Campo          | Tipo   | Obligatorio | Descripción                  |
|----------------|--------|-------------|------------------------------|
| `name`         | string | No          | Nuevo nombre                 |
| `lastname`     | string | No          | Nuevo apellido               |
| `role`         | string | No          | `admin`, `technician`, `requestor` |
| `department_id`| string | No          | UUID del departamento o `null` |

#### Response — `200 OK`

```json
{
  "id": "uuid",
  "name": "Juan Carlos",
  "lastname": "Pérez",
  "username": "jperez",
  "role": "admin",
  "active": true,
  "department_id": "otro-uuid",
  "created_at": "2026-05-25T12:00:00Z"
}
```

---

### `PATCH /users/{user_id}/status`

**Propósito:** Activar o desactivar un usuario. Al desactivar, el usuario no podrá iniciar sesión.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "active": false
}
```

| Campo    | Tipo    | Obligatorio | Descripción                  |
|----------|---------|-------------|------------------------------|
| `active` | boolean | Sí          | `true` = activo, `false` = inactivo |

#### Response — `200 OK`

Misma estructura que `GET /users/{user_id}`.

---

### `PATCH /users/{user_id}/password`

**Propósito:** Forzar cambio de contraseña de un usuario (el admin establece una nueva contraseña).

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "password": "NuevaClaveSegura789"
}
```

| Campo      | Tipo   | Obligatorio | Descripción            |
|------------|--------|-------------|------------------------|
| `password` | string | Sí          | Nueva contraseña (se hashea automáticamente) |

#### Response — `200 OK`

Misma estructura que `GET /users/{user_id}`.

#### Errores Comunes (Módulo Usuarios)

| Código | Cuerpo                                    | Causa                        |
|--------|-------------------------------------------|------------------------------|
| 401    | `{"detail": "Autenticación requerida."}`   | Token ausente o inválido     |
| 403    | `{"detail": "Acceso denegado..."}`         | El token no es de admin      |
| 404    | `{"detail": "Usuario no encontrado."}`     | UUID inválido o inexistente  |
| 409    | `{"detail": "Ya existe un usuario..."}`    | `username` duplicado en POST |
| 422    | *Validación Pydantic*                      | Campos faltantes o tipo incorrecto |

---

## 3. Departamentos

### `POST /departments/`

**Propósito:** Crear un nuevo departamento.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "name": "Departamento de Sistemas"
}
```

| Campo  | Tipo   | Obligatorio | Descripción                    |
|--------|--------|-------------|--------------------------------|
| `name` | string | Sí          | Nombre único del departamento  |

#### Response — `201 Created`

```json
{
  "id": "uuid-del-departamento",
  "name": "Departamento de Sistemas",
  "created_at": "2026-05-25T12:00:00Z"
}
```

---

### `GET /departments/`

**Propósito:** Listar todos los departamentos. Ordenados por fecha de creación descendente. Respuesta paginada.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado.

#### Query Parameters

| Parámetro | Tipo | Obligatorio | Default | Descripción |
|-----------|------|-------------|---------|-------------|
| `limit`   | int  | No          | `10`    | Registros por página (1-100) |
| `offset`  | int  | No          | `0`     | Desplazamiento desde el inicio |

#### Response — `200 OK`

```json
{
  "total": 12,
  "limit": 10,
  "offset": 0,
  "items": [
    {
      "id": "uuid-1",
      "name": "Departamento de Sistemas",
      "created_at": "2026-05-25T12:00:00Z"
    },
    {
      "id": "uuid-2",
      "name": "Departamento de Contabilidad",
      "created_at": "2026-05-24T10:00:00Z"
    }
  ]
}
```

---

### `GET /departments/{department_id}`

**Propósito:** Obtener un departamento por su UUID.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado.

#### Parámetros de URL

| Parámetro       | Tipo   | Descripción               |
|-----------------|--------|---------------------------|
| `department_id` | string | UUID del departamento (PK) |

#### Response — `200 OK`

Misma estructura que `POST /departments/`.

---

### `DELETE /departments/{department_id}`

**Propósito:** Eliminar un departamento. **Validación:** No se permite eliminar si existen usuarios o equipos asociados.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Response — `200 OK`

```json
{
  "detail": "Departamento eliminado exitosamente."
}
```

#### Errores Comunes

| Código | Cuerpo                                                      | Causa                            |
|--------|-------------------------------------------------------------|----------------------------------|
| 400    | `{"detail": "No se puede eliminar... existen usuarios..."}` | Hay usuarios en el departamento  |
| 400    | `{"detail": "No se puede eliminar... existen equipos..."}`  | Hay equipos en el departamento   |
| 404    | `{"detail": "Departamento no encontrado."}`                 | UUID inválido                    |
| 409    | `{"detail": "Ya existe un departamento con ese nombre."}`   | Nombre duplicado en POST         |

---

## 4. Equipos (Inventario)

### `POST /equipments/`

**Propósito:** Registrar un nuevo equipo en el inventario.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "inventory_code": "EQ-2026-001",
  "equipment_type": "Laptop",
  "brand": "Dell",
  "model": "Latitude 5540",
  "technical_specifications": {
    "processor": "Intel i7-1365U",
    "ram": "16GB DDR4",
    "storage": "512GB SSD"
  },
  "department_id": "uuid-del-departamento"
}
```

| Campo                    | Tipo   | Obligatorio | Descripción                              |
|--------------------------|--------|-------------|------------------------------------------|
| `inventory_code`         | string | No          | Código único de inventario               |
| `equipment_type`         | string | Sí          | Tipo (Laptop, Monitor, Impresora, etc.)  |
| `brand`                  | string | No          | Marca del equipo                         |
| `model`                  | string | No          | Modelo del equipo                        |
| `technical_specifications` | object/json | No | Atributos heterogéneos (RAM, CPU, etc.) |
| `department_id`          | string | No          | UUID del departamento asignado           |
| `assigned_person`        | string | No          | Personal responsable del equipo          |

#### Response — `201 Created`

```json
{
  "id": "uuid-del-equipo",
  "inventory_code": "EQ-2026-001",
  "equipment_type": "Laptop",
  "brand": "Dell",
  "model": "Latitude 5540",
  "technical_specifications": {
    "processor": "Intel i7-1365U",
    "ram": "16GB DDR4",
    "storage": "512GB SSD"
  },
  "status": "Operativo",
  "department_id": "uuid-del-departamento",
  "department_name": "Nombre del Departamento",
  "assigned_person": null,
  "entry_date": "2026-05-25T12:00:00Z",
  "out_date": null
}
```

---

### `GET /equipments/`

**Propósito:** Listar todo el inventario. Ordenado por fecha de entrada descendente. Respuesta paginada con filtros.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`, `technician`.

#### Query Parameters

| Parámetro | Tipo | Obligatorio | Default | Descripción |
|-----------|------|-------------|---------|-------------|
| `limit`   | int  | No          | `10`    | Registros por página (1-100) |
| `offset`  | int  | No          | `0`     | Desplazamiento desde el inicio |
| `search`  | string | No        | —       | Búsqueda parcial en código/marca/modelo |
| `equipment_type` | string | No   | —       | Filtrar por tipo de equipo |
| `status`  | string | No          | —       | Filtrar por estado operativo |

#### Response — `200 OK`

```json
{
  "total": 87,
  "limit": 10,
  "offset": 0,
  "items": [
    {
      "id": "uuid-1",
      "inventory_code": "EQ-2026-001",
      "equipment_type": "Laptop",
      "brand": "Dell",
      "model": "Latitude 5540",
      "technical_specifications": { "processor": "Intel i7" },
      "status": "Operativo",
      "department_id": "uuid-depto",
      "entry_date": "2026-05-25T12:00:00Z",
      "out_date": null
    }
  ]
}
```

---

### `GET /equipments/{equipment_id}`

**Propósito:** Obtener ficha técnica completa de un equipo (útil para escaneo QR).

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`, `technician`, `requestor`.

#### Parámetros de URL

| Parámetro      | Tipo   | Descripción             |
|----------------|--------|-------------------------|
| `equipment_id` | string | UUID del equipo (PK)    |

#### Response — `200 OK`

Misma estructura que `POST /equipments/`.

---

### `PUT /equipments/{equipment_id}`

**Propósito:** Editar datos generales de un equipo (código, tipo, marca, modelo, especificaciones).

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "inventory_code": "EQ-2026-001-UPD",
  "brand": "HP",
  "model": "EliteBook 840"
}
```

Todos los campos son opcionales. Solo se actualizan los enviados.

#### Response — `200 OK`

Misma estructura que `POST /equipments/`.

---

### `PATCH /equipments/{equipment_id}/location`

**Propósito:** Transferir un equipo a otro departamento.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "department_id": "uuid-nuevo-departamento"
}
```

#### Response — `200 OK`

Misma estructura que `POST /equipments/`.

---

### `PATCH /equipments/{equipment_id}/status`

**Propósito:** Cambiar el estado operativo del equipo.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`, `technician`.

#### Request Body

```json
{
  "status": "En Mantenimiento"
}
```

| Campo    | Tipo   | Obligatorio | Descripción                                           |
|----------|--------|-------------|-------------------------------------------------------|
| `status` | string | Sí          | Uno de: `Operativo`, `En Mantenimiento`, `Dañado`, `Desincorporado` |

#### Response — `200 OK`

Misma estructura que `POST /equipments/`.

---

### `DELETE /equipments/{equipment_id}`

**Propósito:** Desincorporar un equipo (borrado lógico). Establece `out_date` y cambia estado a `Desincorporado`.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Response — `200 OK`

```json
{
  "detail": "Equipo desincorporado exitosamente."
}
```

#### Errores Comunes

| Código | Cuerpo                                                    | Causa                          |
|--------|-----------------------------------------------------------|--------------------------------|
| 400    | `{"detail": "Estado inválido..."}`                        | Status no permitido            |
| 404    | `{"detail": "Equipo no encontrado."}`                     | UUID inválido                  |
| 409    | `{"detail": "Ya existe un equipo con ese código..."}`     | Código de inventario duplicado |

---

## 5. Tickets

### `POST /tickets/`

**Propósito:** Crear un ticket de incidencia (formulario simplificado para solicitantes). Creado automáticamente en estado `Abierto`.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado.

#### Request Body

```json
{
  "title": "PC no enciende",
  "description": "La computadora del escritorio 3 no responde al botón de encendido",
  "priority": "Alta",
  "category": "Hardware",
  "department_id": "uuid-del-departamento",
  "equipment_id": "uuid-del-equipo"
}
```

| Campo                    | Tipo   | Obligatorio | Default  | Descripción                     |
|--------------------------|--------|-------------|----------|---------------------------------|
| `title`        | string | Sí          | —        | Título breve del problema       |
| `description`  | string | No          | `null`   | Descripción detallada           |
| `priority`     | string | No          | `"Media"` | `Baja`, `Media`, `Alta`, `Crítica` |
| `category`     | string | No          | `null`   | Categoría (ej. Hardware, Software) |
| `department_id`| string | No          | `null`   | UUID del departamento asociado  |
| `equipment_id` | string | No          | `null`   | UUID del equipo asociado        |

#### Response — `201 Created`

```json
{
  "id": "uuid-del-ticket",
  "title": "PC no enciende",
  "description": "La computadora del escritorio 3 no responde al botón de encendido",
  "priority": "Alta",
  "status": "Abierto",
  "category": "Hardware",
  "requester_id": "uuid-del-solicitante",
  "assigned_technician_id": null,
  "department_id": "uuid-del-departamento",
  "equipment_id": "uuid-del-equipo",
  "opened_at": "2026-05-25T12:00:00Z",
  "closed_at": null,
  "rated": false
}
```

---

### `GET /tickets/`

**Propósito:** Listar tickets. Los solicitantes (`requestor`) solo ven sus propios tickets. Administradores y técnicos ven todos. Respuesta paginada.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado (con filtro por rol).

#### Query Parameters

| Parámetro      | Tipo   | Obligatorio | Default | Descripción                              |
|----------------|--------|-------------|---------|------------------------------------------|
| `limit`        | int    | No          | `10`    | Registros por página (1-100)             |
| `offset`       | int    | No          | `0`     | Desplazamiento desde el inicio           |
| `status`       | string | No          | —       | Filtrar por estado                       |
| `category`     | string | No          | —       | Filtrar por categoría                    |
| `date_from`    | string | No          | —       | Fecha ISO (ej. `2026-01-01`)             |
| `date_to`      | string | No          | —       | Fecha ISO (ej. `2026-06-01`)             |
| `search`       | string | No          | —       | Búsqueda parcial en título/descripción   |
| `equipment_id` | string | No          | —       | UUID del equipo                          |

#### Response — `200 OK`

```json
{
  "total": 34,
  "limit": 10,
  "offset": 0,
  "items": [
    {
      "id": "uuid-ticket-1",
      "title": "PC no enciende",
      "description": "...",
      "priority": "Alta",
      "status": "Asignado",
      "category": "Hardware",
      "requester_id": "uuid",
      "assigned_technician_id": "uuid-tecnico",
      "department_id": "uuid-depto",
      "equipment_id": "uuid-equipo",
      "opened_at": "2026-05-25T12:00:00Z",
      "closed_at": null,
      "rated": false,
      "requester_name": "Juan Pérez",
      "assigned_to_name": "Carlos López"
    }
  ]
}
```

---

### `GET /tickets/{ticket_id}`

**Propósito:** Obtener detalle de un ticket. Con control de acceso por rol (solicitante solo ve los suyos).

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado.

---

### `PATCH /tickets/{ticket_id}/cancel`

**Propósito:** Anular un ticket. Solo permitido cuando el estado actual es `Abierto` o `Asignado`. Solo el solicitante (`requestor`) que creó el ticket puede anularlo. Cambia el estado a `Anulado` y registra el motivo en el historial con una notificación para el técnico/admin.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `requestor` (solo tickets propios).

#### Request Body

```json
{
  "reason": "El problema se resolvió internamente"
}
```

| Campo    | Tipo   | Obligatorio | Descripción                |
|----------|--------|-------------|----------------------------|
| `reason` | string | Sí          | Motivo de la anulación     |

#### Response — `200 OK`

Misma estructura que `POST /tickets/`, con `status: "Anulado"`.

---

### `GET /tickets/{ticket_id}/history`

**Propósito:** Obtener el historial de cambios de un ticket (línea de tiempo). Control de acceso por rol.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado.

#### Response — `200 OK`

```json
{
  "items": [
    {
      "id": "uuid-history",
      "ticket_id": "uuid-ticket",
      "previous_status": "Abierto",
      "new_status": "Asignado",
      "technical_action": "assign_ticket",
      "technical_comment": null,
      "reason": null,
      "change_date": "2026-05-25T12:30:00Z"
    }
  ]
}
```

| Campo              | Tipo    | Descripción                     |
|--------------------|---------|---------------------------------|
| `previous_status`  | string  | Estado anterior (opcional)      |
| `new_status`       | string  | Estado nuevo (opcional)         |
| `technical_action` | string  | Acción técnica realizada        |
| `technical_comment`| string  | Comentario técnico              |
| `reason`           | string  | Motivo (usado en anulación)     |
| `change_date`      | string  | Timestamp ISO                   |

---

### `POST /tickets/{ticket_id}/rate`

**Propósito:** Calificar la resolución de un ticket. Solo el solicitante puede calificar. Una sola calificación por ticket (controlado por `unique(ticket_id)` en DB). El `user_id` se almacena internamente para trazabilidad del admin, pero se omite en la respuesta para mantener la percepción de anonimato.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `requestor` (solo tickets propios).

#### Request Body

```json
{
  "rating": 4,
  "comment": "Buena atención, rápido"
}
```

| Campo     | Tipo   | Obligatorio | Descripción      |
|-----------|--------|-------------|------------------|
| `rating`  | int    | Sí          | 1–5 estrellas    |
| `comment` | string | No          | Comentario libre |

#### Response — `200 OK`

```json
{
  "id": "uuid-rating",
  "ticket_id": "uuid-ticket",
  "rating": 4,
  "comment": "Buena atención, rápido",
  "created_at": "2026-05-25T14:30:00Z"
}
```

---

### `GET /tickets/{ticket_id}/rating`

**Propósito:** Obtener la calificación de un ticket (si existe). Acceso para cualquier usuario autenticado con acceso al ticket.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado con acceso al ticket.

#### Response — `200 OK` (si existe)

```json
{
  "id": "uuid-rating",
  "ticket_id": "uuid-ticket",
  "rating": 4,
  "comment": "Buena atención, rápido",
  "created_at": "2026-05-25T14:30:00Z"
}
```

#### Response — `404` (si no existe calificación)

```json
{
  "detail": "No hay calificación para este ticket."
}

---

### `PATCH /tickets/{ticket_id}/assign`

**Propósito:** Asignar un ticket a un técnico. Cambia el estado a `Asignado`.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Request Body

```json
{
  "technician_id": "uuid-del-tecnico"
}
```

| Campo           | Tipo   | Obligatorio | Descripción                  |
|-----------------|--------|-------------|------------------------------|
| `technician_id` | string | Sí          | UUID del usuario con rol `technician` o `admin` |

#### Response — `200 OK`

Misma estructura que `POST /tickets/`, con `status: "Asignado"` y `assigned_technician_id` poblado.

---

### `PATCH /tickets/{ticket_id}/status`

**Propósito:** Cambiar el estado de un ticket durante el flujo de trabajo. Transiciones permitidas: `Asignado → En Proceso`, `En Proceso → Pendiente`, `Pendiente → En Proceso`.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`, `technician`.

#### Request Body

```json
{
  "status": "En Proceso"
}
```

| Campo    | Tipo   | Obligatorio | Descripción                           |
|----------|--------|-------------|---------------------------------------|
| `status` | string | Sí          | Solo `"En Proceso"` o `"Pendiente"`  |

#### Response — `200 OK`

Misma estructura que `POST /tickets/`, con el `status` actualizado.

---

### `POST /tickets/{ticket_id}/resolve`

**Propósito:** Formulario técnico de resolución. Cambia el estado a `Resuelto`, establece `closed_at` y opcionalmente actualiza el estado del equipo vinculado. **Es la operación de cierre definitiva del ticket.**

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`, `technician`.

#### Request Body

```json
{
  "technical_notes": "Se reemplazó la fuente de poder",
  "equipment_status": "Operativo",
  "spare_parts_used": "Fuente de poder ATX 600W"
}
```

| Campo              | Tipo   | Obligatorio | Descripción                                   |
|--------------------|--------|-------------|-----------------------------------------------|
| `technical_notes`  | string | Sí          | Notas técnicas de la resolución               |
| `equipment_status` | string | Sí          | Estado final del equipo (`Operativo`, `Dañado`, etc.) |
| `spare_parts_used` | string | No          | Repuestos utilizados en la reparación         |

**Comportamiento especial:** Si el ticket tiene un `equipment_id` asociado, el estado del equipo se actualiza según `equipment_status`.

#### Response — `200 OK`

```json
{
  "id": "uuid-del-ticket",
  "title": "PC no enciende",
  "status": "Resuelto",
  "closed_at": "2026-05-25T14:00:00Z",
  ...
}
```

#### Errores Comunes

| Código | Cuerpo                                                    | Causa                              |
|--------|-----------------------------------------------------------|------------------------------------|
| 400    | `{"detail": "Transición de estado no permitida..."}`      | Status inválido en PATCH status    |
| 404    | `{"detail": "Ticket no encontrado."}`                     | UUID inválido                      |
| 404    | `{"detail": "Técnico no encontrado o no válido."}`        | `technician_id` inválido en assign |

#### Diagrama de Flujo de Estados

```
Abierto ──[asignar]──→ Asignado ──[status]──→ En Proceso
  │                                                │
  │ ──[cancel]──→ Anulado                          ├──[status]──→ Pendiente
  │                                                ││
  └──[cancel]──→ Anulado                           │└──[status]──→ En Proceso
                                                   │
                                                   └──[resolver]──→ Resuelto ──→ Cerrado
```

---

## 6. Notificaciones

### `GET /notifications/`

**Propósito:** Listar notificaciones del usuario autenticado. Ordenadas por fecha de creación descendente. Las notificaciones con `read_at = null` se consideran no leídas.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado (solo sus propias notificaciones).

#### Query Parameters

| Parámetro | Tipo | Obligatorio | Default | Descripción |
|-----------|------|-------------|---------|-------------|
| `limit`   | int  | No          | `10`    | Registros por página (1-100) |
| `offset`  | int  | No          | `0`     | Desplazamiento desde el inicio |

#### Response — `200 OK`

```json
{
  "total": 5,
  "limit": 10,
  "offset": 0,
  "items": [
    {
      "id": "uuid-notif",
      "user_id": "uuid-usuario",
      "ticket_id": "uuid-ticket",
      "message": "Tu ticket #a1b2c3d4 ha sido resuelto. ¡Califica la atención!",
      "read_at": null,
      "created_at": "2026-05-25T14:00:00Z"
    }
  ]
}
```

| Campo       | Tipo   | Descripción                              |
|-------------|--------|------------------------------------------|
| `id`        | string | UUID de la notificación                  |
| `user_id`   | string | UUID del usuario destinatario            |
| `ticket_id` | string | UUID del ticket relacionado              |
| `message`   | string | Texto de la notificación                 |
| `read_at`   | string | `null` si no leída, timestamp ISO si leída |
| `created_at`| string | Timestamp ISO de creación                |

---

### `PATCH /notifications/{notification_id}/read`

**Propósito:** Marcar una notificación como leída. Establece `read_at` al momento actual. Solo el usuario propietario de la notificación puede marcarla como leída.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Cualquier usuario autenticado (solo sus propias notificaciones).

#### Parámetros de URL

| Parámetro        | Tipo   | Descripción                     |
|------------------|--------|---------------------------------|
| `notification_id`| string | UUID de la notificación (PK)    |

#### Response — `200 OK`

```json
{
  "ok": true,
  "id": "uuid-notif"
}
```

#### Errores

| Código | Causa                              |
|--------|------------------------------------|
| 404    | Notificación no encontrada         |
| 403    | La notificación pertenece a otro usuario |

---

## 7. Auditoría

### `GET /admin/audit-logs`

**Propósito:** Visor cronológico de auditoría. Consulta paginada y filtrable de todos los eventos registrados en `audit_logs`. Solo lectura.

**Nivel de Acceso:** `Authorization: Bearer <JWT>` — Rol: `admin`.

#### Query Parameters

| Parámetro       | Tipo   | Obligatorio | Default | Descripción                                        |
|-----------------|--------|-------------|---------|----------------------------------------------------|
| `limit`         | int    | No          | `10`    | Registros por página (1-100)                       |
| `offset`        | int    | No          | `0`     | Desplazamiento desde el inicio                     |
| `start_date`    | string | No          | —       | Filtro ISO 8601 (ej. `2026-01-01` o `2026-01-01T00:00:00Z`) |
| `end_date`      | string | No          | —       | Filtro ISO 8601                                    |
| `username_query`| string | No          | —       | Búsqueda parcial (ILIKE) sobre nombre completo del usuario |
| `action_filter` | string | No          | —       | Filtrar por acción exacta (ej. `CREATE_USER`, `DELETE_DEPARTMENT`, `resolve_ticket`) |

#### Response — `200 OK`

```json
{
  "total": 150,
  "limit": 10,
  "offset": 0,
  "items": [
    {
      "id": "uuid-del-log",
      "user_id": "uuid-del-admin",
      "user_full_name": "Ana Martínez",
      "user_username": "amartinez",
      "action": "CREATE_USER",
      "affected_table": "users",
      "record_id": "uuid-del-usuario-afectado",
      "details": {
        "user_id": "uuid",
        "username": "nuevo_usuario",
        "role": "technician"
      },
      "timestamp": "2026-05-25T12:00:00Z"
    },
    {
      "id": "uuid-del-log-2",
      "user_id": "uuid-del-tecnico",
      "user_full_name": "Carlos López",
      "user_username": "clopez",
      "action": "resolve_ticket",
      "affected_table": "tickets",
      "record_id": "uuid-del-ticket",
      "details": {
        "ticket_id": "uuid",
        "title": "PC no enciende",
        "status": "Resuelto",
        "previous_status": "En Proceso",
        "new_status": "Resuelto",
        "spare_parts_used": "Fuente de poder ATX 600W"
      },
      "timestamp": "2026-05-25T14:00:00Z"
    }
  ]
}
```

| Campo           | Tipo   | Descripción                              |
|-----------------|--------|------------------------------------------|
| `total`         | int    | Total de registros (sin paginación)      |
| `limit`         | int    | Registros solicitados por página         |
| `offset`        | int    | Desplazamiento aplicado                  |
| `items`         | array  | Lista de registros de auditoría          |

#### Errores Comunes

| Código | Cuerpo                                                    | Causa                              |
|--------|-----------------------------------------------------------|------------------------------------|
| 400    | `{"detail": "Formato de start_date inválido..."}`         | Fecha en formato incorrecto        |
| 400    | `{"detail": "El límite debe ser mayor o igual a 1."}`     | `limit` < 1                        |
| 400    | `{"detail": "El offset debe ser mayor o igual a 0."}`     | `offset` < 0                       |

---

## Apéndice: Códigos de Error Globales

| Código | Significado                    | Acción del Frontend                  |
|--------|--------------------------------|--------------------------------------|
| 401    | No autenticado                 | Redirigir al login                   |
| 403    | No autorizado (rol incorrecto) | Mostrar mensaje "Acceso denegado"    |
| 404    | Recurso no encontrado          | Mostrar mensaje "No encontrado"      |
| 409    | Conflicto (duplicado)          | Mostrar mensaje del `detail`         |
| 422    | Error de validación            | Mostrar errores de campos en el formulario |
| 500    | Error interno del servidor     | Mostrar mensaje genérico de error    |

---

## Apéndice: Mapa de UUIDs (Relaciones)

| Modelo            | PK         | FK                                    |
|-------------------|------------|---------------------------------------|
| Users             | `id`       | `department_id` → Departments          |
| Departments       | `id`       | —                                     |
| Equipment         | `id`       | `department_id` → Departments          |
| Tickets           | `id`       | `requester_id` → Users, `assigned_technician_id` → Users, `department_id` → Departments, `equipment_id` → Equipment |
| TicketHistory     | `id`       | `ticket_id` → Tickets                 |
| TicketRating      | `id`       | `ticket_id` → Tickets, `user_id` → Users |
| NotificationRead  | `id`       | `user_id` → Users, `ticket_id` → Tickets |
| AuditLog          | `id`       | `user_id` → Users                     |
