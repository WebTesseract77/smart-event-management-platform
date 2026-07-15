# 🎉 EventSphere – Smart Event Management Platform

> A modern, full-stack event management platform built with **Next.js**, **FastAPI**, **PostgreSQL**, and **TypeScript**. EventSphere streamlines the complete event lifecycle—from event creation and organizer approval to registrations, secure payments, QR-based entry, attendance tracking, analytics, and automated email notifications.

![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

---

# ✨ Overview

EventSphere is a production-ready Smart Event Management Platform designed for universities, colleges, organizations, hackathons, workshops, conferences, gaming tournaments, and community events.

The platform provides a complete ecosystem for managing the entire event lifecycle through dedicated participant, organizer, and administrator experiences.

From secure authentication and organizer approval workflows to paid registrations, QR-based digital passes, attendance verification, analytics dashboards, and automated transactional emails, EventSphere offers a modern and seamless event management experience.

Whether you're a student registering for a hackathon, an organizer managing multiple events, or an administrator overseeing the entire platform, EventSphere provides powerful tools wrapped inside an elegant, responsive user interface.

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
- Organizer Approval Workflow
- Secure Role Escalation Protection
- Validation against Duplicate Applications
- Protected Admin APIs

---

## 👥 Multi-Role System

### 👨‍🎓 Participant

- Browse Events
- Smart Search & Filtering
- Register for Individual Events
- Register for Team Events
- Apply to Become an Organizer
- Track Organizer Application Status
- View Digital Event Passes
- View Team Passes
- QR Code Pass Generation
- Registration History
- Personal Dashboard
- Profile Management

---

### 🎯 Organizer

Organizer access is granted only after administrator approval.

Features include:

- Create Individual Events
- Create Team Events
- Edit Existing Events
- Manage Own Events
- View Participants
- Track Attendance
- QR Attendance Scanner
- Organizer Dashboard
- Revenue Analytics
- Registration Analytics
- Event Statistics
- Manage Registrations

---

### 🛡 Administrator

- Complete Platform Access
- Manage Users
- Review Organizer Applications
- Approve / Reject Organizer Requests
- Manage Organizers
- View Platform Analytics
- Manage Events
- Monitor Registrations
- Attendance Overview
- Revenue Insights

---

# 🛡 Organizer Request System

EventSphere includes a secure organizer approval workflow to ensure only verified users can create and manage events.

Workflow:

Participant

↓

Submit Organizer Application

↓

Administrator Review

↓

Approved / Rejected

↓

Organizer Access Granted

### Validation Rules

- Only verified participants can apply
- Only one pending application is allowed
- Maximum three applications per calendar year
- 48-hour cooldown after rejection
- Duplicate application prevention
- Automatic organizer role promotion after approval

Each application includes:

- Organization Name
- Experience Level
- Event Categories
- Events Hosted Per Year
- Portfolio / Website
- Application Statement

---

# 🎟 Event Management

Supports both:

- Individual Events
- Team Events

Features include:

- Rich Event Information
- Cloudinary Banner Upload
- Live Banner Preview
- Banner Replacement
- Banner Removal
- Image Validation
- Capacity Limits
- Registration Deadlines
- Registration Deadline Editing
- Paid & Free Events
- Team Size Configuration
- Event Categories
- Venue Information
- Date & Time Scheduling
- Responsive Multi-Section Event Forms
- Modern Card-Based Interface
- Real-Time Validation
---

# 👨‍👩‍👧 Team Registration

- Team Creation
- Captain Management
- Multiple Team Members
- Team Validation
- Team QR Pass Generation
- Team Dashboard
- Team Registration History
- Team Attendance Support

---

# 💳 Payment Integration

Integrated with **Razorpay Test Mode**

Supports:

- Secure Checkout
- Paid Events
- Free Events
- Razorpay Order Creation
- Payment Verification
- Successful Registration Flow
- Revenue Tracking
- Admin Revenue Analytics

---

# 📱 QR Pass System

Every successful registration automatically generates:

- Digital Event Pass
- Secure QR Code
- Registration ID
- Participant Details
- Event Information
- Team Passes
- Attendance Verification
- Online Pass Viewing

---

# 📷 QR Attendance Scanner

Organizers can:

- Scan QR Codes
- Verify Participants
- Mark Attendance
- Prevent Duplicate Check-ins
- Track Live Attendance
- View Attendance Statistics

---

# 📧 Email Notifications

Powered by **Mailjet Transactional Email API**

Automatic emails include:

- Email Verification OTP
- Password Reset OTP
- Event Registration Confirmation
- Team Registration Confirmation
- Organizer Application Submitted
- Organizer Application Approved
- Organizer Application Rejected

All emails are sent asynchronously in the background to improve API response times.

---

# 📊 Dashboards

## User Dashboard

- Upcoming Events
- Active Event Passes
- Registration Summary
- Recent Registrations
- Quick Actions
- Organizer Application Status

## Organizer Dashboard

- Event Overview
- My Events
- Participant Management
- Attendance Statistics
- Registration Metrics
- Revenue Statistics
- Recent Activity
- Quick Actions

## Admin Dashboard

- Platform Analytics
- User Statistics
- Organizer Statistics
- Registration Metrics
- Revenue Analytics
- Monthly Insights
- Top Events
- Top Organizers
- Recent Platform Activity
- Organizer Request Management
---

# 🔍 Smart Event Discovery

Finding the right event is fast and intuitive with EventSphere's intelligent event discovery system.

Features include:

- Intelligent Search
- Multi-word Search
- Real-time Filtering
- Upcoming Events
- Ongoing Events
- Completed Events
- Paid & Free Event Indicators
- Responsive Event Grid
- Rich Event Cards
- Detailed Event Pages

---

# 🎨 Modern UI

Designed with a premium editorial-inspired interface focused on usability and consistency.

Highlights include:

- Fully Responsive Design
- Mobile First Layout
- Tablet Optimized
- Desktop Optimized
- Modern Card-Based Design
- Editorial Typography
- Smooth Framer Motion Animations
- Consistent Design System
- Live Banner Preview
- Responsive Multi-Section Event Forms
- Beautiful Dashboard Analytics
- Elegant Empty States
- Modern Action Cards
- Accessible Components
- Professional Color Palette

---

# 🛠 Technology Stack

## Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- shadcn/ui
- Radix UI
- Lucide React
- MUI X Date & Time Pickers
- Day.js
- Cloudinary Image Upload

---

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- JWT Authentication
- Background Email Services

---

## Database

- PostgreSQL

---

## Payments

- Razorpay (Test Mode)

---

## Email

- Mailjet Transactional Email API

---

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
| Edit Event | `frontend/docs/screenshots/edit_event.png` |
| Organizer Request | `frontend/docs/screenshots/organizer_request.png` |
| Organizer Dashboard | `frontend/docs/screenshots/organizer_dashboard.png` |
| Admin Dashboard | `frontend/docs/screenshots/admin_dashboard.png` |
| Event Form | `frontend/docs/screenshots/event_form.png` |
| My Registrations | `frontend/docs/screenshots/my_registrations.png` |
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

# 📈 Project Highlights

- Full-Stack Production Architecture
- Secure JWT Authentication
- Email Verification & Password Recovery
- Organizer Approval Workflow
- Role-Based Access Control
- Individual & Team Event Support
- Razorpay Payment Integration
- QR-Based Event Passes
- QR Attendance Scanner
- Automated Transactional Emails
- Rich Organizer & Admin Dashboards
- Analytics & Revenue Insights
- Responsive Multi-Section Event Forms
- Modern UI Design System
- PostgreSQL Database
- FastAPI REST APIs
- Next.js App Router
- Mobile Friendly Experience
- Cloudinary Image Upload
- Premium Event Editor
- Live Banner Preview

---

# 🔮 Future Improvements

- Google OAuth Login
- Push Notifications
- Calendar Integration
- Certificate Generation
- AI Event Recommendations
- Progressive Web App (PWA)
- Real-time Notifications
- Event Reviews & Ratings
- Event Bookmarking
- Advanced Reporting & Analytics
- Bulk Email Campaigns
- Multi-language Support
- Public Organizer Profiles

---

# 👨‍💻 Author

**Ashish Madhav Choudhary**

GitHub: **https://github.com/WebTesseract77**

---

# 📄 License

This project is developed for educational purposes and portfolio demonstration.

---

⭐ If you found this project useful, consider giving it a star on GitHub!