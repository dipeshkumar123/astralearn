# 🚀 AstraLearn Kubernetes Deployment Guide
## Phase 6: Production Deployment Documentation

### 📋 Overview

This directory contains comprehensive Kubernetes manifests and deployment configurations for AstraLearn's production-ready deployment. The setup includes advanced features like auto-scaling, monitoring, logging, security policies, and SSL certificate management.

### 🏗️ Architecture

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

### 📁 File Structure

```
k8s/
├── namespace.yaml                 # Namespace definitions
├── configmaps-secrets.yaml       # Configuration and secrets
├── backend-deployment.yaml       # Backend service deployment
├── frontend-deployment.yaml      # Frontend service deployment
├── database-deployment.yaml      # PostgreSQL and Redis
├── monitoring-prometheus.yaml    # Prometheus setup
├── monitoring-grafana.yaml       # Grafana dashboards
├── monitoring-loki.yaml          # Logging stack
├── ssl-certificates.yaml         # SSL/TLS configuration
├── network-security.yaml         # Network policies and security
├── environments.yaml             # Environment-specific configs
├── values.yaml                   # Helm chart values
├── deploy.sh                     # Deployment automation script
└── README.md                     # This file
```

### 🔧 Prerequisites

#### Required Tools
- `kubectl` (v1.25+)
- `helm` (v3.10+)
- `yq` (v4.0+)
- `openssl` (for generating secrets)

#### Kubernetes Cluster Requirements
- Kubernetes v1.25 or higher
- At least 3 worker nodes (for production)
- Storage class with SSD support (`fast-ssd`)
- Ingress controller (nginx-ingress recommended)
- cert-manager for SSL certificates

#### Minimum Resource Requirements
- **Production**: 16 CPU cores, 32GB RAM, 200GB storage
- **Staging**: 8 CPU cores, 16GB RAM, 100GB storage
- **Development**: 4 CPU cores, 8GB RAM, 50GB storage

### 🚀 Quick Start

#### 1. Clone and Navigate
```bash
git clone <repository-url>
cd AstraLearn/k8s
```

#### 2. Install Prerequisites
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Install nginx-ingress
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx
```

#### 3. Configure Secrets
```bash
# Copy the template and edit with actual values
cp secrets/production-secrets.yaml.template secrets/production-secrets.yaml
# Edit the file with actual base64-encoded secrets
```

#### 4. Deploy to Production
```bash
./deploy.sh production deploy
```

#### 5. Verify Deployment
```bash
./deploy.sh production status
./deploy.sh production health
```

### 🌍 Environment Management

#### Available Environments
- **production**: Full production setup with HA, monitoring, and security
- **staging**: Staging environment for testing
- **development**: Lightweight setup for development

#### Environment-Specific Deployment
```bash
# Deploy to staging
./deploy.sh staging deploy

# Deploy to development
./deploy.sh development deploy

# Check status of any environment
./deploy.sh <environment> status

# Run health checks
./deploy.sh <environment> health

# Clean up environment
./deploy.sh <environment> cleanup
```

### 🔐 Security Features

#### Network Security
- **Network Policies**: Restrict inter-pod communication
- **Pod Security Policies**: Enforce security standards
- **RBAC**: Role-based access control
- **SSL/TLS**: Automated certificate management

#### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management with Redis
- API rate limiting

#### Data Protection
- Encrypted data at rest
- Secure inter-service communication
- Regular security scanning
- Compliance with OWASP standards

### 📊 Monitoring & Observability

#### Metrics (Prometheus)
- Application performance metrics
- Infrastructure resource usage
- Custom business metrics
- Alert rules for anomalies

#### Logs (Loki + Promtail)
- Centralized log aggregation
- Structured logging
- Log-based alerting
- 2-week retention by default

#### Dashboards (Grafana)
- System overview dashboard
- Learning analytics dashboard
- Performance monitoring
- Real-time alerts

#### Access Monitoring Tools
```bash
# Port forward to access Grafana
kubectl port-forward -n astralearn-monitoring svc/grafana-service 3000:3000

# Port forward to access Prometheus
kubectl port-forward -n astralearn-monitoring svc/prometheus-service 9090:9090
```

### 🔄 Auto-scaling Configuration

#### Horizontal Pod Autoscaler (HPA)
- **Backend**: 3-10 replicas based on CPU (70%) and Memory (80%)
- **Frontend**: 2-5 replicas based on CPU usage
- **Scaling Policies**: Gradual scale-up/down for stability

#### Vertical Pod Autoscaler (VPA)
- Automatic resource recommendation
- Resource optimization based on actual usage
- Cost optimization

### 💾 Storage Management

#### Persistent Volumes
- **PostgreSQL**: 50GB SSD storage with automatic backups
- **Redis**: 10GB SSD storage for cache persistence
- **Monitoring**: 75GB total for metrics and logs retention

#### Backup Strategy
- **Database**: Daily automated backups with 30-day retention
- **Application Data**: Incremental backups
- **Configuration**: Git-based version control

### 🔧 Configuration Management

#### ConfigMaps
- Application configuration
- Feature flags
- Environment-specific settings
- Third-party service configurations

#### Secrets Management
- Database credentials
- API keys (Groq, etc.)
- SSL certificates
- Session secrets

### 🚨 Alerting & Incident Response

#### Alert Categories
- **Critical**: Service down, high error rates
- **Warning**: High resource usage, performance degradation
- **Info**: Deployment events, scaling events

#### Alert Channels
- Email notifications
- Slack integration
- PagerDuty for critical alerts
- Webhook integrations

### 📈 Performance Optimization

#### Caching Strategy
- Redis for session and application cache
- CDN for static assets (configurable)
- Database query optimization
- API response caching

#### Resource Optimization
- Resource requests and limits tuning
- Node affinity and anti-affinity rules
- Horizontal and vertical pod autoscaling
- Storage class optimization

### 🔄 Deployment Strategies

#### Rolling Updates
- Zero-downtime deployments
- Automatic rollback on failure
- Health check validation
- Gradual traffic shifting

#### Blue-Green Deployment
- Full environment switching
- Risk-free deployments
- Instant rollback capability
- Traffic validation

### 🐛 Troubleshooting

#### Common Issues

**Pod Startup Failures**
```bash
# Check pod status
kubectl get pods -n astralearn

# View pod logs
kubectl logs -n astralearn <pod-name>

# Describe pod for events
kubectl describe pod -n astralearn <pod-name>
```

**Database Connection Issues**
```bash
# Check database pod
kubectl exec -n astralearn deploy/postgresql -- pg_isready

# Check connection from backend
kubectl exec -n astralearn deploy/astralearn-backend -- nc -zv postgresql-service 5432
```

**SSL Certificate Issues**
```bash
# Check certificate status
kubectl get certificates -n astralearn

# Check cert-manager logs
kubectl logs -n cert-manager deploy/cert-manager
```

**Monitoring Issues**
```bash
# Check Prometheus targets
kubectl port-forward -n astralearn-monitoring svc/prometheus-service 9090:9090
# Visit http://localhost:9090/targets

# Check Grafana datasources
kubectl port-forward -n astralearn-monitoring svc/grafana-service 3000:3000
# Visit http://localhost:3000
```

### 🛠️ Helm & ArgoCD Usage

- **Helm**: This deployment supports Helm for templating and managing releases. Use the provided `values.yaml` and environment-specific values files for customization.
  - Example: `helm install astralearn . -f values.yaml`
- **ArgoCD**: (If used) You can deploy and manage AstraLearn using ArgoCD for GitOps workflows. Point ArgoCD to this directory or your forked repository.
  - Example: Set up an ArgoCD Application with the `k8s/` directory as the source.
- See the main project README and CI/CD workflow for automation examples.

### ⚠️ Cluster Requirements (Summary)
- Kubernetes v1.25+ (tested up to v1.29)
- 3+ worker nodes (production), SSD-backed storage class (e.g., `fast-ssd`)
- NGINX Ingress Controller, cert-manager, and (optionally) ArgoCD/Helm
- Sufficient CPU/RAM as detailed above

### 🐛 Helm/ArgoCD Troubleshooting

**Helm Issues**
```bash
# Check Helm release status
helm list -A
helm status <release-name> -n <namespace>

# Debug failed install/upgrade
helm install ... --debug --dry-run
```

**ArgoCD Issues**
```bash
# Check ArgoCD application status
argocd app list
argocd app get <app-name>

# View sync and health status
argocd app sync <app-name>
argocd app health <app-name>
```

- Ensure all CRDs (cert-manager, ingress, etc.) are installed before deploying with Helm or ArgoCD.
- For secret management, use Sealed Secrets or External Secrets Operator for production (see CONTRIBUTING.md).

### 🔄 Maintenance Procedures

#### Regular Maintenance
- Weekly security updates
- Monthly dependency updates
- Quarterly disaster recovery testing
- Annual security audits

#### Database Maintenance
```bash
# Create manual backup
kubectl exec -n astralearn deploy/postgresql -- pg_dump -U astralearn astralearn_prod > backup.sql

# Check database performance
kubectl exec -n astralearn deploy/postgresql -- psql -U astralearn -c "SELECT * FROM pg_stat_activity;"
```

#### Log Rotation
```bash
# Check log storage usage
kubectl exec -n astralearn-monitoring deploy/loki -- df -h

# Force log cleanup if needed
kubectl exec -n astralearn-monitoring deploy/loki -- find /loki -name "*.gz" -mtime +14 -delete
```

### 📋 Health Checks

#### Application Health
- `/api/health` - Backend health endpoint
- `/health` - Frontend health endpoint
- `/api/ready` - Backend readiness endpoint

#### Infrastructure Health
- Node resource utilization
- Pod restart frequency
- Network connectivity
- Storage availability

### 🚀 Scaling Guidelines

#### When to Scale Up
- CPU utilization > 70% for 5+ minutes
- Memory utilization > 80% for 5+ minutes
- Response time > 2 seconds (95th percentile)
- Error rate > 1%

#### When to Scale Down
- CPU utilization < 30% for 15+ minutes
- Memory utilization < 50% for 15+ minutes
- Low traffic periods
- Cost optimization requirements

### 📞 Support & Contact

For deployment issues or questions:
- **Technical Support**: Create GitHub issue
- **Emergency Contact**: Use configured alert channels
- **Documentation**: Check inline comments in YAML files
- **Updates**: Monitor repository for latest changes

### 📄 License

This deployment configuration is part of the AstraLearn project and follows the same licensing terms.

---

**Last Updated**: Phase 6 Implementation - June 2025
**Version**: 2.0.0
**Environment**: Production Ready
