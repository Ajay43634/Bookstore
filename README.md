# Bookstore

A full-stack bookstore application built with Next.js and FastAPI.

**Live site:** http://localhost

## Stack

- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **Backend:** FastAPI (Python, SQLAlchemy, PostgreSQL)
- **Proxy:** Nginx
- **Container:** Docker Compose

## Getting Started

### Prerequisites

- Docker Desktop

### Run

```bash
# Copy env file
cp .env.example .env

# Build images
docker build -t bookstore-backend ./backend
docker build -t bookstore-frontend ./frontend

# Start all services
docker compose up -d

# Run DB migrations
docker compose exec backend uv run alembic upgrade head

# Seed sample data
docker compose exec backend uv run python -m bookstore.scripts.seed
```

The site will be available at **http://localhost**.

## Features

- Browse and search books by title, author, genre, and date
- Book detail pages with series information
- Author profile pages
- Shopping cart
- User authentication (register / login)
- Admin dashboard for managing books
