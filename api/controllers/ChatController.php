<?php

class ChatController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function processRequest($method) {
        switch ($method) {
            case 'GET':
                $this->getChats();
                break;
            case 'POST':
                $this->createChat();
                break;
            default:
                http_response_code(405);
                echo json_encode(["message" => "Method not allowed"]);
                break;
        }
    }

    private function getChats() {
        if (!isset($_GET['user_id'])) {
            http_response_code(400);
            echo json_encode(["message" => "user_id required"]);
            return;
        }

        $userId = $_GET['user_id'];
        $query = "SELECT c.* FROM chats c 
                  JOIN chat_members cm ON c.id = cm.chat_id 
                  WHERE cm.user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch members for each chat
        foreach ($chats as &$chat) {
            $mQuery = "SELECT user_id FROM chat_members WHERE chat_id = :chat_id";
            $mStmt = $this->db->prepare($mQuery);
            $mStmt->bindParam(':chat_id', $chat['id']);
            $mStmt->execute();
            $chat['members'] = $mStmt->fetchAll(PDO::FETCH_COLUMN);
        }

        echo json_encode($chats);
    }

    private function createChat() {
        $data = json_decode(file_get_contents("php://input"));
        
        $this->db->beginTransaction();
        try {
            $query = "INSERT INTO chats (id, type, name, avatar) VALUES (:id, :type, :name, :avatar)";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $data->id);
            $stmt->bindParam(':type', $data->type);
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':avatar', $data->avatar);
            $stmt->execute();

            foreach ($data->members as $user_id) {
                $mQuery = "INSERT INTO chat_members (chat_id, user_id) VALUES (:chat_id, :user_id)";
                $mStmt = $this->db->prepare($mQuery);
                $mStmt->bindParam(':chat_id', $data->id);
                $mStmt->bindParam(':user_id', $user_id);
                $mStmt->execute();
            }

            $this->db->commit();
            echo json_encode(["message" => "Chat created successfully"]);
        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Failed to create chat", "error" => $e->getMessage()]);
        }
    }
}
?>
