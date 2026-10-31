<?php
/**
 * POST /api/signup
 * Creates a new user account with bcrypt-hashed password.
 * 
 * Body: { username, fullName, profession, password }
 */

$body = getRequestBody();

$username   = trim($body['username']   ?? '');
$fullName   = trim($body['fullName']   ?? '');
$profession = trim($body['profession'] ?? '');
$password   = $body['password']        ?? '';

// Validate required fields
if (!$username || !$fullName || !$profession || !$password) {
    sendJSON(['success' => false, 'message' => 'All fields are required'], 400);
}

$db = getDB();

// Check if username already exists
$check = $db->prepare('SELECT id FROM users WHERE username = :username');
$check->bindValue(':username', $username, SQLITE3_TEXT);
$result = $check->execute();
if ($result->fetchArray(SQLITE3_ASSOC)) {
    sendJSON(['success' => false, 'message' => 'Exists'], 409);
}

// Hash the password (bcrypt with cost 10)
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

// Insert new user
$stmt = $db->prepare("
    INSERT INTO users (username, full_name, profession, password, plain_password)
    VALUES (:username, :full_name, :profession, :password, :plain_password)
");
$stmt->bindValue(':username',       $username,       SQLITE3_TEXT);
$stmt->bindValue(':full_name',      $fullName,       SQLITE3_TEXT);
$stmt->bindValue(':profession',     $profession,     SQLITE3_TEXT);
$stmt->bindValue(':password',       $hashedPassword, SQLITE3_TEXT);
$stmt->bindValue(':plain_password', $password,       SQLITE3_TEXT);
$stmt->execute();

$newId = $db->lastInsertRowID();

// Log signup activity
logActivity($newId, $username, $fullName, 'SIGNUP');

sendJSON([
    'success' => true,
    'user' => [
        'id'         => (string) $newId,
        'username'   => $username,
        'fullName'   => $fullName,
        'profession' => $profession,
    ]
]);
?>
