# 🌦️ Klowdi - Weather App with Enterprise Infrastructure

![Klowdi Screenshot](https://i.ibb.co/kQkVsGr/files-2083263-1735252761431-image.png)  
*A React/TypeScript weather app demonstrating dual-platform deployment and enterprise CI/CD*

---

## 🚀 Live Deployments

- **Production (Railway)**: [klowdi.com](https://klowdi.com) - Rapid iteration platform
- **Enterprise (AWS ECS)**: `18.119.166.112:3000` - Full infrastructure deployment

---

## ✨ Technical Features  
✔ **React 18** with TypeScript and Vite  
✔ **Express.js** backend server  
✔ **Tailwind CSS** for responsive design  
✔ **Docker containerization** with multi-stage builds  
✔ **Dual-platform deployment** strategy  
✔ **Enterprise CI/CD pipeline** with Jenkins  

---

## 🏗️ Infrastructure & Deployment

### AWS Infrastructure
- **ECS Cluster**: `klowdi-cluster` with Fargate containers
- **ECR Repository**: Private container registry
- **VPC**: Custom networking with public/private subnets
- **Security Groups**: Configured for HTTP traffic (port 3000)
- **Region**: us-east-2 (Ohio)

### CI/CD Pipeline
- **Jenkins**: Automated build and deployment
- **GitHub Integration**: Webhook-triggered builds
- **Docker**: Multi-platform builds (ARM64 → x86_64)
- **AWS CLI**: Automated ECS deployments

### Pipeline Stages
1. **Checkout** - Pull from GitHub repository
2. **Build React App** - Compile TypeScript/React with Vite
3. **Build Docker Image** - Multi-stage containerization
4. **ECR Login** - Authenticate with AWS container registry
5. **Push to ECR** - Upload container image
6. **Deploy to ECS** - Update service with new image
7. **Verify Deployment** - Health check validation

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- Docker
- AWS CLI (for deployment)

### Setup
```bash
# Clone repository
git clone https://github.com/your-username/klowdi.git
cd klowdi

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Docker
```bash
# Build image
docker build -t klowdi .

# Run container
docker run -p 3000:3000 klowdi

# Multi-platform build (for AWS deployment)
docker buildx build --platform linux/amd64 -t klowdi .
```

---

## 📁 Project Structure

```
klowdi/
├── src/                    # React/TypeScript source
├── public/                 # Static assets
├── server.js              # Express backend
├── Dockerfile             # Container configuration
├── Jenkinsfile           # CI/CD pipeline
├── task-definition.json  # ECS task configuration
└── package.json          # Dependencies
```

---

## 🌍 Deployment Strategy

This project demonstrates a **dual-platform deployment** approach:

### Railway (Development/Staging)
- **Purpose**: Rapid iteration and testing
- **Benefits**: Zero-config deployment, automatic SSL, Git integration
- **URL**: [klowdi.com](https://klowdi.com)

### AWS ECS (Production/Enterprise)
- **Purpose**: Enterprise-grade infrastructure
- **Benefits**: Auto-scaling, load balancing, monitoring, security
- **Architecture**: VPC + ECS Fargate + ECR + Jenkins CI/CD

---

## 🔧 Technical Highlights

### Containerization
- **Multi-stage builds** for optimized image size
- **Platform compatibility** handling (ARM64 → x86_64)
- **Production-ready** Express server configuration

### Infrastructure as Code
- **ECS Task Definitions** for container orchestration
- **VPC Configuration** with proper security groups
- **Automated deployments** via Jenkins pipeline

### Monitoring & Observability
- **ECS CloudWatch** integration
- **Container health checks**
- **Deployment verification** in CI/CD

---

## 🏆 Key Achievements

✅ **Dual-Platform Strategy**: Railway for speed + AWS for scale  
✅ **Full CI/CD Pipeline**: Automated builds, tests, and deployments  
✅ **Container Orchestration**: ECS Fargate with auto-scaling  
✅ **Security Best Practices**: VPC, security groups, private ECR  
✅ **Platform Compatibility**: ARM64 to x86_64 cross-compilation  
✅ **Infrastructure Automation**: Jenkins pipeline with AWS integration  

---

## 📊 Architecture Overview

```
GitHub → Jenkins → Docker Build → ECR → ECS → Load Balancer → Users
    ↓                                               ↑
Railway ←————————————————————————————————————————————
```

This setup showcases both **startup agility** (Railway) and **enterprise infrastructure** (AWS), demonstrating versatility in deployment strategies and technical depth in cloud architecture.

---

## 🤝 About

Built to demonstrate comprehensive full-stack development skills, from frontend React development to enterprise infrastructure deployment. This project showcases practical experience with:

- Modern web development (React, TypeScript, Vite)
- Containerization and orchestration (Docker, ECS)
- CI/CD automation (Jenkins, GitHub integration)
- Cloud infrastructure (AWS VPC, ECR, ECS)
- Dual-platform deployment strategies
