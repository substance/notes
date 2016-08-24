-- Reset database:

drop table if exists "snapshots";
drop table if exists "changes";
drop table if exists "documents";
drop table if exists "sessions";
drop table if exists "users";

-- Users:
CREATE TABLE "users" (
  user_id varchar(40) UNIQUE PRIMARY KEY,
  email varchar(255) UNIQUE,
  name varchar(255),
  created timestamp,
  login_key varchar(40) UNIQUE
);

CREATE UNIQUE INDEX login_key_index ON users(login_key);

-- Sessions:
CREATE TABLE "sessions" (
  session_token varchar(40) UNIQUE PRIMARY KEY,
  user_id varchar(40) REFERENCES users,
  -- ex timestamp
  created timestamp
);

-- Documents:
CREATE TABLE "documents" (
  document_id varchar(40) UNIQUE PRIMARY KEY,
  schema_name varchar(40),
  schema_version varchar(40),
  info jsonb,
  version integer,
  title varchar(255),
  updated timestamp,
  updated_by varchar(40) REFERENCES users,
  user_id varchar(40) REFERENCES users
);

CREATE UNIQUE INDEX document_id_index ON documents(document_id);

-- Changes:
CREATE TABLE "changes" (
  document_id varchar(40) REFERENCES documents,
  version integer,
  data jsonb,
  created timestamp,
  user_id varchar(40) REFERENCES users,
  PRIMARY KEY(document_id, version)
);

-- Index so we can query by documentId and or userId (needed to extract collaborators)
CREATE INDEX changes_document_id_index ON changes(document_id);
CREATE INDEX changes_user_id_index ON changes(user_id);
CREATE INDEX changes_document_user_idx_index ON changes(document_id, user_id);

-- Snapshots:
CREATE TABLE "snapshots" (
  document_id varchar(40) REFERENCES documents,
  version integer,
  data jsonb,
  created timestamp,
  PRIMARY KEY(document_id, version)
);