// main.js

// ⚠️ هام: يجب تعديل هذا الرابط لاحقاً ليتطابق مع عنوان خادم Node.js الخاص بك.
// حالياً، سنستخدم عنواناً وهمياً.
const SERVER_URL = 'http://localhost:3000'; 
const socket = io(SERVER_URL);

// توليد هوية مؤقتة (Ephemeral ID) للمستخدم لضمان المجهولية
const ephemeralId = 'USER-' + Math.random().toString(36).substring(2, 9);

// بيانات المستخدم الرمزية الأساسية
const userData = {
    ephemeralId: ephemeralId,
    geoCell: 'wide_area_id_placeholder', // سيتم استبدالها لاحقاً بموقع واسع
    chosenRoom: 'Nomad Room', // نستخدم غرفة افتراضية مؤقتاً
    moodSymbol: 'Wave' 
};

// عناصر واجهة المستخدم (لربط الأزرار والأماكن)
const goToSleepButton = document.getElementById('go-to-sleep-button');
const activeSleepersSpan = document.getElementById('active-sleepers');

// ===================================================
// أ. وظائف الاتصال بالسيرفر
// ===================================================

// الوظيفة التي تُنفذ عند الضغط على زر "أنا ذاهب للنوم الآن"
function handleGoToSleep() {
    console.log("إعلان النية: أنا ذاهب للنوم الآن...");
    
    // إرسال البيانات الرمزية إلى الخادم عبر Socket.IO
    socket.emit('join_sleep_session', userData);
    
    // تغيير واجهة المستخدم بعد الدخول في وضع السكون
    goToSleepButton.innerText = "في وضع السكون (اضغط للاستيقاظ)";
    goToSleepButton.classList.add('sleeping');
    
    // هنا يجب بدء مؤقت الـ 2 دقيقة قبل إطفاء الشاشة
    // (سنترك هذه الوظيفة معقدة لوقت لاحق)
}

// ربط الوظيفة بالزر عند تحميل الصفحة
if (goToSleepButton) {
    goToSleepButton.addEventListener('click', handleGoToSleep);
}

// ===================================================
// ب. استقبال التحديثات من الخادم
// ===================================================

// استقبال تحديثات خريطة السكون العالمية
socket.on('sleep_map_update', (data) => {
    // تتلقى البيانات كقائمة مجهولة من النقاط
    const count = data.length;
    console.log(`عدد النائمين الحاليين: ${count}`);
    
    // تحديث رقم النائمين في الواجهة
    if (activeSleepersSpan) {
        activeSleepersSpan.innerText = count;
    }
    
    // هنا يجب إضافة كود عرض النقاط على الخريطة البصرية (سنتجاهله الآن)
});

// رسائل التأكيد والخطأ
socket.on('connect', () => {
    console.log("تم الاتصال بخادم SleepShare بنجاح.");
});

socket.on('disconnect', () => {
    console.log("تم قطع الاتصال بالخادم.");
});
