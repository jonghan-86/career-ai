// 플로팅 바 표시
window.addEventListener('scroll', function() {
    const floatingBar = document.getElementById('floatingBar');
    const visualHeight = document.querySelector('.main-visual').offsetHeight;
    
    if (window.scrollY > visualHeight * 0.5) {
        floatingBar.classList.add('show');
    } else {
        floatingBar.classList.remove('show');
    }
});

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});
