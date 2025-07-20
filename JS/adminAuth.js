// نظام المصادقة للمدير
class AdminAuth {
    constructor() {
        this.defaultPassword = 'admin123'; // كلمة المرور الافتراضية
        this.passwordKey = 'aseelAdminPassword';
        this.sessionKey = 'aseelAdminSession';
        this.sessionDuration = 60 * 60 * 1000; // 60 دقيقة
        this.loadPassword();
        this.init();
    }

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

    init() {
        this.checkAuthStatus();
        this.setupAuthUI();
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
        
        this.hideAdminElements();
        return false;
    }

    // إظهار عناصر المدير
    showAdminElements() {
        const adminLinks = document.querySelectorAll('.admin-link');
        adminLinks.forEach(adminLink => {
            adminLink.classList.add('authenticated');
            adminLink.style.display = 'inline-block';
            adminLink.style.opacity = '1';
        });

        // إضافة زر تسجيل الخروج
        this.addLogoutButton();
        
        // إشعار الصفحات الأخرى بتغيير حالة المصادقة
        document.dispatchEvent(new CustomEvent('authStatusChanged', { detail: { authenticated: true } }));
    }

    // إخفاء عناصر المدير
    hideAdminElements() {
        const adminLinks = document.querySelectorAll('.admin-link');
        adminLinks.forEach(adminLink => {
            adminLink.classList.remove('authenticated');
            adminLink.style.display = 'none';
        });

        // إزالة زر تسجيل الخروج
        this.removeLogoutButton();
        
        // إشعار الصفحات الأخرى بتغيير حالة المصادقة
        document.dispatchEvent(new CustomEvent('authStatusChanged', { detail: { authenticated: false } }));
    }

    // إعداد واجهة المصادقة
    setupAuthUI() {
        // إضافة زر تسجيل الدخول للمدير
        this.addLoginButton();
    }

    // إضافة زر تسجيل الدخول
    addLoginButton() {
        if (this.checkAuthStatus()) return;

        const nav = document.querySelector('.navbar');
        if (nav && !document.querySelector('.admin-login-btn')) {
            const loginBtn = document.createElement('a');
            loginBtn.href = '#';
            loginBtn.className = 'admin-login-btn';
            loginBtn.innerHTML = '🔐 دخول المدير';
            loginBtn.onclick = (e) => {
                e.preventDefault();
                this.showLoginModal();
            };
            nav.appendChild(loginBtn);
        }
    }

    // إضافة زر تسجيل الخروج
    addLogoutButton() {
        const nav = document.querySelector('.navbar');
        if (nav && !document.querySelector('.admin-logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.className = 'admin-logout-btn';
            logoutBtn.innerHTML = '🚪 خروج المدير';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };
            nav.appendChild(logoutBtn);

            // إضافة زر تغيير كلمة المرور
            const changePasswordBtn = document.createElement('a');
            changePasswordBtn.href = '#';
            changePasswordBtn.className = 'admin-change-password-btn';
            changePasswordBtn.innerHTML = '🔑 تغيير كلمة المرور';
            changePasswordBtn.onclick = (e) => {
                e.preventDefault();
                this.showChangePasswordModal();
            };
            nav.appendChild(changePasswordBtn);
        }

        // إزالة زر تسجيل الدخول
        this.removeLoginButton();
    }

    // إزالة زر تسجيل الدخول
    removeLoginButton() {
        const loginBtn = document.querySelector('.admin-login-btn');
        if (loginBtn) {
            loginBtn.remove();
        }
    }

    // إزالة زر تسجيل الخروج
    removeLogoutButton() {
        const logoutBtn = document.querySelector('.admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
        
        const changePasswordBtn = document.querySelector('.admin-change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.remove();
        }
    }

    // إظهار نافذة تسجيل الدخول
    showLoginModal() {
        // إزالة النافذة الموجودة إن وجدت
        this.removeLoginModal();

        const modal = document.createElement('div');
        modal.className = 'admin-login-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="adminAuth.removeLoginModal()"></div>
            <div class="modal-content">
                <h3>🔐 دخول المدير</h3>
                <form id="admin-login-form" autocomplete="off">
                    <div class="form-group">
                        <label for="admin-password">كلمة المرور الحالية:</label>
                        <input type="password" id="admin-password" 
                               autocomplete="current-password" 
                               placeholder="أدخل كلمة المرور: admin123"
                               required>
                    </div>
                    <div class="form-actions">
                        <button type="submit">دخول</button>
                        <button type="button" onclick="adminAuth.removeLoginModal()">إلغاء</button>
                    </div>
                </form>
                <div id="login-message"></div>
                <p style="font-size: 0.9rem; color: #6c757d; text-align: center; margin-top: 1rem;">
                    💡 كلمة المرور الافتراضية: admin123
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        // إعداد النموذج
        const form = document.getElementById('admin-login-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleLogin();
        };

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
            const session = {
                loginTime: new Date().getTime(),
                expiry: new Date().getTime() + this.sessionDuration
            };

            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            
            messageDiv.innerHTML = '<p style="color: green;">✅ تم تسجيل الدخول بنجاح!</p>';
            
            setTimeout(() => {
                this.removeLoginModal();
                this.showAdminElements();
                this.showSuccessMessage();
            }, 1000);

        } else {
            // كلمة مرور خاطئة
            messageDiv.innerHTML = '<p style="color: red;">❌ كلمة المرور غير صحيحة</p>';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // تسجيل الخروج
    logout() {
        localStorage.removeItem(this.sessionKey);
        this.hideAdminElements();
        this.addLoginButton();
        this.showLogoutMessage();
    }

    // إظهار نافذة تغيير كلمة المرور
    showChangePasswordModal() {
        // إزالة النافذة الموجودة إن وجدت
        this.removeChangePasswordModal();

        const modal = document.createElement('div');
        modal.className = 'admin-change-password-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="adminAuth.removeChangePasswordModal()"></div>
            <div class="modal-content">
                <h3>🔑 تغيير كلمة مرور المدير</h3>
                <form id="admin-change-password-form" autocomplete="off">
                    <div class="form-group">
                        <label for="current-password">كلمة المرور الحالية:</label>
                        <input type="password" id="current-password" 
                               autocomplete="current-password" 
                               required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">كلمة المرور الجديدة:</label>
                        <input type="password" id="new-password" 
                               autocomplete="new-password"
                               minlength="4"
                               required>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">تأكيد كلمة المرور الجديدة:</label>
                        <input type="password" id="confirm-password" 
                               autocomplete="new-password"
                               minlength="4"
                               required>
                    </div>
                    <div class="form-actions">
                        <button type="submit">🔑 تغيير كلمة المرور</button>
                        <button type="button" onclick="adminAuth.removeChangePasswordModal()">إلغاء</button>
                    </div>
                </form>
                <div id="change-password-message"></div>
                <p style="font-size: 0.9rem; color: #6c757d; text-align: center; margin-top: 1rem;">
                    💡 كلمة المرور يجب أن تكون 4 أحرف على الأقل
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        // إعداد النموذج
        const form = document.getElementById('admin-change-password-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleChangePassword();
        };

        // التركيز على حقل كلمة المرور الحالية
        document.getElementById('current-password').focus();
    }

    // إزالة نافذة تغيير كلمة المرور
    removeChangePasswordModal() {
        const modal = document.querySelector('.admin-change-password-modal');
        if (modal) {
            modal.remove();
        }
    }

    // معالجة تغيير كلمة المرور
    handleChangePassword() {
        const currentPasswordInput = document.getElementById('current-password');
        const newPasswordInput = document.getElementById('new-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const messageDiv = document.getElementById('change-password-message');

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // التحقق من كلمة المرور الحالية
        if (currentPassword !== this.adminPassword) {
            messageDiv.innerHTML = '<p style="color: red;">❌ كلمة المرور الحالية غير صحيحة</p>';
            currentPasswordInput.focus();
            return;
        }

        // التحقق من طول كلمة المرور الجديدة
        if (newPassword.length < 4) {
            messageDiv.innerHTML = '<p style="color: red;">❌ كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل</p>';
            newPasswordInput.focus();
            return;
        }

        // التحقق من تطابق كلمات المرور
        if (newPassword !== confirmPassword) {
            messageDiv.innerHTML = '<p style="color: red;">❌ كلمات المرور الجديدة غير متطابقة</p>';
            confirmPasswordInput.focus();
            return;
        }

        // تغيير كلمة المرور
        this.adminPassword = newPassword;
        this.savePassword();

        messageDiv.innerHTML = '<p style="color: green;">✅ تم تغيير كلمة المرور بنجاح!</p>';

        setTimeout(() => {
            this.removeChangePasswordModal();
            this.showMessage('تم تغيير كلمة المرور بنجاح! 🔑', 'success');
        }, 1500);
    }

    // رسالة نجاح تسجيل الدخول
    showSuccessMessage() {
        this.showMessage('مرحباً بك في لوحة الإدارة! 👋', 'success');
    }

    // رسالة تسجيل الخروج
    showLogoutMessage() {
        this.showMessage('تم تسجيل الخروج بنجاح 👋', 'info');
    }

    // إظهار رسالة
    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `admin-message ${type}`;
        message.textContent = text;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 100);

        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }

    // التحقق من كون المستخدم مدير
    isAdmin() {
        return this.checkAuthStatus();
    }

    // إعداد تسجيل الخروج التلقائي عند إغلاق الصفحة
    setupAutoLogout() {
        // تسجيل الخروج عند إغلاق النافذة أو التبديل لصفحة أخرى
        window.addEventListener('beforeunload', () => {
            if (this.isAdmin()) {
                this.logout();
            }
        });

        // تسجيل الخروج عند إخفاء الصفحة (تبديل التابات أو تصغير النافذة)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isAdmin()) {
                this.logout();
            }
        });

        // تسجيل الخروج عند فقدان التركيز على النافذة
        window.addEventListener('blur', () => {
            if (this.isAdmin()) {
                this.logout();
            }
        });

        // تسجيل الخروج عند تحديث الصفحة
        window.addEventListener('unload', () => {
            if (this.isAdmin()) {
                this.logout();
            }
        });
    }

    // تغيير كلمة المرور (للاستخدام من console)
    changePassword(newPassword) {
        if (this.isAdmin()) {
            this.adminPassword = newPassword;
            console.log('تم تغيير كلمة المرور بنجاح');
            return true;
        } else {
            console.log('يجب تسجيل الدخول أولاً');
            return false;
        }
    }
}

// إنشاء مثيل نظام المصادقة
const adminAuth = new AdminAuth();
