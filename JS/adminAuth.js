// Admin Authentication System
// Author: AlAseel Commercial Complex Management System
// Version: 1.0

class AdminAuth {
    constructor() {
        this.isInitialized = false;
        this.authKey = 'alaseel_admin_session';
        this.sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
        this.adminCredentials = {
            username: 'admin',
            password: 'AlAseel2025#Admin'
        };
        this.protectedPages = [
            'admin.html',
            'customers.html',
            'archive.html',
            'backup-manager.html',
            'expenses-management.html',
            'project-expenses.html',
            'budget-settings.html'
        ];
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Check if current page is protected
        if (this.isCurrentPageProtected()) {
            this.checkAuthenticationStatus();
        }
        
        this.isInitialized = true;
    }

    isCurrentPageProtected() {
        const currentPage = window.location.pathname.split('/').pop();
        return this.protectedPages.includes(currentPage);
    }

    checkAuthenticationStatus() {
        const session = this.getStoredSession();
        
        if (!session || this.isSessionExpired(session)) {
            this.redirectToLogin();
            return false;
        }
        
        // Extend session on activity
        this.extendSession();
        return true;
    }

    getStoredSession() {
        try {
            const sessionData = localStorage.getItem(this.authKey);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Error reading session data:', error);
            return null;
        }
    }

    isSessionExpired(session) {
        const now = new Date().getTime();
        return (now - session.timestamp) > this.sessionTimeout;
    }

    extendSession() {
        const session = this.getStoredSession();
        if (session) {
            session.timestamp = new Date().getTime();
            localStorage.setItem(this.authKey, JSON.stringify(session));
        }
    }

    authenticate(username, password) {
        if (username === this.adminCredentials.username && 
            password === this.adminCredentials.password) {
            
            const sessionData = {
                username: username,
                timestamp: new Date().getTime(),
                authenticated: true
            };
            
            localStorage.setItem(this.authKey, JSON.stringify(sessionData));
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem(this.authKey);
        this.redirectToHome();
    }

    redirectToLogin() {
        // Create login modal or redirect to login page
        this.showLoginModal();
    }

    redirectToHome() {
        window.location.href = 'Aseel-home-01.html';
    }

    showLoginModal() {
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'admin-auth-backdrop';
        modalBackdrop.innerHTML = `
            <div class="admin-auth-modal">
                <div class="admin-auth-header">
                    <h2>🔐 تسجيل دخول الإدارة</h2>
                    <p>مجمع الأصيل التجاري</p>
                </div>
                <form id="admin-login-form" class="admin-auth-form">
                    <div class="form-group">
                        <label for="admin-username">اسم المستخدم:</label>
                        <input type="text" id="admin-username" required 
                               placeholder="أدخل اسم المستخدم...">
                    </div>
                    <div class="form-group">
                        <label for="admin-password">كلمة المرور:</label>
                        <input type="password" id="admin-password" required 
                               placeholder="أدخل كلمة المرور...">
                    </div>
                    <div id="auth-error" class="auth-error" style="display: none;">
                        اسم المستخدم أو كلمة المرور غير صحيحة
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-login">تسجيل الدخول</button>
                        <button type="button" class="btn-cancel" onclick="adminAuth.redirectToHome()">
                            إلغاء
                        </button>
                    </div>
                </form>
                <div class="auth-info">
                    <small>⚠️ هذه المنطقة مخصصة للإدارة فقط</small>
                </div>
            </div>
        `;

        // Add styles
        const styles = `
            <style>
                .admin-auth-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .admin-auth-modal {
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 90%;
                    direction: rtl;
                    text-align: center;
                }

                .admin-auth-header h2 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                    font-size: 24px;
                }

                .admin-auth-header p {
                    color: #7f8c8d;
                    margin-bottom: 25px;
                    font-size: 14px;
                }

                .admin-auth-form .form-group {
                    margin-bottom: 20px;
                    text-align: right;
                }

                .admin-auth-form label {
                    display: block;
                    margin-bottom: 8px;
                    color: #34495e;
                    font-weight: 600;
                }

                .admin-auth-form input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #bdc3c7;
                    border-radius: 6px;
                    font-size: 16px;
                    direction: rtl;
                    transition: border-color 0.3s;
                }

                .admin-auth-form input:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
                }

                .auth-error {
                    background: #e74c3c;
                    color: white;
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 15px;
                    font-size: 14px;
                }

                .form-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 25px;
                }

                .btn-login, .btn-cancel {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-weight: 600;
                }

                .btn-login {
                    background: #27ae60;
                    color: white;
                }

                .btn-login:hover {
                    background: #2ecc71;
                    transform: translateY(-2px);
                }

                .btn-cancel {
                    background: #95a5a6;
                    color: white;
                }

                .btn-cancel:hover {
                    background: #7f8c8d;
                }

                .auth-info {
                    margin-top: 20px;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 6px;
                }

                .auth-info small {
                    color: #e67e22;
                    font-weight: 600;
                }
            </style>
        `;

        // Add styles to head
        document.head.insertAdjacentHTML('beforeend', styles);
        
        // Add modal to body
        document.body.appendChild(modalBackdrop);

        // Handle form submission
        const form = document.getElementById('admin-login-form');
        const errorDiv = document.getElementById('auth-error');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            if (this.authenticate(username, password)) {
                document.body.removeChild(modalBackdrop);
                location.reload(); // Reload page after successful login
            } else {
                errorDiv.style.display = 'block';
                // Clear fields
                document.getElementById('admin-username').value = '';
                document.getElementById('admin-password').value = '';
                // Focus on username field
                document.getElementById('admin-username').focus();
            }
        });

        // Focus on username field when modal opens
        setTimeout(() => {
            document.getElementById('admin-username').focus();
        }, 100);
    }

    // Add logout functionality to admin pages
    addLogoutButton() {
        const nav = document.querySelector('.navbar, nav');
        if (nav && !document.getElementById('admin-logout-btn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'admin-logout-btn';
            logoutBtn.href = '#';
            logoutBtn.innerHTML = '🚪 تسجيل الخروج';
            logoutBtn.style.cssText = 'color: #e74c3c; font-weight: bold; margin-left: 20px;';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('هل تريد تسجيل الخروج من لوحة الإدارة؟')) {
                    this.logout();
                }
            };
            nav.appendChild(logoutBtn);
        }
    }

    // Check if user is authenticated (for conditional UI elements)
    isAuthenticated() {
        const session = this.getStoredSession();
        return session && !this.isSessionExpired(session);
    }
}

// Initialize authentication system
const adminAuth = new AdminAuth();

// Add logout button to admin pages when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (adminAuth.isCurrentPageProtected() && adminAuth.isAuthenticated()) {
        adminAuth.addLogoutButton();
    }
});

// Extend session on user activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, () => {
        if (adminAuth.isAuthenticated()) {
            adminAuth.extendSession();
        }
    }, { passive: true });
});
