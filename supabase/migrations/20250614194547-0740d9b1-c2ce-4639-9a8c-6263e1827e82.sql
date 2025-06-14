
-- Add email_notifications column to profiles table
ALTER TABLE profiles ADD COLUMN email_notifications BOOLEAN DEFAULT true;

-- Update existing users to have email notifications enabled by default
UPDATE profiles SET email_notifications = true WHERE email_notifications IS NULL;
