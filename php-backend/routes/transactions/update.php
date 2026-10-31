<?php
/**
 * PUT /api/transactions/:id
 * Updates an existing transaction by ID.
 * 
 * URL segment sets $_GET['id'] via the router.
 * Body: { date, amount, category, type, description }
 */

$id   = (int) ($_GET['id'] ?? 0);
$body = getRequestBody();

$date        = (string) ($body['date']        ?? '');
$amount      = (float)  ($body['amount']      ?? 0);
$category    = (string) ($body['category']    ?? '');
$type        = (string) ($body['type']        ?? '');
$description = (string) ($body['description'] ?? '');

if (!$id) {
    sendJSON(['success' => false, 'message' => 'Transaction ID is required'], 400);
}

if (!$date || $amount === 0.0 || !$category || !$type || !$description) {
    sendJSON(['success' => false, 'message' => 'Missing fields'], 400);
}

$db = getDB();

$stmt = $db->prepare("
    UPDATE transactions
    SET date = :date, amount = :amount, category = :category, type = :type, description = :description
    WHERE id = :id
");
$stmt->bindValue(':date',        $date,        SQLITE3_TEXT);
$stmt->bindValue(':amount',      $amount,      SQLITE3_FLOAT);
$stmt->bindValue(':category',    $category,    SQLITE3_TEXT);
$stmt->bindValue(':type',        $type,        SQLITE3_TEXT);
$stmt->bindValue(':description', $description, SQLITE3_TEXT);
$stmt->bindValue(':id',          $id,          SQLITE3_INTEGER);
$stmt->execute();

sendJSON(['success' => true]);
?>
