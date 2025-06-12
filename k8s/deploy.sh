#!/bin/bash
# AstraLearn Kubernetes Deployment Script
# Phase 6: Production deployment automation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENVIRONMENT="${1:-production}"
ACTION="${2:-deploy}"
NAMESPACE=""
DOMAIN=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    # Check if yq is installed for YAML processing
    if ! command -v yq &> /dev/null; then
        print_warning "yq is not installed. Installing via snap..."
        sudo snap install yq
    fi
    
    print_success "Prerequisites check completed"
}

# Function to load environment configuration
load_environment_config() {
    print_status "Loading environment configuration for: $ENVIRONMENT"
    
    if [[ ! -f "$SCRIPT_DIR/environments.yaml" ]]; then
        print_error "Environment configuration file not found: $SCRIPT_DIR/environments.yaml"
        exit 1
    fi
    
    # Extract environment-specific values
    NAMESPACE=$(yq eval ".environments.$ENVIRONMENT.namespace" "$SCRIPT_DIR/environments.yaml")
    DOMAIN=$(yq eval ".environments.$ENVIRONMENT.domain" "$SCRIPT_DIR/environments.yaml")
    
    if [[ "$NAMESPACE" == "null" || "$DOMAIN" == "null" ]]; then
        print_error "Invalid environment: $ENVIRONMENT"
        exit 1
    fi
    
    print_success "Environment configuration loaded - Namespace: $NAMESPACE, Domain: $DOMAIN"
}

# Function to create namespace
create_namespace() {
    print_status "Creating namespace: $NAMESPACE"
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_warning "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f "$SCRIPT_DIR/namespace.yaml"
        print_success "Namespace created successfully"
    fi
}

# Function to create secrets
create_secrets() {
    print_status "Creating secrets..."
    
    # Check if secrets file exists
    if [[ ! -f "$SCRIPT_DIR/secrets/$ENVIRONMENT-secrets.yaml" ]]; then
        print_warning "Secrets file not found: $SCRIPT_DIR/secrets/$ENVIRONMENT-secrets.yaml"
        print_status "Creating template secrets file..."
        
        # Create secrets directory if it doesn't exist
        mkdir -p "$SCRIPT_DIR/secrets"
        
        # Generate template secrets file
        cat > "$SCRIPT_DIR/secrets/$ENVIRONMENT-secrets.yaml" << EOF
apiVersion: v1
kind: Secret
metadata:
  name: astralearn-secrets
  namespace: $NAMESPACE
type: Opaque
data:
  jwt-secret: $(echo -n "$(openssl rand -base64 32)" | base64 -w 0)
  session-secret: $(echo -n "$(openssl rand -base64 32)" | base64 -w 0)
  openai-api-key: $(echo -n "REPLACE_WITH_ACTUAL_OPENAI_KEY" | base64 -w 0)
  db-password: $(echo -n "$(openssl rand -base64 16)" | base64 -w 0)
  redis-password: $(echo -n "$(openssl rand -base64 16)" | base64 -w 0)
---
apiVersion: v1
kind: Secret
metadata:
  name: grafana-secrets
  namespace: astralearn-monitoring
type: Opaque
data:
  admin-password: $(echo -n "$(openssl rand -base64 16)" | base64 -w 0)
  db-password: $(echo -n "$(openssl rand -base64 16)" | base64 -w 0)
  secret-key: $(echo -n "$(openssl rand -base64 32)" | base64 -w 0)
EOF
        
        print_warning "Please update the secrets file with actual values: $SCRIPT_DIR/secrets/$ENVIRONMENT-secrets.yaml"
        print_warning "Then run the script again."
        exit 1
    fi
    
    kubectl apply -f "$SCRIPT_DIR/secrets/$ENVIRONMENT-secrets.yaml"
    print_success "Secrets created successfully"
}

# Function to deploy ConfigMaps
deploy_configmaps() {
    print_status "Deploying ConfigMaps..."
    kubectl apply -f "$SCRIPT_DIR/configmaps-secrets.yaml"
    print_success "ConfigMaps deployed successfully"
}

# Function to deploy databases
deploy_databases() {
    print_status "Deploying databases..."
    kubectl apply -f "$SCRIPT_DIR/database-deployment.yaml"
    
    # Wait for databases to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgresql -n "$NAMESPACE" --timeout=300s
    
    print_status "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s
    
    print_success "Databases deployed successfully"
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend..."
    kubectl apply -f "$SCRIPT_DIR/backend-deployment.yaml"
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    kubectl wait --for=condition=ready pod -l app=astralearn-backend -n "$NAMESPACE" --timeout=300s
    
    print_success "Backend deployed successfully"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    kubectl apply -f "$SCRIPT_DIR/frontend-deployment.yaml"
    
    # Wait for frontend to be ready
    print_status "Waiting for frontend to be ready..."
    kubectl wait --for=condition=ready pod -l app=astralearn-frontend -n "$NAMESPACE" --timeout=300s
    
    print_success "Frontend deployed successfully"
}

# Function to deploy monitoring
deploy_monitoring() {
    local monitoring_enabled
    monitoring_enabled=$(yq eval ".environments.$ENVIRONMENT.monitoring.enabled" "$SCRIPT_DIR/environments.yaml")
    
    if [[ "$monitoring_enabled" == "true" ]]; then
        print_status "Deploying monitoring stack..."
        
        # Create monitoring namespace if it doesn't exist
        if ! kubectl get namespace astralearn-monitoring &> /dev/null; then
            kubectl create namespace astralearn-monitoring
        fi
        
        # Deploy Prometheus
        kubectl apply -f "$SCRIPT_DIR/monitoring-prometheus.yaml"
        
        # Deploy Grafana
        kubectl apply -f "$SCRIPT_DIR/monitoring-grafana.yaml"
        
        # Deploy Loki
        kubectl apply -f "$SCRIPT_DIR/monitoring-loki.yaml"
        
        print_success "Monitoring stack deployed successfully"
    else
        print_warning "Monitoring is disabled for environment: $ENVIRONMENT"
    fi
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    local health_check_failed=false
    
    # Check backend health
    if ! kubectl exec -n "$NAMESPACE" deploy/astralearn-backend -- curl -f http://localhost:3001/api/health &> /dev/null; then
        print_error "Backend health check failed"
        health_check_failed=true
    else
        print_success "Backend health check passed"
    fi
    
    # Check frontend health
    if ! kubectl exec -n "$NAMESPACE" deploy/astralearn-frontend -- curl -f http://localhost/health &> /dev/null; then
        print_error "Frontend health check failed"
        health_check_failed=true
    else
        print_success "Frontend health check passed"
    fi
    
    # Check database connectivity
    if ! kubectl exec -n "$NAMESPACE" deploy/postgresql -- pg_isready -U astralearn &> /dev/null; then
        print_error "PostgreSQL health check failed"
        health_check_failed=true
    else
        print_success "PostgreSQL health check passed"
    fi
    
    # Check Redis connectivity
    if ! kubectl exec -n "$NAMESPACE" deploy/redis -- redis-cli ping &> /dev/null; then
        print_error "Redis health check failed"
        health_check_failed=true
    else
        print_success "Redis health check passed"
    fi
    
    if [[ "$health_check_failed" == "true" ]]; then
        print_error "Some health checks failed. Please investigate."
        exit 1
    fi
    
    print_success "All health checks passed"
}

# Function to display deployment status
display_status() {
    print_status "Deployment Status for $ENVIRONMENT environment:"
    echo ""
    
    # Display pods
    echo "Pods:"
    kubectl get pods -n "$NAMESPACE" -o wide
    echo ""
    
    # Display services
    echo "Services:"
    kubectl get services -n "$NAMESPACE"
    echo ""
    
    # Display ingress
    echo "Ingress:"
    kubectl get ingress -n "$NAMESPACE"
    echo ""
    
    # Display persistent volumes
    echo "Persistent Volumes:"
    kubectl get pvc -n "$NAMESPACE"
    echo ""
    
    # Display external access information
    local external_ip
    external_ip=$(kubectl get service astralearn-frontend-service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending")
    
    print_success "Deployment completed successfully!"
    echo ""
    echo "Access Information:"
    echo "  External IP: $external_ip"
    echo "  Domain: https://$DOMAIN"
    echo "  Namespace: $NAMESPACE"
    echo ""
    echo "Monitoring (if enabled):"
    echo "  Grafana: http://grafana.$DOMAIN"
    echo "  Prometheus: http://prometheus.$DOMAIN"
    echo ""
}

# Function to clean up deployment
cleanup_deployment() {
    print_status "Cleaning up deployment for environment: $ENVIRONMENT"
    
    read -p "Are you sure you want to delete the deployment? This action cannot be undone. (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleanup cancelled"
        exit 0
    fi
    
    # Delete application resources
    kubectl delete -f "$SCRIPT_DIR/frontend-deployment.yaml" --ignore-not-found=true
    kubectl delete -f "$SCRIPT_DIR/backend-deployment.yaml" --ignore-not-found=true
    kubectl delete -f "$SCRIPT_DIR/database-deployment.yaml" --ignore-not-found=true
    kubectl delete -f "$SCRIPT_DIR/configmaps-secrets.yaml" --ignore-not-found=true
    
    # Delete monitoring resources
    kubectl delete -f "$SCRIPT_DIR/monitoring-loki.yaml" --ignore-not-found=true
    kubectl delete -f "$SCRIPT_DIR/monitoring-grafana.yaml" --ignore-not-found=true
    kubectl delete -f "$SCRIPT_DIR/monitoring-prometheus.yaml" --ignore-not-found=true
    
    # Delete secrets
    kubectl delete -f "$SCRIPT_DIR/secrets/$ENVIRONMENT-secrets.yaml" --ignore-not-found=true
    
    # Delete namespace
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    kubectl delete namespace astralearn-monitoring --ignore-not-found=true
    
    print_success "Cleanup completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <environment> <action>"
    echo ""
    echo "Environments:"
    echo "  production  - Production environment"
    echo "  staging     - Staging environment"
    echo "  development - Development environment"
    echo ""
    echo "Actions:"
    echo "  deploy      - Deploy the application (default)"
    echo "  status      - Show deployment status"
    echo "  health      - Run health checks"
    echo "  cleanup     - Clean up deployment"
    echo ""
    echo "Examples:"
    echo "  $0 production deploy"
    echo "  $0 staging status"
    echo "  $0 development cleanup"
}

# Main deployment function
main() {
    case "$ACTION" in
        "deploy")
            check_prerequisites
            load_environment_config
            create_namespace
            create_secrets
            deploy_configmaps
            deploy_databases
            deploy_backend
            deploy_frontend
            deploy_monitoring
            run_health_checks
            display_status
            ;;
        "status")
            load_environment_config
            display_status
            ;;
        "health")
            load_environment_config
            run_health_checks
            ;;
        "cleanup")
            load_environment_config
            cleanup_deployment
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Validate arguments
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "development" ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    show_usage
    exit 1
fi

# Run main function
main
