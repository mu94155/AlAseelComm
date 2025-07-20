// اختبار بسيط للتحقق من تدفق البيانات
function testNewsFlow() {
    console.log('=== اختبار تدفق البيانات ===');
    
    // التحقق من وجود localStorage
    const localData = localStorage.getItem('newsDatabase');
    console.log('بيانات localStorage:', localData ? 'موجودة' : 'غير موجودة');
    
    if (localData) {
        const parsed = JSON.parse(localData);
        console.log('عدد الأخبار في localStorage:', parsed.news.length);
        console.log('آخر الأخبار:', parsed.news[parsed.news.length - 1]);
    }
    
    // التحقق من todayNews
    if (typeof todayNews !== 'undefined') {
        console.log('عدد الأخبار في todayNews:', todayNews.length);
        console.log('آخر خبر في todayNews:', todayNews[todayNews.length - 1]);
    }
    
    // التحقق من newsManager
    if (typeof newsManager !== 'undefined' && newsManager.newsDatabase) {
        console.log('عدد الأخبار في newsManager:', newsManager.newsDatabase.news.length);
        console.log('آخر خبر في newsManager:', newsManager.newsDatabase.news[newsManager.newsDatabase.news.length - 1]);
    }
}

// تشغيل الاختبار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(testNewsFlow, 2000); // انتظار 2 ثانية لتحميل البيانات
});
