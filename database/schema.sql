CREATE TABLE IF NOT EXISTS game_players (
  "Username" text PRIMARY KEY,
  "DisplayName" text NOT NULL,
  "Role" text NOT NULL DEFAULT 'student' CHECK ("Role" IN ('teacher', 'student')),
  "PasswordHash" text NOT NULL,
  "ProfileJson" jsonb NOT NULL CHECK (jsonb_typeof("ProfileJson") = 'object'),
  "CorrectAnswers" integer NOT NULL DEFAULT 0 CHECK ("CorrectAnswers" >= 0),
  "IncorrectAnswers" integer NOT NULL DEFAULT 0 CHECK ("IncorrectAnswers" >= 0),
  "Revision" integer NOT NULL DEFAULT 0 CHECK ("Revision" >= 0),
  "UpdatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS game_sessions (
  "TokenHash" text PRIMARY KEY,
  "Username" text NOT NULL REFERENCES game_players("Username") ON DELETE CASCADE,
  "ExpiresAt" timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS game_sessions_expiry ON game_sessions("ExpiresAt");
