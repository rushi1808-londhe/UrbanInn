# 🏨 UrbanInn — Multi-Tenant Hotel Management SaaS

> A production-ready full-stack Hotel Management platform built with **Spring Boot 4.0** and **React.js 18**, featuring role-based dashboards, real-time kitchen order queue, automated bill generation and guest self-service portal.
---

## ✨ Features

- 🏢 **Multi-tenant architecture** — one platform serves multiple hotels with isolated data
- 👥 **5 role-based dashboards** — SuperAdmin, Hotel Admin, Receptionist, Kitchen Staff, Guest
- 🍽️ **Real-time food ordering** — complete pipeline from order to delivery with kitchen queue
- 🧾 **Automated bill generation** — room charges + food orders aggregated on checkout
- 📱 **Guest self-service portal** — phone + room number login, food ordering, service requests
- 🔐 **JWT authentication** — secure stateless auth with role-based access control
- 🛎️ **Service request workflow** — Pending → In Progress → Completed lifecycle
- 💰 **Revenue analytics** — daily, weekly, monthly revenue for hotel admin

---

## 👤 User Roles

| Role | Key Features |
|---|---|
| **Super Admin** | Create hotels, manage all staff across properties |
| **Hotel Admin** | Manage rooms, menu items, view revenue analytics |
| **Receptionist** | Check-in/out guests, manage services, view bills |
| **Kitchen Staff** | View order queue, update order status |
| **Guest** | Order food, request room services, track orders |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17, Spring Boot 4.0, Spring Security, JWT |
| **Frontend** | React.js 18, Bootstrap 5, Axios, Zustand |
| **Database** | MySQL 9.5, Hibernate ORM, JPA |
| **Tools** | Maven, Git, Postman, Eclipse |
| **Deployment** | Render (backend), Netlify (frontend) |

---

## 📁 Project Structure

```
UrbanInn/
├── urbaninn-backend/
│   └── src/main/java/com/rushikesh/
│       ├── controller/     # 7 REST Controllers
│       ├── service/        # 6 Business Logic Services
│       ├── repository/     # 9 JPA Repositories
│       ├── entity/         # 9 JPA Entities
│       ├── dto/            # 20+ Request/Response DTOs
│       ├── security/       # JWT + Spring Security
│       └── config/         # App configuration
│
└── urbaninn-frontend/
    └── src/
        ├── pages/
        │   ├── auth/           # Login pages
        │   ├── superadmin/     # SuperAdmin dashboard
        │   ├── admin/          # Hotel Admin dashboard
        │   ├── receptionist/   # Receptionist pages
        │   ├── kitchen/        # Kitchen Staff pages
        │   └── guest/          # Guest portal
        ├── layouts/        # StaffLayout, GuestLayout
        ├── api/            # Axios configuration
        └── store/          # Zustand auth store
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

### Backend Setup

```bash
cd UrbanInn/urbaninn-backend

# Configure MySQL in application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/urban_inn
spring.datasource.username=root
spring.datasource.password=yourpassword

# Run the application
mvn spring-boot:run
```
Backend starts at: `http://localhost:8080`

### Frontend Setup

```bash
cd UrbanInn/urbaninn-frontend
npm install
npm start
```
Frontend starts at: `http://localhost:3000`

### Default Login
```
Email:    superadmin@urbaninn.com
Password: password123
```

---

## 🔄 Status Flows

```
Order:   PLACED → CONFIRMED → PREPARING → READY → DELIVERED
Service: PENDING → IN_PROGRESS → COMPLETED
Room:    AVAILABLE → OCCUPIED → CLEANING → AVAILABLE
```

---

## 📊 Project Stats

| Metric | Count |
|---|---|
| REST API Endpoints | 50+ |
| Database Tables | 9 |
| Frontend Pages | 15 |
| User Roles | 5 |

---

## 👨‍💻 Author

**Rushikesh Londhe**


⭐ **If you found this project helpful, please give it a star!** ⭐
