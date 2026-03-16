<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (!empty($_GET['id'])) {
            $query = "SELECT * FROM organizations WHERE id = :id LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $_GET['id']);
            $stmt->execute();
            $org = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($org) {
                $org['settings'] = json_decode($org['settings']);
                echo json_encode($org);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Organization not found"]);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $id = uniqid('org_');
        $query = "INSERT INTO organizations (id, name, domain, subscriptionPlanId, settings) 
                  VALUES (:id, :name, :domain, :plan, :settings)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':domain', $data->domain);
        $stmt->bindParam(':plan', $data->subscriptionPlanId);
        $settings = json_encode($data->settings);
        $stmt->bindParam(':settings', $settings);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Organization created", "id" => $id]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"));
        $fields = [];
        foreach($data as $key => $value) {
            if ($key !== 'id') $fields[] = "$key = :$key";
        }
        $query = "UPDATE organizations SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        foreach($data as $key => $value) {
            if ($key !== 'id') {
                if ($key === 'settings') $value = json_encode($value);
                $stmt->bindValue(":$key", $value);
            }
        }
        if ($stmt->execute()) {
            echo json_encode(["message" => "Organization updated"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Unable to update organization"]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM organizations WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Organization deleted"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Unable to delete organization"]);
        }
        break;
}
?>
