-- Reset database:

drop table if exists "snapshots";
drop table if exists "changes";
drop table if exists "documents";
drop table if exists "sessions";
drop table if exists "users";

-- Users:
CREATE TABLE "users" (
  "userId" varchar(40) UNIQUE PRIMARY KEY,
  email varchar(255) UNIQUE,
  name varchar(255),
  created timestamp,
  "loginKey" varchar(40) UNIQUE
);

CREATE UNIQUE INDEX login_key_index ON users("loginKey");

-- Sessions:
CREATE TABLE "sessions" (
  "sessionToken" varchar(40) UNIQUE PRIMARY KEY,
  "userId" varchar(40) REFERENCES users,
  -- ex timestamp
  created timestamp
);

-- Documents:
CREATE TABLE "documents" (
  "documentId" varchar(40) UNIQUE PRIMARY KEY,
  "schemaName" varchar(40),
  "schemaVersion" varchar(40),
  info jsonb,
  version integer,
  title varchar(255),
  "updatedAt" timestamp,
  "updatedBy" varchar(40) REFERENCES users,
  "userId" varchar(40) REFERENCES users
);

CREATE UNIQUE INDEX document_id_index ON documents("documentId");

-- Changes:
CREATE TABLE "changes" (
  "documentId" varchar(40) REFERENCES documents,
  version integer,
  data jsonb,
  "createdAt" timestamp,
  "userId" varchar(40) REFERENCES users,
  PRIMARY KEY("documentId", version)
);

-- Index so we can query by documentId and or userId (needed to extract collaborators)
CREATE INDEX changes_document_id_index ON changes("documentId");
CREATE INDEX changes_user_id_index ON changes("userId");
CREATE INDEX changes_document_user_idx_index ON changes("documentId", "userId");

-- Snapshots:
CREATE TABLE "snapshots" (
  "documentId" varchar(40) REFERENCES documents,
  version integer,
  data jsonb,
  created timestamp,
  PRIMARY KEY("documentId", version)
);