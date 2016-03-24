# BASICS
# -------------------

# Comma separate multiple string values
SELECT GROUP_CONCAT(name) FROM (SELECT name FROM  users);


# Get collaborators for a certain document
SELECT GROUP_CONCAT(name) FROM
  (SELECT u.name FROM changes c INNER JOIN users u ON (c.userId = u.userId) WHERE documentId = 'note-99')

# Get all documents (title + collaborators)

SELECT 
   title, 
   -- collaborators
  (SELECT GROUP_CONCAT(name) FROM (SELECT u.name FROM changes c INNER JOIN users u ON (c.userId = u.userId) WHERE c.documentId = d.documentId))
  FROM documents d;


# Dashboard queries
# -------------------

# My documents (title, creator name, collaborators)

SELECT 
  d.title,
  u.name as creator,
  -- collaborators (all except creator)
  (SELECT GROUP_CONCAT(name) FROM 
    (SELECT u.name FROM changes c INNER JOIN users u ON (c.userId = u.userId)
    WHERE c.documentId = d.documentId AND c.userId != d.userId)) AS collaborators,
  d.updatedAt,
  (SELECT name FROM users WHERE userId=d.updatedBy) AS updatedBy
FROM documents d INNER JOIN users u ON (d.userId = u.userId)
WHERE d.userId = 'testuser2'


# Collaborated docs of testuser (someone else created it but 'testuser' made change)

SELECT 
  d.title,
  u.name as creator,
  -- collaborators (all except creator)
  (SELECT GROUP_CONCAT(name) FROM 
    (SELECT u.name FROM changes c INNER JOIN users u ON (c.userId = u.userId)
    WHERE c.documentId = d.documentId AND c.userId != d.userId)) AS collaborators,
  d.updatedAt,
  (SELECT name FROM users WHERE userId=d.updatedBy) AS updatedBy
FROM documents d INNER JOIN users u ON (d.userId = u.userId)
WHERE d.documentId IN (SELECT documentId FROM changes WHERE userId = 'testuser2') AND d.userId != 'testuser2'


