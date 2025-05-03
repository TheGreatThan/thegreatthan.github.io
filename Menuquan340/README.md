# Menu Quán 340

Đây là hệ thống menu và quản lý đơn hàng tại Quán 340.

## Tính năng

### Trang Menu Khách hàng
- Hiển thị menu với hình ảnh đẹp mắt
- Phân loại sản phẩm (Cà phê, Trà, Nước giải khát, Khác)
- Thiết kế responsive - tương thích với máy tính và điện thoại
- Giao diện sang trọng, hiện đại
- Hiệu ứng chuyển động mượt mà

### Trang Quản lý Đơn hàng (Admin)
- Quản lý đơn hàng dễ dàng
- Tạo đơn hàng mới
- Theo dõi doanh thu theo ngày, tuần, tháng
- Lọc và tìm kiếm đơn hàng
- Xuất báo cáo dạng Excel
- Lưu trữ dữ liệu trong bộ nhớ trình duyệt

## Hướng dẫn sử dụng

### Trang Menu Khách hàng
1. Mở file `index.html` trong trình duyệt web để xem menu.
2. Bạn có thể lọc menu theo từng loại bằng cách nhấp vào các tab ở trên đầu trang.

### Trang Quản lý Đơn hàng (Admin)
1. Mở file `admin.html` trong trình duyệt web để quản lý đơn hàng.
2. Để tạo đơn hàng mới:
   - Chọn sản phẩm từ danh sách bên trái
   - Điều chỉnh số lượng nếu cần
   - Nhấn "Xác nhận đơn hàng" để hoàn tất
3. Đơn hàng sẽ được lưu vào bộ nhớ của trình duyệt
4. Để xuất báo cáo:
   - Chọn khoảng thời gian (Hôm nay, Hôm qua, 7 ngày qua, Tháng này)
   - Nhấn nút "Xuất báo cáo" để tải xuống file Excel

## Chỉnh sửa dữ liệu

### Chỉnh sửa menu sản phẩm
Để chỉnh sửa giá cả và thông tin sản phẩm, mở file `src/script.js` và thay đổi thông tin trong mảng `menuItems`.

Ví dụ:
```javascript
{
    id: 1,
    name: 'Cà phê đen',
    price: '20,000đ', // Thay đổi giá tại đây
    category: 'coffee',
    description: 'Cà phê nguyên chất đậm đà, thơm nồng',
    image: 'src/assets/images/cafe-den.jpg',
    isFeatured: true
}
```

### Thêm hình ảnh
Để thêm hình ảnh cho sản phẩm, đặt file hình ảnh vào thư mục `src/assets/images/` và cập nhật đường dẫn trong mảng `menuItems` trong file `src/script.js`.

## Lưu ý kỹ thuật
- Dữ liệu đơn hàng được lưu trong localStorage của trình duyệt
- Để xóa tất cả dữ liệu, xóa localStorage của trang web này trong trình duyệt
- Báo cáo Excel sử dụng thư viện SheetJS (xlsx) để tạo và tải xuống file Excel

## Liên hệ
Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào, vui lòng liên hệ với chúng tôi theo thông tin được cung cấp ở cuối trang menu. 