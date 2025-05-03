<?php
header('Content-Type: application/json');

// Thư mục lưu trữ
$storageDir = 'storage';

// Kiểm tra thư mục tồn tại
if (!file_exists($storageDir) || !is_dir($storageDir)) {
    echo json_encode(['success' => false, 'error' => 'Storage directory not found']);
    exit;
}

// Lọc file theo loại nếu có
$filter = isset($_GET['filter']) ? $_GET['filter'] : null;

// Lấy danh sách file
$files = [];
$dirContents = scandir($storageDir);

foreach ($dirContents as $item) {
    // Bỏ qua thư mục . và ..
    if ($item === '.' || $item === '..') {
        continue;
    }
    
    $path = $storageDir . '/' . $item;
    
    // Chỉ lấy file
    if (is_file($path)) {
        $fileInfo = [
            'name' => $item,
            'path' => $path,
            'size' => filesize($path),
            'modified' => filemtime($path)
        ];
        
        // Lọc theo loại file nếu cần
        if ($filter === null || strpos($item, $filter) !== false) {
            $files[] = $fileInfo;
        }
    }
}

// Sắp xếp theo thời gian thay đổi (mới nhất trước)
usort($files, function ($a, $b) {
    return $b['modified'] - $a['modified'];
});

echo json_encode(['success' => true, 'files' => $files]);
?> 