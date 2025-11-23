// إدارة صفحة القرعة
let names = [];
let topics = [];
let isSpinning = false;

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadHistory();
    updateStats();
});

function loadData() {
    checkStoredData();
    
    const savedNames = JSON.parse(localStorage.getItem('lotteryNames'));
    const savedTopics = JSON.parse(localStorage.getItem('lotteryTopics'));
    
    if (savedNames && savedNames.length > 0) {
        names = savedNames;
    } else {
        names = ["أحمد", "محمد", "فاطمة", "خالد", "سارة"];
    }
    
    if (savedTopics && savedTopics.length > 0) {
        topics = savedTopics;
    } else {
        topics = ["التسويق الرقمي", "الذكاء الاصطناعي", "التعليم الإلكتروني"];
    }
    
    updateStats();
}

// الاستماع للرسائل من صفحة التحكم
window.addEventListener('message', function(event) {
    if (event.data.type === 'DATA_UPDATED') {
        names = event.data.names || [];
        topics = event.data.topics || [];
        updateStats();
        showNotification('تم تحديث البيانات من لوحة التحكم!', 'success');
    }
});

function drawName() {
    if (isSpinning) return;
    if (names.length === 0) {
        showNotification('لا توجد أسماء مضافة!', 'error');
        return;
    }
    
    const resultBox = document.getElementById('nameResult');
    startSpinning(resultBox);
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * names.length);
        const selectedName = names[randomIndex];
        stopSpinning(resultBox, selectedName);
        addToHistory('name', selectedName);
    }, 1000);
}

function drawTopic() {
    if (isSpinning) return;
    if (topics.length === 0) {
        showNotification('لا توجد مواضيع مضافة!', 'error');
        return;
    }
    
    const resultBox = document.getElementById('topicResult');
    startSpinning(resultBox);
    
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * topics.length);
        const selectedTopic = topics[randomIndex];
        stopSpinning(resultBox, selectedTopic);
        addToHistory('topic', selectedTopic);
    }, 1000);
}

function drawBoth() {
    if (isSpinning) return;
    if (names.length === 0 || topics.length === 0) {
        showNotification('يجب إضافة أسماء ومواضيع أولاً!', 'error');
        return;
    }
    
    const nameBox = document.getElementById('nameResult');
    const topicBox = document.getElementById('topicResult');
    
    startSpinning(nameBox);
    startSpinning(topicBox);
    
    setTimeout(() => {
        const nameIndex = Math.floor(Math.random() * names.length);
        const topicIndex = Math.floor(Math.random() * topics.length);
        
        const selectedName = names[nameIndex];
        const selectedTopic = topics[topicIndex];
        
        stopSpinning(nameBox, selectedName);
        stopSpinning(topicBox, selectedTopic);
        addToHistory('both', `${selectedName} - ${selectedTopic}`);
    }, 1000);
}

function startSpinning(element) {
    isSpinning = true;
    element.classList.add('spinning');
    element.textContent = '...';
}

function stopSpinning(element, result) {
    element.classList.remove('spinning');
    element.textContent = result;
    isSpinning = false;
}

function clearResult(type) {
    if (type === 'name') {
        document.getElementById('nameResult').textContent = '???';
    } else if (type === 'topic') {
        document.getElementById('topicResult').textContent = '???';
    } else {
        document.getElementById('nameResult').textContent = '???';
        document.getElementById('topicResult').textContent = '???';
    }
}

function addToHistory(type, value) {
    const historyList = document.getElementById('historyList');
    const now = new Date();
    const time = now.toLocaleTimeString('ar-EG');
    
    let typeText = '';
    if (type === 'name') typeText = 'اسم';
    else if (type === 'topic') typeText = 'موضوع';
    else typeText = 'مزدوج';
    
    const historyItem = document.createElement('li');
    historyItem.textContent = `[${time}] ${typeText}: ${value}`;
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // حفظ في localStorage
    saveToLocalStorage(historyItem.textContent);
}

function saveToLocalStorage(item) {
    let history = JSON.parse(localStorage.getItem('lotteryHistory')) || [];
    history.unshift(item);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('lotteryHistory', JSON.stringify(history));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('lotteryHistory')) || [];
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        historyList.appendChild(li);
    });
}

function clearHistory() {
    if (confirm('هل أنت متأكد من مسح سجل السحوبات؟')) {
        localStorage.removeItem('lotteryHistory');
        document.getElementById('historyList').innerHTML = '';
        showNotification('تم مسح سجل السحوبات', 'success');
    }
}

function exportHistory() {
    const history = JSON.parse(localStorage.getItem('lotteryHistory')) || [];
    if (history.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'error');
        return;
    }
    
    const data = history.join('\n');
    exportData(data, 'سجل-السحوبات.txt', 'text/plain;charset=utf-8');
    showNotification('تم تصدير سجل السحوبات', 'success');
}

function updateStats() {
    document.getElementById('namesCount').textContent = names.length;
    document.getElementById('topicsCount').textContent = topics.length;
    document.getElementById('combinationsCount').textContent = names.length * topics.length;
}