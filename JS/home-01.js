// تحميل الأخبار باستخدام النظام الجديد
async function loadRecentNews() {
    // التأكد من تحميل مدير الأخبار أولاً
    if (!newsManager.newsDatabase) {
        await newsManager.loadNews();
    }
    
    // الحصول على آخر 5 أخبار
    const recentNews = newsManager.getRecentNews(5);
    
    const news = recentNews.map(item => `
        <article class="news-item" data-news-id="${item.id}">
            <h3>${item.title}</h3>
            <p class="news-content">${item.content}</p>
            <div class="news-meta">
                <small>تاريخ النشر: ${item.date}</small>
                <span class="news-category">${item.category}</span>
            </div>
            <img src="${item.image}" alt="${item.title}" class="news-image" style="max-width: 100%; height: auto; margin-top: 10px;">
        </article>
    `).join('');

    const newsSection = document.getElementById("news");
    if (newsSection) {
        // أضافة الأخبار بعد العنوان مباشرة
        const existingContent = newsSection.innerHTML;
        const h2Index = existingContent.indexOf('</h2>');
        if (h2Index !== -1) {
            const beforeH2 = existingContent.substring(0, h2Index + 5);
            const afterH2 = existingContent.substring(h2Index + 5);
            newsSection.innerHTML = beforeH2 + news + afterH2;
        } else {
            newsSection.innerHTML += news;
        }
    } else {
        console.error("Element with ID 'news' not found.");
    }
}

// تحميل الأخبار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await loadRecentNews();
});

// الاستماع لتحديثات الأخبار من لوحة الإدارة
window.addEventListener('storage', function(e) {
    if (e.key === 'newsDatabase') {
        console.log('تم اكتشاف تحديث في الأخبار، جاري إعادة التحميل...');
        loadRecentNews();
    }
});

// الاستماع للتحديثات من نفس النافذة
window.addEventListener('newsUpdated', function() {
    console.log('تم تحديث الأخبار، جاري إعادة التحميل...');
    loadRecentNews();
});