document.addEventListener('DOMContentLoaded', function() {
    // Menu items data
    const menuItems = [
        {
            id: 1,
            name: 'Cà phê đen',
            price: '20,000đ',
            category: 'coffee',
            description: 'Cà phê nguyên chất đậm đà, thơm nồng',
            image: 'src/assets/images/cafe-den.jpg',
            isFeatured: true
        },
        {
            id: 2,
            name: 'Cà phê sữa',
            price: '20,000đ',
            category: 'coffee',
            description: 'Cà phê pha sữa đặc, ngọt ngào và đậm vị',
            image: 'src/assets/images/cafe-sua.jpg',
            isFeatured: false
        },
        {
            id: 3,
            name: 'C2',
            price: '20,000đ',
            category: 'tea',
            description: 'Trà xanh C2 mát lạnh, giải khát',
            image: 'src/assets/images/c2.jpg',
            isFeatured: false
        },
        {
            id: 4,
            name: 'Wake-up 247',
            price: '20,000đ',
            category: 'coffee',
            description: 'Cà phê sữa Wake-up 247 sẵn sàng tiếp thêm năng lượng',
            image: 'src/assets/images/wake-up.jpg',
            isFeatured: false
        },
        {
            id: 5,
            name: 'Trà bí đao Wonderfarm',
            price: '20,000đ',
            category: 'tea',
            description: 'Trà bí đao thanh mát, giải nhiệt ngày hè',
            image: 'src/assets/images/tra-bi-dao.jpg',
            isFeatured: false
        },
        {
            id: 6,
            name: 'Tea+',
            price: '20,000đ',
            category: 'tea',
            description: 'Trà Tea+ hương vị thơm ngon, sảng khoái',
            image: 'src/assets/images/tea-plus.jpg',
            isFeatured: false
        },
        {
            id: 7,
            name: 'Revive',
            price: '20,000đ',
            category: 'softdrinks',
            description: 'Nước tăng lực Revive giúp phục hồi năng lượng',
            image: 'src/assets/images/revive.jpg',
            isFeatured: false
        },
        {
            id: 8,
            name: 'Coca Cola',
            price: '20,000đ',
            category: 'softdrinks',
            description: 'Nước ngọt Coca Cola sảng khoái',
            image: 'src/assets/images/coca.jpg',
            isFeatured: false
        },
        {
            id: 9,
            name: 'Red Bull',
            price: '20,000đ',
            category: 'softdrinks',
            description: 'Nước tăng lực Red Bull giúp tỉnh táo và tràn đầy năng lượng',
            image: 'src/assets/images/redbull.jpg',
            isFeatured: false
        },
        {
            id: 10,
            name: 'Number 1',
            price: '20,000đ',
            category: 'softdrinks',
            description: 'Nước tăng lực Number 1 sảng khoái, tiếp thêm năng lượng',
            image: 'src/assets/images/number1.jpg',
            isFeatured: false
        },
        {
            id: 11,
            name: 'Sữa đậu nành Tribeco',
            price: '20,000đ',
            category: 'softdrinks',
            description: 'Sữa đậu nành Tribeco dinh dưỡng, tốt cho sức khỏe',
            image: 'src/assets/images/sua-dau-nanh.jpg',
            isFeatured: false
        },
        {
            id: 12,
            name: 'Nước dừa',
            price: '30,000đ',
            category: 'softdrinks',
            description: 'Nước dừa tươi mát, ngọt thanh',
            image: 'src/assets/images/nuoc-dua.jpg',
            isFeatured: true
        },
        {
            id: 13,
            name: 'Thuốc lá Jet',
            price: '30,000đ',
            category: 'others',
            description: 'Thuốc lá Jet',
            image: 'src/assets/images/thuoc-la-jet.jpg',
            isFeatured: false
        },
        {
            id: 14,
            name: 'Thuốc lá Thăng Long',
            price: '20,000đ',
            category: 'others',
            description: 'Thuốc lá Thăng Long',
            image: 'src/assets/images/thuoc-la-thang-long.jpg',
            isFeatured: false
        },
        {
            id: 15,
            name: 'Thuốc lá Sài Gòn',
            price: '20,000đ',
            category: 'others',
            description: 'Thuốc lá Sài Gòn',
            image: 'src/assets/images/thuoc-la-sai-gon.jpg',
            isFeatured: false
        },
        {
            id: 16,
            name: 'Thuốc lá Mèo Mi',
            price: '20,000đ',
            category: 'others',
            description: 'Thuốc lá Mèo Mi',
            image: 'src/assets/images/thuoc-la-meo-mi.jpg',
            isFeatured: false
        }
    ];

    // Function to render menu items
    function renderMenuItems(items) {
        const menuContainer = document.querySelector('.menu-container');
        menuContainer.innerHTML = '';

        items.forEach((item, index) => {
            // Create a delay for animation
            const delay = index * 0.1;
            
            const menuItemHTML = `
                <div class="menu-item" style="animation-delay: ${delay}s;" data-category="${item.category}">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='src/assets/images/placeholder.jpg'">
                    ${item.isFeatured ? '<span class="item-badge">Đặc biệt</span>' : ''}
                    <div class="menu-item-content">
                        <h3>${item.name}</h3>
                        <p class="description">${item.description}</p>
                        <span class="price">${item.price}</span>
                    </div>
                </div>
            `;
            menuContainer.innerHTML += menuItemHTML;
        });
    }

    // Initial render
    renderMenuItems(menuItems);

    // Filter menu items based on category
    const filterButtons = document.querySelectorAll('nav li');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            let filteredItems;

            if (category === 'all') {
                filteredItems = menuItems;
            } else {
                filteredItems = menuItems.filter(item => item.category === category);
            }

            renderMenuItems(filteredItems);
        });
    });

    // Create a placeholder image for missing product images
    function createPlaceholderImage() {
        // Check if placeholder already exists
        fetch('src/assets/images/placeholder.jpg')
            .then(response => {
                if (!response.ok) {
                    console.log('Creating placeholder image');
                    // Create a canvas to generate a placeholder image
                    const canvas = document.createElement('canvas');
                    canvas.width = 400;
                    canvas.height = 300;
                    const ctx = canvas.getContext('2d');
                    
                    // Draw gradient background
                    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
                    gradient.addColorStop(0, '#d4a762');
                    gradient.addColorStop(1, '#a67c52');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, 400, 300);
                    
                    // Draw text
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 30px Montserrat, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('Quán 340', 200, 150);
                    
                    // Convert to data URL and save
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    
                    // Since we can't directly save to file system from browser,
                    // we'll just use this data URL for now
                    console.log('Placeholder image created');
                }
            });
    }
    
    createPlaceholderImage();
}); 