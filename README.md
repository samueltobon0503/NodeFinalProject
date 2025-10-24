# Aliestres API

![Aliestres Logo](./docs/aliestres_logo.jpg)

---

## Overview

**Aliestres API** is an e-commerce platform developed under a Hexagonal Architecture, designed to maintain a modular, scalable, and easily maintainable codebase.
It provides complete functionality for managing users, products, carts, orders, addresses, authentication, and more.

The system includes:

- Role-based control and authentication with JWT
- Email verification
- Automatic email notifications
- Scheduled tasks (cron jobs) for system maintenance
- Unit testing with Jest
- Password encryption using bcryptjs
- MongoDB Atlas as a cloud database
---

## Project Members

| Nombre             | Role / Main Contribution |
|--------------------|------------------------|
| **Samuel Tobon**   | Backend, autenticación y servicios |
| **Nicolás Restrepo** | Modelado de base de datos y controladores |
| **Jhoel Torres**   | Lógica de negocio y cron jobs |

---

## Project Architecture

The project follows the Hexagonal Architecture (Ports & Adapters) pattern, dividing responsibilities into layers:

- **Domain**: Business logic, models, services, and domain rules.
- **Application**: Controllers and validations.
- **Infrastructure**: External integrations (JWT, nodemailer, database, etc.).
- **Tests**: Unit coverage for controllers and services.

---

## Technologies and Libraries

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB Atlas**
- **bcryptjs** 
- **jsonwebtoken** 
- **nodemailer** 
- **node-cron** 
- **rxjs** 
- **jest** 

---

## Installation and Execution

```bash
# Clone the repository
git clone https://github.com/<usuario>/alietres-api.git
cd alietres-api

# Install dependencies
npm install

# Run 
npm start

#Run tests
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