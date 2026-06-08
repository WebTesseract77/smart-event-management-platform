# Smart Event Management Platform Backend

This repository now contains a FastAPI backend for a smart event management platform.

## Quick Start
1. Create a virtual environment and install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Copy the example environment file:
   ```bash
   Copy-Item backend\.env.example backend\.env
   ```
3. Update `backend/.env` with your PostgreSQL connection string.
4. Run migrations:
   ```bash
   alembic -c backend/alembic.ini upgrade head
   ```
5. Start the API:
   ```bash
   uvicorn backend.main:app --reload
   ```

## Docs
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

