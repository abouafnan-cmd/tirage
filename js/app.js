// 1. ربط المتغيرات بعناصر واجهة المستخدم
const verseInput = document.getElementById('verse-input');
const searchBtn = document.getElementById('search-btn');
const resultContainer = document.getElementById('result-container');
const arabicText = document.getElementById('arabic-text');
const englishText = document.getElementById('english-text');
const playAudioBtn = document.getElementById('play-audio-btn');
const grammarNote = document.getElementById('grammar-note');
const vocabularyList = document.getElementById('vocabulary-list');

let currentEnglishText = ""; 
let currentSpeechSpeed = 0.8; // السرعة الافتراضية (بطء متوسط للتعلم)

// 2. دالة جلب البيانات من الملفات الأربعة معاً
async function fetchVerseData(verseNumber) {
    try {
        const [resAr, resEn, resVocab, resGrammar] = await Promise.all([
            fetch('data/arabic.json'),
            fetch('data/english.json'),
            fetch('data/vocabulary.json'),
            fetch('data/grammar.json')
        ]);
        
        const dataAr = await resAr.json();
        const dataEn = await resEn.json();
        const dataVocab = await resVocab.json();
        const dataGrammar = await resGrammar.json();
        
        const arabicKey = "verse_" + verseNumber;
        const englishKey = "2:" + verseNumber;
        
        const arabicVerse = dataAr.verse[arabicKey];
        const englishVerse = dataEn[englishKey]?.t;
        
        if (arabicVerse && englishVerse) {
            const verseData = {
                verse_number: parseInt(verseNumber),
                arabic_text: arabicVerse,
                english_translation: englishVerse,
                linguistic_notes: {
                    grammar: dataGrammar[arabicKey] || "لم تُدرج إضاءة نحوية لهذه الآية بعد.",
                    vocabulary: dataVocab[arabicKey] || []
                }
            };
            
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

// 3. دالة عرض البيانات وتقسيم النص الإنجليزي لتلوين الكلمات
function displayResults(verse) {
    resultContainer.classList.remove('hidden');
    vocabularyList.innerHTML = "";
    
    arabicText.textContent = verse.arabic_text;
    currentEnglishText = verse.english_translation; 
    
    // تقسيم النص الإنجليزي إلى كلمات مستقلة لتمكين ميزة التتبع اللحظي
    englishText.innerHTML = "";
    const words = verse.english_translation.split(" ");
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + " ";
        span.className = "word-token";
        span.id = "word-" + index;
        englishText.appendChild(span);
    });
    
    grammarNote.innerHTML = `<p><strong>فائدة نحوية: </strong>${verse.linguistic_notes.grammar}</p>`;
    
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

// 4. دالة النطق الصوتي مع ميزة تتبع وإبراز الكلمات أثناء نطقها
function playAudio() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentEnglishText);
        utterance.lang = 'en-US';
        utterance.rate = currentSpeechSpeed;
        
        const wordSpans = document.querySelectorAll('.word-token');
        
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                wordSpans.forEach(span => span.classList.remove('active-word'));
                let charCount = 0;
                for (let i = 0; i < wordSpans.length; i++) {
                    charCount += wordSpans[i].textContent.length;
                    if (event.charIndex < charCount) {
                        wordSpans[i].classList.add('active-word');
                        break;
                    }
                }
            }
        };
        
        utterance.onend = () => {
            wordSpans.forEach(span => span.classList.remove('active-word'));
        };
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert("متصفحك لا يدعم خاصية القراءة الصوتية الآلية.");
    }
}

// 5. ميزة الوضع الليلي
const themeToggleBtn = document.getElementById('theme-toggle-btn');
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeToggleBtn.textContent = '☀️ الوضع الفاتح';
    } else {
        themeToggleBtn.textContent = '🌙 الوضع الليلي';
    }
});

// 6. ميزة التحكم بحجم الخط
const arabicParagraph = document.querySelector('.quran-text p');
const englishParagraph = document.querySelector('.translation-text p');
let currentArabicSize = 32; 
let currentEnglishSize = 1.2; 

document.getElementById('font-increase-btn').addEventListener('click', () => {
    if (currentArabicSize < 44) {
        currentArabicSize += 2;
        currentEnglishSize += 0.1;
        arabicParagraph.style.fontSize = currentArabicSize + 'px';
        englishParagraph.style.fontSize = currentEnglishSize + 'rem';
    }
});

document.getElementById('font-decrease-btn').addEventListener('click', () => {
    if (currentArabicSize > 22) {
        currentArabicSize -= 2;
        currentEnglishSize -= 0.1;
        arabicParagraph.style.fontSize = currentArabicSize + 'px';
        englishParagraph.style.fontSize = currentEnglishSize + 'rem';
    }
});

// 7. التحكم في سرعة الصوت
const speedButtons = document.querySelectorAll('.speed-btn');
speedButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        speedButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentSpeechSpeed = parseFloat(e.target.getAttribute('data-speed'));
        if (window.speechSynthesis.speaking) {
            playAudio();
        }
    });
});

// 8. أحداث البحث والاستماع
searchBtn.addEventListener('click', () => {
    const verseNum = verseInput.value;
    if (verseNum && verseNum > 0 && verseNum <= 286) {
        fetchVerseData(verseNum);
    } else {
        alert("الرجاء إدخال رقم آية صحيح بين 1 و 286");
    }
});

playAudioBtn.addEventListener('click', playAudio);

// 9. تسجيل Service Worker للـ PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('js/service-worker.js').catch(error => {
        console.log('Service Worker error:', error);
    });
  });
}