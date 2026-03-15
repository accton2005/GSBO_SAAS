<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (!empty($_GET['orgId'])) {
            $query = "SELECT id, organizationId, name, displayName, email, photoURL, role, serviceId, lastLogin, createdAt FROM users WHERE organizationId = :orgId";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':orgId', $_GET['orgId']);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($users);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $id = uniqid('usr_');
        $query = "INSERT INTO users (id, organizationId, name, displayName, email, role, password, createdAt) 
                  VALUES (:id, :orgId, :name, :dname, :email, :role, :pass, :created)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':orgId', $data->organizationId);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':dname', $data->displayName);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':role', $data->role);
        $stmt->bindParam(':pass', $data->password);
        $stmt->bindParam(':created', $data->createdAt);

        if ($stmt->execute()) {
            echo json_encode(["message" => "User created", "id" => $id]);
        }
        break;
}
?>
