<?php
header('Content-Type: application/json');

// Kiểm tra nếu yêu cầu là POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Đảm bảo thư mục storage tồn tại
$storageDir = 'storage';
if (!file_exists($storageDir)) {
    mkdir($storageDir, 0777, true);
}

// Lấy dữ liệu JSON từ yêu cầu
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

// Kiểm tra dữ liệu hợp lệ
if (!isset($data['filename']) || !isset($data['content'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid data format']);
    exit;
}

// Xử lý tên file để đảm bảo an toàn
$filename = basename($data['filename']);
$filepath = $storageDir . '/' . $filename;

// Lưu dữ liệu vào file
if (file_put_contents($filepath, json_encode($data['content'], JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true, 'filepath' => $filepath]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
}
?> 