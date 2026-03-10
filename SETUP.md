# Quiz Portal Database & Setup Documentation

As per the requirements, this project uses a custom SQLite3 database (`db.sqlite3` during development/evaluation) via the Django ORM. The relational schema and authentication are strictly version-controlled through Django's migration files inside `backend/apps/*/migrations`.

## Database Layout and Models

The backend is separated into three distinct Django apps, each representing a core domain of the platform:

### 1. Users App
Handles authentication, session management, and role-based access.
- **User Model**: Extends Django's `AbstractUser`.
  - `email` (Unique identifier for login)
  - `total_score` (Integer, stores aggregate points from all quiz attempts, default 0)
  - `avatar_url` (String, generic storage for profile images)
  - `google_id` (String, used to uniquely authenticate users via Google OAuth)

### 2. Quizzes App
Handles the core content structure.
- **Quiz Model**:
  - `title` (String)
  - `description` (Text)
  - `creator` (Foreign Key -> User, enforces `IsAdminOrReadOnly` creation restrictions)
  - `created_at` / `updated_at` (Timestamps)
  - `time_limit_seconds` (Integer, defines the countdown timer on the frontend)
  - `is_published` (Boolean)
- **Question Model**:
  - `quiz` (Foreign Key -> Quiz, related_name `questions`)
  - `text` (String)
  - `type` (Choices: Multiple Choice, True/False, Fill in Blank)
  - `options` (JSONField, stores array of valid choices for MCQs)
  - `correct_answer` (String)
  - `points` (Integer)
  - `order` (Integer)

### 3. Attempts App
Records user interactions and calculates final statistics.
- **Attempt Model**:
  - `user` (Foreign Key -> User)
  - `quiz` (Foreign Key -> Quiz)
  - `start_time` / `end_time` (Timestamps)
  - `score` (Integer)
  - `status` (Choices: IN_PROGRESS, COMPLETED, ABANDONED)
- **Answer Model**:
  - `attempt` (Foreign Key -> Attempt, related_name `answers`)
  - `question` (Foreign Key -> Question)
  - `user_answer` (String)
  - `is_correct` (Boolean)
  - `time_taken_seconds` (Integer)

---

## Migration Flow & Seed Data

1. **Schema Creation (DDL)**: 
   - All relational schemas are defined logically in `models.py` files.
   - Django handles translating these to raw SQL via `makemigrations`. You will find the migration histories in the repository under `backend/apps/<app_name>/migrations`.
2. **Applying Schemas**:
   - Run `python manage.py migrate` to generate the `db.sqlite3` file and establish the tables, indexes, and FK constraints.
3. **Database Rules & Security**:
   - Data access is restricted not via raw SQL triggers, but via application-level rules inside `views.py`.
   - **Quiz Creation**: Only users where `is_staff=True` can `POST` to `/api/quizzes/` or `/api/quizzes/<id>/add_question/`.
   - **Data Isolation**: Regular users querying `/api/attempts/` only receive attempts where `user == request.user`.

## Steps to Reproduce Local Environment

1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate` (or `source venv/bin/activate`)
4. `pip install -r requirements.txt`
5. `python manage.py migrate` *(This applies the DDL scripts to create the database)*
6. `python manage.py runserver`

*To test the system without requiring Google OAuth, use the Demo Login option on the frontend `http://localhost:5173/login`, which bypasses external auth triggers and provisions a standard user row.*
