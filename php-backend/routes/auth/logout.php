<?php
/**
 * POST /api/logout
 * Logs the logout action for the user.
 * 
 * Body: { userId, username, fullName }
 */

$body = getRequestBody();

$userId   = (int)   ($body['userId']   ?? 0);
$username = (string)($body['username'] ?? '');
$fullName = (string)($body['fullName'] ?? '');

if (!$userId || !$username) {
    sendJSON(['success' => false, 'message' => 'userId and username are required'], 400);
}

// Log logout activity
logActivity($userId, $username, $fullName, 'LOGOUT');

sendJSON(['success' => true]);
?>
