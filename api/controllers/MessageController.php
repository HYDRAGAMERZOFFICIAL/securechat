<?php

class MessageController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function processRequest($method) {
        switch ($method) {
            case 'GET':
                $this->getMessages();
                break;
            case 'POST':
                $this->sendMessage();
                break;
            default:
                http_response_code(405);
                echo json_encode(["message" => "Method not allowed"]);
                break;
        }
    }

    private function getMessages() {
        if (!isset($_GET['chat_id'])) {
            http_response_code(400);
            echo json_encode(["message" => "chat_id required"]);
            return;
        }

        $chatId = $_GET['chat_id'];
        $query = "SELECT * FROM messages WHERE chat_id = :chat_id ORDER BY timestamp ASC";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':chat_id', $chatId);
        $stmt->execute();
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($messages);
    }

    private function sendMessage() {
        $data = json_decode(file_get_contents("php://input"));
        
        $query = "INSERT INTO messages (id, chat_id, sender_id, text, status) VALUES (:id, :chat_id, :sender_id, :text, :status)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':chat_id', $data->chat_id);
        $stmt->bindParam(':sender_id', $data->sender_id);
        $stmt->bindParam(':text', $data->text);
        $stmt->bindParam(':status', $data->status);

        if ($stmt->execute()) {
            // Update last message in chat
            $uQuery = "UPDATE chats SET last_message = :text, last_message_timestamp = CURRENT_TIMESTAMP WHERE id = :chat_id";
            $uStmt = $this->db->prepare($uQuery);
            $uStmt->bindParam(':text', $data->text);
            $uStmt->bindParam(':chat_id', $data->chat_id);
            $uStmt->execute();

            echo json_encode(["message" => "Message sent"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to send message"]);
        }
    }
}
?>
