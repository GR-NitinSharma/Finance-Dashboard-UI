<?php
/**
 * GET /api/activity
 * Returns last 200 activity log entries.
 */

$db = getDB();

$result = $db->query("
    SELECT *
    FROM activity_log
    ORDER BY timestamp DESC
    LIMIT 200
");

$logs = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $logs[] = $row;
}

sendJSON(['success' => true, 'logs' => $logs]);
?>
