<?php

class UserController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function processRequest($method) {
        switch ($method) {
            case 'GET':
                $this->getAllUsers();
                break;
            case 'POST':
                $this->handlePost();
                break;
            case 'PUT':
                $this->updateUser();
                break;
            default:
                http_response_code(405);
                echo json_encode(["message" => "Method not allowed"]);
                break;
        }
    }

    private function getAllUsers() {
        $query = "SELECT id, username, profile_picture as profilePicture, online FROM users";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($users);
    }

    private function handlePost() {
        $data = json_encode(file_get_contents("php://input"));
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->action)) {
            http_response_code(400);
            echo json_encode(["message" => "Action required"]);
            return;
        }

        if ($data->action === 'login') {
            $this->login($data);
        } else if ($data->action === 'register') {
            $this->register($data);
        }
    }

    private function login($data) {
        $query = "SELECT * FROM users WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Update online status
            $updateQuery = "UPDATE users SET online = 1 WHERE id = :id";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->bindParam(':id', $data->id);
            $updateStmt->execute();
            
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "User not found"]);
        }
    }

    private function register($data) {
        $query = "INSERT INTO users (id, username, profile_picture, online) VALUES (:id, :username, :profile_picture, 1)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':username', $data->username);
        $stmt->bindParam(':profile_picture', $data->profile_picture);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "User registered successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Registration failed"]);
        }
    }

    private function updateUser() {
        $data = json_decode(file_get_contents("php://input"));
        $query = "UPDATE users SET username = :username, profile_picture = :profile_picture WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':username', $data->username);
        $stmt->bindParam(':profile_picture', $data->profilePicture);
        $stmt->bindParam(':id', $data->id);

        if ($stmt->execute()) {
            echo json_encode(["message" => "User updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Update failed"]);
        }
    }
}
?>
