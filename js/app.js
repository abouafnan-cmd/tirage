// 1. ربط المتغيرات بعناصر واجهة المستخدم (HTML)
const verseInput = document.getElementById('verse-input');
const searchBtn = document.getElementById('search-btn');
const resultContainer = document.getElementById('result-container');
const arabicText = document.getElementById('arabic-text');
const englishText = document.getElementById('english-text');
const playAudioBtn = document.getElementById('play-audio-btn');
const grammarNote = document.getElementById('grammar-note');
const vocabularyList = document.getElementById('vocabulary-list');

let currentEnglishText = ""; // متغير لحفظ النص الإنجليزي للقراءة الصوتية

// 2. دالة جلب البيانات من الملفات الأربعة معاً (بشكل متزامن)
async function fetchVerseData(verseNumber) {
    try {
        // نستخدم Promise.all لضمان تحميل جميع الملفات في نفس اللحظة
        const [resAr, resEn, resVocab, resGrammar] = await Promise.all([
            fetch('data/arabic.json'),
            fetch('data/english.json'),
            fetch('data/vocabulary.json'),
            fetch('data/grammar.json')
        ]);
        
        // تحويل الاستجابات إلى صيغة JSON قابلة للقراءة
        const dataAr = await resAr.json();
        const dataEn = await resEn.json();
        const dataVocab = await resVocab.json();
        const dataGrammar = await resGrammar.json();
        
        // بناء المفاتيح البرمجية للبحث حسب هيكلة كل ملف
        const arabicKey = "verse_" + verseNumber;
        const englishKey = "2:" + verseNumber;
        
        // استخراج النصوص
        const arabicVerse = dataAr.verse[arabicKey];
        const englishVerse = dataEn[englishKey]?.t;
        
        // التحقق من وجود الآية والترجمة
        if (arabicVerse && englishVerse) {
            const verseData = {
                verse_number: parseInt(verseNumber),
                arabic_text: arabicVerse,
                english_translation: englishVerse,
                linguistic_notes: {
                    // إذا لم تُدرج فائدة أو مفردات، سيتم عرض رسالة افتراضية تمنع تعطل المنصة
                    grammar: dataGrammar[arabicKey] || "لم تُدرج إضاءة نحوية لهذه الآية بعد.",
                    vocabulary: dataVocab[arabicKey] || []
                }
            };
            
            // إرسال الكائن المُجمّع لدالة العرض
            displayResults(verseData);
            
        } else {
            alert("عذراً، الآية غير متوفرة أو الرقم المُدخل غير صحيح.");
            resultContainer.classList.add('hidden');
        }
    } catch (error) {
        console.error("حدث خطأ أثناء جلب البيانات:", error);
        alert("حدث خطأ أثناء الاتصال بقاعدة البيانات. تأكد من وجود الملفات الأربعة داخل مجلد data.");
    }
}

// 3. دالة عرض البيانات المستخرجة في واجهة المستخدم
function displayResults(verse) {
    // إظهار منطقة النتائج المخفية
    resultContainer.classList.remove('hidden');
    
    // تفريغ قائمة المفردات السابقة
    vocabularyList.innerHTML = "";
    
    // تعبئة النص القرآني والترجمة
    arabicText.textContent = verse.arabic_text;
    englishText.textContent = verse.english_translation;
    currentEnglishText = verse.english_translation; // التخزين للنطق الصوتي
    
    // تعبئة الإضاءة النحوية
    grammarNote.innerHTML = `<p><strong>فائدة نحوية: </strong>${verse.linguistic_notes.grammar}</p>`;
    
    // تعبئة قائمة المفردات (إذا كانت موجودة)
    if (verse.linguistic_notes.vocabulary.length > 0) {
        verse.linguistic_notes.vocabulary.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong dir="ltr">${item.word}</strong>: ${item.meaning}`;
            vocabularyList.appendChild(li);
        });
    } else {
        vocabularyList.innerHTML = "<li>لم تُدرج مفردات لهذه الآية بعد.</li>";
    }
}

// 4. دالة النطق الصوتي (Web Speech API)
function playAudio() {
    if ('speechSynthesis' in window) {
        // إيقاف أي قراءة سابقة لتجنب تداخل الأصوات
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentEnglishText);
        utterance.lang = 'en-US'; // اللغة الإنجليزية الأمريكية
        utterance.rate = 0.9;     // سرعة هادئة تناسب المتعلمين
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert("متصفحك لا يدعم خاصية القراءة الصوتية الآلية.");
    }
}

// 5. الاستماع لأحداث النقر (الأزرار)
searchBtn.addEventListener('click', () => {
    const verseNum = verseInput.value;
    // التحقق من صحة الرقم (سورة البقرة: 1 إلى 286)
    if (verseNum && verseNum > 0 && verseNum <= 286) {
        fetchVerseData(verseNum);
    } else {
        alert("الرجاء إدخال رقم آية صحيح بين 1 و 286");
    }
});

playAudioBtn.addEventListener('click', playAudio);

// =========================================================================
// 6. إعدادات تطبيق الويب التقدمي (Service Worker للعمل بدون إنترنت)
// =========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('js/service-worker.js')
      .then(registration => {
        console.log('تم تسجيل Service Worker بنجاح.');
      })
      .catch(error => {
        console.log('فشل تسجيل Service Worker:', error);
      });
  });
}