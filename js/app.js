// تعريف المتغيرات لربطها بعناصر HTML
const verseInput = document.getElementById('verse-input');
const searchBtn = document.getElementById('search-btn');
const resultContainer = document.getElementById('result-container');
const arabicText = document.getElementById('arabic-text');
const englishText = document.getElementById('english-text');
const playAudioBtn = document.getElementById('play-audio-btn');
const grammarNote = document.getElementById('grammar-note');
const vocabularyList = document.getElementById('vocabulary-list');

let currentEnglishText = ""; // متغير لحفظ النص الإنجليزي ليتم نطقه لاحقاً

// دالة لجلب البيانات من ملفي JSON ودمجها برمجياً
async function fetchVerseData(verseNumber) {
    try {
        // 1. جلب ملف النص العربي (تأكد من أن الملف اسمه arabic.json وموجود في مجلد data)
        const responseAr = await fetch('data/arabic.json');
        const dataAr = await responseAr.json();
        
        // 2. جلب ملف الترجمة الإنجليزية (تأكد من أن الملف اسمه english.json وموجود في مجلد data)
        const responseEn = await fetch('data/english.json');
        const dataEn = await responseEn.json();
        
        // 3. بناء المفاتيح البرمجية للبحث حسب هيكلة الملفات
        const arabicKey = "verse_" + verseNumber;
        const englishKey = "2:" + verseNumber;
        
        // 4. استخراج النصوص
        const arabicVerse = dataAr.verse[arabicKey];
        const englishVerse = dataEn[englishKey]?.t;
        
        if (arabicVerse && englishVerse) {
            // تكوين كائن (Object) يتوافق مع دالة العرض الموجودة مسبقاً
            const verseData = {
                verse_number: parseInt(verseNumber),
                arabic_text: arabicVerse,
                english_translation: englishVerse,
                linguistic_notes: {
                    grammar: "هذه مساحة مؤقتة للفوائد النحوية. يمكنك مستقبلاً إنشاء ملف JSON خاص بالإضاءات اللغوية وربطه هنا.",
                    vocabulary: [
                        {word: "تنبيه", meaning: "قم بتغذية هذا القسم بالمفردات مستقبلاً لتعزيز الفائدة التعليمية."}
                    ]
                }
            };
            
            // إرسال البيانات لدالة العرض
            displayResults(verseData);
            
        } else {
            alert("عذراً، الآية غير متوفرة أو الرقم غير صحيح.");
            resultContainer.classList.add('hidden');
        }
    } catch (error) {
        console.error("حدث خطأ أثناء جلب البيانات:", error);
        alert("حدث خطأ أثناء الاتصال بقاعدة البيانات. تأكد من تشغيل المنصة عبر خادم محلي (Local Server).");
    }
}

// دالة لعرض البيانات في الواجهة
function displayResults(verse) {
    // إظهار منطقة النتائج
    resultContainer.classList.remove('hidden');
    
    // تفريغ البيانات السابقة
    vocabularyList.innerHTML = "";
    
    // تعبئة النصوص
    arabicText.textContent = verse.arabic_text;
    englishText.textContent = verse.english_translation;
    currentEnglishText = verse.english_translation; // حفظ النص للقراءة الصوتية
    
    // تعبئة الإضاءات اللغوية (القواعد)
    grammarNote.innerHTML = `<p><strong>فائدة نحوية: </strong>${verse.linguistic_notes.grammar}</p>`;
    
    // تعبئة المفردات في القائمة
    verse.linguistic_notes.vocabulary.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong dir="ltr">${item.word}</strong>: ${item.meaning}`;
        vocabularyList.appendChild(li);
    });
}

// دالة لنطق النص الإنجليزي باستخدام واجهة المتصفح المدمجة
function playAudio() {
    if ('speechSynthesis' in window) {
        // إيقاف أي قراءة سابقة حتى لا تتداخل الأصوات
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentEnglishText);
        utterance.lang = 'en-US'; // تعيين اللغة إلى الإنجليزية الأمريكية
        utterance.rate = 0.9;     // تقليل سرعة القراءة لتناسب المتعلمين
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert("متصفحك لا يدعم خاصية القراءة الصوتية الآلية.");
    }
}

// الاستماع لحدث النقر على زر البحث
searchBtn.addEventListener('click', () => {
    const verseNum = verseInput.value;
    if (verseNum && verseNum > 0 && verseNum <= 286) {
        fetchVerseData(verseNum);
    } else {
        alert("الرجاء إدخال رقم آية صحيح بين 1 و 286");
    }
});

// الاستماع لحدث النقر على زر الاستماع
playAudioBtn.addEventListener('click', playAudio);

// =========================================================================
// إعدادات تطبيق الويب التقدمي (PWA)
// =========================================================================

// تسجيل Service Worker ليعمل التطبيق بدون إنترنت ويتمكن من التحول لتطبيق أندرويد
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('js/service-worker.js')
      .then(registration => {
        console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
      })
      .catch(error => {
        console.log('فشل تسجيل Service Worker:', error);
      });
  });
}