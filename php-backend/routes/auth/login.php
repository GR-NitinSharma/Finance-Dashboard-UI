<?php
/**
 * POST /api/login
 * Authenticates a user and returns their profile.
 * 
 * Body: { username, password }
 */

$body = getRequestBody();

$username = trim($body['username'] ?? '');
$password = $body['password']      ?? '';

if (!$username || !$password) {
    sendJSON(['success' => false, 'message' => 'Username and password are required'], 400);
}

$db = getDB();

// Fetch user by username
$stmt = $db->prepare('SELECT * FROM users WHERE username = :username');
$stmt->bindValue(':username', $username, SQLITE3_TEXT);
$result = $stmt->execute();
$user   = $result->fetchArray(SQLITE3_ASSOC);

// Verify password
if (!$user || !password_verify($password, $user['password'])) {
    sendJSON(['success' => false, 'message' => 'Invalid username or password'], 401);
}

// Log login activity
logActivity((int) $user['id'], $user['username'], $user['full_name'], 'LOGIN');

sendJSON([
    'success' => true,
    'user' => [
        'id'         => (string) $user['id'],
        'username'   => $user['username'],
        'fullName'   => $user['full_name'],
        'profession' => $user['profession'],
    ]
]);
?>
