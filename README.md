# 🏥 Patient Management System

A production-grade Patient Management System built with a **true microservices architecture** using Docker Compose, deployed on AWS EC2 and available via Docker Hub.

## 🐳 Quick Start (No Code Needed!)

Pull and run directly from Docker Hub:

```bash
curl -O https://raw.githubusercontent.com/desbain/patient-management-system/main/docker-compose.yml
docker compose up -d
```

Open http://localhost:3000
Username: admin

Password: Admin@1234
## 🏗️ Architecture
┌─────────────────────────────────────────────────────┐

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
## 🐳 Docker Hub Images

| Image | Docker Hub | Description |
|---|---|---|
| Patient App | gewa11281/patient-app:latest | Node.js patient service |
| Auth Service | gewa11281/auth-service:latest | JWT authentication service |

Pull images directly:
```bash
docker pull gewa11281/patient-app:latest
docker pull gewa11281/auth-service:latest
```

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
| Registry | Docker Hub |
| Version Control | Git + GitHub |

## 📦 Microservices

| Service | Container | Port | Image | Responsibility |
|---|---|---|---|---|
| Patient App | patient_app | 3000 | gewa11281/patient-app | Patient CRUD, Dashboard |
| Auth Service | auth_service | 4000 | gewa11281/auth-service | Login, Register, JWT |
| Database | patient_db | 5432 | postgres:15-alpine | Data persistence |
| DB Admin | pgadmin | 5050 | dpage/pgadmin4 | Database UI |

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
- Stateless authentication — no database needed to verify tokens

### Role Based Access Control (RBAC)
| Permission | Nurse | Doctor | Admin |
|---|---|---|---|
| View patients | ✅ | ✅ | ✅ |
| Add patients | ✅ | ✅ | ✅ |
| Discharge patient | ✅ | ✅ | ✅ |
| Mark critical | ✅ | ✅ | ✅ |
| Delete patient | ❌ | ❌ | ✅ |

## 🔐 How JWT Authentication Works
User logs in → patient_app calls auth_service
Auth_service verifies password with bcrypt
Auth_service issues signed JWT token (8hr expiry)
Token stored in HttpOnly browser cookie
Every protected request → patient_app sends

token to auth_service for verification
Auth_service verifies mathematically (no DB needed)
Valid token → access granted with user role
Invalid/expired token → redirect to login
## 🚀 Deployment Options

### Option 1 — Docker Hub (Recommended)
No code needed — just the compose file:
```bash
mkdir patient-system && cd patient-system

cat > docker-compose.yml << 'COMPOSE'
services:
  auth:
    image: gewa11281/auth-service:latest
    container_name: auth_service
    ports:
      - "4000:4000"
    environment:
      DB_HOST: db
      DB_USER: admin
      DB_PASSWORD: secret123
      DB_NAME: patientdb
      JWT_SECRET: superSecretJWT2024PatientSystem
    depends_on:
      - db
    restart: always

  app:
    image: gewa11281/patient-app:latest
    container_name: patient_app
    ports:
      - "3000:3000"
    environment:
      DB_HOST: db
      DB_USER: admin
      DB_PASSWORD: secret123
      DB_NAME: patientdb
      AUTH_SERVICE_URL: http://auth:4000
    depends_on:
      - db
      - auth
    restart: always

  db:
    image: postgres:15-alpine
    container_name: patient_db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret123
      POSTGRES_DB: patientdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  pgadmin:
    image: dpage/pgadmin4
    container_name: pgadmin
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    depends_on:
      - db
    restart: always

volumes:
  pgdata:
COMPOSE

docker compose up -d
```

### Option 2 — Build From Source
```bash
git clone https://github.com/desbain/patient-management-system
cd patient-management-system
docker compose up -d --build
```

## 📁 Project Structure

patient-management-system/

├── app/                         ← Patient Microservice :3000

│   ├── Dockerfile

│   ├── package.json

│   ├── server.js                ← Express routes & DB logic

│   ├── middleware/

│   │   └── auth.js              ← JWT verification via auth service

│   ├── views/

│   │   ├── index.ejs            ← Dashboard

│   │   ├── add.ejs              ← Add patient form

│   │   ├── patient.ejs          ← Patient detail view

│   │   ├── login.ejs            ← Login page

│   │   └── register.ejs         ← Register page

│   └── public/css/

│       └── style.css

├── auth/                        ← Auth Microservice :4000

│   ├── Dockerfile

│   ├── package.json

│   └── server.js                ← JWT login/register/verify

└── docker-compose.yml           ← Orchestrates all 4 services
## 🔧 Docker Commands

```bash
# Start all services
docker compose up -d

# Start and rebuild
docker compose up -d --build

# Check running containers
docker compose ps

# View all logs
docker compose logs -f

# View specific service
docker compose logs -f app
docker compose logs -f auth

# Stop all services
docker compose down

# Stop and wipe database
docker compose down -v

# Restart single service
docker compose restart app
```

## 🧪 Test Auth API Directly

```bash
# Health check
curl http://localhost:4000/health

# Login — returns JWT token
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@1234"}'

# Verify token
curl -X POST http://localhost:4000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_JWT_TOKEN"}'

# Register new user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Jane Doe","username":"nurse2","password":"Nurse@1234","role":"nurse"}'

# Get all users
curl http://localhost:4000/auth/users
```

## ☁️ AWS Deployment

Deployed on AWS EC2 (Amazon Linux) with security group rules:

| Port | Service | Access |
|---|---|---|
| 22 | SSH | Your IP only |
| 3000 | Patient App | 0.0.0.0/0 |
| 4000 | Auth Service | 0.0.0.0/0 |
| 5050 | pgAdmin | 0.0.0.0/0 |
| 5432 | PostgreSQL | Your IP only |

## 🔄 Docker Hub Workflow
Code Changes → Build → Tag → Push → Pull Anywhere → Run
Build
docker compose build
Tag
docker tag patient-system-app gewa11281/patient-app:latest

docker tag patient-system-auth gewa11281/auth-service:latest
Push
docker push gewa11281/patient-app:latest

docker push gewa11281/auth-service:latest
Pull and run anywhere
docker compose up -d
## 💡 What I Learned

- Docker containerization and image building
- Docker Compose multi-container orchestration
- Microservices vs monolithic architecture
- JWT authentication and stateless auth
- Role-based access control (RBAC)
- Service-to-service communication
- PostgreSQL with persistent Docker volumes
- Docker Hub image registry
- Pushing and pulling images from registry
- Running same images locally and on cloud
- AWS EC2 deployment and security groups
- Git version control and GitHub workflow
- Healthcare domain patient data management

## 🗺️ Roadmap

- [ ] Kubernetes (EKS) deployment
- [ ] Helm charts
- [ ] CI/CD with GitHub Actions
- [ ] HTTPS with SSL/TLS
- [ ] Terraform infrastructure as code
- [ ] Monitoring with Prometheus & Grafana

## 👨‍💻 Author

**George Awa**
DevSecOps Engineer 
- GitHub: https://github.com/desbain
- Website: https://desbain.com

> This project bridges my dual background in healthcare and cloud engineering,
> demonstrating how modern DevSecOps practices apply to real-world healthcare systems.

## 🔄 GitOps with ArgoCD

ArgoCD watches this GitHub repo and automatically deploys changes to EKS.

### How it works
\`\`\`
git push → ArgoCD detects → Auto deploys to EKS → Zero downtime
\`\`\`

### Access ArgoCD
\`\`\`bash
kubectl port-forward svc/argocd-server -n argocd 8888:443
open https://localhost:8888
\`\`\`

### Deploy ArgoCD Application
\`\`\`bash
kubectl apply -f argocd/application.yaml
\`\`\`

## ☸️ Kubernetes on EKS + Fargate

### Deploy with kubectl
\`\`\`bash
kubectl apply -f k8s/
\`\`\`

### Deploy with Helm
\`\`\`bash
helm install patient-system helm/patient-system --namespace patient-system
\`\`\`

### Useful kubectl commands
\`\`\`bash
kubectl get pods -n patient-system
kubectl get svc -n patient-system
kubectl logs -n patient-system deployment/patient-app
kubectl port-forward -n patient-system svc/patient-service 9090:80
\`\`\`

### Helm commands
\`\`\`bash
helm list -n patient-system
helm history patient-system -n patient-system
helm rollback patient-system 1 -n patient-system
\`\`\`

## ☸️ EKS + Fargate Setup

\`\`\`bash
# Create EKS cluster with Fargate
eksctl create cluster \
  --name patient-cluster \
  --region us-east-2 \
  --fargate \
  --version 1.32

# Update kubeconfig
aws eks update-kubeconfig \
  --name patient-cluster \
  --region us-east-2

# Create namespaces and Fargate profiles
kubectl create namespace patient-system
eksctl create fargateprofile \
  --cluster patient-cluster \
  --region us-east-2 \
  --name fp-patient-system \
  --namespace patient-system
\`\`\`

## 🔁 ArgoCD Installation on EKS

\`\`\`bash
# Create namespace and Fargate profile
kubectl create namespace argocd
eksctl create fargateprofile \
  --cluster patient-cluster \
  --region us-east-2 \
  --name fp-argocd \
  --namespace argocd

# Install ArgoCD
kubectl apply -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get admin password
kubectl get secret argocd-initial-admin-secret \
  -n argocd \
  -o jsonpath="{.data.password}" | base64 -d

# Access UI
kubectl port-forward svc/argocd-server -n argocd 8888:443
# Open https://localhost:8888
\`\`\`

## 💰 Cost Management

\`\`\`bash
# Delete cluster when done to avoid charges
eksctl delete cluster \
  --name patient-cluster \
  --region us-east-2

# Estimated costs while running:
# EKS Control Plane: $0.10/hour
# Fargate pods:      ~$0.10/hour
# NAT Gateway:       ~$0.05/hour
# Total:             ~$0.25/hour
\`\`\`
