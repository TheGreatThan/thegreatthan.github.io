<?php
header('Content-Type: application/json');

// Kiểm tra nếu có tham số filename
if (!isset($_GET['filename'])) {
    echo json_encode(['success' => false, 'error' => 'Filename is required']);
    exit;
}

// Xử lý tên file để đảm bảo an toàn
$filename = basename($_GET['filename']);
$filepath = 'storage/' . $filename;

// Kiểm tra file tồn tại
if (!file_exists($filepath)) {
    echo json_encode(['success' => false, 'error' => 'File not found']);
    exit;
}

// Đọc nội dung file
$content = file_get_contents($filepath);

if ($content === false) {
    echo json_encode(['success' => false, 'error' => 'Failed to read file']);
    exit;
}

// Trả về nội dung file
echo json_encode(['success' => true, 'content' => json_decode($content)]);
?> 