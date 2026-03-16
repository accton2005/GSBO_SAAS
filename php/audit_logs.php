<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (!empty($_GET['orgId'])) {
            $query = "SELECT * FROM audit_logs WHERE organizationId = :orgId ORDER BY timestamp DESC LIMIT 100";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':orgId', $_GET['orgId']);
            $stmt->execute();
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($logs);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $query = "INSERT INTO audit_logs (organizationId, userId, action, details, resourceId) 
                  VALUES (:orgId, :userId, :action, :details, :resId)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':orgId', $data->organizationId);
        $stmt->bindParam(':userId', $data->userId);
        $stmt->bindParam(':action', $data->action);
        $stmt->bindParam(':details', $data->details);
        $stmt->bindParam(':resId', $data->resourceId);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Audit log created"]);
        }
        break;
}
?>
