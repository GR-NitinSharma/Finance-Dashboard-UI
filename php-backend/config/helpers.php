<?php
/**
 * CORS + JSON Headers Helper
 * Sets common headers for all PHP API responses.
 */

function setCorsHeaders(): void {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function sendJSON(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function getRequestBody(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function logActivity(int $userId, string $username, string $fullName, string $action): void {
    $db = getDB();
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $stmt = $db->prepare("
        INSERT INTO activity_log (user_id, username, full_name, action, ip_address, user_agent)
        VALUES (:user_id, :username, :full_name, :action, :ip, :ua)
    ");
    $stmt->bindValue(':user_id',    $userId,    SQLITE3_INTEGER);
    $stmt->bindValue(':username',   $username,  SQLITE3_TEXT);
    $stmt->bindValue(':full_name',  $fullName,  SQLITE3_TEXT);
    $stmt->bindValue(':action',     $action,    SQLITE3_TEXT);
    $stmt->bindValue(':ip',         $ip,        SQLITE3_TEXT);
    $stmt->bindValue(':ua',         $ua,        SQLITE3_TEXT);
    $stmt->execute();
}
?>
