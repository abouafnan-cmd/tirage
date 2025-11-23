// الدوال المساعدة المشتركة

// دالة عرض الإشعارات
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type, 'show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// دالة التحقق من البيانات المحفوظة
function checkStoredData() {
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
    
    if (!localStorage.getItem('lotteryNames')) {
        localStorage.setItem('lotteryNames', JSON.stringify(["أحمد", "محمد", "فاطمة", "سارة", "خالد"]));
    }
    
    if (!localStorage.getItem('lotteryTopics')) {
        localStorage.setItem('lotteryTopics', JSON.stringify(["التسويق الرقمي", "الذكاء الاصطناعي", "التعليم الإلكتروني"]));
    }
}

// دالة تصدير البيانات
function exportData(data, filename, type = 'application/json') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// دالة استيراد من CSV
function importFromCSV(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const items = content.split(',')
                .map(item => item.trim())
                .filter(item => item !== '');
            callback(items);
        } catch (error) {
            showNotification('خطأ في معالجة الملف', 'error');
        }
    };
    reader.readAsText(file);
}

// دالة النسخ إلى الحافظة
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('تم النسخ إلى الحافظة', 'success');
    } catch (err) {
        // طريقة بديلة للمتصفحات القديمة
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('تم النسخ إلى الحافظة', 'success');
    }
}

// دالة تحميل البيانات الحالية
function getCurrentData() {
    const nameGroups = JSON.parse(localStorage.getItem('lotteryNameGroups') || '{}');
    const topicGroups = JSON.parse(localStorage.getItem('lotteryTopicGroups') || '{}');
    const currentNameGroup = Object.keys(nameGroups)[0] || '';
    const currentTopicGroup = Object.keys(topicGroups)[0] || '';
    
    return {
        nameGroups,
        topicGroups,
        currentNameGroup,
        currentTopicGroup,
        currentNames: nameGroups[currentNameGroup] || [],
        currentTopics: topicGroups[currentTopicGroup] || []
    };
}

// دالة تحديث البيانات
function updateCurrentData(nameGroups, topicGroups) {
    localStorage.setItem('lotteryNameGroups', JSON.stringify(nameGroups));
    localStorage.setItem('lotteryTopicGroups', JSON.stringify(topicGroups));
    
    // تحديث البيانات النشطة
    const currentNameGroup = Object.keys(nameGroups)[0] || '';
    const currentTopicGroup = Object.keys(topicGroups)[0] || '';
    
    localStorage.setItem('lotteryNames', JSON.stringify(nameGroups[currentNameGroup] || []));
    localStorage.setItem('lotteryTopics', JSON.stringify(topicGroups[currentTopicGroup] || []));
}