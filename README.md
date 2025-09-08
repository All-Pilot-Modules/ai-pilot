<div align="center">
  <h1>🚀 AI Education Pilot</h1>
  <p><strong>Empowering Education Through Artificial Intelligence</strong></p>
  
  <p>An innovative educational platform that integrates AI technology to revolutionize learning experiences for teachers and students.</p>

  [![Contributors][contributors-shield]][contributors-url]
  [![Forks][forks-shield]][forks-url]
  [![Stargazers][stars-shield]][stars-url]
  [![Issues][issues-shield]][issues-url]
  [![License][license-shield]][license-url]

  <p>
    <a href="https://github.com/All-Pilot-Modules/AI-PILOT2/wiki"><strong>📚 Explore the Wiki »</strong></a>
    <br />
    <br />
    <a href="#demo">View Demo</a>
    ·
    <a href="https://github.com/All-Pilot-Modules/AI-PILOT2/issues/new?template=bug_report.md">Report Bug</a>
    ·
    <a href="https://github.com/All-Pilot-Modules/AI-PILOT2/issues/new?template=feature_request.md">Request Feature</a>
  </p>
</div>

## 🌟 About The Project

AI Education Pilot is a comprehensive educational technology platform designed to integrate artificial intelligence into classroom learning. The platform empowers educators with intelligent tools for assignment creation, automated grading, and student progress tracking while providing students with personalized, AI-assisted learning experiences.

### ✨ Key Features

- **🤖 AI-Powered Assignment Generation** - Create diverse, customized assignments using advanced AI models
- **📊 Intelligent Grading System** - Automated assessment with human oversight capabilities
- **📈 Real-time Analytics** - Comprehensive tracking of student progress and engagement
- **🔄 RAG Integration** - Retrieval-Augmented Generation for enhanced educational content
- **👥 Multi-Role Dashboard** - Tailored experiences for teachers, students, and administrators
- **🎯 Personalized Learning** - AI-driven personalized learning paths and recommendations
- **🔐 Secure Authentication** - JWT-based authentication with role-based access control
- **📱 Responsive Design** - Modern, mobile-friendly interface built with Next.js

## 🏗️ Built With

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for building APIs
- **[LlamaIndex](https://www.llamaindex.ai/)** - Data framework for LLM applications
- **[OpenAI](https://openai.com/)** - GPT models for AI-powered features
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - Python SQL toolkit and ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Advanced relational database
- **[JWT](https://jwt.io/)** - JSON Web Tokens for secure authentication

### Frontend
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[React](https://reactjs.org/)** - Frontend JavaScript library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Recharts](https://recharts.org/)** - Composable charting library

### Database Architecture

Our PostgreSQL database is designed for scalability and educational workflows:

**🔗 [Interactive Database Diagram](https://dbdiagram.io/d/68b01146777b52b76cf1efaa)**

<div align="center">
  <a href="https://dbdiagram.io/d/68b01146777b52b76cf1efaa">
    <img src="https://dbdiagram.io/d/68b01146777b52b76cf1efaa.png" alt="Database Schema Diagram" width="600" />
  </a>
</div>

**Core Tables:**
- **Users** - Students, teachers, administrators with role-based access
- **Modules** - Courses and learning modules with access codes
- **Documents** - Educational content (PDFs, PowerPoints, Word docs)
- **Questions** - AI-generated questions from documents
- **Student Answers** - Response tracking with multiple attempts
- **AI Feedback** - Intelligent grading and personalized feedback

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Git**
- **OpenAI API Key** (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/All-Pilot-Modules/AI-PILOT2.git
   cd AI-PILOT2
   ```

2. **Set up the Backend**
   ```bash
   cd Backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env file with your API keys and database configuration
   python main.py
   ```

3. **Set up the Frontend**
   ```bash
   cd Frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your environment variables
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`

### Environment Variables

#### Backend (.env)
```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url
JWT_SECRET_KEY=your_jwt_secret
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📖 Usage

### For Teachers
- Create AI-powered assignments with customizable difficulty levels
- Manage student rosters and organize classes
- Review and grade submissions with AI assistance
- Track student progress with detailed analytics
- Access comprehensive reporting tools

### For Students
- Submit assignments through an intuitive interface
- Access personalized learning resources
- Track academic progress and achievements
- Receive AI-powered feedback and recommendations
- Collaborate with peers on group projects

### For Administrators
- Monitor platform usage and performance
- Manage user accounts and permissions
- Configure AI model settings and parameters
- Access institution-wide analytics and reports

## 🎯 Use Cases

- **K-12 Education** - Elementary through high school classrooms
- **Higher Education** - Universities and colleges
- **Online Learning** - Remote and hybrid learning environments
- **Corporate Training** - Employee education and skill development
- **Tutoring Services** - Personalized one-on-one instruction

## 📚 Documentation

For detailed documentation, tutorials, and guides, visit our comprehensive [Wiki](https://github.com/All-Pilot-Modules/AI-PILOT2/wiki).

- [Getting Started Guide](https://github.com/All-Pilot-Modules/AI-PILOT2/wiki/Getting-Started)
- [Installation Instructions](https://github.com/All-Pilot-Modules/AI-PILOT2/wiki/Installation-Guide)
- [Database Schema](https://github.com/All-Pilot-Modules/AI-PILOT2/wiki/Database-Schema) | [Interactive Diagram](https://dbdiagram.io/d/68b01146777b52b76cf1efaa)
- [API Documentation](https://github.com/All-Pilot-Modules/AI-PILOT2/wiki/AI-Integration)
- [User Guides](https://github.com/All-Pilot-Modules/AI-PILOT2/wiki/Home)

## 🛣️ Roadmap

- [x] Core platform development
- [x] AI-powered assignment generation
- [x] User authentication and role management
- [x] Comprehensive wiki documentation
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with popular LMS platforms
- [ ] Advanced AI tutoring features

See the [open issues](https://github.com/All-Pilot-Modules/AI-PILOT2/issues) for a full list of proposed features and known issues.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

**Project Maintainer:** [Yubraj Khatri](https://github.com/Yubraj977)

**Project Link:** [https://github.com/All-Pilot-Modules/AI-PILOT2](https://github.com/All-Pilot-Modules/AI-PILOT2)

**Wiki & Documentation:** [https://github.com/All-Pilot-Modules/AI-PILOT2/wiki](https://github.com/All-Pilot-Modules/AI-PILOT2/wiki)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for providing powerful AI capabilities
- [LlamaIndex](https://www.llamaindex.ai/) for the excellent data framework
- [Vercel](https://vercel.com/) for hosting and deployment solutions
- [Next.js](https://nextjs.org/) for the amazing React framework
- All contributors and educators who help improve this platform

---

<div align="center">
  <p><strong>Made with ❤️ for the education community</strong></p>
  <p><em>Transforming education through the power of artificial intelligence</em></p>
</div>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/All-Pilot-Modules/AI-PILOT2.svg?style=for-the-badge
[contributors-url]: https://github.com/All-Pilot-Modules/AI-PILOT2/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/All-Pilot-Modules/AI-PILOT2.svg?style=for-the-badge
[forks-url]: https://github.com/All-Pilot-Modules/AI-PILOT2/network/members
[stars-shield]: https://img.shields.io/github/stars/All-Pilot-Modules/AI-PILOT2.svg?style=for-the-badge
[stars-url]: https://github.com/All-Pilot-Modules/AI-PILOT2/stargazers
[issues-shield]: https://img.shields.io/github/issues/All-Pilot-Modules/AI-PILOT2.svg?style=for-the-badge
[issues-url]: https://github.com/All-Pilot-Modules/AI-PILOT2/issues
[license-shield]: https://img.shields.io/github/license/All-Pilot-Modules/AI-PILOT2.svg?style=for-the-badge
[license-url]: https://github.com/All-Pilot-Modules/AI-PILOT2/blob/master/LICENSE