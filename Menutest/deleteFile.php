<?php
header('Content-Type: application/json');

// Kiểm tra nếu yêu cầu là POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Lấy dữ liệu JSON từ yêu cầu
$rawData = file_get_contents('php://input');
$data = json_decode($rawData, true);

// Kiểm tra dữ liệu hợp lệ
if (!isset($data['filename'])) {
    echo json_encode(['success' => false, 'error' => 'Filename is required']);
    exit;
}

// Xử lý tên file để đảm bảo an toàn
$filename = basename($data['filename']);
$filepath = 'storage/' . $filename;

// Kiểm tra file tồn tại
if (!file_exists($filepath)) {
    echo json_encode(['success' => false, 'error' => 'File not found']);
    exit;
}

// Xóa file
if (unlink($filepath)) {
    echo json_encode(['success' => true, 'message' => 'File deleted successfully']);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to delete file']);
}
?> 