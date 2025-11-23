// تهيئة الصفحة الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    // إضافة تأثيرات عند التمرير
    const features = document.querySelectorAll('.feature');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    features.forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(30px)';
        feature.style.transition = 'all 0.6s ease';
        observer.observe(feature);
    });

    // تحميل إحصائيات سريعة إذا كانت موجودة
    loadQuickStats();
});

function loadQuickStats() {
    // يمكن إضافة إحصائيات سريعة هنا إذا لزم الأمر
    console.log('تطبيق القرعة العشوائية جاهز للاستخدام!');
}