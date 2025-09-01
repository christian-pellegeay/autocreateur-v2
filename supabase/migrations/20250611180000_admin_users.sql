/*
  # Create admin_users table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `username` (text, unique, not null)
      - `password_hash` (text, not null)
      - `created_at` (timestamptz, not null, default now())

  2. Data
    - Insert default admin user with bcrypt hashed password
*/

-- Create the admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default admin user
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$krGi.ALIxDpYb.t7VAYxTO7dxhPkTlTmmfbmQ9pvavFFUNlngW6oG');