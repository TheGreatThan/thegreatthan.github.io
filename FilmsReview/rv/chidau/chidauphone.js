function checkWindowSize() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    if (windowWidth < 1350 || windowHeight < 600) {
    }else{
        window.location.href = "./chidau.html";
    }
}

setInterval(checkWindowSize, 500);

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const title = document.querySelector('.movie-title');

    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        title.style.display = 'none'; // Hide duplicate in content area
    } else {
        header.classList.remove('scrolled');
        title.style.display = 'block';
    }
});

window.addEventListener('scroll', () => {
    const scrollTitle = document.querySelector('.scroll-title');
    if (window.scrollY > 50) { // Adjust scroll threshold as needed
        scrollTitle.style.opacity = '1';
        scrollTitle.style.fontSize = '30px'; // Original font size when hidden
    } else {
        scrollTitle.style.opacity = '0';
        scrollTitle.style.fontSize = '0'; // Original font size when hidden
    }
});