<?php

class AIController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function processRequest($method) {
        if ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"));
            $prompt = $data->prompt ?? '';

            // Placeholder for AI logic
            $response = [
                "text" => "AI Response from PHP for: " . $prompt
            ];

            echo json_encode($response);
        } else {
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed"]);
        }
    }
}
?>
