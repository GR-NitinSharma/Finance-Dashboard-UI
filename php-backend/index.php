<?php
/**
 * PHP API Router — Main Entry Point
 * 
 * Routes:
 *   POST   /api/signup              → auth/signup.php
 *   POST   /api/login               → auth/login.php
 *   POST   /api/logout              → auth/logout.php
 *   GET    /api/users               → users/list.php
 *   GET    /api/activity            → users/activity.php
 *   GET    /api/transactions/:id    → transactions/get.php
 *   POST   /api/transactions        → transactions/create.php
 *   PUT    /api/transactions/:id    → transactions/update.php
 *   DELETE /api/transactions/:id    → transactions/delete.php
 *
 * Usage with PHP built-in server:
 *   php -S localhost:8080 php-backend/index.php
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/helpers.php';

setCorsHeaders();

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Strip leading slash and split
$parts = explode('/', trim($uri, '/'));
// Expected pattern: api / <resource> / [id]
// $parts[0] = 'api', $parts[1] = resource, $parts[2] = optional id

if ($parts[0] !== 'api') {
    sendJSON(['success' => false, 'message' => 'Not found'], 404);
}

$resource = $parts[1] ?? '';
$id       = $parts[2] ?? null;

switch ($resource) {

    // ── Auth ─────────────────────────────────────────────────────────────────
    case 'signup':
        if ($method === 'POST') require __DIR__ . '/routes/auth/signup.php';
        else sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        break;

    case 'login':
        if ($method === 'POST') require __DIR__ . '/routes/auth/login.php';
        else sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        break;

    case 'logout':
        if ($method === 'POST') require __DIR__ . '/routes/auth/logout.php';
        else sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        break;

    // ── Users ─────────────────────────────────────────────────────────────────
    case 'users':
        if ($method === 'GET') require __DIR__ . '/routes/users/list.php';
        else sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        break;

    // ── Activity ─────────────────────────────────────────────────────────────
    case 'activity':
        if ($method === 'GET') require __DIR__ . '/routes/users/activity.php';
        else sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        break;

    // ── Transactions ──────────────────────────────────────────────────────────
    case 'transactions':
        switch ($method) {
            case 'GET':
                if ($id !== null) {
                    $_GET['userId'] = $id;
                    require __DIR__ . '/routes/transactions/get.php';
                } else {
                    sendJSON(['success' => false, 'message' => 'User ID required'], 400);
                }
                break;

            case 'POST':
                require __DIR__ . '/routes/transactions/create.php';
                break;

            case 'PUT':
                if ($id !== null) {
                    $_GET['id'] = $id;
                    require __DIR__ . '/routes/transactions/update.php';
                } else {
                    sendJSON(['success' => false, 'message' => 'Transaction ID required'], 400);
                }
                break;

            case 'DELETE':
                if ($id !== null) {
                    $_GET['id'] = $id;
                    require __DIR__ . '/routes/transactions/delete.php';
                } else {
                    sendJSON(['success' => false, 'message' => 'Transaction ID required'], 400);
                }
                break;

            default:
                sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        }
        break;

    // ── Health Check ──────────────────────────────────────────────────────────
    case 'health':
        sendJSON([
            'success' => true,
            'message' => 'PHP backend is running',
            'php_version' => PHP_VERSION,
            'db_path' => DB_PATH,
            'db_exists' => file_exists(DB_PATH),
        ]);
        break;

    default:
        sendJSON(['success' => false, 'message' => "Unknown route: /$resource"], 404);
}
?>
