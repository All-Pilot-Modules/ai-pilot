# Installation Guide

This comprehensive guide covers all installation methods for AI Education Pilot.

## 📋 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 10 GB free space
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 20+ GB free space (SSD recommended)
- **OS**: Latest stable versions

## 🛠️ Prerequisites Installation

### 1. Install Node.js

**macOS** (using Homebrew):
```bash
brew install node
```

**Windows** (using Chocolatey):
```bash
choco install nodejs
```

**Linux** (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:
```bash
node --version  # Should show v18.0.0 or higher
npm --version
```

### 2. Install Python

**macOS**:
```bash
brew install python@3.10
```

**Windows**:
Download from [python.org](https://www.python.org/downloads/) or use Chocolatey:
```bash
choco install python
```

**Linux** (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip
```

Verify installation:
```bash
python3 --version  # Should show 3.10 or higher
pip3 --version
```

### 3. Install PostgreSQL

**macOS**:
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows**:
Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

**Linux** (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create database:
```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE ai_pilot;
CREATE USER ai_pilot_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_pilot TO ai_pilot_user;
\q
```

### 4. Install Git

**macOS**:
```bash
brew install git
```

**Windows**:
Download from [git-scm.com](https://git-scm.com/download/win)

**Linux**:
```bash
sudo apt install git
```

## 🚀 Installation Methods

### Method 1: Standard Installation (Recommended)

#### Step 1: Clone Repository

```bash
git clone https://github.com/All-Pilot-Modules/ai-pilot.git
cd ai-pilot
```

#### Step 2: Backend Setup

```bash
cd Backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 3: Backend Configuration

Create `.env` file in `Backend/` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://ai_pilot_user:your_secure_password@localhost:5432/ai_pilot

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4

# JWT Configuration
SECRET_KEY=your-secret-key-here-use-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=uploads

# RAG Configuration
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_ENVIRONMENT=your-pinecone-env
PINECONE_INDEX_NAME=ai-pilot-docs
```

#### Step 4: Initialize Database

```bash
# Run migrations
alembic upgrade head

# Or manually create tables
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

#### Step 5: Frontend Setup

Open a new terminal:

```bash
cd Frontend

# Install dependencies
npm install

# Or use yarn
yarn install
```

#### Step 6: Frontend Configuration

Create `.env.local` file in `Frontend/` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Application
NEXT_PUBLIC_APP_NAME=AI Education Pilot
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_ENABLE_AI_FEEDBACK=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### Step 7: Start Services

**Backend** (in Backend directory):
```bash
source venv/bin/activate  # If not already activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend** (in Frontend directory):
```bash
npm run dev
# Or
yarn dev
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Method 2: Docker Installation

#### Prerequisites
- Docker Desktop installed
- Docker Compose installed

#### Step 1: Clone Repository

```bash
git clone https://github.com/All-Pilot-Modules/ai-pilot.git
cd ai-pilot
```

#### Step 2: Configure Environment

Create `.env` file in root directory:

```env
# Database
POSTGRES_USER=ai_pilot_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=ai_pilot

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here

# JWT
SECRET_KEY=your-secret-key-here

# App
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Step 3: Build and Run

```bash
docker-compose up --build
```

Access services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

#### Step 4: Stop Services

```bash
docker-compose down
```

### Method 3: Production Deployment

For production deployment, see:
- [Deployment Guide](Deployment)
- [Cloud Deployment Options](Cloud-Deployment)

## 🔐 Security Configuration

### Generate Secure Keys

**SECRET_KEY** (JWT signing):
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Database Password**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(16))"
```

### Environment Variables Security

⚠️ **Important Security Notes**:
- Never commit `.env` files to Git
- Use different keys for development and production
- Rotate keys regularly
- Use environment-specific configurations
- Enable HTTPS in production

## 🧪 Verify Installation

### Backend Health Check

```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### Frontend Health Check

Open browser to `http://localhost:3000`
- Should see the landing page
- No console errors

### Database Connection Test

```bash
# Access PostgreSQL
psql -U ai_pilot_user -d ai_pilot

# List tables
\dt

# Should see tables: users, modules, tests, etc.
\q
```

## 🐛 Common Installation Issues

### Issue: Port Already in Use

**Error**: `Address already in use: 8000`

**Solution**:
```bash
# Find process using port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: Database Connection Failed

**Error**: `could not connect to server`

**Solution**:
```bash
# Check PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Restart PostgreSQL
brew services restart postgresql  # macOS
sudo systemctl restart postgresql  # Linux
```

### Issue: Python Module Not Found

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Node Modules Not Found

**Error**: `Cannot find module 'next'`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📦 Optional Components

### Pinecone (for RAG)

1. Sign up at [pinecone.io](https://www.pinecone.io/)
2. Create an index
3. Add credentials to `.env`:
```env
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=your-env
PINECONE_INDEX_NAME=ai-pilot-docs
```

### Redis (for caching)

```bash
# Install Redis
brew install redis  # macOS
sudo apt install redis-server  # Linux

# Start Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

## 🎯 Next Steps

After installation:

1. **[Getting Started Guide](Getting-Started)** - First steps with AI Pilot
2. **[Configuration Guide](Configuration)** - Detailed configuration options
3. **[User Manual](User-Manual)** - Learn all features
4. **[Troubleshooting](Troubleshooting)** - Fix common issues

## 💬 Need Help?

- **Issues**: [GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions)
- **Email**: support@aipilot.education (if configured)

---

**Installation complete?** 🎉 Head to the [Getting Started Guide](Getting-Started)!
