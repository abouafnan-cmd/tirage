// الصفحة الرئيسية
document.addEventListener('DOMContentLoaded', function() {
    console.log('تطبيق القرعة العشوائية جاهز للاستخدام!');
    
    // تهيئة البيانات إذا لم تكن موجودة
    initializeData();
});

function initializeData() {
    if (!localStorage.getItem('lotteryNameGroups')) {
        const defaultNameGroups = {
            'المجموعة الأساسية': ["أحمد", "محمد", "فاطمة", "سارة", "خالد"]
        };
        localStorage.setItem('lotteryNameGroups', JSON.stringify(defaultNameGroups));
    }
    
    if (!localStorage.getItem('lotteryTopicGroups')) {
        const defaultTopicGroups = {
            'المواضيع العامة': ["التسويق الرقمي", "الذكاء الاصطناعي", "التعليم الإلكتروني"]
        };
        localStorage.setItem('lotteryTopicGroups', JSON.stringify(defaultTopicGroups));
    }
}