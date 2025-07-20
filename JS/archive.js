// تحميل جميع الأخبار في صفحة الأرشيف باستخدام النظام الجديد
async function loadAllNews() {
    // التأكد من تحميل مدير الأخبار أولاً
    if (!newsManager.newsDatabase) {
        await newsManager.loadNews();
    }
    
    // الحصول على جميع الأخبار
    const allNews = newsManager.getAllNews();
    
    const newsHTML = allNews.map((item, index) => `
        <article class="news-item archive-news-item" data-news-id="${item.id}">
            <div class="news-number">#${index + 1}</div>
            <div class="news-status ${item.status}">${item.status === 'active' ? 'نشط' : 'مؤرشف'}</div>
            <h3>${item.title}</h3>
            <p class="news-content">${item.content}</p>
            <div class="news-meta">
                <small>تاريخ النشر: ${item.date}</small>
                <span class="news-category">${item.category}</span>
                <span class="news-id">ID: ${item.id}</span>
            </div>
            <img src="${item.image}" alt="${item.title}" class="news-image" style="max-width: 100%; height: auto; margin-top: 10px;">
        </article>
    `).join('');

    const archiveSection = document.getElementById("archive-news");
    if (archiveSection) {
        archiveSection.innerHTML = newsHTML;
    } else {
        console.error("Element with ID 'archive-news' not found.");
    }
    
    // تحديث إحصائيات الأرشيف
    updateArchiveStats(allNews);
}

function updateArchiveStats(allNews) {
    const totalNewsElement = document.getElementById("total-news");
    const lastUpdateElement = document.getElementById("last-update");

    if (totalNewsElement) {
        totalNewsElement.textContent = allNews.length;
    }

    if (lastUpdateElement && allNews.length > 0) {
        // البحث عن آخر تاريخ في الأخبار
        const latestDate = allNews.reduce((latest, news) => {
            return new Date(news.date) > new Date(latest.date) ? news : latest;
        }).date;
        lastUpdateElement.textContent = latestDate;
    }
}

// تحميل الأخبار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllNews();
});
