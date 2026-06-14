# 🏥 Patient Management System

A real-world Patient Management System built with Docker Compose, deployed on AWS EC2.

## Tech Stack
- **Frontend/Backend:** Node.js + Express + EJS
- **Database:** PostgreSQL 15
- **DB Admin:** pgAdmin 4
- **Containerization:** Docker Compose
- **Cloud:** AWS EC2 (Amazon Linux)

## Services
| Service | Port | Description |
|---|---|---|
| Patient App | 3000 | Main web application |
| PostgreSQL | 5432 | Database |
| pgAdmin | 5050 | Database admin UI |

## Features
- Add / View / Delete patients
- Track vitals (BP, HR, Temperature)
- Admit / Discharge / Mark Critical
- Search patients by name or diagnosis
- Persistent database with Docker volumes
- Real-time stats dashboard

## Quick Start
\`\`\`bash
git clone https://github.com/desbain/patient-management-system
cd patient-management-system
docker compose up -d --build
open http://localhost:3000
\`\`\`

## Author
George Awa — DevSecOps Engineer | RN
GitHub: https://github.com/desbain
