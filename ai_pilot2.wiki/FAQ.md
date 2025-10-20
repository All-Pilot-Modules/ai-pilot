# Frequently Asked Questions (FAQ)

## General Questions

### What is AI Education Pilot?

AI Education Pilot is an open-source, AI-powered educational analytics platform that helps teachers track student progress, generate intelligent insights, and provide personalized learning experiences.

### Is AI Education Pilot free?

Yes! AI Education Pilot is 100% free and open-source under the MIT License. However, you'll need your own OpenAI API key for AI features, which has its own costs.

### What programming languages is it built with?

- **Frontend**: Next.js 15 (React, TypeScript, Tailwind CSS)
- **Backend**: Python (FastAPI)
- **Database**: PostgreSQL

### Can I self-host AI Education Pilot?

Absolutely! AI Education Pilot is designed to be self-hosted. See our [Installation Guide](Installation) for details.

## Getting Started

### How do I create my first module?

1. Sign in to your account
2. Click "Create Module" from the home dashboard
3. Enter module name and description
4. Click "Create"
5. Share the access code with students

### How do students join my module?

Students can join in two ways:
1. **Access Code**: Give them the 6-digit code, they visit `/join`
2. **Direct Link**: Share `your-domain.com/join/ACCESS_CODE`

### What file types can I upload?

Supported formats:
- **Documents**: PDF, DOCX, DOC, TXT
- **Presentations**: PPTX, PPT
- **Images**: JPG, JPEG, PNG, GIF
- **Archives**: ZIP, RAR

## Features

### What question types are supported?

- Multiple Choice
- True/False
- Short Answer
- Essay/Long Answer
- Fill in the Blank (coming soon)
- Matching (coming soon)

### How does AI feedback work?

When students submit answers, AI analyzes their responses against the correct answer and rubric (if provided) to generate personalized, constructive feedback.

### Can I customize grading rubrics?

Yes! Navigate to Dashboard → Rubric to create custom rubrics with:
- Multiple criteria
- Point values
- Descriptions
- AI-powered rubric generation

### What analytics are available?

- Individual student performance
- Class-wide statistics
- Progress tracking over time
- Question difficulty analysis
- Engagement metrics
- Performance trends

## Technical Questions

### What are the system requirements?

**Minimum**:
- 2 CPU cores
- 4 GB RAM
- 10 GB storage

**Recommended**:
- 4+ CPU cores
- 8+ GB RAM
- 20+ GB SSD storage

See [Installation Guide](Installation) for details.

### Do I need an OpenAI API key?

Yes, for AI features like:
- AI-generated feedback
- Test question suggestions
- Analytics insights
- Document Q&A (RAG)

Basic features work without an API key.

### What database is used?

PostgreSQL 15+ is the primary database. It stores:
- User accounts
- Modules and tests
- Student responses
- Analytics data

### Can I use a different AI provider?

Currently, the system is built for OpenAI's API. However, you can modify the code to support:
- Anthropic Claude
- Google PaLM
- Open-source models (LLaMA, Mistral)

### Is there a mobile app?

Not yet, but the web interface is fully responsive and works on:
- Mobile browsers
- Tablets
- Desktop

## Security & Privacy

### How is student data protected?

- Passwords are hashed with bcrypt
- JWT tokens for authentication
- HTTPS encryption (in production)
- Role-based access control
- Database encryption at rest

### Is data shared with third parties?

No. Your data stays on your server. OpenAI processes text for AI features but doesn't store it (per their policy).

### Can I export my data?

Yes! You can export:
- Student lists (CSV, JSON)
- Test results (CSV, JSON)
- Analytics reports (CSV, PDF)
- All module data

### Is it FERPA compliant?

The system provides the tools for FERPA compliance, but you're responsible for:
- Proper deployment security
- Access controls
- Data handling policies
- Privacy notices

## Usage & Administration

### How many students can I have?

There's no hard limit. Performance depends on your server resources. Typical deployments handle:
- Small: 1-100 students
- Medium: 100-1,000 students
- Large: 1,000+ students (requires scaling)

### Can multiple teachers use the same instance?

Yes! Each teacher has their own account and modules. Students can be enrolled in multiple modules.

### How do I back up my data?

**Database backup**:
```bash
pg_dump ai_pilot > backup.sql
```

**Restore**:
```bash
psql ai_pilot < backup.sql
```

See [Backup Guide](Backup-and-Restore) for details.

### Can I migrate from another LMS?

We're working on import tools. Currently, you can:
- Manually recreate modules
- Import student lists via CSV
- Import questions (with custom scripts)

## Troubleshooting

### Students can't join my module

**Check**:
- Access code is correct (6 digits)
- Module is active
- Server is running
- No firewall blocking access

### AI feedback isn't working

**Verify**:
- OpenAI API key is set in `.env`
- API key is valid and has credits
- Backend server is running
- Check backend logs for errors

### Analytics not showing

**Common causes**:
- No student data yet
- Database connection issues
- Frontend can't reach backend API
- Check browser console for errors

### Upload fails

**Solutions**:
- Check file size limit (default 10MB)
- Verify file format is supported
- Ensure upload directory has write permissions
- Check backend logs

## Development

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [Contributing Guide](https://github.com/All-Pilot-Modules/ai-pilot/blob/main/CONTRIBUTING.md).

### Where do I report bugs?

[GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)

### How do I request features?

[GitHub Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions)

### Can I customize the UI?

Yes! The frontend uses:
- Tailwind CSS for styling
- Shadcn/ui components
- Next.js for routing

Customize in `Frontend/app/` and `Frontend/components/`.

## Billing & Costs

### What costs are involved?

**Free**:
- AI Education Pilot software
- Self-hosting

**Paid** (you provide):
- Server/hosting
- OpenAI API credits
- Domain name (optional)
- SSL certificate (optional, Let's Encrypt is free)

### How much does OpenAI API cost?

Depends on usage. Typical costs:
- **GPT-4**: ~$0.03 per 1K tokens
- **GPT-3.5**: ~$0.002 per 1K tokens

Estimate: $0.01-0.10 per student feedback

### Can I use it without paying anything?

Yes, if you:
- Self-host on existing hardware
- Don't use AI features (or use free alternatives)
- Use Let's Encrypt for SSL

## More Help

### Where can I find video tutorials?

Check our [Video Tutorials](Video-Tutorials) page.

### Is there a user manual?

Yes! See the [User Manual](User-Manual).

### How do I contact support?

- **Issues**: [GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)
- **Questions**: [GitHub Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions)
- **Chat**: Community Discord (link in repo)

### What if my question isn't here?

Ask in [GitHub Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions) - we'll add it to the FAQ!

---

**Still have questions?** [Ask the Community](https://github.com/All-Pilot-Modules/ai-pilot/discussions) | [Report Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)
