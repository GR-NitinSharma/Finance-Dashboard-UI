<?php
/**
 * GET /api/transactions/:userId
 * Fetches all transactions for a given user.
 * 
 * URL segment: /api/transactions/{userId}
 * $_GET['userId'] is set by the router.
 */

$userId = (int) ($_GET['userId'] ?? 0);

if (!$userId) {
    sendJSON(['success' => false, 'message' => 'Valid userId is required'], 400);
}

$db = getDB();

$stmt = $db->prepare("
    SELECT id, date, amount, category, type, description
    FROM transactions
    WHERE user_id = :user_id
    ORDER BY date DESC
");
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$result = $stmt->execute();

$transactions = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $transactions[] = [
        'id'          => (string) $row['id'],
        'date'        => $row['date'],
        'amount'      => (float)  $row['amount'],
        'category'    => $row['category'],
        'type'        => $row['type'],
        'description' => $row['description'],
    ];
}

sendJSON(['success' => true, 'transactions' => $transactions]);
?>
