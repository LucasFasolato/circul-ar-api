# 🏗️ CirculAR API

API backend desarrollada con **NestJS + TypeORM + PostgreSQL**, destinada a gestionar usuarios, publicaciones (items), imágenes y sistema de favoritos.
Incluye autenticación JWT, manejo seguro de archivos con Multer y validaciones robustas vía `class-validator`.

---

## 🚀 Tecnologías principales

| Módulo                 | Tecnología                          |
| ---------------------- | ----------------------------------- |
| **Framework**          | NestJS (TypeScript)                 |
| **ORM**                | TypeORM                             |
| **Base de datos**      | PostgreSQL                          |
| **Autenticación**      | JWT + bcrypt                        |
| **Subida de archivos** | Multer (almacenamiento local)       |
| **Validaciones**       | class-validator / class-transformer |
| **Entorno**            | dotenv                              |
| **Servidor**           | Express (por Nest)                  |

---

## 📂 Estructura de carpetas

```
src/
 ┣ app.module.ts
 ┣ main.ts
 ┣ auth/
 ┃ ┣ auth.controller.ts
 ┃ ┣ auth.service.ts
 ┃ ┣ jwt.strategy.ts
 ┃ ┣ jwt-auth.guard.ts
 ┃ ┣ jwt-optional.guard.ts
 ┃ ┣ auth.types.ts
 ┃ ┗ auth.module.ts
 ┣ users/
 ┃ ┣ entities/user.entity.ts
 ┃ ┣ users.service.ts
 ┃ ┗ users.module.ts
 ┣ items/
 ┃ ┣ entities/item.entity.ts
 ┃ ┣ entities/item-image.entity.ts
 ┃ ┣ dto/create-item.dto.ts
 ┃ ┣ dto/update-item.dto.ts
 ┃ ┣ dto/query-items.dto.ts
 ┃ ┣ items.service.ts
 ┃ ┣ items.controller.ts
 ┃ ┗ items.module.ts
 ┣ favorites/
 ┃ ┣ entities/favorite.entity.ts
 ┃ ┣ favorites.service.ts
 ┃ ┣ favorites.controller.ts
 ┃ ┗ favorites.module.ts
 ┗ database/
    ┗ data-source.ts
```

---

## ⚙️ Configuración inicial

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tuusuario/circular-api.git
   cd circular-api
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   Crear un archivo `.env` en la raíz:

   ```env
   PORT=**
   DATABASE_URL=**
   JWT_SECRET=**
   JWT_EXPIRES_IN=**
   BASE_URL=**
   ```

4. **Levantar la base de datos**
   (Ejemplo con Docker)

   ```bash
   docker run --name pg-circular -e POSTGRES_PASSWORD=1234 -p 5432:5432 -d postgres
   ```

5. **Ejecutar el proyecto**

   ```bash
   npm run start:dev
   ```

---

## 🧩 Módulos implementados

### 1️⃣ Auth (`/auth`)

| Método | Endpoint         | Descripción                                                 |
| ------ | ---------------- | ----------------------------------------------------------- |
| `POST` | `/auth/register` | Registra un nuevo usuario                                   |
| `POST` | `/auth/login`    | Inicia sesión y devuelve `access_token`                     |
| `GET`  | `/auth/me`       | Devuelve los datos del usuario autenticado (requiere token) |

**Ejemplo de registro**

```json
{
  "name": "Lucas",
  "email": "lucas@test.com",
  "password": "123456"
}
```

**Respuesta**

```json
{
  "access_token": "eyJhbGciOiJIUzI1..."
}
```

---

### 2️⃣ Items (`/items`)

| Método   | Endpoint            | Descripción                            |
| -------- | ------------------- | -------------------------------------- |
| `GET`    | `/items`            | Lista items (con filtros y paginación) |
| `GET`    | `/items/:id`        | Obtiene un item por ID                 |
| `POST`   | `/items`            | Crea un item (requiere token)          |
| `PATCH`  | `/items/:id`        | Actualiza un item (requiere token)     |
| `DELETE` | `/items/:id`        | Elimina un item (requiere token)       |
| `POST`   | `/items/:id/images` | Sube imágenes al item (requiere token) |
| `GET`    | `/items/:id/images` | Lista imágenes de un item              |

**Campos del item**

```json
{
  "title": "Remera oversize",
  "price": 18000,
  "category": "ropa",
  "condition": "usado",
  "description": "Casi nueva, talle M"
}
```

**Respuesta**

```json
{
  "id": "70bab8e7-de44-4243-b9bd-09534ed78626",
  "title": "Remera oversize",
  "price": 18000,
  "category": "ropa",
  "condition": "usado",
  "ownerId": "45f344e3-2c9a-49a9-be0d-b5110a128325",
  "images": [
    {
      "url": "http://localhost:3000/uploads/63057aea6c70f1ff1bd26cb3acee7844.jpg"
    }
  ],
  "createdAt": "2025-10-30T14:30:24.355Z"
}
```

📎 Las imágenes se guardan en `/uploads` y son accesibles desde el navegador.

---

### 3️⃣ Favoritos (`/favorites`)

| Método   | Endpoint             | Descripción                           |
| -------- | -------------------- | ------------------------------------- |
| `POST`   | `/favorites/:itemId` | Marca un item como favorito           |
| `DELETE` | `/favorites/:itemId` | Quita el favorito                     |
| `GET`    | `/favorites/me`      | Lista mis favoritos                   |
| `GET`    | `/favorites/:itemId` | Consulta si un item está en favoritos |

**Respuesta típica**

```json
{
  "itemId": "70bab8e7-de44-4243-b9bd-09534ed78626",
  "favorite": true
}
```

Además, los endpoints de items (`/items` y `/items/:id`) incluyen un campo calculado:

```json
"favorite": true
```

cuando el usuario autenticado tiene ese item marcado.

---

## 🔐 Seguridad y buenas prácticas

* Autenticación con JWT.
* Passwords cifradas con bcrypt.
* Validaciones globales con `ValidationPipe`.
* CORS habilitado para el front.
* Uploads limitados a 5 MB por archivo.
* Whitelist de ordenamiento para prevenir SQL Injection.

---

## 🧠 Próximos pasos (plan a seguir)

* [ ] Agregar paginación avanzada en favoritos.
* [ ] Permitir múltiples imágenes por ítem con eliminación individual.
* [ ] Endpoint `/users/:id/items` para listar los items de un usuario.
* [ ] Filtros combinados (rango de precio + búsqueda por texto + categoría).
* [ ] Implementar refresh token (JWT dual).
* [ ] Integrar con front (React / Next.js).

---

## 👨‍💻 Autor

**Lucas Fasolato**
Desarrollador Backend / Estudiante de Ingeniería en Sistemas
📍 Rosario, Argentina
💼 Proyecto académico y personal 2025

