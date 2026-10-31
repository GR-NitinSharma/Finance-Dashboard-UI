<?php
/**
 * GET /api/users
 * Returns all registered users (admin panel use).
 */

$db = getDB();

$result = $db->query("
    SELECT id, username, full_name, profession, plain_password, created_at
    FROM users
    ORDER BY created_at DESC
");

$users = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $users[] = $row;
}

sendJSON(['success' => true, 'users' => $users]);
?>
