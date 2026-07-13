# 🎉 EventSphere – Smart Event Management Platform

> A modern, full-stack event management platform built with **Next.js**, **FastAPI**, **PostgreSQL**, and **TypeScript**. EventSphere simplifies the complete event lifecycle—from creation and registration to secure QR-based entry, attendance tracking, payments, and role-based management.

![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

---

# ✨ Overview

EventSphere is a complete Event Management System designed for universities, organizations, clubs, hackathons, conferences, workshops, and community events.

The platform supports multiple user roles with dedicated dashboards, secure authentication, online event registration, QR-based digital passes, payment integration, attendance management, automated email notifications, and a fully responsive user experience.

Whether you're an organizer managing hundreds of participants or a student registering for your next hackathon, EventSphere provides a seamless experience.

---

# 🚀 Core Features

## 👤 Authentication & Security

- JWT Authentication
- Email Verification using OTP
- Password Reset via Email
- Secure Password Hashing
- Protected API Routes
- Role-Based Authorization
- Session Persistence

---

## 👥 Multi-Role System

### 👨‍🎓 Participant

- Browse Events
- Search & Filter Events
- Register for Events
- Register for Team Events
- View Digital Event Passes
- QR Code Pass Generation
- Registration History
- Personal Dashboard
- Profile Management

### 🎯 Organizer

- Create Individual Events
- Create Team Events
- Manage Own Events
- View Participants
- Track Attendance
- Organizer Dashboard
- Event Analytics
- Manage Registrations

### 🛡 Administrator

- Complete Platform Access
- Manage Users
- Promote/Demote Organizers
- View Analytics
- Manage Events
- Monitor Registrations
- Attendance Overview

---

# 🎟 Event Management

Supports both

- Individual Events
- Team Events

Features include

- Rich Event Details
- Event Banner Images
- Capacity Limits
- Registration Deadlines
- Paid & Free Events
- Team Size Configuration
- Event Categories
- Venue Information
- Date & Time Scheduling

---

# 👨‍👩‍👧 Team Registration

- Team Creation
- Captain Management
- Multiple Team Members
- Team Validation
- Team QR Pass
- Team Dashboard
- Team Registration History

---

# 💳 Payment Integration

Integrated with Razorpay

Supports

- Secure Checkout
- Paid Events
- Free Events
- Payment Verification
- Successful Registration Flow

---

# 📱 QR Pass System

Every successful registration automatically generates

- Digital Event Pass
- Secure QR Code
- Registration ID
- Event Information
- Participant Details
- Team Passes
- Attendance Verification

---

# 📷 QR Attendance Scanner

Organizers can

- Scan QR Codes
- Verify Participants
- Mark Attendance
- Prevent Duplicate Check-ins
- Track Live Attendance

---

# 📧 Email Notifications

Powered by **Mailjet**

Automatic emails for

- Email Verification OTP
- Password Reset OTP
- Event Registration Confirmation
- Team Registration Confirmation

---

# 📊 Dashboards

## User Dashboard

- Upcoming Events
- Active Passes
- Registration Summary
- Recent Registrations
- Quick Actions

## Organizer Dashboard

- My Events
- Participants
- Attendance Statistics
- Event Overview
- Quick Actions

## Admin Dashboard

- Platform Analytics
- User Statistics
- Events Statistics
- Registration Metrics
- Management Tools

---

# 🔍 Smart Event Discovery

- Intelligent Search
- Multi-word Search
- Search Ranking
- Event Filters
- Upcoming Events
- Ongoing Events
- Completed Events
- Responsive Grid Layout

---

# 🎨 Modern UI

- Fully Responsive
- Mobile First
- Tablet Optimized
- Desktop Optimized
- Premium Card Design
- Smooth Animations
- Accessible Components
- Elegant Typography
- Professional Color Palette

---

# 🛠 Technology Stack

## Frontend

- Next.js 15
- React
- TypeScript
- TailwindCSS v4
- Framer Motion
- Shadcn/UI
- Lucide Icons

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Alembic

## Database

- PostgreSQL

## Payments

- Razorpay

## Email

- Mailjet

## QR Generation

- Python QRCode


---

# 📸 Screenshots

| Page | Preview |
|------|---------|
| Home | `frontend/docs/screenshots/homepage.png` |
| Events | `frontend/docs/screenshots/events.png` |
| Event Details | `frontend/docs/screenshots/Event_info.png` |
| Create Event | `frontend/docs/screenshots/create_event.png` |
| Event Form | `frontend/docs/screenshots/event_form.png` |
| My Registrations | `frontend/docs/screenshots/my_registrations.png` |
| Dashboard | `frontend/docs/screenshots/dashboard.png` |
| QR Pass | `frontend/docs/screenshots/pass.png` |
| Attendance Scanner | `frontend/docs/screenshots/scanner.png` |

---

# ⚙️ Local Setup

## Clone Repository

```bash
git clone https://github.com/WebTesseract77/smart-event-management-platform.git

cd smart-event-management-platform
```

---

## Backend

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:3000
```

---

# 🌐 Deployment

Frontend

- Vercel

Backend

- Render

Database

- PostgreSQL

Payments

- Razorpay

Email Service

- Mailjet

---

# 🔮 Future Improvements

- Google OAuth Login
- Event Categories
- Push Notifications
- Calendar Integration
- Certificate Generation
- Live Chat
- AI Event Recommendations
- Multi-language Support
- Dark Mode
- Advanced Analytics
- Event Reviews
- Event Bookmarking
- Bulk Email Campaigns

---

# 👨‍💻 Author

**Ashish Madhav Choudhary**

GitHub: **WebTesseract77**

---

# 📄 License

This project is developed for educational purposes and portfolio demonstration.

---

⭐ If you found this project useful, consider giving it a star on GitHub!