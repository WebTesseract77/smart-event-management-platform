from backend.app.database.session import SessionLocal, engine
from backend.app.database.base import Base
from backend.app.services.seed_service import seed_initial_data

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_data(db)
        print("Seed data inserted successfully.")
    finally:
        db.close()

