// مدير الأخبار المتقدم
class NewsManager {
    constructor() {
        this.newsDatabase = null;
    }

    // تحميل الأخبار من JSON
    async loadNews() {
        try {
            // أولاً، محاولة تحميل من localStorage (البيانات المحدثة من لوحة الإدارة)
            const localData = localStorage.getItem('newsDatabase');
            if (localData) {
                this.newsDatabase = JSON.parse(localData);
                console.log('تم تحميل الأخبار من التخزين المحلي');
                return;
            }
            
            // إذا لم توجد بيانات محلية، تحميل من ملف JSON
            const response = await fetch('data/newsDatabase.json');
            this.newsDatabase = await response.json();
            console.log('تم تحميل الأخبار من ملف JSON');
        } catch (error) {
            console.error('خطأ في تحميل الأخبار:', error);
            // العودة للنظام القديم إذا فشل تحميل JSON
            if (typeof todayNews !== 'undefined') {
                this.newsDatabase = { news: todayNews.map((item, index) => ({
                    id: index + 1,
                    ...item,
                    category: 'عام',
                    status: 'active',
                    createdAt: new Date(item.date).toISOString()
                })), metadata: {
                    totalNews: todayNews.length,
                    lastUpdated: new Date().toISOString(),
                    version: "1.0"
                }};
                console.log('تم تحميل الأخبار من النظام القديم');
            }
        }
    }

    // الحصول على آخر الأخبار
    getRecentNews(limit = 5) {
        if (!this.newsDatabase) return [];
        
        return this.newsDatabase.news
            .filter(news => news.status === 'active')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // الحصول على جميع الأخبار
    getAllNews() {
        if (!this.newsDatabase) return [];
        
        return this.newsDatabase.news
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // الحصول على الأخبار المؤرشفة
    getArchivedNews() {
        if (!this.newsDatabase) return [];
        
        return this.newsDatabase.news
            .filter(news => news.status === 'archived')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // البحث في الأخبار
    searchNews(query) {
        if (!this.newsDatabase) return [];
        
        const searchTerm = query.toLowerCase();
        return this.newsDatabase.news.filter(news =>
            news.title.toLowerCase().includes(searchTerm) ||
            news.content.toLowerCase().includes(searchTerm)
        );
    }

    // الحصول على الأخبار حسب الفئة
    getNewsByCategory(category) {
        if (!this.newsDatabase) return [];
        
        return this.newsDatabase.news
            .filter(news => news.category === category)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // إضافة خبر جديد (للاستخدام المستقبلي مع نظام إدارة)
    addNews(newsData) {
        if (!this.newsDatabase) return false;
        
        const newNews = {
            id: Math.max(...this.newsDatabase.news.map(n => n.id)) + 1,
            ...newsData,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        this.newsDatabase.news.push(newNews);
        this.newsDatabase.metadata.totalNews = this.newsDatabase.news.length;
        this.newsDatabase.metadata.lastUpdated = new Date().toISOString();
        
        return true;
    }

    // أرشفة خبر
    archiveNews(newsId) {
        if (!this.newsDatabase) return false;
        
        const news = this.newsDatabase.news.find(n => n.id === newsId);
        if (news) {
            news.status = 'archived';
            return true;
        }
        return false;
    }
}

// إنشاء مثيل من مدير الأخبار
const newsManager = new NewsManager();

// تحميل الأخبار عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await newsManager.loadNews();
});
