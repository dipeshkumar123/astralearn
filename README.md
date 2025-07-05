# AstraLearn

## 🚀 Project Overview
AstraLearn is a next-generation, AI-powered social learning platform designed to foster collaborative, adaptive, and gamified education. It integrates advanced analytics, real-time collaboration, and community-driven features to enhance the learning experience for students, educators, and institutions.

Key features include:
- Adaptive learning paths and personalized recommendations
- Social learning: study groups, buddies, forums, and live sessions
- Gamification: points, achievements, leaderboards, and challenges
- Real-time analytics and performance tracking
- Scalable, production-ready cloud-native architecture

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Nginx Ingress                              │
└─────────────────┬───────────────────┬───────────────────────┘
                  │                   │
┌─────────────────▼───────────────────▼───────────────────────┐
│           Frontend Pods          │      Backend Pods       │
│         (React + Nginx)          │    (Node.js + Express)  │
└─────────────────┬───────────────────┬───────────────────────┘
                  │                   │
┌─────────────────▼───────────────────▼───────────────────────┐
│            PostgreSQL            │         Redis           │
│           (Primary DB)           │       (Cache/Sessions)  │
└──────────────────────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Monitoring Stack                         │
│  Prometheus | Grafana | Loki | Promtail | AlertManager    │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (for k8s deployment)
- [Helm](https://helm.sh/) (for Helm-based deployment)

### Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-org/astralearn.git
   cd astralearn
   ```
2. **Start with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
   - Frontend: http://localhost:5173 or http://localhost:3000
   - Backend API: http://localhost:3001

3. **(Optional) Run locally without Docker:**
   - Install dependencies:
     ```sh
     cd client && npm install
     cd ../server && npm install
     ```
   - Start frontend:
     ```sh
     cd ../client && npm run dev
     ```
   - Start backend:
     ```sh
     cd ../server && npm run dev
     ```

### Production Deployment (Kubernetes)
See `k8s/README.md` for full details. Basic steps:
1. Set up your Kubernetes cluster (v1.25+ recommended).
2. Install Helm and required CRDs (e.g., cert-manager).
3. Deploy with Helm:
   ```sh
   cd k8s
   helm install astralearn . -f values.yaml
   ```

---

## 🤝 Contribution Guide

We welcome contributions! To get started:
1. Fork the repository and create a new branch for your feature or bugfix.
2. Follow the existing code style and add clear comments.
3. Write tests for new features or bugfixes.
4. Submit a pull request with a clear description of your changes.

**Development tips:**
- Use descriptive commit messages.
- Keep PRs focused and small.
- For major changes, open an issue first to discuss your proposal.
- See `CONTRIBUTING.md` (if available) for more details.

---

## 📫 Contact
- **Project Lead:** Dipesh Kumar Panjiyar (panjiyardipesh123@gmail.com)
- **Issues & Support:** Please use the [GitHub Issues](https://github.com/dipeshkumar123/astralearn/issues) page for bug reports and feature requests.
- **General Inquiries:** panjiyardipesh123@gmail.com

---

## Test Data

Test/demo JSON files have been moved into the `data/` directory:
- `data/test-login.json`
- `data/test-progress.json`

© 2025 AstraLearn. All rights reserved.
