<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (!empty($_GET['orgId'])) {
            $query = "SELECT * FROM courriers WHERE organizationId = :orgId ORDER BY createdAt DESC";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':orgId', $_GET['orgId']);
            $stmt->execute();
            $courriers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($courriers);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "orgId is required"]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        if (!empty($data->organizationId) && !empty($data->reference)) {
            $id = uniqid('cr_');
            $query = "INSERT INTO courriers (id, organizationId, type, reference, objet, expediteur, destinataire, dateReception, status, priority, createdAt) 
                      VALUES (:id, :orgId, :type, :ref, :obj, :exp, :dest, :dateR, :status, :prio, :created)";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':orgId', $data->organizationId);
            $stmt->bindParam(':type', $data->type);
            $stmt->bindParam(':ref', $data->reference);
            $stmt->bindParam(':obj', $data->objet);
            $stmt->bindParam(':exp', $data->expediteur);
            $stmt->bindParam(':dest', $data->destinataire);
            $stmt->bindParam(':dateR', $data->dateReception);
            $stmt->bindParam(':status', $data->status);
            $stmt->bindParam(':prio', $data->priority);
            $stmt->bindParam(':created', $data->createdAt);

            if ($stmt->execute()) {
                echo json_encode(["message" => "Courrier created", "id" => $id]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Unable to create courrier"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Incomplete data"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}
?>
