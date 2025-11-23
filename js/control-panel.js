// إدارة لوحة التحكم
let nameGroups = JSON.parse(localStorage.getItem('lotteryNameGroups')) || {
    'المستوى التمهيدي': ["أحمد", "محمد", "فاطمة"],
    'المستوى الأولي': ["سارة", "خالد", "ليلى"],
    'المستوى الإعدادي': [],
    'المستوى الثانوي': []
};

let topicGroups = JSON.parse(localStorage.getItem('lotteryTopicGroups')) || {
    'موضوعات ثقافية': ["التسويق الرقمي", "الذكاء الاصطناعي"],
    'موضوعات رياضية': ["كرة القدم", "السباحة"],
    'موضوعات دينية': [],
    'موضوعات لغوية': []
};

let currentNameGroup = Object.keys(nameGroups)[0];
let currentTopicGroup = Object.keys(topicGroups)[0];
let lotteryWindow = null;

// دالة عرض الأقسام
function showSection(sectionName) {
    document.querySelectorAll('.panel-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    event.target.classList.add('active');
    
    if (sectionName === 'preview') {
        loadPreview();
    } else if (sectionName === 'stats') {
        updateStats();
    }
}

// تحديث صفحة القرعة
function updateLotteryPage() {
    const activeNames = nameGroups[currentNameGroup] || [];
    const activeTopics = topicGroups[currentTopicGroup] || [];
    
    localStorage.setItem('lotteryNames', JSON.stringify(activeNames));
    localStorage.setItem('lotteryTopics', JSON.stringify(activeTopics));
    localStorage.setItem('lotteryNameGroups', JSON.stringify(nameGroups));
    localStorage.setItem('lotteryTopicGroups', JSON.stringify(topicGroups));
    
    if (lotteryWindow && !lotteryWindow.closed) {
        lotteryWindow.postMessage({
            type: 'DATA_UPDATED',
            names: activeNames,
            topics: activeTopics
        }, '*');
    }
}

// إدارة مجموعات الأسماء
function createNameGroup() {
    const groupName = document.getElementById('newNameGroup').value.trim();
    if (!groupName) {
        showNotification('يرجى إدخال اسم المجموعة!', 'error');
        return;
    }
    
    if (nameGroups[groupName]) {
        showNotification('المجموعة موجودة مسبقاً!', 'error');
        return;
    }
    
    nameGroups[groupName] = [];
    document.getElementById('newNameGroup').value = '';
    updateNameGroupsUI();
    showNotification(`تم إنشاء مجموعة "${groupName}"`, 'success');
}

function switchNameGroup() {
    const select = document.getElementById('nameGroupSelect');
    const groupName = select.value;
    if (groupName && nameGroups[groupName]) {
        currentNameGroup = groupName;
        updateNameGroupsUI();
        renderLists();
        showNotification(`تم التبديل إلى مجموعة "${groupName}"`, 'success');
    }
}

function deleteNameGroup() {
    if (Object.keys(nameGroups).length <= 1) {
        showNotification('لا يمكن حذف جميع المجموعات!', 'error');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف مجموعة "${currentNameGroup}"؟ سيتم حذف جميع الأسماء فيها.`)) {
        delete nameGroups[currentNameGroup];
        currentNameGroup = Object.keys(nameGroups)[0];
        updateNameGroupsUI();
        renderLists();
        showNotification('تم حذف المجموعة', 'success');
    }
}

function renameNameGroup() {
    const newName = prompt('أدخل الاسم الجديد للمجموعة:', currentNameGroup);
    if (newName && newName.trim() && newName !== currentNameGroup) {
        if (nameGroups[newName]) {
            showNotification('اسم المجموعة موجود مسبقاً!', 'error');
            return;
        }
        nameGroups[newName] = [...nameGroups[currentNameGroup]];
        delete nameGroups[currentNameGroup];
        currentNameGroup = newName;
        updateNameGroupsUI();
        showNotification('تم تغيير اسم المجموعة', 'success');
    }
}

function updateNameGroupsUI() {
    const select = document.getElementById('nameGroupSelect');
    const groupsList = document.getElementById('nameGroupsList');
    
    select.innerHTML = '<option value="">اختر مجموعة...</option>';
    Object.keys(nameGroups).forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        if (group === currentNameGroup) option.selected = true;
        select.appendChild(option);
    });
    
    groupsList.innerHTML = '';
    Object.keys(nameGroups).forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = `group-card ${group === currentNameGroup ? 'active' : ''}`;
        groupCard.onclick = () => {
            currentNameGroup = group;
            updateNameGroupsUI();
            renderLists();
        };
        
        groupCard.innerHTML = `
            <div class="group-actions">
                <button class="btn btn-xs btn-warning" onclick="event.stopPropagation(); duplicateNameGroup('${group}')">نسخ</button>
            </div>
            <div class="group-name">${group}</div>
            <div class="group-count">${nameGroups[group].length} اسم</div>
        `;
        groupsList.appendChild(groupCard);
    });
    
    updateLotteryPage();
}

function duplicateNameGroup(groupName) {
    const newName = prompt(`أدخل اسم للمجموعة الجديدة (نسخة من ${groupName}):`, `${groupName} - نسخة`);
    if (newName && newName.trim()) {
        if (nameGroups[newName]) {
            showNotification('اسم المجموعة موجود مسبقاً!', 'error');
            return;
        }
        nameGroups[newName] = [...nameGroups[groupName]];
        currentNameGroup = newName;
        updateNameGroupsUI();
        renderLists();
        showNotification(`تم نسخ مجموعة "${groupName}" إلى "${newName}"`, 'success');
    }
}

// إدارة مجموعات المواضيع
function createTopicGroup() {
    const groupName = document.getElementById('newTopicGroup').value.trim();
    if (!groupName) {
        showNotification('يرجى إدخال اسم المجموعة!', 'error');
        return;
    }
    
    if (topicGroups[groupName]) {
        showNotification('المجموعة موجودة مسبقاً!', 'error');
        return;
    }
    
    topicGroups[groupName] = [];
    document.getElementById('newTopicGroup').value = '';
    updateTopicGroupsUI();
    showNotification(`تم إنشاء مجموعة "${groupName}"`, 'success');
}

function switchTopicGroup() {
    const select = document.getElementById('topicGroupSelect');
    const groupName = select.value;
    if (groupName && topicGroups[groupName]) {
        currentTopicGroup = groupName;
        updateTopicGroupsUI();
        renderLists();
        showNotification(`تم التبديل إلى مجموعة "${groupName}"`, 'success');
    }
}

function deleteTopicGroup() {
    if (Object.keys(topicGroups).length <= 1) {
        showNotification('لا يمكن حذف جميع المجموعات!', 'error');
        return;
    }
    
    if (confirm(`هل أنت متأكد من حذف مجموعة "${currentTopicGroup}"؟ سيتم حذف جميع المواضيع فيها.`)) {
        delete topicGroups[currentTopicGroup];
        currentTopicGroup = Object.keys(topicGroups)[0];
        updateTopicGroupsUI();
        renderLists();
        showNotification('تم حذف المجموعة', 'success');
    }
}

function renameTopicGroup() {
    const newName = prompt('أدخل الاسم الجديد للمجموعة:', currentTopicGroup);
    if (newName && newName.trim() && newName !== currentTopicGroup) {
        if (topicGroups[newName]) {
            showNotification('اسم المجموعة موجود مسبقاً!', 'error');
            return;
        }
        topicGroups[newName] = [...topicGroups[currentTopicGroup]];
        delete topicGroups[currentTopicGroup];
        currentTopicGroup = newName;
        updateTopicGroupsUI();
        showNotification('تم تغيير اسم المجموعة', 'success');
    }
}

function updateTopicGroupsUI() {
    const select = document.getElementById('topicGroupSelect');
    const groupsList = document.getElementById('topicGroupsList');
    
    select.innerHTML = '<option value="">اختر مجموعة...</option>';
    Object.keys(topicGroups).forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        if (group === currentTopicGroup) option.selected = true;
        select.appendChild(option);
    });
    
    groupsList.innerHTML = '';
    Object.keys(topicGroups).forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = `group-card ${group === currentTopicGroup ? 'active' : ''}`;
        groupCard.onclick = () => {
            currentTopicGroup = group;
            updateTopicGroupsUI();
            renderLists();
        };
        
        groupCard.innerHTML = `
            <div class="group-actions">
                <button class="btn btn-xs btn-warning" onclick="event.stopPropagation(); duplicateTopicGroup('${group}')">نسخ</button>
            </div>
            <div class="group-name">${group}</div>
            <div class="group-count">${topicGroups[group].length} موضوع</div>
        `;
        groupsList.appendChild(groupCard);
    });
    
    updateLotteryPage();
}

function duplicateTopicGroup(groupName) {
    const newName = prompt(`أدخل اسم للمجموعة الجديدة (نسخة من ${groupName}):`, `${groupName} - نسخة`);
    if (newName && newName.trim()) {
        if (topicGroups[newName]) {
            showNotification('اسم المجموعة موجود مسبقاً!', 'error');
            return;
        }
        topicGroups[newName] = [...topicGroups[groupName]];
        currentTopicGroup = newName;
        updateTopicGroupsUI();
        renderLists();
        showNotification(`تم نسخ مجموعة "${groupName}" إلى "${newName}"`, 'success');
    }
}

// إضافة وحذف العناصر
function addItem(type) {
    const input = document.getElementById(type + 'Input');
    const value = input.value.trim();
    
    if (value === '') {
        showNotification('يرجى إدخال قيمة!', 'error');
        return;
    }
    
    if (type === 'name') {
        const currentGroup = nameGroups[currentNameGroup];
        if (currentGroup.includes(value)) {
            showNotification('هذا الاسم موجود مسبقاً في هذه المجموعة!', 'error');
            return;
        }
        currentGroup.push(value);
    } else if (type === 'topic') {
        const currentGroup = topicGroups[currentTopicGroup];
        if (currentGroup.includes(value)) {
            showNotification('هذا الموضوع موجود مسبقاً في هذه المجموعة!', 'error');
            return;
        }
        currentGroup.push(value);
    }
    
    updateLotteryPage();
    input.value = '';
    renderLists();
    showNotification('تم الإضافة بنجاح!', 'success');
}

function deleteItem(type, index) {
    if (confirm('هل أنت متأكد من الحذف؟')) {
        if (type === 'name') {
            nameGroups[currentNameGroup].splice(index, 1);
        } else if (type === 'topic') {
            topicGroups[currentTopicGroup].splice(index, 1);
        }
        
        updateLotteryPage();
        renderLists();
        showNotification('تم الحذف بنجاح!', 'success');
    }
}

// الاستيراد من ملفات
function importFromTXT(type, fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const items = content.split('\n')
                .map(item => item.trim())
                .filter(item => item !== '');
            
            if (type === 'names') {
                const currentGroup = nameGroups[currentNameGroup];
                const newItems = items.filter(item => !currentGroup.includes(item));
                nameGroups[currentNameGroup] = [...currentGroup, ...newItems];
                showNotification(`تم استيراد ${newItems.length} اسم جديد إلى مجموعة "${currentNameGroup}"`, 'success');
            } else if (type === 'topics') {
                const currentGroup = topicGroups[currentTopicGroup];
                const newItems = items.filter(item => !currentGroup.includes(item));
                topicGroups[currentTopicGroup] = [...currentGroup, ...newItems];
                showNotification(`تم استيراد ${newItems.length} موضوع جديد إلى مجموعة "${currentTopicGroup}"`, 'success');
            }
            
            updateLotteryPage();
            renderLists();
            fileInput.value = '';
            
        } catch (error) {
            showNotification('خطأ في معالجة الملف', 'error');
        }
    };
    reader.readAsText(file);
}

function importFromExcel(type, fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            const items = jsonData
                .flat()
                .map(item => item ? item.toString().trim() : '')
                .filter(item => item !== '');
            
            if (type === 'names') {
                const currentGroup = nameGroups[currentNameGroup];
                const newItems = items.filter(item => !currentGroup.includes(item));
                nameGroups[currentNameGroup] = [...currentGroup, ...newItems];
                showNotification(`تم استيراد ${newItems.length} اسم من Excel إلى مجموعة "${currentNameGroup}"`, 'success');
            } else if (type === 'topics') {
                const currentGroup = topicGroups[currentTopicGroup];
                const newItems = items.filter(item => !currentGroup.includes(item));
                topicGroups[currentTopicGroup] = [...currentGroup, ...newItems];
                showNotification(`تم استيراد ${newItems.length} موضوع من Excel إلى مجموعة "${currentTopicGroup}"`, 'success');
            }
            
            updateLotteryPage();
            renderLists();
            fileInput.value = '';
            
        } catch (error) {
            showNotification('خطأ في معالجة ملف Excel', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

// دوال المساعدة
function clearCurrentNameGroup() {
    if (confirm(`هل أنت متأكد من مسح جميع الأسماء في مجموعة "${currentNameGroup}"؟`)) {
        nameGroups[currentNameGroup] = [];
        updateLotteryPage();
        renderLists();
        showNotification('تم مسح المجموعة الحالية', 'success');
    }
}

function clearCurrentTopicGroup() {
    if (confirm(`هل أنت متأكد من مسح جميع المواضيع في مجموعة "${currentTopicGroup}"؟`)) {
        topicGroups[currentTopicGroup] = [];
        updateLotteryPage();
        renderLists();
        showNotification('تم مسح المجموعة الحالية', 'success');
    }
}

function exportCurrentNameGroup() {
    const data = JSON.stringify(nameGroups[currentNameGroup], null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `أسماء-${currentNameGroup}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('تم تصدير المجموعة الحالية', 'success');
}

function exportCurrentTopicGroup() {
    const data = JSON.stringify(topicGroups[currentTopicGroup], null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مواضيع-${currentTopicGroup}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('تم تصدير المجموعة الحالية', 'success');
}

function addSampleNames() {
    const sampleNames = ["علي", "حسن", "زينب", "مريم", "يوسف", "إبراهيم", "آمنة", "جمال"];
    const currentGroup = nameGroups[currentNameGroup];
    const newNames = sampleNames.filter(name => !currentGroup.includes(name));
    nameGroups[currentNameGroup] = [...currentGroup, ...newNames];
    updateLotteryPage();
    renderLists();
    showNotification(`تم إضافة ${newNames.length} اسم مثال`, 'success');
}

function addSampleTopics() {
    const sampleTopics = ["التعلم الآلي", "البرمجة", "التصميم", "الكتابة", "البحث العلمي"];
    const currentGroup = topicGroups[currentTopicGroup];
    const newTopics = sampleTopics.filter(topic => !currentGroup.includes(topic));
    topicGroups[currentTopicGroup] = [...currentGroup, ...newTopics];
    updateLotteryPage();
    renderLists();
    showNotification(`تم إضافة ${newTopics.length} موضوع مثال`, 'success');
}

function pasteFromClipboard(type) {
    navigator.clipboard.readText().then(text => {
        const items = text.split('\n')
            .map(item => item.trim())
            .filter(item => item !== '');
        
        if (items.length > 0) {
            if (type === 'names') {
                const currentGroup = nameGroups[currentNameGroup];
                const newItems = items.filter(item => !currentGroup.includes(item));
                nameGroups[currentNameGroup] = [...currentGroup, ...newItems];
                showNotification(`تم لصق ${newItems.length} اسم من الحافظة`, 'success');
            } else if (type === 'topics') {
                const currentGroup = topicGroups[currentTopicGroup];
                const newItems = items.filter(item => !currentGroup.includes(item));
                topicGroups[currentTopicGroup] = [...currentGroup, ...newItems];
                showNotification(`تم لصق ${newItems.length} موضوع من الحافظة`, 'success');
            }
            
            updateLotteryPage();
            renderLists();
        } else {
            showNotification('لا توجد بيانات في الحافظة', 'error');
        }
    }).catch(() => {
        showNotification('تعذر الوصول إلى الحافظة', 'error');
    });
}

function renderLists() {
    const currentNames = nameGroups[currentNameGroup] || [];
    const currentTopics = topicGroups[currentTopicGroup] || [];
    
    document.getElementById('namesList').innerHTML = currentNames.length === 0 ? 
        '<div class="empty-message">لا توجد أسماء مضافة</div>' :
        currentNames.map((name, index) => `
            <div class="list-item">
                <div class="item-text">${name}</div>
                <div class="item-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteItem('name', ${index})">حذف</button>
                </div>
            </div>
        `).join('');
    
    document.getElementById('topicsList').innerHTML = currentTopics.length === 0 ? 
        '<div class="empty-message">لا توجد مواضيع مضافة</div>' :
        currentTopics.map((topic, index) => `
            <div class="list-item">
                <div class="item-text">${topic}</div>
                <div class="item-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteItem('topic', ${index})">حذف</button>
                </div>
            </div>
        `).join('');
    
    updateStats();
}

function updateStats() {
    const namesCount = nameGroups[currentNameGroup] ? nameGroups[currentNameGroup].length : 0;
    const topicsCount = topicGroups[currentTopicGroup] ? topicGroups[currentTopicGroup].length : 0;
    
    document.getElementById('namesCount').textContent = namesCount;
    document.getElementById('topicsCount').textContent = topicsCount;
    document.getElementById('combinationsCount').textContent = namesCount * topicsCount;
}

function loadPreview() {
    const currentNames = nameGroups[currentNameGroup] || [];
    const currentTopics = topicGroups[currentTopicGroup] || [];
    
    document.getElementById('lotteryPreview').innerHTML = `
        <div class="preview-content">
            <h3 class="preview-title">معاينة القرعة</h3>
            <div class="preview-info">
                <div class="preview-group">
                    <strong>مجموعة الأسماء:</strong> ${currentNameGroup}
                </div>
                <div class="preview-items">
                    <strong>الأسماء (${currentNames.length}):</strong> ${currentNames.length > 0 ? currentNames.join('، ') : 'لا توجد أسماء'}
                </div>
                <div class="preview-group">
                    <strong>مجموعة المواضيع:</strong> ${currentTopicGroup}
                </div>
                <div class="preview-items">
                    <strong>المواضيع (${currentTopics.length}):</strong> ${currentTopics.length > 0 ? currentTopics.join('، ') : 'لا توجد مواضيع'}
                </div>
            </div>
            <button class="btn btn-success" onclick="openLottery()">
                <i class="fas fa-play"></i> فتح صفحة القرعة
            </button>
        </div>
    `;
}

function openLottery() {
    lotteryWindow = window.open('lottery.html', '_blank', 'width=1200,height=800');
}

function handleEnter(event, type) {
    if (event.key === 'Enter') {
        addItem(type);
    }
}

// التحميل الأولي
document.addEventListener('DOMContentLoaded', function() {
    updateNameGroupsUI();
    updateTopicGroupsUI();
    renderLists();
    checkStoredData();
});