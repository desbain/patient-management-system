# 🏥 Patient Management System

A production-grade Patient Management System built with a **true microservices architecture** using Docker Compose, deployed on AWS EC2.

## 🏗️ Architecture┌─────────────────────────────────────────────────────┐

│                Docker Compose Stack                 │

│                                                     │

│  ┌──────────────┐         ┌──────────────┐         │

│  │ patient_app  │────────▶│ auth_service │         │

│  │ Node.js:3000 │  JWT    │ Node.js:4000 │         │

│  │              │  verify │              │         │

│  │ - Dashboard  │         │ - Login      │         │

│  │ - Patient    │         │ - Register   │         │

│  │   CRUD       │         │ - JWT tokens │         │

│  │ - Vitals     │         │ - RBAC       │         │

│  │ - Search     │         │              │         │

│  └──────┬───────┘         └──────┬───────┘         │

│         │                        │                  │

│         └───────────┬────────────┘                  │

│                     ▼                               │

│             ┌──────────────┐                        │

│             │  patient_db  │                        │

│             │ Postgres:5432│                        │

│             │              │                        │

│             │ - patients   │                        │

│             │ - users      │                        │

│             └──────────────┘                        │

│                                                     │

│             ┌──────────────┐                        │

│             │   pgadmin    │                        │

│             │     :5050    │                        │

│             └──────────────┘                        │

└─────────────────────────────────────────────────────┘
## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Patient Service | Node.js + Express + EJS |
| Auth Service | Node.js + Express + JWT |
| Database | PostgreSQL 15 |
| DB Admin UI | pgAdmin 4 |
| Containerization | Docker + Docker Compose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Cloud | AWS EC2 (Amazon Linux) |
| Version Control | Git + GitHub |

## 📦 Microservices

| Service | Container | Port | Responsibility |
|---|---|---|---|
| Patient App | patient_app | 3000 | Patient CRUD, Dashboard, Views |
| Auth Service | auth_service | 4000 | Login, Register, JWT tokens |
| Database | patient_db | 5432 | PostgreSQL data persistence |
| DB Admin | pgadmin | 5050 | Database management UI |

## ✨ Features

### Patient Management
- Add / View / Update / Delete patient records
- Track vitals (Blood Pressure, Heart Rate, Temperature)
- Admit / Discharge / Mark Critical status
- Search patients by name or diagnosis
- Real-time stats dashboard (Total, Admitted, Critical, Discharged)
- Audit trail — tracks which user added each patient

### Authentication & Security
- User registration with role selection
- Secure login with bcrypt password hashing
- JWT token issuance (8hr expiry — one nursing shift)
- HttpOnly cookies (XSS protection)
- Protected routes — all patient data requires authentication
- Token verification via auth microservice

### Role Based Access Control (RBAC)
| Permission | Nurse | Doctor | Admin |
|---|---|---|---|
| View patients | ✅ | ✅ | ✅ |
| Add patients | ✅ | ✅ | ✅ |
| Discharge patient | ✅ | ✅ | ✅ |
| Mark critical | ✅ | ✅ | ✅ |
| Delete patient | ❌ | ❌ | ✅ |

## 🔐 How JWT Authentication Works
## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Patient Service | Node.js + Express + EJS |
| Auth Service | Node.js + Express + JWT |
| Database | PostgreSQL 15 |
| DB Admin UI | pgAdmin 4 |
| Containerization | Docker + Docker Compose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Cloud | AWS EC2 (Amazon Linux) |
| Version Control | Git + GitHub |

## 📦 Microservices

| Service | Container | Port | Responsibility |
|---|---|---|---|
| Patient App | patient_app | 3000 | Patient CRUD, Dashboard, Views |
| Auth Service | auth_service | 4000 | Login, Register, JWT tokens |
| Database | patient_db | 5432 | PostgreSQL data persistence |
| DB Admin | pgadmin | 5050 | Database management UI |

## ✨ Features

### Patient Management
- Add / View / Update / Delete patient records
- Track vitals (Blood Pressure, Heart Rate, Temperature)
- Admit / Discharge / Mark Critical status
- Search patients by name or diagnosis
- Real-time stats dashboard (Total, Admitted, Critical, Discharged)
- Audit trail — tracks which user added each patient

### Authentication & Security
- User registration with role selection
- Secure login with bcrypt password hashing
- JWT token issuance (8hr expiry — one nursing shift)
- HttpOnly cookies (XSS protection)
- Protected routes — all patient data requires authentication
- Token verification via auth microservice

### Role Based Access Control (RBAC)
| Permission | Nurse | Doctor | Admin |
|---|---|---|---|
| View patients | ✅ | ✅ | ✅ |
| Add patients | ✅ | ✅ | ✅ |
| Discharge patient | ✅ | ✅ | ✅ |
| Mark critical | ✅ | ✅ | ✅ |
| Delete patient | ❌ | ❌ | ✅ |

## 🔐 How JWT Authentication WorksUser logs in → patient_app calls auth_service
Auth_service verifies password with bcrypt
Auth_service issues signed JWT token
Token stored in HttpOnly browser cookie
Every protected request → patient_app sends

token to auth_service for verification
Auth_service verifies mathematically (no DB needed)
Valid token → access granted with user role
Invalid/expired token → redirect to login


## 🚀 Quick Start

### Prerequisites
- Docker
- Docker Compose

### Run Locally
\`\`\`bash
git clone https://github.com/desbain/patient-management-system
cd patient-management-system
docker compose up -d --build
\`\`\`

### Access
- Patient App → http://localhost:3000
- pgAdmin → http://localhost:5050

### Default Admin Login
\`\`\`
Username: admin
Password: Admin@1234
\`\`\`

### Register Users
Navigate to http://localhost:3000/register to create:
- Nurse accounts
- Doctor accounts
- Admin accounts

## 📁 Project Structure

\`\`\`
patient-management-system/
├── app/                         ← Patient Microservice
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js                ← Express routes & DB logic
│   ├── middleware/
│   │   └── auth.js              ← JWT verification middleware
│   ├── views/
│   │   ├── index.ejs            ← Dashboard
│   │   ├── add.ejs              ← Add patient form
│   │   ├── patient.ejs          ← Patient detail view
│   │   ├── login.ejs            ← Login page
│   │   └── register.ejs         ← Register page
│   └── public/css/
│       └── style.css            ← Application styles
├── auth/                        ← Auth Microservice
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                ← JWT login/register/verify
└── docker-compose.yml           ← Orchestrates all 4 services
\`\`\`

## 🔧 Docker Commands

\`\`\`bash
# Start all services
docker compose up -d --build

# Check running containers
docker compose ps

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f app
docker compose logs -f auth

# Stop all services
docker compose down

# Stop and wipe database
docker compose down -v

# Restart single service
docker compose restart app
\`\`\`

## 🧪 Test Auth Service API Directly

\`\`\`bash
# Health check
curl http://localhost:4000/health

# Login and get JWT token
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234"}'

# Verify a token
curl -X POST http://localhost:4000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_JWT_TOKEN_HERE"}'

# Register new user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Jane Doe","username":"nurse2","password":"Nurse@1234","role":"nurse"}'
\`\`\`

## ☁️ AWS Deployment

Deployed on AWS EC2 (Amazon Linux) with the following security group rules:

| Port | Service | Access |
|---|---|---|
| 22 | SSH | Your IP only |
| 3000 | Patient App | 0.0.0.0/0 |
| 5050 | pgAdmin | 0.0.0.0/0 |
| 5432 | PostgreSQL | Your IP only |

## 💡 What I Learned

- Docker containerization and image building
- Docker Compose multi-container orchestration
- Microservices vs monolithic architecture
- JWT authentication and stateless auth
- Role-based access control (RBAC)
- Service-to-service communication
- PostgreSQL with persistent Docker volumes
- AWS EC2 deployment and security groups
- Healthcare domain — patient data management
- Git version control and GitHub workflow

## 👨‍💻 Author

**George Awa**
DevSecOps Engineer 
- GitHub: https://github.com/desbain
- Website: https://desbain.com

> This project bridges my dual background in healthcare and cloud engineering,
> demonstrating how modern DevSecOps practices apply to real-world healthcare systems.
