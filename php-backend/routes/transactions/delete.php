<?php
/**
 * DELETE /api/transactions/:id
 * Deletes a transaction by its ID.
 * 
 * URL segment sets $_GET['id'] via the router.
 */

$id = (int) ($_GET['id'] ?? 0);

if (!$id) {
    sendJSON(['success' => false, 'message' => 'Transaction ID is required'], 400);
}

$db = getDB();

$stmt = $db->prepare('DELETE FROM transactions WHERE id = :id');
$stmt->bindValue(':id', $id, SQLITE3_INTEGER);
$stmt->execute();

sendJSON(['success' => true]);
?>
