# Troubleshooting Guide

This guide helps you diagnose and fix common issues with AI Education Pilot.

## 🔍 Quick Diagnostics

### Check System Status

```bash
# Check if backend is running
curl http://localhost:8000/health

# Check if frontend is running
curl http://localhost:3000

# Check if database is running
pg_isready -h localhost -p 5432
```

### View Logs

**Backend logs**:
```bash
cd Backend
tail -f logs/app.log  # If logging to file
# Or check terminal output
```

**Frontend logs**:
Check browser console (F12 → Console tab)

**Database logs**:
```bash
# macOS
tail -f /usr/local/var/log/postgresql@15.log

# Linux
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

## 🚨 Common Issues

### Installation Issues

#### Issue: `pip install` fails

**Error**: `ERROR: Could not find a version that satisfies the requirement`

**Solution**:
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Try installing with verbose output
pip install -r requirements.txt -v

# If specific package fails, install it separately
pip install <package-name>==<version>
```

#### Issue: `npm install` fails

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $USER ~/.npm
sudo chown -R $USER /usr/local/lib/node_modules

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

#### Issue: Database connection refused

**Error**: `could not connect to server: Connection refused`

**Solution**:
```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql  # Linux

# Verify connection
psql -U postgres -h localhost
```

### Backend Issues

#### Issue: Module import errors

**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

#### Issue: Database migration fails

**Error**: `alembic.util.exc.CommandError: Can't locate revision`

**Solution**:
```bash
# Reset migrations
rm -rf alembic/versions/*

# Create new migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head

# Or create tables directly
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

#### Issue: OpenAI API errors

**Error**: `AuthenticationError: Incorrect API key`

**Solutions**:
1. Verify API key in `.env`:
   ```bash
   cat Backend/.env | grep OPENAI_API_KEY
   ```
2. Test API key:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```
3. Check API key has credits at [platform.openai.com](https://platform.openai.com/account/billing)

#### Issue: Port already in use

**Error**: `[Errno 48] Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
uvicorn app.main:app --port 8001
```

### Frontend Issues

#### Issue: API connection failed

**Error**: `Failed to fetch` or `Network Error`

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:8000/health
   ```
2. Check `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
3. Check for CORS issues in browser console
4. Verify firewall isn't blocking connections

#### Issue: Page not found (404)

**Error**: `404 | This page could not be found`

**Solutions**:
1. Verify route exists in `Frontend/app/`
2. Check for typos in URL
3. Restart dev server:
   ```bash
   npm run dev
   ```
4. Clear `.next` cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

#### Issue: Build fails

**Error**: `Error: Build failed`

**Solutions**:
```bash
# Clear cache
rm -rf .next node_modules package-lock.json

# Reinstall dependencies
npm install

# Try build again
npm run build

# Check for TypeScript errors
npm run lint
```

#### Issue: Styles not loading

**Error**: Unstyled or broken layout

**Solutions**:
1. Verify Tailwind is configured
2. Restart dev server
3. Check `tailwind.config.js`
4. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+F5)

### Authentication Issues

#### Issue: Can't sign in

**Error**: `Invalid credentials` or `Authentication failed`

**Solutions**:
1. Verify credentials are correct
2. Check database connection
3. Verify `SECRET_KEY` in `.env`
4. Check backend logs for errors:
   ```bash
   tail -f logs/app.log
   ```
5. Try creating a new account

#### Issue: Token expired

**Error**: `Token has expired`

**Solution**:
- Sign in again
- Adjust token expiry time in `.env`:
  ```env
  ACCESS_TOKEN_EXPIRE_MINUTES=30
  ```

#### Issue: Unauthorized access

**Error**: `403 Forbidden` or `401 Unauthorized`

**Solutions**:
1. Sign in again
2. Check user permissions/role
3. Verify JWT token is being sent:
   - Open browser DevTools → Network
   - Check request headers for `Authorization: Bearer <token>`

### Module & Test Issues

#### Issue: Can't create module

**Error**: `Failed to create module`

**Solutions**:
1. Check backend logs
2. Verify database connection
3. Check user authentication
4. Ensure required fields are filled

#### Issue: Access code not working

**Error**: `Invalid access code` or `Module not found`

**Solutions**:
1. Verify code is exactly 6 characters
2. Check module exists in database:
   ```sql
   SELECT * FROM modules WHERE access_code = 'CODE';
   ```
3. Verify module is active
4. Try generating a new code

#### Issue: Questions not saving

**Error**: Save fails silently or with error

**Solutions**:
1. Check required fields are filled
2. Verify data format (JSON)
3. Check database constraints
4. View backend error logs

### Upload Issues

#### Issue: File upload fails

**Error**: `Failed to upload file` or `File too large`

**Solutions**:
1. Check file size (default limit: 10MB):
   ```env
   MAX_FILE_SIZE=10485760
   ```
2. Verify file format is supported
3. Check upload directory permissions:
   ```bash
   ls -la Backend/uploads
   chmod 755 Backend/uploads
   ```
4. Check backend logs for detailed error

#### Issue: Uploaded files not accessible

**Error**: `404` when accessing file

**Solutions**:
1. Verify files are in upload directory:
   ```bash
   ls Backend/uploads
   ```
2. Check file permissions
3. Verify `UPLOAD_DIR` in `.env`
4. Ensure backend serves static files

### AI & RAG Issues

#### Issue: AI feedback not generating

**Error**: No feedback or generic error

**Solutions**:
1. Verify OpenAI API key is set
2. Check API credits/quota
3. Test API connection:
   ```bash
   curl https://api.openai.com/v1/chat/completions \
     -H "Authorization: Bearer YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"test"}]}'
   ```
4. Check backend logs for API errors

#### Issue: RAG not working

**Error**: Document Q&A returns no results

**Solutions**:
1. Verify Pinecone credentials in `.env`
2. Check documents are uploaded
3. Verify documents are indexed:
   ```python
   # Check Pinecone index
   import pinecone
   pinecone.init(api_key="YOUR_KEY", environment="YOUR_ENV")
   index = pinecone.Index("ai-pilot-docs")
   print(index.describe_index_stats())
   ```
4. Re-index documents if needed

### Performance Issues

#### Issue: Slow page loads

**Solutions**:
1. Check database query performance
2. Enable caching (Redis)
3. Optimize database indexes
4. Use production build:
   ```bash
   npm run build
   npm start
   ```

#### Issue: High memory usage

**Solutions**:
1. Monitor with htop/Activity Monitor
2. Limit concurrent connections
3. Optimize database queries
4. Consider scaling (more RAM, multiple instances)

#### Issue: Database connection pool exhausted

**Error**: `OperationalError: connection pool exhausted`

**Solution**:
Increase pool size in database connection:
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10
)
```

## 🛠️ Advanced Diagnostics

### Enable Debug Mode

**Backend**:
```env
# In .env
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

**Frontend**:
```bash
# Run with debug flag
DEBUG=* npm run dev
```

### Check Database

```sql
-- Connect to database
psql -U ai_pilot_user -d ai_pilot

-- Check tables
\dt

-- Check table structure
\d users
\d modules

-- Check data
SELECT * FROM users;
SELECT * FROM modules;

-- Check database size
SELECT pg_size_pretty(pg_database_size('ai_pilot'));
```

### Network Diagnostics

```bash
# Test backend endpoint
curl -v http://localhost:8000/health

# Test with headers
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/modules

# Check DNS
nslookup your-domain.com

# Check connectivity
ping your-domain.com
telnet your-domain.com 443
```

### Clear All Caches

```bash
# Frontend
cd Frontend
rm -rf .next node_modules/.cache

# Browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

# Backend (if using Redis)
redis-cli FLUSHALL
```

## 📞 Getting Help

### Before Asking for Help

Gather this information:
1. **Error message** (full text)
2. **Steps to reproduce**
3. **System info**:
   - OS version
   - Python version
   - Node.js version
   - PostgreSQL version
4. **Log files**:
   - Backend logs
   - Browser console
   - Database logs
5. **Configuration**:
   - `.env` (without secrets)
   - `package.json` versions

### Where to Get Help

1. **Search existing issues**: [GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)
2. **Check discussions**: [GitHub Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions)
3. **Create new issue**: Include info from above
4. **Community chat**: Discord/Slack (if available)

### How to Report Bugs

Use this template:

```markdown
**Description**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS 13.0]
- Python: [e.g. 3.10.5]
- Node: [e.g. 18.16.0]
- Browser: [e.g. Chrome 122]

**Logs**
Relevant log output
```

## 🔄 Emergency Recovery

### Reset Everything

```bash
# Stop all services
pkill -f uvicorn
pkill -f next

# Clear data (⚠️ DESTRUCTIVE)
dropdb ai_pilot
createdb ai_pilot

# Reinstall
cd Backend
pip install -r requirements.txt
alembic upgrade head

cd ../Frontend
rm -rf node_modules .next
npm install
npm run dev
```

### Backup Before Reset

```bash
# Backup database
pg_dump ai_pilot > backup_$(date +%Y%m%d).sql

# Backup uploads
tar -czf uploads_backup.tar.gz Backend/uploads

# Backup .env files
cp Backend/.env Backend/.env.backup
cp Frontend/.env.local Frontend/.env.local.backup
```

---

**Still stuck?** [Open an Issue](https://github.com/All-Pilot-Modules/ai-pilot/issues) | [Ask Community](https://github.com/All-Pilot-Modules/ai-pilot/discussions)
