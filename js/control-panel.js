// إدارة لوحة التحكم
let nameGroups = {};
let topicGroups = {};
let currentNameGroup = '';
let currentTopicGroup = '';

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeControlPanel();
});

function initializeControlPanel() {
    checkStoredData();
    loadData();
    renderLists();
}

function loadData() {
    nameGroups = JSON.parse(localStorage.getItem('lotteryNameGroups') || '{}');
    topicGroups = JSON.parse(localStorage.getItem('lotteryTopicGroups') || '{}');
    
    currentNameGroup = Object.keys(nameGroups)[0] || '';
    currentTopicGroup = Object.keys(topicGroups)[0] || '';
    
    updateNameGroupsUI();
    updateTopicGroupsUI();
    updateStats();
}

function showSection(sectionName) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.panel-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إلغاء تفعيل جميع الأزرار
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار القسم المحدد
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // تفعيل الزر المحدد
    event.target.classList.add('active');
    
    // إذا كان قسم المعاينة، قم بتحميل المعاينة
    if (sectionName === 'preview') {
        loadPreview();
    } else if (sectionName === 'stats') {
        updateStats();
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
    currentNameGroup = groupName;
    
    updateNameGroupsUI();
    updateLotteryPage();
    showNotification(`تم إنشاء مجموعة "${groupName}"`, 'success');
}

function switchNameGroup() {
    const select = document.getElementById('nameGroupSelect');
    const groupName = select.value;
    if (groupName && nameGroups[groupName]) {
        currentNameGroup = groupName;
        updateNameGroupsUI();
        renderLists();
        updateLotteryPage();
        showNotification(`تم التبديل إلى مجموعة "${groupName}"`, 'success');
    }
}

function deleteNameGroup() {
    if (Object.keys(nameGroups).length <= 1) {
        showNotification('لا يمكن حذف جميع المجموعات!', 'error');
        return;
    }
    
    if (!currentNameGroup) return;
    
    if (confirm(`هل أنت متأكد من حذف مجموعة "${currentNameGroup}"؟ سيتم حذف جميع الأسماء فيها.`)) {
        delete nameGroups[currentNameGroup];
        currentNameGroup = Object.keys(nameGroups)[0];
        updateNameGroupsUI();
        renderLists();
        updateLotteryPage();
        showNotification('تم حذف المجموعة', 'success');
    }
}

function renameNameGroup() {
    if (!currentNameGroup) return;
    
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
        updateLotteryPage();
        showNotification('تم تغيير اسم المجموعة', 'success');
    }
}

function updateNameGroupsUI() {
    const select = document.getElementById('nameGroupSelect');
    const groupsList = document.getElementById('nameGroupsList');
    
    // تحديث القائمة المنسدلة
    select.innerHTML = '<option value="">اختر مجموعة...</option>';
    Object.keys(nameGroups).forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        if (group === currentNameGroup) option.selected = true;
        select.appendChild(option);
    });
    
    // تحديث قائمة المجموعات
    groupsList.innerHTML = '';
    Object.keys(nameGroups).forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = `group-card ${group === currentNameGroup ? 'active' : ''}`;
        groupCard.onclick = () => {
            currentNameGroup = group;
            updateNameGroupsUI();
            renderLists();
            updateLotteryPage();
        };
        
        groupCard.innerHTML = `
            <div class="group-name">${group}</div>
            <div class="group-count">${nameGroups[group].length} اسم</div>
        `;
        groupsList.appendChild(groupCard);
    });
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
    currentTopicGroup = groupName;
    
    updateTopicGroupsUI();
    updateLotteryPage();
    showNotification(`تم إنشاء مجموعة "${groupName}"`, 'success');
}

function switchTopicGroup() {
    const select = document.getElementById('topicGroupSelect');
    const groupName = select.value;
    if (groupName && topicGroups[groupName]) {
        currentTopicGroup = groupName;
        updateTopicGroupsUI();
        renderLists();
        updateLotteryPage();
        showNotification(`تم التبديل إلى مجموعة "${groupName}"`, 'success');
    }
}

function deleteTopicGroup() {
    if (Object.keys(topicGroups).length <= 1) {
        showNotification('لا يمكن حذف جميع المجموعات!', 'error');
        return;
    }
    
    if (!currentTopicGroup) return;
    
    if (confirm(`هل أنت متأكد من حذف مجموعة "${currentTopicGroup}"؟ سيتم حذف جميع المواضيع فيها.`)) {
        delete topicGroups[currentTopicGroup];
        currentTopicGroup = Object.keys(topicGroups)[0];
        updateTopicGroupsUI();
        renderLists();
        updateLotteryPage();
        showNotification('تم حذف المجموعة', 'success');
    }
}

function renameTopicGroup() {
    if (!currentTopicGroup) return;
    
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
        updateLotteryPage();
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
            updateLotteryPage();
        };
        
        groupCard.innerHTML = `
            <div class="group-name">${group}</div>
            <div class="group-count">${topicGroups[group].length} موضوع</div>
        `;
        groupsList.appendChild(groupCard);
    });
}

// إضافة العناصر
function addItem(type) {
    const input = document.getElementById(type + 'Input');
    const value = input.value.trim();
    
    if (value === '') {
        showNotification('يرجى إدخال قيمة!', 'error');
        return;
    }
    
    if (type === 'name') {
        if (!currentNameGroup) {
            showNotification('يرجى اختيار مجموعة أسماء أولاً!', 'error');
            return;
        }
        const currentGroup = nameGroups[currentNameGroup];
        if (currentGroup.includes(value)) {
            showNotification('هذا الاسم موجود مسبقاً!', 'error');
            return;
        }
        currentGroup.push(value);
    } else if (type === 'topic') {
        if (!currentTopicGroup) {
            showNotification('يرجى اختيار مجموعة مواضيع أولاً!', 'error');
            return;
        }
        const currentGroup = topicGroups[currentTopicGroup];
        if (currentGroup.includes(value)) {
            showNotification('هذا الموضوع موجود مسبقاً!', 'error');
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

// الاستيراد من الملفات
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
            
            if (items.length > 0) {
                if (type === 'names') {
                    if (!currentNameGroup) {
                        showNotification('يرجى اختيار مجموعة أسماء أولاً!', 'error');
                        return;
                    }
                    const currentGroup = nameGroups[currentNameGroup];
                    const newItems = items.filter(item => !currentGroup.includes(item));
                    nameGroups[currentNameGroup] = [...currentGroup, ...newItems];
                    showNotification(`تم استيراد ${newItems.length} اسم`, 'success');
                } else if (type === 'topics') {
                    if (!currentTopicGroup) {
                        showNotification('يرجى اختيار مجموعة مواضيع أولاً!', 'error');
                        return;
                    }
                    const currentGroup = topicGroups[currentTopicGroup];
                    const newItems = items.filter(item => !currentGroup.includes(item));
                    topicGroups[currentTopicGroup] = [...currentGroup, ...newItems];
                    showNotification(`تم استيراد ${newItems.length} موضوع`, 'success');
                }
                
                updateLotteryPage();
                renderLists();
                fileInput.value = '';
            }
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
            
            if (items.length > 0) {
                if (type === 'names') {
                    if (!currentNameGroup) {
                        showNotification('يرجى اختيار مجموعة أسماء أولاً!', 'error');
                        return;
                    }
                    const currentGroup = nameGroups[currentNameGroup];
                    const newItems = items.filter(item => !currentGroup.includes(item));
                    nameGroups[currentNameGroup] = [...currentGroup, ...newItems];
                    showNotification(`تم استيراد ${newItems.length} اسم من Excel`, 'success');
                } else if (type === 'topics') {
                    if (!currentTopicGroup) {
                        showNotification('يرجى اختيار مجموعة مواضيع أولاً!', 'error');
                        return;
                    }
                    const currentGroup = topicGroups[currentTopicGroup];
                    const newItems = items.filter(item => !currentGroup.includes(item));
                    topicGroups[currentTopicGroup] = [...currentGroup, ...newItems];
                    showNotification(`تم استيراد ${newItems.length} موضوع من Excel`, 'success');
                }
                
                updateLotteryPage();
                renderLists();
                fileInput.value = '';
            }
        } catch (error) {
            showNotification('خطأ في معالجة ملف Excel', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

// دوال المساعدة
function clearCurrentNameGroup() {
    if (!currentNameGroup) return;
    
    if (confirm(`هل أنت متأكد من مسح جميع الأسماء في مجموعة "${currentNameGroup}"؟`)) {
        nameGroups[currentNameGroup] = [];
        updateLotteryPage();
        renderLists();
        showNotification('تم مسح المجموعة الحالية', 'success');
    }
}

function clearCurrentTopicGroup() {
    if (!currentTopicGroup) return;
    
    if (confirm(`هل أنت متأكد من مسح جميع المواضيع في مجموعة "${currentTopicGroup}"؟`)) {
        topicGroups[currentTopicGroup] = [];
        updateLotteryPage();
        renderLists();
        showNotification('تم مسح المجموعة الحالية', 'success');
    }
}

function exportCurrentNameGroup() {
    if (!currentNameGroup) return;
    
    const data = JSON.stringify(nameGroups[currentNameGroup], null, 2);
    exportData(data, `أسماء-${currentNameGroup}.json`);
    showNotification('تم تصدير المجموعة الحالية', 'success');
}

function exportCurrentTopicGroup() {
    if (!currentTopicGroup) return;
    
    const data = JSON.stringify(topicGroups[currentTopicGroup], null, 2);
    exportData(data, `مواضيع-${currentTopicGroup}.json`);
    showNotification('تم تصدير المجموعة الحالية', 'success');
}

function addSampleNames() {
    if (!currentNameGroup) {
        showNotification('يرجى اختيار مجموعة أسماء أولاً!', 'error');
        return;
    }
    
    const sampleNames = ["علي", "حسن", "زينب", "مريم", "يوسف", "إبراهيم", "آمنة", "جمال"];
    const currentGroup = nameGroups[currentNameGroup];
    const newNames = sampleNames.filter(name => !currentGroup.includes(name));
    nameGroups[currentNameGroup] = [...currentGroup, ...newNames];
    updateLotteryPage();
    renderLists();
    showNotification(`تم إضافة ${newNames.length} اسم مثال`, 'success');
}

function addSampleTopics() {
    if (!currentTopicGroup) {
        showNotification('يرجى اختيار مجموعة مواضيع أولاً!', 'error');
        return;
    }
    
    const sampleTopics = ["التعلم الآلي", "البرمجة", "التصميم", "الكتابة", "البحث العلمي"];
    const currentGroup = topicGroups[currentTopicGroup];
    const newTopics = sampleTopics.filter(topic => !currentGroup.includes(topic));
    topicGroups[currentTopicGroup] = [...currentGroup, ...newTopics];
    updateLotteryPage();
    renderLists();
    showNotification(`تم إضافة ${newTopics.length} موضوع مثال`, 'success');
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
    
    document.getElementById('statsNamesCount').textContent = namesCount;
    document.getElementById('statsTopicsCount').textContent = topicsCount;
    document.getElementById('statsCombinationsCount').textContent = namesCount * topicsCount;
}

function loadPreview() {
    const currentNames = nameGroups[currentNameGroup] || [];
    const currentTopics = topicGroups[currentTopicGroup] || [];
    
    document.getElementById('lotteryPreview').innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h3 style="color: #333; margin-bottom: 20px; font-size: 1.8em;">معاينة القرعة</h3>
            <div style="background: #f8f9fa; padding: 25px; border-radius: 20px; margin-bottom: 25px; border: 2px solid #e9ecef;">
                <div style="margin-bottom: 15px; font-size: 1.2em;">
                    <strong>مجموعة الأسماء:</strong> ${currentNameGroup || 'غير محدد'}
                </div>
                <div style="margin-bottom: 20px;">
                    <strong>الأسماء (${currentNames.length}):</strong> ${currentNames.length > 0 ? currentNames.join('، ') : 'لا توجد أسماء'}
                </div>
                <div style="margin-bottom: 15px; font-size: 1.2em;">
                    <strong>مجموعة المواضيع:</strong> ${currentTopicGroup || 'غير محدد'}
                </div>
                <div>
                    <strong>المواضيع (${currentTopics.length}):</strong> ${currentTopics.length > 0 ? currentTopics.join('، ') : 'لا توجد مواضيع'}
                </div>
            </div>
            <button class="btn btn-success" onclick="openLottery()" style="font-size: 1.2em; padding: 15px 30px;">
                <i class="fas fa-play"></i> فتح صفحة القرعة
            </button>
        </div>
    `;
}

function openLottery() {
    window.open('lottery.html', '_blank');
}

function updateLotteryPage() {
    localStorage.setItem('lotteryNameGroups', JSON.stringify(nameGroups));
    localStorage.setItem('lotteryTopicGroups', JSON.stringify(topicGroups));
    
    const activeNames = nameGroups[currentNameGroup] || [];
    const activeTopics = topicGroups[currentTopicGroup] || [];
    
    localStorage.setItem('lotteryNames', JSON.stringify(activeNames));
    localStorage.setItem('lotteryTopics', JSON.stringify(activeTopics));
}

function handleEnter(event, type) {
    if (event.key === 'Enter') {
        addItem(type);
    }
}