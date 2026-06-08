# Smart Event Management Backend

## Features
- User registration and login
- JWT authentication
- Event CRUD
- Event registration management
- Seed data for quick local setup

## Local Setup
1. Create and activate a Python virtual environment.
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Copy environment variables:
   ```bash
   Copy-Item backend\.env.example backend\.env
   ```
4. Start PostgreSQL and update `backend/.env` with your `DATABASE_URL`.
5. Run the app:
   ```bash
   uvicorn backend.main:app --reload
   ```
6. Open Swagger docs:
   - `http://127.0.0.1:8000/docs`

## Database Migration
Initialize and apply Alembic migrations:
```bash
alembic -c backend/alembic.ini revision --autogenerate -m "initial"
alembic -c backend/alembic.ini upgrade head
```

## Seed Data
```bash
python scripts/seed_data.py
```
