// آخر 10 أخبار فقط - يتم تحديثها يدوياً
const recentNews = [
    {
        title: "مهرجان التسوق السنوي",
        date: "2023-10-10",
        content: "انضم إلينا في مهرجان التسوق السنوي في مجمع الأصيل التجاري، حيث يمكنك الاستمتاع بالفعاليات الترفيهية والعروض الحصرية.",
        image: "images/shopping-festival.jpg"
    },
    {
        title: "افتتاح مطعم جديد",
        date: "2023-10-15",
        content: "يسرنا الإعلان عن افتتاح مطعم جديد يقدم أشهى الأطباق المحلية والعالمية في مجمع الأصيل التجاري.",
        image: "images/new-restaurant.jpg"
    },
    {
        title: "تحديثات جديدة على الموقع",
        date: "2025-07-10",
        content: "قمنا بتحديث موقعنا الإلكتروني ليصبح أكثر سهولة في الاستخدام، مع تصميم جديد وميزات محسنة.",
        image: "images/website-update.jpg"
    }
];

// دالة لإضافة خبر جديد
function addNews(title, date, content, image) {
    const newNewsItem = { title, date, content, image };
    recentNews.push(newNewsItem);
    
    // إذا تجاوز العدد 10، انقل الأقدم إلى الأرشيف
    if (recentNews.length > 10) {
        const oldestNews = recentNews.shift();
        // هنا يمكنك إضافة كود لحفظ الخبر القديم في ملف الأرشيف
        console.log('تم نقل الخبر إلى الأرشيف:', oldestNews.title);
    }
}
