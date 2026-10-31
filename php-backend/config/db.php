<?php
/**
 * Database Configuration
 * Connects to the same SQLite database used by the Node.js server.
 */

// Path to the SQLite DB used by the Node.js server
define('DB_PATH', dirname(__DIR__, 2) . '/server/app.db');

function getDB(): SQLite3 {
    static $db = null;
    if ($db === null) {
        if (!file_exists(DB_PATH)) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database not found. Please start the Node.js server first to initialize the database.'
            ]);
            exit;
        }
        $db = new SQLite3(DB_PATH, SQLITE3_OPEN_READWRITE);
        $db->exec("PRAGMA journal_mode = WAL;");
        $db->exec("PRAGMA foreign_keys = ON;");
    }
    return $db;
}
?>
