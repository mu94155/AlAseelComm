// نظام إدارة الأخبار المتكامل - مع المصادقة
class AdminManager {
    constructor() {
        // إعدادات المصادقة
        this.defaultPassword = 'admin123';
        this.passwordKey = 'aseelAdminPassword';
        this.sessionKey = 'aseelAdminSession';
        this.sessionDuration = 60 * 60 * 1000; // 60 دقيقة
        
        // إدارة الأخبار
        this.newsManager = null;
        
        // تهيئة النظام
        this.loadPassword();
        this.init();
    }

    // ==================== نظام المصادقة ====================
    
    // تحميل كلمة المرور من التخزين المحلي
    loadPassword() {
        const storedPassword = localStorage.getItem(this.passwordKey);
        this.adminPassword = storedPassword || this.defaultPassword;
        
        // حفظ كلمة المرور الافتراضية في المرة الأولى
        if (!storedPassword) {
            this.savePassword();
        }
    }

    // حفظ كلمة المرور في التخزين المحلي
    savePassword() {
        localStorage.setItem(this.passwordKey, this.adminPassword);
    }

    async init() {
        // التحقق من المصادقة
        if (!this.checkAuthStatus()) {
            this.setupAuthUI();
            return;
        }
        
        // إذا كان مصادق عليه، تهيئة إدارة الأخبار
        await this.initNewsManagement();
        this.setupAutoLogout();
    }

    // التحقق من حالة المصادقة
    checkAuthStatus() {
        const session = localStorage.getItem(this.sessionKey);
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                
                // التحقق من انتهاء الجلسة
                if (now < sessionData.expiry) {
                    this.showAdminElements();
                    return true;
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('خطأ في قراءة بيانات الجلسة:', error);
                this.logout();
            }
        }
        
        return false;
    }

    // إعداد واجهة المصادقة
    setupAuthUI() {
        this.hideAdminElements();
        this.showAuthRequired();
    }

    // عرض رسالة المصادقة المطلوبة
    showAuthRequired() {
        const container = document.querySelector('.container') || document.body;
        
        const authMessage = document.createElement('div');
        authMessage.id = 'auth-message';
        authMessage.style.cssText = `
            text-align: center;
            padding: 3rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
            margin: 2rem auto;
            max-width: 600px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        `;
        authMessage.innerHTML = `
            <h2>🔐 إدارة الأخبار - تسجيل دخول مطلوب</h2>
            <p style="font-size: 1.1rem; margin: 1.5rem 0;">هذا النظام مخصص لإدارة أخبار مجمع الأصيل التجاري</p>
            <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
                <p style="color: #ffd700; font-weight: bold; font-size: 1.2rem;">💡 كلمة المرور: admin123</p>
            </div>
            <button onclick="adminManager.showLoginModal()" 
                    style="background: #28a745; color: white; border: none; padding: 1rem 2rem; 
                           border-radius: 8px; font-size: 1.1rem; cursor: pointer; margin: 0.5rem;
                           transition: all 0.3s ease;">
                🔐 تسجيل الدخول لإدارة الأخبار
            </button>
            <br>
            <a href="Aseel-home-01.html" 
               style="background: #6c757d; color: white; text-decoration: none; padding: 1rem 2rem; 
                      border-radius: 8px; font-size: 1rem; display: inline-block; margin: 0.5rem;
                      transition: all 0.3s ease;">
                🏠 العودة للرئيسية
            </a>
        `;
        
        container.appendChild(authMessage);
    }

    // إظهار نافذة تسجيل الدخول
    showLoginModal() {
        // إزالة النافذة الموجودة إن وجدت
        this.removeLoginModal();

        const modal = document.createElement('div');
        modal.className = 'admin-login-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 15px; 
                        box-shadow: 0 15px 35px rgba(0,0,0,0.3); max-width: 400px; width: 90%;">
                <h3 style="text-align: center; color: #495057; margin-bottom: 1.5rem;">
                    ⚙️ دخول إدارة الأخبار
                </h3>
                <form id="admin-login-form">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #495057;">
                            كلمة مرور الإدارة:
                        </label>
                        <input type="password" id="admin-password" 
                               style="width: 100%; padding: 0.8rem; border: 2px solid #ced4da; 
                                      border-radius: 8px; font-size: 1rem; box-sizing: border-box;"
                               placeholder="أدخل: admin123"
                               autocomplete="new-password" required>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" 
                                style="background: #007bff; color: white; border: none; 
                                       padding: 0.8rem 1.5rem; border-radius: 8px; 
                                       font-size: 1rem; cursor: pointer; margin: 0.3rem;">
                            دخول
                        </button>
                        <button type="button" onclick="adminManager.removeLoginModal()"
                                style="background: #6c757d; color: white; border: none; 
                                       padding: 0.8rem 1.5rem; border-radius: 8px; 
                                       font-size: 1rem; cursor: pointer; margin: 0.3rem;">
                            إلغاء
                        </button>
                    </div>
                </form>
                <div id="login-message" style="text-align: center; margin-top: 1rem;"></div>
                <p style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 1rem;">
                    💡 كلمة المرور: <strong>admin123</strong>
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        // إعداد النموذج
        const form = document.getElementById('admin-login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // التركيز على حقل كلمة المرور
        document.getElementById('admin-password').focus();
    }

    // إزالة نافذة تسجيل الدخول
    removeLoginModal() {
        const modal = document.querySelector('.admin-login-modal');
        if (modal) {
            modal.remove();
        }
    }

    // معالجة تسجيل الدخول
    handleLogin() {
        const passwordInput = document.getElementById('admin-password');
        const messageDiv = document.getElementById('login-message');
        const password = passwordInput.value;

        if (password === this.adminPassword) {
            // تسجيل دخول ناجح
            const sessionData = {
                authenticated: true,
                expiry: new Date().getTime() + this.sessionDuration,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
            
            this.removeLoginModal();
            this.removeAuthMessage();
            this.showAdminElements();
            this.showSuccessMessage();
            
            // تهيئة إدارة الأخبار
            this.initNewsManagement();
            
        } else {
            // كلمة مرور خاطئة
            messageDiv.innerHTML = '<p style="color: red;">❌ كلمة المرور غير صحيحة - استخدم: admin123</p>';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // إزالة رسالة المصادقة
    removeAuthMessage() {
        const authMessage = document.getElementById('auth-message');
        if (authMessage) {
            authMessage.remove();
        }
    }

    // عرض عناصر الإدارة
    showAdminElements() {
        const adminElements = document.querySelectorAll('.admin-panel, .admin-content');
        adminElements.forEach(element => {
            element.style.display = 'block';
        });
        
        // إضافة زر تسجيل الخروج
        this.addLogoutButton();
        this.addChangePasswordButton();
    }

    // إخفاء عناصر الإدارة
    hideAdminElements() {
        const adminElements = document.querySelectorAll('.admin-panel, .admin-content');
        adminElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // إضافة زر تسجيل الخروج
    addLogoutButton() {
        // إزالة الزر الموجود أولاً
        this.removeLogoutButton();

        const header = document.querySelector('header .header-content') || document.querySelector('header');
        if (header) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'admin-logout-btn';
            logoutBtn.innerHTML = '🚪 خروج';
            logoutBtn.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: #dc3545;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                z-index: 1000;
            `;
            logoutBtn.onclick = () => this.logout();
            header.style.position = 'relative';
            header.appendChild(logoutBtn);
        }
    }

    // إضافة زر تغيير كلمة المرور
    addChangePasswordButton() {
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            const changePasswordBtn = document.createElement('button');
            changePasswordBtn.innerHTML = '🔑 تغيير كلمة المرور';
            changePasswordBtn.style.cssText = `
                position: absolute;
                top: 10px;
                left: 140px;
                background: #28a745;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                z-index: 1000;
            `;
            changePasswordBtn.onclick = () => this.showChangePasswordModal();
            logoutBtn.parentNode.appendChild(changePasswordBtn);
        }
    }

    // إظهار نافذة تغيير كلمة المرور
    showChangePasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'admin-change-password-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(5px);"></div>
            <div style="background: white; padding: 2rem; border-radius: 15px; 
                        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); max-width: 450px; width: 90%; 
                        position: relative; z-index: 10000;">
                <h3 style="text-align: center; color: #495057; margin-bottom: 1.5rem; font-size: 1.3rem;">
                    🔑 تغيير كلمة المرور
                </h3>
                <form id="change-password-form">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #495057;">
                            كلمة المرور الحالية:
                        </label>
                        <input type="password" id="current-password" 
                               style="width: 100%; padding: 0.8rem; border: 2px solid #ced4da; 
                                      border-radius: 8px; font-size: 1rem; box-sizing: border-box;" required>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #495057;">
                            كلمة المرور الجديدة:
                        </label>
                        <input type="password" id="new-password" 
                               style="width: 100%; padding: 0.8rem; border: 2px solid #ced4da; 
                                      border-radius: 8px; font-size: 1rem; box-sizing: border-box;"
                               minlength="6" required>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #495057;">
                            تأكيد كلمة المرور الجديدة:
                        </label>
                        <input type="password" id="confirm-password" 
                               style="width: 100%; padding: 0.8rem; border: 2px solid #ced4da; 
                                      border-radius: 8px; font-size: 1rem; box-sizing: border-box;"
                               minlength="6" required>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                        <button type="submit" 
                                style="background: #28a745; color: white; border: none; 
                                       padding: 0.8rem 1.5rem; border-radius: 8px; 
                                       font-size: 1rem; cursor: pointer;">
                            تغيير كلمة المرور
                        </button>
                        <button type="button" onclick="adminManager.removeChangePasswordModal()"
                                style="background: #6c757d; color: white; border: none; 
                                       padding: 0.8rem 1.5rem; border-radius: 8px; 
                                       font-size: 1rem; cursor: pointer;">
                            إلغاء
                        </button>
                    </div>
                </form>
                <div id="change-password-message" style="text-align: center; margin-top: 1rem; font-weight: bold;"></div>
            </div>
        `;

        document.body.appendChild(modal);

        // إعداد النموذج
        const form = document.getElementById('change-password-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChangePassword();
        });
    }

    // معالجة تغيير كلمة المرور
    handleChangePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const messageDiv = document.getElementById('change-password-message');

        // التحقق من كلمة المرور الحالية
        if (currentPassword !== this.adminPassword) {
            messageDiv.innerHTML = '<span style="color: red;">❌ كلمة المرور الحالية غير صحيحة</span>';
            return;
        }

        // التحقق من تطابق كلمة المرور الجديدة
        if (newPassword !== confirmPassword) {
            messageDiv.innerHTML = '<span style="color: red;">❌ كلمة المرور الجديدة غير متطابقة</span>';
            return;
        }

        // التحقق من طول كلمة المرور
        if (newPassword.length < 6) {
            messageDiv.innerHTML = '<span style="color: red;">❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل</span>';
            return;
        }

        // تحديث كلمة المرور
        this.adminPassword = newPassword;
        this.savePassword();

        messageDiv.innerHTML = '<span style="color: green;">✅ تم تغيير كلمة المرور بنجاح</span>';
        
        // إغلاق النافذة بعد ثانيتين
        setTimeout(() => {
            this.removeChangePasswordModal();
        }, 2000);
    }

    // إزالة نافذة تغيير كلمة المرور
    removeChangePasswordModal() {
        const modal = document.querySelector('.admin-change-password-modal');
        if (modal) {
            modal.remove();
        }
    }

    // إزالة زر تسجيل الخروج
    removeLogoutButton() {
        const existingBtn = document.getElementById('admin-logout-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
    }

    // تسجيل الخروج
    logout() {
        localStorage.removeItem(this.sessionKey);
        this.removeLogoutButton();
        window.location.reload();
    }

    // رسالة نجاح تسجيل الدخول
    showSuccessMessage() {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            color: #155724;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid #c3e6cb;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        alert.innerHTML = '✅ مرحباً بك في لوحة إدارة الأخبار!';
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }

    // إعداد تسجيل الخروج التلقائي
    setupAutoLogout() {
        // تسجيل خروج تلقائي عند عدم النشاط
        let inactiveTime = 0;
        const maxInactiveTime = 30; // 30 دقيقة

        const resetTimer = () => {
            inactiveTime = 0;
        };

        // إعادة تعيين العداد عند النشاط
        document.addEventListener('mousemove', resetTimer);
        document.addEventListener('keypress', resetTimer);
        document.addEventListener('click', resetTimer);

        // فحص كل دقيقة
        setInterval(() => {
            inactiveTime++;
            if (inactiveTime >= maxInactiveTime) {
                alert('تم تسجيل الخروج تلقائياً بسبب عدم النشاط');
                this.logout();
            }
        }, 60000); // كل دقيقة
    }

    // التحقق من كون المستخدم مدير
    isAdmin() {
        return this.checkAuthStatus();
    }

    // ==================== إدارة الأخبار ====================

    async initNewsManagement() {
        // تحميل مدير الأخبار
        this.newsManager = newsManager;
        await this.newsManager.loadNews();
        
        // إعداد النموذج إذا كان موجوداً
        if (document.getElementById('news-form')) {
            this.setupNewsForm();
            this.loadExistingNews();
            this.updateStats();
            this.setupSearchAndFilter();
            
            // تعيين التاريخ الحالي كافتراضي
            const dateInput = document.getElementById('news-date');
            if (dateInput) {
                dateInput.valueAsDate = new Date();
            }
        }
    }

    setupNewsForm() {
        const form = document.getElementById('news-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleNewsFormSubmit(e));
        }
    }

    async handleNewsFormSubmit(e) {
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
                this.showNewsMessage('تم حفظ الخبر بنجاح! ✅', 'success');
                e.target.reset();
                const dateInput = document.getElementById('news-date');
                if (dateInput) dateInput.valueAsDate = new Date();
                this.loadExistingNews();
                this.updateStats();
                this.hidePreview();
            } else {
                this.showNewsMessage('حدث خطأ أثناء حفظ الخبر ❌', 'error');
            }
        } catch (error) {
            console.error('خطأ في حفظ الخبر:', error);
            this.showNewsMessage('حدث خطأ تقني أثناء حفظ الخبر ❌', 'error');
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
            this.showNewsMessage('يرجى تصحيح الأخطاء التالية:<br>• ' + errors.join('<br>• '), 'error');
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
        if (!newsList) return;
        
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
                        <button class="btn-edit" onclick="adminManager.editNews(${news.id})">✏️ تعديل</button>
                        <button class="btn-archive" onclick="adminManager.toggleNewsStatus(${news.id})">${news.status === 'active' ? '📦 أرشفة' : '🔄 تفعيل'}</button>
                        <button class="btn-delete" onclick="adminManager.deleteNews(${news.id})">🗑️ حذف</button>
                    </div>
                </div>
                <p class="news-content-preview">${news.content.substring(0, 100)}${news.content.length > 100 ? '...' : ''}</p>
            </div>
        `).join('');

        newsList.innerHTML = newsHTML;
    }

    updateStats() {
        const totalElement = document.getElementById('total-news-count');
        const activeElement = document.getElementById('active-news-count');
        const archivedElement = document.getElementById('archived-news-count');
        
        if (totalElement && activeElement && archivedElement) {
            const allNews = this.newsManager.getAllNews();
            const activeNews = allNews.filter(n => n.status === 'active');
            const archivedNews = allNews.filter(n => n.status === 'archived');

            totalElement.textContent = allNews.length;
            activeElement.textContent = activeNews.length;
            archivedElement.textContent = archivedNews.length;
        }
    }

    setupSearchAndFilter() {
        const searchInput = document.getElementById('search-news');
        const categoryFilter = document.getElementById('filter-category');
        const statusFilter = document.getElementById('filter-status');

        [searchInput, categoryFilter, statusFilter].forEach(element => {
            if (element) {
                element.addEventListener('input', () => this.filterNews());
            }
        });
    }

    filterNews() {
        const searchTerm = document.getElementById('search-news')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('filter-category')?.value || '';
        const statusFilter = document.getElementById('filter-status')?.value || '';

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
        if (!newsList) return;
        
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
                        <button class="btn-edit" onclick="adminManager.editNews(${news.id})">✏️ تعديل</button>
                        <button class="btn-archive" onclick="adminManager.toggleNewsStatus(${news.id})">${news.status === 'active' ? '📦 أرشفة' : '🔄 تفعيل'}</button>
                        <button class="btn-delete" onclick="adminManager.deleteNews(${news.id})">🗑️ حذف</button>
                    </div>
                </div>
                <p class="news-content-preview">${news.content.substring(0, 100)}${news.content.length > 100 ? '...' : ''}</p>
            </div>
        `).join('');

        newsList.innerHTML = newsHTML;
    }

    showNewsMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        if (!container) return;
        
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
        const preview = document.getElementById('news-preview');
        if (preview) {
            preview.classList.add('hidden');
        }
    }

    // دوال إدارة الأخبار
    editNews(newsId) {
        const news = this.newsManager.newsDatabase.news.find(n => n.id === newsId);
        if (!news) return;

        // ملء النموذج ببيانات الخبر
        const elements = {
            'news-title': news.title,
            'news-date': news.date,
            'news-category': news.category,
            'news-content': news.content,
            'news-image': news.image,
            'news-status': news.status
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });

        // تغيير النموذج إلى وضع التعديل
        const form = document.getElementById('news-form');
        if (form) {
            form.dataset.editingId = newsId;
            
            const submitBtn = form.querySelector('.btn-save');
            if (submitBtn) {
                submitBtn.textContent = '🔄 تحديث الخبر';
                submitBtn.style.background = '#ffc107';
            }
        }

        this.showNewsMessage('تم تحميل الخبر للتعديل 📝', 'info');
        
        // التمرير إلى النموذج
        const addSection = document.getElementById('add-news');
        if (addSection) {
            addSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    toggleNewsStatus(newsId) {
        const news = this.newsManager.newsDatabase.news.find(n => n.id === newsId);
        if (!news) return;

        const newStatus = news.status === 'active' ? 'archived' : 'active';
        news.status = newStatus;

        this.saveNewsDatabase();
        this.loadExistingNews();
        this.updateStats();
        
        const statusText = newStatus === 'active' ? 'تم تفعيل' : 'تم أرشفة';
        this.showNewsMessage(`${statusText} الخبر بنجاح ✅`, 'success');
    }

    deleteNews(newsId) {
        if (!confirm('هل أنت متأكد من حذف هذا الخبر؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }

        const newsIndex = this.newsManager.newsDatabase.news.findIndex(n => n.id === newsId);
        if (newsIndex === -1) return;

        this.newsManager.newsDatabase.news.splice(newsIndex, 1);
        this.newsManager.newsDatabase.metadata.totalNews = this.newsManager.newsDatabase.news.length;

        this.saveNewsDatabase();
        this.loadExistingNews();
        this.updateStats();
        
        this.showNewsMessage('تم حذف الخبر بنجاح ✅', 'success');
    }

    // دوال مساعدة للأخبار
    previewNews() {
        const form = document.getElementById('news-form');
        if (!form) return;
        
        const title = form.querySelector('#news-title')?.value || '';
        const date = form.querySelector('#news-date')?.value || '';
        const content = form.querySelector('#news-content')?.value || '';
        const image = form.querySelector('#news-image')?.value || '';
        const category = form.querySelector('#news-category')?.value || '';
        const status = form.querySelector('#news-status')?.value || 'active';

        if (!title || !content) {
            this.showNewsMessage('يرجى ملء العنوان والمحتوى على الأقل للمعاينة', 'error');
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

        const previewContent = document.getElementById('preview-content');
        const newsPreview = document.getElementById('news-preview');
        
        if (previewContent) previewContent.innerHTML = previewHTML;
        if (newsPreview) newsPreview.classList.remove('hidden');
    }

    exportNews() {
        const data = this.newsManager.newsDatabase;
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
        
        this.showNewsMessage('تم تصدير الأخبار بنجاح 📤', 'success');
    }

    importNews() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.newsManager.newsDatabase = data;
                    this.saveNewsDatabase();
                    this.loadExistingNews();
                    this.updateStats();
                    this.showNewsMessage('تم استيراد الأخبار بنجاح 📥', 'success');
                } catch (error) {
                    console.error('خطأ في قراءة ملف الاستيراد:', error);
                    this.showNewsMessage('خطأ في قراءة ملف الاستيراد ❌', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    backupData() {
        // حفظ في localStorage
        localStorage.setItem('newsBackup', JSON.stringify(this.newsManager.newsDatabase));
        this.showNewsMessage('تم إنشاء نسخة احتياطية محلية 💾', 'success');
    }

    testAndRefreshHome() {
        // فتح الصفحة الرئيسية في تبويب جديد
        const homeWindow = window.open('Aseel-home-01.html', '_blank');
        
        // إرسال إشعار تحديث
        setTimeout(() => {
            if (homeWindow && homeWindow.location.origin === window.location.origin) {
                homeWindow.postMessage('newsUpdated', window.location.origin);
            }
        }, 1000);
        
        this.showNewsMessage('تم فتح الصفحة الرئيسية في تبويب جديد للاختبار 🔄', 'info');
    }
}

// إنشاء مثيل مدير الإدارة
const adminManager = new AdminManager();

// دوال عامة للتوافق مع الأكواد الموجودة
function previewNews() {
    adminManager.previewNews();
}

function editNews(newsId) {
    adminManager.editNews(newsId);
}

function toggleNewsStatus(newsId) {
    adminManager.toggleNewsStatus(newsId);
}

function deleteNews(newsId) {
    adminManager.deleteNews(newsId);
}

function exportNews() {
    adminManager.exportNews();
}

function importNews() {
    adminManager.importNews();
}

function backupData() {
    adminManager.backupData();
}

function testAndRefreshHome() {
    adminManager.testAndRefreshHome();
}

// متغير للتوافق مع الأكواد القديمة
const admin = adminManager;
