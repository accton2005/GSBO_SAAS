<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (!empty($_GET['orgId'])) {
            $query = "SELECT * FROM services WHERE organizationId = :orgId";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':orgId', $_GET['orgId']);
            $stmt->execute();
            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($services);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $id = uniqid('srv_');
        $query = "INSERT INTO services (id, organizationId, name, description) 
                  VALUES (:id, :orgId, :name, :desc)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':orgId', $data->organizationId);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':desc', $data->description);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Service created", "id" => $id]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"));
        $fields = [];
        foreach($data as $key => $value) {
            if ($key !== 'id') $fields[] = "$key = :$key";
        }
        $query = "UPDATE services SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        foreach($data as $key => $value) {
            if ($key !== 'id') {
                $stmt->bindValue(":$key", $value);
            }
        }
        if ($stmt->execute()) {
            echo json_encode(["message" => "Service updated"]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM services WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Service deleted"]);
        }
        break;
}
?>
