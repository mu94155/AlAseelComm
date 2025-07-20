// نظام المصادقة الخاص بإدارة العملاء
class CustomerAuth {
    constructor() {
        this.customerPassword = 'admin'; // كلمة مرور خاصة بإدارة العملاء
        this.sessionKey = 'aseelCustomerAdminSession';
        this.sessionDuration = 30 * 60 * 1000; // 30 دقيقة
        this.init();
    }

    init() {
        this.setupAuthUI();
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
                    return true;
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('خطأ في قراءة بيانات جلسة العملاء:', error);
                this.logout();
            }
        }
        
        return false;
    }

    // إعداد واجهة المصادقة
    setupAuthUI() {
        if (!this.checkAuthStatus()) {
            this.showAuthRequired();
        }
    }

    // عرض رسالة المصادقة المطلوبة
    showAuthRequired() {
        const adminPanel = document.querySelector('.admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
        }

        const container = document.querySelector('.container');
        if (container) {
            const authMessage = document.createElement('div');
            authMessage.id = 'customer-auth-message';
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
                <h2>🔐 إدارة العملاء - تسجيل دخول مطلوب</h2>
                <p style="font-size: 1.1rem; margin: 1.5rem 0;">هذا النظام مخصص لإدارة بيانات عملاء المجمع التجاري</p>
                <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
                    <p style="color: #ffd700; font-weight: bold; font-size: 1.2rem;">💡 كلمة المرور: admin</p>
                </div>
                <button onclick="customerAuth.showLoginModal()" 
                        style="background: #28a745; color: white; border: none; padding: 1rem 2rem; 
                               border-radius: 8px; font-size: 1.1rem; cursor: pointer; margin: 0.5rem;
                               transition: all 0.3s ease;">
                    🔐 تسجيل الدخول لإدارة العملاء
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
    }

    // إظهار نافذة تسجيل الدخول
    showLoginModal() {
        // إزالة النافذة الموجودة إن وجدت
        this.removeLoginModal();

        const modal = document.createElement('div');
        modal.className = 'customer-login-modal';
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
                    👥 دخول إدارة العملاء
                </h3>
                <form id="customer-login-form">
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: #495057;">
                            كلمة مرور إدارة العملاء:
                        </label>
                        <input type="password" id="customer-password" 
                               style="width: 100%; padding: 0.8rem; border: 2px solid #ced4da; 
                                      border-radius: 8px; font-size: 1rem; box-sizing: border-box;"
                               placeholder="أدخل: admin"
                               autocomplete="new-password" required>
                    </div>
                    <div style="text-align: center;">
                        <button type="submit" 
                                style="background: #007bff; color: white; border: none; 
                                       padding: 0.8rem 1.5rem; border-radius: 8px; 
                                       font-size: 1rem; cursor: pointer; margin: 0.3rem;">
                            دخول
                        </button>
                        <button type="button" onclick="customerAuth.removeLoginModal()"
                                style="background: #6c757d; color: white; border: none; 
                                       padding: 0.8rem 1.5rem; border-radius: 8px; 
                                       font-size: 1rem; cursor: pointer; margin: 0.3rem;">
                            إلغاء
                        </button>
                    </div>
                </form>
                <div id="customer-login-message" style="text-align: center; margin-top: 1rem;"></div>
                <p style="text-align: center; color: #6c757d; font-size: 0.9rem; margin-top: 1rem;">
                    💡 كلمة المرور: <strong>admin</strong>
                </p>
            </div>
        `;

        document.body.appendChild(modal);

        // إعداد النموذج
        const form = document.getElementById('customer-login-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleLogin();
        };

        // التركيز على حقل كلمة المرور
        document.getElementById('customer-password').focus();

        // إغلاق عند الضغط على الخلفية
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.removeLoginModal();
            }
        };
    }

    // إزالة نافذة تسجيل الدخول
    removeLoginModal() {
        const modal = document.querySelector('.customer-login-modal');
        if (modal) {
            modal.remove();
        }
    }

    // معالجة تسجيل الدخول
    handleLogin() {
        const passwordInput = document.getElementById('customer-password');
        const messageDiv = document.getElementById('customer-login-message');
        const password = passwordInput.value;

        if (password === this.customerPassword) {
            // تسجيل دخول ناجح
            const session = {
                loginTime: new Date().getTime(),
                expiry: new Date().getTime() + this.sessionDuration
            };

            localStorage.setItem(this.sessionKey, JSON.stringify(session));
            
            messageDiv.innerHTML = '<p style="color: green;">✅ تم تسجيل الدخول بنجاح!</p>';
            
            setTimeout(() => {
                this.removeLoginModal();
                this.showCustomerManagement();
                this.showSuccessMessage();
            }, 1000);

        } else {
            // كلمة مرور خاطئة
            messageDiv.innerHTML = '<p style="color: red;">❌ كلمة المرور غير صحيحة - استخدم: admin</p>';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // عرض نظام إدارة العملاء
    showCustomerManagement() {
        // إخفاء رسالة المصادقة
        const authMessage = document.getElementById('customer-auth-message');
        if (authMessage) {
            authMessage.remove();
        }

        // إظهار لوحة الإدارة
        const adminPanel = document.querySelector('.admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
        }

        // إضافة زر تسجيل الخروج
        this.addLogoutButton();
    }

    // إضافة زر تسجيل الخروج
    addLogoutButton() {
        // إزالة الزر الموجود أولاً
        this.removeLogoutButton();

        const toolbar = document.querySelector('.toolbar-actions');
        if (toolbar) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'customer-logout-btn';
            logoutBtn.className = 'btn-danger';
            logoutBtn.innerHTML = '🚪 خروج';
            logoutBtn.onclick = () => this.logout();
            toolbar.appendChild(logoutBtn);
        }
    }

    // إزالة زر تسجيل الخروج
    removeLogoutButton() {
        const logoutBtn = document.getElementById('customer-logout-btn');
        if (logoutBtn) {
            logoutBtn.remove();
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
        alert.innerHTML = '✅ مرحباً بك في نظام إدارة العملاء!';
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }

    // التحقق من كون المستخدم مدير عملاء
    isCustomerAdmin() {
        return this.checkAuthStatus();
    }
}

// إنشاء مثيل نظام مصادقة العملاء
const customerAuth = new CustomerAuth();
