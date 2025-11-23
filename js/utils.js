// دوال مساعدة عامة للتطبيق

// دالة عرض الإشعارات
function showNotification(message, type = 'success') {
    // إنشاء عنصر الإشعار إذا لم يكن موجوداً
    let notification = document.getElementById('global-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'global-notification';
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// دالة التحقق من البيانات المحفوظة
function checkStoredData() {
    const nameGroups = JSON.parse(localStorage.getItem('lotteryNameGroups'));
    const topicGroups = JSON.parse(localStorage.getItem('lotteryTopicGroups'));
    
    if (!nameGroups || !topicGroups) {
        // تهيئة بيانات افتراضية
        const defaultNameGroups = {
            'المستوى التمهيدي': [],
            'المستوى الأولي': [],
            'المستوى الإعدادي': [],
            'المستوى الثانوي': []
        };
        
        const defaultTopicGroups = {
            'موضوعات ثقافية': [],
            'موضوعات رياضية': [],
            'موضوعات دينية': [],
            'موضوعات لغوية': []
        };
        
        localStorage.setItem('lotteryNameGroups', JSON.stringify(defaultNameGroups));
        localStorage.setItem('lotteryTopicGroups', JSON.stringify(defaultTopicGroups));
    }
}

// دالة تصدير البيانات
function exportData(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// دالة استيراد البيانات
function importData(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            callback(data);
        } catch (error) {
            showNotification('خطأ في معالجة الملف', 'error');
        }
    };
    reader.readAsText(file);
}

// دالة النسخ إلى الحافظة
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم النسخ إلى الحافظة', 'success');
    }).catch(() => {
        // طريقة بديلة للمتصفحات القديمة
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('تم النسخ إلى الحافظة', 'success');
    });
}