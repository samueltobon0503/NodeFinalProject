# Aliestres API

![Aliestres Logo](./docs/aliestres.jpg)

---

## Descripción General

**Aliestres API** es una plataforma de comercio electrónico desarrollada bajo una **arquitectura hexagonal**, orientada a mantener un código modular, escalable y fácil de mantener.  
Provee funcionalidades completas de gestión de usuarios, productos, carritos, pedidos, direcciones, autenticación y más.

El sistema incluye:
- Control de roles y autenticación con **JWT**
- Validación de correos electrónicos
- Envío de notificaciones automáticas por correo
- Tareas programadas (**cron jobs**) para mantenimiento del sistema
- Pruebas unitarias con **Jest**
- Encriptación de contraseñas con **bcryptjs**
- Uso de **MongoDB Atlas** como base de datos en la nube

---

## Integrantes del Proyecto

| Nombre             | Rol / Aporte Principal |
|--------------------|------------------------|
| **Samuel Tobon**   | Backend, autenticación y servicios |
| **Nicolás Restrepo** | Modelado de base de datos y controladores |
| **Jhoel Torres**   | Lógica de negocio y cron jobs |

---

## Arquitectura del Proyecto

El proyecto sigue el patrón **Hexagonal (Ports & Adapters)**, dividiendo las responsabilidades en capas:

- **Domain**: Lógica de negocio, modelos, servicios y reglas de dominio.
- **Application**: Controladores y validaciones.
- **Infrastructure**: Integraciones externas (JWT, nodemailer, base de datos, etc).
- **Tests**: Cobertura unitaria de controladores y servicios.

---

## Tecnologías y Librerías

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB Atlas**
- **bcryptjs** → Encriptación de contraseñas
- **jsonwebtoken** → Manejo de autenticación JWT
- **nodemailer** → Envío de correos
- **node-cron** → Tareas automáticas
- **rxjs** → Flujo reactivo en servicios
- **jest** → Pruebas unitarias

---

## Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/<usuario>/alietres-api.git
cd alietres-api

# Instalar dependencias
npm install

# Crear el archivo de entorno
cp .env.example .env

# Ejecutar en modo desarrollo
npm run start:dev

# Correr pruebas
npm test

|  Method | Route   | Description / Protection                            |
| :-----: | :------ | :-------------------------------------------------- |
| **GET** | `/api/` | Welcome endpoint to verify that the API is running. |


|  Method  | Route                    | Description / Protection                                |
| :------: | :----------------------- | :------------------------------------------------------ |
| **POST** | `/api/auth/login`        | Logs in a user and returns a JWT.                       |
|  **GET** | `/api/auth/verify-email` | Verifies the email confirmation token sent to the user. |


|  Method  | Route                    | Description / Protection                     |
| :------: | :----------------------- | :------------------------------------------- |
|  **GET** | `/api/user`              | 🛡️ Retrieves a list of all users.           |
| **POST** | `/api/user`              | Registers a new user.                        |
|  **PUT** | `/api/user/inactive/:id` | 🛡️ Deactivates (soft deletes) a user by ID. |


|   Method   | Route                     | Description / Protection                              |
| :--------: | :------------------------ | :---------------------------------------------------- |
|  **POST**  | `/api/address`            | 🛡️ Creates a new address for the authenticated user. |
| **DELETE** | `/api/address/delete/:id` | 🛡️ Deletes an address by ID.                         |

|   Method   | Route                     | Description / Protection                    |
| :--------: | :------------------------ | :------------------------------------------ |
|   **GET**  | `/api/product`            | 🛡️ Retrieves all products (client view).   |
|   **GET**  | `/api/product/admin`      | 🛡️ 🔒 Retrieves all products (admin view). |
|  **POST**  | `/api/product`            | 🛡️ 🔒 Creates a new product.               |
| **DELETE** | `/api/product/delete/:id` | 🛡️ 🔒 Soft deletes a product by ID.        |

|   Method   | Route                             | Description / Protection               |
| :--------: | :-------------------------------- | :------------------------------------- |
|   **GET**  | `/api/productCategory`            | 🛡️ Retrieves all product categories.  |
|  **POST**  | `/api/productCategory`            | 🛡️ 🔒 Creates a new product category. |
|   **PUT**  | `/api/productCategory/:id`        | 🛡️ Updates a product category by ID.  |
| **DELETE** | `/api/productCategory/delete/:id` | 🛡️ Deletes a product category by ID.  |

|   Method   | Route                  | Description / Protection                              |
| :--------: | :--------------------- | :---------------------------------------------------- |
|   **GET**  | `/api/cart`            | 🛡️ Retrieves the authenticated user’s shopping cart. |
|  **POST**  | `/api/cart/add`        | 🛡️ Adds a product to the cart.                       |
|   **PUT**  | `/api/cart/update`     | 🛡️ Updates the quantity of a product in the cart.    |
| **DELETE** | `/api/cart/:productId` | 🛡️ Removes a product from the cart.                  |

|  Method  | Route                    | Description / Protection                            |
| :------: | :----------------------- | :-------------------------------------------------- |
|  **GET** | `/api/checkout/confirm`  | 🛡️ Confirms the checkout (likely after payment).   |
| **POST** | `/api/checkout/shipping` | 🛡️ Confirms the shipping information for checkout. |

|   Method  | Route                          | Description / Protection                                       |
| :-------: | :----------------------------- | :------------------------------------------------------------- |
|  **GET**  | `/api/order`                   | 🛡️ Retrieves the authenticated user’s order history.          |
|  **POST** | `/api/order`                   | 🛡️ 📧 Creates a new order (places an order).                  |
|  **GET**  | `/api/order/:orderId/tracking` | 🛡️ Retrieves the tracking status of a specific order.         |
| **PATCH** | `/api/order/:orderId/status`   | 🛡️ Updates an order’s status (e.g., “preparing” → “shipped”). |
|  **PUT**  | `/api/order/inactive/:id`      | 🛡️ Deactivates (soft deletes) an order by ID.                 |

|   Method   | Route                      | Description / Protection      |
| :--------: | :------------------------- | :---------------------------- |
|   **GET**  | `/api/shipment`            | 🛡️ Retrieves all shipments.  |
|  **POST**  | `/api/shipment`            | 🛡️ Assigns a new shipment.   |
| **DELETE** | `/api/shipment/delete/:id` | 🛡️ Deletes a shipment by ID. |

| Symbol | Meaning                                     |
| :----: | :------------------------------------------ |
|   🛡️  | Requires authentication (valid JWT).        |
|   🔒   | Admin-only access.                          |
|   📧   | Sends a confirmation or notification email. |