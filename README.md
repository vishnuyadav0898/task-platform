# Collaborative Task Management Platform

A modern, full-stack collaborative task management platform featuring workspaces, semantic routing, strict role-based access control (RBAC), and interactive notifications. Built with React, Node.js, TypeScript, and PostgreSQL.

## 🚀 Features

* **Workspaces & Semantic Routing**: Clean, shareable URLs (e.g., `/workspace-name/project/project-name`) with strict boundaries. Projects are scoped locally to their workspace.
* **Role-Based Access Control (RBAC)**: Secure access system enforcing Admin/Member roles.
* **Invite Workflow**: Secure, two-step workspace invitation system with `PENDING` state and interactive "Accept" notifications.
* **Task & Subtask Hierarchy**: Create infinite levels of nested subtasks inside projects.
* **Activity Tracking**: Automated, real-time activity logs for every action taken in a project.
* **Interactive Notifications**: Real-time alerts for invites and task updates, complete with a "Clear All" functionality.
* **Beautiful UI**: Modern, glassmorphic UI built with Tailwind CSS.

## 🛠️ Technology Stack

**Frontend**
* React 18
* Vite
* TypeScript
* Tailwind CSS
* React Router v6
* React Query (TanStack Query)
* Lucide React (Icons)

**Backend**
* Node.js & Express
* TypeScript
* PostgreSQL (Database)
* Sequelize (ORM)
* JWT (JSON Web Tokens for Authentication)
* Docker & Docker Compose (Containerization)

## 📦 Running the Project Locally

The entire application is containerized using Docker. You do not need to install Node or PostgreSQL on your host machine to run this project.

### Prerequisites
* Docker Desktop installed and running.

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/vishnuyadav0898/task-platform.git
   cd task-platform
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. The platform will automatically spin up 3 containers:
   * **PostgreSQL Database**: Exposed on port `5433` (mapped to `5432` internally).
   * **Backend API**: Running on `http://localhost:4000`. The database automatically synchronizes constraints and models on startup.
   * **Frontend UI**: Running on `http://localhost:5173`.

4. Open your browser and navigate to `http://localhost:5173` to sign up or log in!

## 🔐 Security & Database Design

* **Composite Unique Indexes:** Project slugs are enforced as unique via a composite index `(workspaceId, slug)` ensuring zero naming collisions across different workspaces.
* **Relational Integrity:** Cascading deletes ensure that if a Workspace is deleted, all associated Projects, Tasks, and Activities are purged.
* **Secure Middleware:** All API routes are protected by a JWT authorization layer and strict workspace-membership validation logic.

## 📄 License
MIT License
