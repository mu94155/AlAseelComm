// نص ترحيل الأخبار من النظام القديم إلى النظام الجديد
function migrateOldNewsToNewFormat() {
    const migratedNews = todayNews.map((item, index) => ({
        id: index + 1,
        title: item.title,
        date: item.date,
        content: item.content,
        image: item.image,
        category: getCategoryFromTitle(item.title),
        status: getStatusFromDate(item.date),
        createdAt: new Date(item.date).toISOString()
    }));

    const newDatabase = {
        news: migratedNews,
        metadata: {
            totalNews: migratedNews.length,
            lastUpdated: new Date().toISOString(),
            version: "1.0"
        }
    };

    // طباعة JSON الجديد للنسخ واللصق في newsDatabase.json
    console.log('=== JSON المحدث لقاعدة البيانات ===');
    console.log(JSON.stringify(newDatabase, null, 2));
    
    return newDatabase;
}

// تحديد الفئة بناءً على العنوان
function getCategoryFromTitle(title) {
    if (title.includes('افتتاح')) return 'افتتاح';
    if (title.includes('عروض') || title.includes('خصم')) return 'عروض';
    if (title.includes('مهرجان') || title.includes('فعالية')) return 'فعاليات';
    if (title.includes('تحديث') || title.includes('موقع')) return 'تقنية';
    return 'عام';
}

// تحديد الحالة بناءً على التاريخ
function getStatusFromDate(date) {
    const newsDate = new Date(date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return newsDate < oneYearAgo ? 'archived' : 'active';
}

// تشغيل الترحيل
console.log('بدء ترحيل الأخبار...');
const newDB = migrateOldNewsToNewFormat();
console.log('تم الانتهاء من الترحيل!');
console.log('انسخ JSON أعلاه وضعه في ملف newsDatabase.json');
