<?php
/**
 * POST /api/transactions
 * Creates a new transaction for a user.
 * 
 * Body: { userId, date, amount, category, type, description }
 */

$body = getRequestBody();

$userId      = (int)    ($body['userId']      ?? 0);
$date        = (string) ($body['date']        ?? '');
$amount      = (float)  ($body['amount']      ?? 0);
$category    = (string) ($body['category']    ?? '');
$type        = (string) ($body['type']        ?? '');
$description = (string) ($body['description'] ?? '');

if (!$userId || !$date || !$amount || !$category || !$type || !$description) {
    sendJSON(['success' => false, 'message' => 'All fields are required'], 400);
}

// Validate type
if (!in_array($type, ['income', 'expense'], true)) {
    sendJSON(['success' => false, 'message' => 'Type must be income or expense'], 400);
}

$db = getDB();

$stmt = $db->prepare("
    INSERT INTO transactions (user_id, date, amount, category, type, description)
    VALUES (:user_id, :date, :amount, :category, :type, :description)
");
$stmt->bindValue(':user_id',     $userId,      SQLITE3_INTEGER);
$stmt->bindValue(':date',        $date,        SQLITE3_TEXT);
$stmt->bindValue(':amount',      $amount,      SQLITE3_FLOAT);
$stmt->bindValue(':category',    $category,    SQLITE3_TEXT);
$stmt->bindValue(':type',        $type,        SQLITE3_TEXT);
$stmt->bindValue(':description', $description, SQLITE3_TEXT);
$stmt->execute();

$newId = $db->lastInsertRowID();

sendJSON([
    'success' => true,
    'transaction' => [
        'id'          => (string) $newId,
        'date'        => $date,
        'amount'      => $amount,
        'category'    => $category,
        'type'        => $type,
        'description' => $description,
    ]
]);
?>
