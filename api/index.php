<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

// Basic routing
// Expected URL: /securechat/api/index.php/users
// Or if using rewrite: /securechat/api/users

$resource = null;
if (isset($uri[4])) {
    $resource = $uri[4];
}

switch ($resource) {
    case 'users':
        require_once 'controllers/UserController.php';
        $controller = new UserController($db);
        $controller->processRequest($_SERVER['REQUEST_METHOD']);
        break;
    case 'chats':
        require_once 'controllers/ChatController.php';
        $controller = new ChatController($db);
        $controller->processRequest($_SERVER['REQUEST_METHOD']);
        break;
    case 'messages':
        require_once 'controllers/MessageController.php';
        $controller = new MessageController($db);
        $controller->processRequest($_SERVER['REQUEST_METHOD']);
        break;
    case 'ai':
        require_once 'controllers/AIController.php';
        $controller = new AIController($db);
        $controller->processRequest($_SERVER['REQUEST_METHOD']);
        break;
    default:
        http_response_code(404);
        echo json_encode(["message" => "Resource not found"]);
        break;
}
?>
