# Getting Started with AI Education Pilot

Welcome! This guide will help you get AI Education Pilot up and running in minutes.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **Python** 3.10+ installed
- **PostgreSQL** database
- **OpenAI API key** (for AI features)
- **Git** for cloning the repository

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/All-Pilot-Modules/ai-pilot.git
cd ai-pilot
```

### 2. Set Up the Backend

```bash
cd Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

#### Configure Backend Environment Variables

Edit `Backend/.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_pilot

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret
SECRET_KEY=your_secret_key_here

# Server
PORT=8000
HOST=0.0.0.0
```

#### Run Database Migrations

```bash
# Initialize database
alembic upgrade head

# Or create tables manually
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

#### Start the Backend Server

```bash
uvicorn app.main:app --reload
```

The backend API will be available at: `http://localhost:8000`

### 3. Set Up the Frontend

Open a new terminal:

```bash
cd Frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

#### Configure Frontend Environment Variables

Edit `Frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AI Education Pilot
```

#### Start the Frontend Development Server

```bash
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## 🎯 First Steps

### 1. Create Your Account

1. Navigate to `http://localhost:3000`
2. Click "Sign Up"
3. Enter your details:
   - Username
   - Email
   - Password
4. Click "Create Account"

### 2. Create Your First Module

1. After signing in, you'll see the home dashboard
2. Click "Create Module" or go to "My Modules"
3. Fill in module details:
   - Module Name
   - Description
   - Settings
4. Click "Create"

### 3. Upload Course Materials

1. Navigate to **Dashboard → Documents**
2. Click "Upload Document"
3. Select your file (PDF, DOCX, PPT, etc.)
4. Add a title (optional)
5. Click "Upload"

### 4. Create Your First Test

1. Go to **Dashboard → Questions**
2. Click "Create Question"
3. Choose question type:
   - Multiple Choice
   - True/False
   - Short Answer
   - Essay
4. Enter question details
5. Add answer choices (if applicable)
6. Set correct answer
7. Click "Save"

### 5. Invite Students

Students can join your module in two ways:

#### Option A: Share Module Code
1. Go to your module dashboard
2. Copy the 6-digit access code
3. Share with students
4. Students visit `/join` and enter the code

#### Option B: Direct Link
Share the direct join link:
```
http://localhost:3000/join/YOUR_ACCESS_CODE
```

### 6. View Student Progress

1. Navigate to **Dashboard → Students**
2. View list of enrolled students
3. Click on any student to see:
   - Test scores
   - Progress percentage
   - Performance analytics
   - Individual question responses

## 🎨 Explore the Dashboard

### Main Navigation Sections

- **Dashboard** - Overview and quick stats
- **Documents** - Course materials library
- **Questions** - Test question bank
- **Students** - Student management
- **Analytics** - Performance insights
- **Settings** - Module configuration

### Key Features to Try

✅ **AI Feedback**: Create a test and let AI generate personalized feedback for student answers

✅ **Analytics Dashboard**: View real-time performance metrics and trends

✅ **Rubric Management**: Create custom grading rubrics for assessments

✅ **Document Chat**: Ask questions about your uploaded course materials (RAG)

## 🔧 Configuration Options

### Theme Settings

1. Click on your profile → Settings
2. Go to "Appearance"
3. Choose:
   - Light mode
   - Dark mode
   - System (auto)

### Notification Preferences

1. Profile → Settings → Notifications
2. Toggle options:
   - Email notifications
   - Push notifications
   - Weekly reports

### Account Information

1. Profile → Settings → Account Information
2. Update:
   - Name
   - Email
   - Organization
   - Bio

## 📊 Understanding the Interface

### Dashboard Overview

The main dashboard shows:
- Active modules count
- Total students enrolled
- AI insights generated
- Average completion rate

### Module Dashboard

Each module has its own dashboard showing:
- Student performance
- Recent activity
- Quick actions
- Access code

### Student View

Students see:
- Available tests
- Course materials
- Their progress
- AI feedback

## 🎓 Next Steps

Now that you're set up, explore these guides:

- **[Creating Tests](Creating-Tests)** - Detailed test creation guide
- **[Managing Students](Managing-Students)** - Student management features
- **[AI Feedback System](AI-Feedback-System)** - Using AI-powered feedback
- **[Analytics Dashboard](Analytics-Dashboard)** - Understanding analytics

## 🆘 Having Issues?

Check our troubleshooting guides:
- [Troubleshooting Guide](Troubleshooting)
- [FAQ](FAQ)
- [GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)

## 💡 Tips for Success

1. **Start Small**: Create one module first, test all features
2. **Use AI Features**: Enable AI feedback for better student insights
3. **Regular Backups**: Export data regularly
4. **Engage Students**: Share the access code and encourage participation
5. **Monitor Analytics**: Check the dashboard regularly for insights

---

**Questions?** [Ask in Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions) | [Report Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)
