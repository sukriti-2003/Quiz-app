# Quiz Portal Deployment Guide

This document outlines how to deploy the Quiz Portal application to a production environment. Since the project uses two separate stacks (Django/Python for the backend, Next.js/TypeScript for the frontend), both must be deployed independently but linked securely via environment variables.

---

## 1. Backend Deployment (Render, Railway, DigitalOcean App Platform, or AWS)

The backend is a standard Django application. We recommend **Render** or **Railway** for ease of deployment.

### Prerequisites (Production Ready)
1. **PostgreSQL Database:** While SQLite is used locally, production requires a robust database. Spin up a managed PostgreSQL database (e.g., Supabase, Heroku Postgres, AWS RDS).
2. **Environment Variables Configured:**
   - `SECRET_KEY`: Generate a long, random string.
   - `DEBUG`: Must be set to `False`.
   - `DATABASE_URL`: The connection string provided by your managed PostgreSQL database.
   - `ALLOWED_HOSTS`: Your deployment domain (e.g., `api.yourdomain.com`).
   - `CORS_ALLOWED_ORIGINS`: The URL of your deployed frontend (e.g., `https://yourdomain.com`).
   - `GOOGLE_CLIENT_ID`: Your Google OAuth credentials.

### Deployment Steps (e.g., Render Web Service)
1. Connect your Github Repository to Render.
2. Select the `backend` directory as the Root Directory.
3. Configure the **Build Command**:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```
4. Configure the **Start Command**:
   ```bash
   gunicorn core.wsgi:application
   ```
   *(Note: You will need to add `gunicorn`, `psycopg2-binary`, `dj-database-url`, and `whitenoise` to your `requirements.txt` for these production standards to operate correctly).*
5. Add all Environment Variables listed above into the Render dashboard.

---

## 2. Frontend Deployment (Vercel or Netlify)

Vercel is highly recommended as it is specifically built for Next.js applications and handles SSR/CSR routing seamlessly.

### Prerequisites
1. Ensure your backend is fully deployed and you have the live API URL (e.g., `https://quiz-api.onrender.com/api`).
2. Ensure you have your `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

### Deployment Steps (Vercel)
1. Log in to Vercel and import your GitHub Repository.
2. Set the **Root Directory** to `frontend`.
3. Vercel automatically detects Next.js. The default build commands (`npm run build`) and output directory (`.next`) are correct.
4. Open the **Environment Variables** tab and enter:
   - `NEXT_PUBLIC_API_URL`: `https://your-production-backend.com/api`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: `your-google-client-id.apps.googleusercontent.com`
5. Click **Deploy**.

### Finalizing Google OAuth Authorization
Once your frontend is deployed (e.g., `https://quiz-portal-app.vercel.app`):
1. Go to the **Google Cloud Console**.
2. Navigate to your OAuth 2.0 Client ID settings.
3. Under **Authorized JavaScript origins** and **Authorized redirect URIs**, add your exact deployed frontend URL.
4. Save the credentials. Without this step, Google login will fail in production.
