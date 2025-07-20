// إدارة الأخبار - واجهة الإدارة
class NewsAdmin {
    constructor() {
        this.newsManager = null;
    }

    async init() {
        // تحميل مدير الأخبار
        this.newsManager = newsManager;
        await this.newsManager.loadNews();
        
        // إعداد النموذج
        this.setupForm();
        
        // تحميل الأخبار الموجودة
        this.loadExistingNews();
        
        // تحديث الإحصائيات
        this.updateStats();
        
        // إعداد البحث والفلترة
        this.setupSearchAndFilter();
        
        // تعيين التاريخ الحالي كافتراضي
        document.getElementById('news-date').valueAsDate = new Date();
    }

    setupForm() {
        const form = document.getElementById('news-form');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newsData = {
            title: formData.get('title').trim(),
            date: formData.get('date'),
            content: formData.get('content').trim(),
            image: formData.get('image').trim(),
            category: formData.get('category'),
            status: formData.get('status')
        };

        // التحقق من صحة البيانات
        if (!this.validateNewsData(newsData)) {
            return;
        }

        try {
            // إضافة الخبر
            const success = await this.addNewsItem(newsData);
            
            if (success) {
                this.showMessage('تم حفظ الخبر بنجاح! ✅', 'success');
                e.target.reset();
                document.getElementById('news-date').valueAsDate = new Date();
                this.loadExistingNews();
                this.updateStats();
                this.hidePreview();
            } else {
                this.showMessage('حدث خطأ أثناء حفظ الخبر ❌', 'error');
            }
        } catch (error) {
            console.error('خطأ في حفظ الخبر:', error);
            this.showMessage('حدث خطأ تقني أثناء حفظ الخبر ❌', 'error');
        }
    }

    validateNewsData(data) {
        const errors = [];

        if (!data.title) errors.push('عنوان الخبر مطلوب');
        if (!data.date) errors.push('تاريخ النشر مطلوب');
        if (!data.content) errors.push('محتوى الخبر مطلوب');
        if (!data.image) errors.push('رابط الصورة مطلوب');
        if (!data.category) errors.push('فئة الخبر مطلوبة');

        if (data.title && data.title.length < 5) {
            errors.push('عنوان الخبر يجب أن يكون 5 أحرف على الأقل');
        }

        if (data.content && data.content.length < 20) {
            errors.push('محتوى الخبر يجب أن يكون 20 حرف على الأقل');
        }

        if (errors.length > 0) {
            this.showMessage('يرجى تصحيح الأخطاء التالية:<br>• ' + errors.join('<br>• '), 'error');
            return false;
        }

        return true;
    }

    async addNewsItem(newsData) {
        try {
            // إضافة الخبر إلى المدير
            const success = this.newsManager.addNews(newsData);
            
            if (success) {
                // حفظ البيانات المحدثة
                await this.saveNewsDatabase();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('خطأ في إضافة الخبر:', error);
            return false;
        }
    }

    async saveNewsDatabase() {
        // حفظ في localStorage للتحديث الفوري
        localStorage.setItem('newsDatabase', JSON.stringify(this.newsManager.newsDatabase));
        
        // تحديث todayNews أيضاً للتوافق مع النظام القديم
        this.updateTodayNewsArray();
        
        // إشعار النوافذ الأخرى بالتحديث
        window.dispatchEvent(new Event('newsUpdated'));
        
        console.log('تم حفظ الأخبار بنجاح');
    }

    updateTodayNewsArray() {
        // تحديث مصفوفة todayNews للتوافق مع الصفحات الأخرى
        const newsArray = this.newsManager.getAllNews()
            .filter(item => item.status === 'active') // فقط الأخبار النشطة
            .map(item => ({
                title: item.title,
                date: item.date,
                content: item.content,
                image: item.image
            }));
        
        // حفظ في localStorage 
        localStorage.setItem('todayNewsArray', JSON.stringify(newsArray));
        
        // تحديث المتغير العام إذا كان موجوداً
        if (typeof window.todayNews !== 'undefined') {
            window.todayNews = newsArray;
        }
        
        console.log('تم تحديث مصفوفة todayNews');
    }

    loadExistingNews() {
        const newsList = document.getElementById('news-list');
        const allNews = this.newsManager.getAllNews();
        
        if (allNews.length === 0) {
            newsList.innerHTML = '<p class="no-news">لا توجد أخبار حالياً</p>';
            return;
        }

        const newsHTML = allNews.map(news => `
            <div class="news-management-item" data-news-id="${news.id}">
                <h4>${news.title}</h4>
                <div class="news-item-meta">
                    <div>
                        <span class="news-category">${news.category}</span>
                        <span class="news-status ${news.status}">${news.status === 'active' ? 'نشط' : 'مؤرشف'}</span>
                        <small>تاريخ النشر: ${news.date}</small>
                    </div>
                    <div class="news-item-actions">
                        <button class="btn-edit" onclick="editNews(${news.id})">✏️ تعديل</button>
                        <button class="btn-archive" onclick="toggleNewsStatus(${news.id})">${news.status === 'active' ? '📦 أرشفة' : '🔄 تفعيل'}</button>
                        <button class="btn-delete" onclick="deleteNews(${news.id})">🗑️ حذف</button>
                    </div>
                </div>
                <p class="news-content-preview">${news.content.substring(0, 100)}${news.content.length > 100 ? '...' : ''}</p>
            </div>
        `).join('');

        newsList.innerHTML = newsHTML;
    }

    updateStats() {
        const allNews = this.newsManager.getAllNews();
        const activeNews = allNews.filter(n => n.status === 'active');
        const archivedNews = allNews.filter(n => n.status === 'archived');

        document.getElementById('total-news-count').textContent = allNews.length;
        document.getElementById('active-news-count').textContent = activeNews.length;
        document.getElementById('archived-news-count').textContent = archivedNews.length;
    }

    setupSearchAndFilter() {
        const searchInput = document.getElementById('search-news');
        const categoryFilter = document.getElementById('filter-category');
        const statusFilter = document.getElementById('filter-status');

        [searchInput, categoryFilter, statusFilter].forEach(element => {
            element.addEventListener('input', () => this.filterNews());
        });
    }

    filterNews() {
        const searchTerm = document.getElementById('search-news').value.toLowerCase();
        const categoryFilter = document.getElementById('filter-category').value;
        const statusFilter = document.getElementById('filter-status').value;

        let filteredNews = this.newsManager.getAllNews();

        // تطبيق البحث النصي
        if (searchTerm) {
            filteredNews = filteredNews.filter(news =>
                news.title.toLowerCase().includes(searchTerm) ||
                news.content.toLowerCase().includes(searchTerm)
            );
        }

        // تطبيق فلتر الفئة
        if (categoryFilter) {
            filteredNews = filteredNews.filter(news => news.category === categoryFilter);
        }

        // تطبيق فلتر الحالة
        if (statusFilter) {
            filteredNews = filteredNews.filter(news => news.status === statusFilter);
        }

        this.displayFilteredNews(filteredNews);
    }

    displayFilteredNews(filteredNews) {
        const newsList = document.getElementById('news-list');
        
        if (filteredNews.length === 0) {
            newsList.innerHTML = '<p class="no-news">لا توجد أخبار تطابق معايير البحث</p>';
            return;
        }

        const newsHTML = filteredNews.map(news => `
            <div class="news-management-item" data-news-id="${news.id}">
                <h4>${news.title}</h4>
                <div class="news-item-meta">
                    <div>
                        <span class="news-category">${news.category}</span>
                        <span class="news-status ${news.status}">${news.status === 'active' ? 'نشط' : 'مؤرشف'}</span>
                        <small>تاريخ النشر: ${news.date}</small>
                    </div>
                    <div class="news-item-actions">
                        <button class="btn-edit" onclick="editNews(${news.id})">✏️ تعديل</button>
                        <button class="btn-archive" onclick="toggleNewsStatus(${news.id})">${news.status === 'active' ? '📦 أرشفة' : '🔄 تفعيل'}</button>
                        <button class="btn-delete" onclick="deleteNews(${news.id})">🗑️ حذف</button>
                    </div>
                </div>
                <p class="news-content-preview">${news.content.substring(0, 100)}${news.content.length > 100 ? '...' : ''}</p>
            </div>
        `).join('');

        newsList.innerHTML = newsHTML;
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = message;
        
        container.innerHTML = '';
        container.appendChild(messageDiv);
        
        // إخفاء الرسالة بعد 5 ثوان
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    hidePreview() {
        document.getElementById('news-preview').classList.add('hidden');
    }
}

// الدوال العامة
function previewNews() {
    const form = document.getElementById('news-form');
    
    const title = form.querySelector('#news-title').value || '';
    const date = form.querySelector('#news-date').value || '';
    const content = form.querySelector('#news-content').value || '';
    const image = form.querySelector('#news-image').value || '';
    const category = form.querySelector('#news-category').value || '';
    const status = form.querySelector('#news-status').value || 'active';

    if (!title || !content) {
        admin.showMessage('يرجى ملء العنوان والمحتوى على الأقل للمعاينة', 'error');
        return;
    }

    const previewHTML = `
        <article class="news-item">
            <div class="news-meta">
                <span class="news-category">${category || 'غير محدد'}</span>
                <span class="news-status ${status}">${status === 'active' ? 'نشط' : 'مؤرشف'}</span>
            </div>
            <h3>${title}</h3>
            <p class="news-content">${content}</p>
            <small>تاريخ النشر: ${date || 'غير محدد'}</small>
            ${image ? `<img src="${image}" alt="${title}" class="news-image" style="max-width: 100%; height: auto; margin-top: 10px;">` : ''}
        </article>
    `;

    document.getElementById('preview-content').innerHTML = previewHTML;
    document.getElementById('news-preview').classList.remove('hidden');
}

function editNews(newsId) {
    const news = admin.newsManager.newsDatabase.news.find(n => n.id === newsId);
    if (!news) return;

    // ملء النموذج ببيانات الخبر
    document.getElementById('news-title').value = news.title;
    document.getElementById('news-date').value = news.date;
    document.getElementById('news-category').value = news.category;
    document.getElementById('news-content').value = news.content;
    document.getElementById('news-image').value = news.image;
    document.getElementById('news-status').value = news.status;

    // تغيير النموذج إلى وضع التعديل
    const form = document.getElementById('news-form');
    form.dataset.editingId = newsId;
    
    const submitBtn = form.querySelector('.btn-save');
    submitBtn.textContent = '🔄 تحديث الخبر';
    submitBtn.style.background = '#ffc107';

    admin.showMessage('تم تحميل الخبر للتعديل 📝', 'info');
    
    // التمرير إلى النموذج
    document.getElementById('add-news').scrollIntoView({ behavior: 'smooth' });
}

function toggleNewsStatus(newsId) {
    const news = admin.newsManager.newsDatabase.news.find(n => n.id === newsId);
    if (!news) return;

    const newStatus = news.status === 'active' ? 'archived' : 'active';
    news.status = newStatus;

    admin.saveNewsDatabase();
    admin.loadExistingNews();
    admin.updateStats();
    
    const statusText = newStatus === 'active' ? 'تم تفعيل' : 'تم أرشفة';
    admin.showMessage(`${statusText} الخبر بنجاح ✅`, 'success');
}

function deleteNews(newsId) {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }

    const newsIndex = admin.newsManager.newsDatabase.news.findIndex(n => n.id === newsId);
    if (newsIndex === -1) return;

    admin.newsManager.newsDatabase.news.splice(newsIndex, 1);
    admin.newsManager.newsDatabase.metadata.totalNews = admin.newsManager.newsDatabase.news.length;

    admin.saveNewsDatabase();
    admin.loadExistingNews();
    admin.updateStats();
    
    admin.showMessage('تم حذف الخبر بنجاح ✅', 'success');
}

function exportNews() {
    const data = admin.newsManager.newsDatabase;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    admin.showMessage('تم تصدير الأخبار بنجاح 📤', 'success');
}

function importNews() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                admin.newsManager.newsDatabase = data;
                admin.saveNewsDatabase();
                admin.loadExistingNews();
                admin.updateStats();
                admin.showMessage('تم استيراد الأخبار بنجاح 📥', 'success');
            } catch (error) {
                console.error('خطأ في قراءة ملف الاستيراد:', error);
                admin.showMessage('خطأ في قراءة ملف الاستيراد ❌', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function backupData() {
    // حفظ في localStorage
    localStorage.setItem('newsBackup', JSON.stringify(admin.newsManager.newsDatabase));
    admin.showMessage('تم إنشاء نسخة احتياطية محلية 💾', 'success');
}

// دالة اختبار لفتح الصفحة الرئيسية
function testAndRefreshHome() {
    // فتح الصفحة الرئيسية في تبويب جديد
    const homeWindow = window.open('Aseel-home-01.html', '_blank');
    
    // إرسال إشعار تحديث
    setTimeout(() => {
        if (homeWindow && homeWindow.location.origin === window.location.origin) {
            homeWindow.postMessage('newsUpdated', window.location.origin);
        }
    }, 1000);
    
    admin.showMessage('تم فتح الصفحة الرئيسية في تبويب جديد للاختبار 🔄', 'info');
}

// تهيئة لوحة الإدارة
let admin;
document.addEventListener('DOMContentLoaded', async () => {
    // التحقق من المصادقة أولاً
    if (!adminAuth.isAdmin()) {
        // إعادة توجيه للصفحة الرئيسية مع رسالة
        alert('يجب تسجيل الدخول كمدير للوصول إلى هذه الصفحة');
        window.location.href = 'Aseel-home-01.html';
        return;
    }
    
    // إذا كان المستخدم مدير، تشغيل لوحة الإدارة
    admin = new NewsAdmin();
    await admin.init();
});
