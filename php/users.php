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
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
        $query = "INSERT INTO users (id, organizationId, name, displayName, email, role, password, createdAt) 
                  VALUES (:id, :orgId, :name, :dname, :email, :role, :pass, :created)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':orgId', $data->organizationId);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':dname', $data->displayName);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':role', $data->role);
        $stmt->bindParam(':pass', $hashed_password);
        $stmt->bindParam(':created', $data->createdAt);

        if ($stmt->execute()) {
            echo json_encode(["message" => "User created", "id" => $id]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Unable to create user"]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'];
        $data = json_decode(file_get_contents("php://input"));
        $fields = [];
        foreach($data as $key => $value) {
            if ($key !== 'id') $fields[] = "$key = :$key";
        }
        $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        foreach($data as $key => $value) {
            if ($key !== 'id') {
                if ($key === 'password') $value = password_hash($value, PASSWORD_DEFAULT);
                $stmt->bindValue(":$key", $value);
            }
        }
        if ($stmt->execute()) {
            echo json_encode(["message" => "User updated"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Unable to update user"]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'];
        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "User deleted"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Unable to delete user"]);
        }
        break;
}
?>
