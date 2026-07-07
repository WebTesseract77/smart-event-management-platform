Markdown
# EventSphere - Smart Event Management Platform 🌐

A full-stack Event Management Platform built with FastAPI, Next.js (App Router), TypeScript, and SQLite. The platform enables users to discover events, register online, receive digital event passes, and allows administrators to manage events, participants, and attendance efficiently.

---

## 🚀 Key Features

### 👤 User & Role-Based Workflows
* **User Hub:** Personalized dashboard featuring dynamic tracking cards, support for both individual and team registration review, and immediate event discoverability feeds.
* **Organizer Panel:** Isolated control workflows to manage distinct event metrics, view analytical breakdowns, and track registered participants.
* **Admin Dashboard:** Centralized platform layout with optimized, responsive tracking grids and granular user promotion/demotion utilities.

### 🎫 Event & Registration Engines
* **Multi-Tier Registrations:** Scalable configuration pipelines supporting both individual entry points and complex multi-member team registrations.
* **Digital Passes & Security:** Automatic generation of unique, secure QR-based event passes for instant registration verification.
* **Real-time Attendance Scanner:** An embedded camera/scanner component allowing event managers to instantly scan digital passes and log live attendance records.
* **Data Bookkeeping:** Automated on-demand CSV compilation handlers for organizer record exporting.

### 🔐 Security & Auth Systems
* Secure JWT-based Authentication with Role-Based Access Control (RBAC).
* Automated verification mail configurations, password recovery pipelines, and protected UI route guards.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js (App Router), TypeScript
* **Styling & Components:** Tailwind CSS, Shadcn UI Design Foundations

### Backend
* **Framework:** Python (FastAPI / Starlette ecosystem)
* **ORM & Migrations:** SQLAlchemy, Alembic database migration management

### Database & Utilities
* **Database:** SQLite
* **Services:** QR Code generation engine, Dynamic CSV compiler, SMTP Email notification handlers

---

## 📦 Project Architecture

```text
smart-event-management-platform/
│
├── backend/
│   ├── alembic/            # Database schema migrations
│   ├── app/
│   │   ├── core/           # Security, roles, and configurations
│   │   ├── database/       # Session setups and bases
│   │   ├── models/         # Database relational schemas
│   │   ├── routes/         # API endpoints (auth, admin, events, teams, registrations)
│   │   ├── schemas/        # Pydantic validation schemas
│   │   └── services/       # Core business logic modules (QR, CSV, attendance, email)
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/                # Next.js role-based router views
│   ├── components/         # Modular shadcn UI & custom app layouts (Navbar, Sidebar, layout)
│   ├── lib/                # Utility modules, API handlers, and CSV builders
│   └── package.json
│
└── README.md               # Unified project entry guidelines
⚙️ Installation & Setup
1. Clone Repository
Bash
git clone [https://github.com/WebTesseract77/smart-event-management-platform.git](https://github.com/WebTesseract77/smart-event-management-platform.git)
cd smart-event-management-platform
2. Backend Setup
Bash
# Navigate to backend and initialize virtual environment
cd backend
python -m venv .venv

# Activate Virtual Environment (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install Dependencies
pip install -r requirements.txt

# Run Backend Server
uvicorn app.main:app --reload
Backend runs at: http://127.0.0.1:8000

Interactive API Documentation: http://127.0.0.1:8000/docs

Configure Backend Environment Variables (backend/.env)
Create a .env file in the backend/ directory matching this template:

Code snippet
DATABASE_URL=sqlite:///./smart_event.db
SECRET_KEY=your-secret-key

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-password

MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
3. Frontend Setup
Bash
cd ../frontend
npm install
npm run dev
Frontend runs at: http://localhost:3000

## 📸 Screenshots

### Home Page Landing
<img src="https://raw.githubusercontent.com/WebTesseract77/smart-event-management-platform/main/frontend/docs/screenshots/hompage.png" width="100%" alt="Home Page"/>
The landing page provides a centralized entry point for creating, managing, and exploring events with professional analytics insight summaries.

### Discover Events Feed
<img src="https://raw.githubusercontent.com/WebTesseract77/smart-event-management-platform/main/frontend/docs/screenshots/events.png" width="100%" alt="Events Feed"/>
Comprehensive discovery board showcasing scheduled listings, real-time ticket availability tags, and quick-action detail layouts.

### Event Detail Metrics
<img src="https://raw.githubusercontent.com/WebTesseract77/smart-event-management-platform/main/frontend/docs/screenshots/Event_Details.png" width="100%" alt="Event Details"/>
Granular registration metrics displaying venue records, date intervals, capacity caps, and instant registration status workflows.

### Creation Suite Selector
<img src="https://raw.githubusercontent.com/WebTesseract77/smart-event-management-platform/main/frontend/docs/screenshots/create_event.png" width="100%" alt="Create Event Hub"/>
Dual-track creation portal letting organizers select and scale distinct entry specifications for individual or team entries.

### Individual Form Configuration
<img src="https://raw.githubusercontent.com/WebTesseract77/smart-event-management-platform/main/frontend/docs/screenshots/event_form.png" width="100%" alt="Individual Form"/>
Structured parameters enabling planners to provision title records, banner structures, and descriptive metadata fields.

### Registration Control Panel
<img src="https://raw.githubusercontent.com/WebTesseract77/smart-event-management-platform/main/frontend/docs/screenshots/my_registrations.png" width="100%" alt="My Registrations"/>
Unified dashboard enabling participants to toggle tracking modules, review distinct digital entry slots, and map team management hierarchies.
🔗 API Endpoints
Authentication
POST /api/v1/auth/register

POST /api/v1/auth/login

Events
GET /api/v1/events

GET /api/v1/events/{id}

POST /api/v1/events

PATCH /api/v1/events/{id}

DELETE /api/v1/events/{id}

Registrations & Teams
POST /api/v1/events/{event_id}/register

DELETE /api/v1/events/{event_id}/register

POST /api/v1/teams/register

GET /api/v1/me/registrations

Attendance
POST /api/v1/events/{event_id}/attendance/{user_id}

GET /api/v1/events/{event_id}/attendance

🔒 Security & Workspace Integrity
Secret Isolation: Local environment variables (.env, .env.local), development log binaries, generated asset directories (generated_qr/), and local SQLite database binaries (*.db) are strictly kept out of git tracking records via a comprehensive, global repository-level ignore map.

✍️ Author
Ashish Madhav Choudhary

GitHub: @WebTesseract77

📄 License
This project is intended for educational purposes.