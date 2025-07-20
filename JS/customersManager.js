// نظام إدارة العملاء لمجمع الأصيل التجاري
class CustomersManager {
    constructor() {
        this.customers = [];
        this.currentEditingId = null;
        this.storageKey = 'aseelCustomersDatabase';
        this.init();
    }

    init() {
        this.loadCustomers();
        this.setupEventListeners();
        this.renderCustomers();
        this.updateStats();
    }

    // تحميل بيانات العملاء من التخزين المحلي
    loadCustomers() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.customers = JSON.parse(stored);
            } else {
                // بيانات تجريبية للبداية
                this.customers = this.getSampleData();
                this.saveCustomers();
            }
        } catch (error) {
            console.error('خطأ في تحميل بيانات العملاء:', error);
            this.customers = this.getSampleData();
        }
    }

    // حفظ بيانات العملاء في التخزين المحلي
    saveCustomers() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.customers));
        } catch (error) {
            console.error('خطأ في حفظ بيانات العملاء:', error);
        }
    }

    // بيانات تجريبية
    getSampleData() {
        return [
            {
                id: 1,
                name: 'أحمد محمد الأحمد',
                businessType: 'مطعم',
                shopNumbers: 2,
                shopDetails: 'محل رقم 15 و 16 - الطابق الأرضي',
                monthlyRent: 8000,
                electricityAccount: 'E123456789',
                paymentStatus: 'مدفوع',
                depositAmount: 16000,
                phone: '0501234567',
                email: 'ahmed@restaurant.com',
                startDate: '2024-01-15',
                contractDuration: 12,
                contractLink: 'https://drive.google.com/contract1',
                notes: 'عميل مميز - دفع منتظم',
                createdAt: '2024-01-15T10:00:00Z'
            },
            {
                id: 2,
                name: 'فاطمة علي السالم',
                businessType: 'محل ملابس',
                shopNumbers: 1,
                shopDetails: 'محل رقم 8 - الطابق الأول',
                monthlyRent: 4500,
                electricityAccount: 'E987654321',
                paymentStatus: 'متأخر',
                depositAmount: 9000,
                phone: '0512345678',
                email: 'fatima@fashion.com',
                startDate: '2024-03-01',
                contractDuration: 24,
                contractLink: 'https://drive.google.com/contract2',
                notes: 'تحتاج متابعة للمدفوعات',
                createdAt: '2024-03-01T14:30:00Z'
            }
        ];
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // أزرار شريط الأدوات
        document.getElementById('add-customer-btn').addEventListener('click', () => this.openAddModal());
        document.getElementById('export-customers-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-customers-btn').addEventListener('click', () => this.openImportDialog());
        document.getElementById('import-file-input').addEventListener('change', (e) => this.importData(e));

        // البحث والفلترة
        document.getElementById('business-type-filter').addEventListener('change', () => this.filterCustomers());
        document.getElementById('payment-status-filter').addEventListener('change', () => this.filterCustomers());

        // نموذج العميل
        document.getElementById('customer-form').addEventListener('submit', (e) => this.saveCustomer(e));
        document.getElementById('cancel-customer-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('close-modal-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('close-details-modal-btn').addEventListener('click', () => this.closeDetailsModal());
        
        // إغلاق النوافذ بالضغط على الخلفية
        document.getElementById('modal-overlay-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('details-modal-overlay-btn').addEventListener('click', () => this.closeDetailsModal());
        
        // دعم لوحة المفاتيح للنوافذ المنبثقة
        document.getElementById('modal-overlay-btn').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.closeModal();
            }
        });
        document.getElementById('details-modal-overlay-btn').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.closeDetailsModal();
            }
        });

        // إغلاق النوافذ المنبثقة بالضغط على Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDetailsModal();
            }
        });
    }

    // عرض قائمة العملاء
    renderCustomers(customersToRender = this.customers) {
        const tbody = document.querySelector('#customers-table tbody');
        
        if (customersToRender.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <h3>📭 لا توجد عملاء</h3>
                        <p>ابدأ بإضافة عميل جديد باستخدام الزر أعلاه</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = customersToRender.map(customer => `
            <tr>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.businessType}</td>
                <td>${customer.shopNumbers}</td>
                <td>${this.formatCurrency(customer.monthlyRent)}</td>
                <td>${customer.electricityAccount || 'غير محدد'}</td>
                <td><a href="tel:${customer.phone}">${customer.phone}</a></td>
                <td>${this.formatDate(customer.startDate)}</td>
                <td><span class="payment-status status-${this.getStatusClass(customer.paymentStatus)}">${customer.paymentStatus}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="customersManager.viewCustomer(${customer.id})" title="عرض التفاصيل">👁</button>
                        <button class="action-btn btn-edit" onclick="customersManager.editCustomer(${customer.id})" title="تعديل">✏️</button>
                        <button class="action-btn btn-delete" onclick="customersManager.deleteCustomer(${customer.id})" title="حذف">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // تحديث الإحصائيات
    updateStats() {
        const totalCustomers = this.customers.length;
        const activeShops = this.customers.reduce((sum, customer) => sum + customer.shopNumbers, 0);
        const totalRent = this.customers.reduce((sum, customer) => sum + customer.monthlyRent, 0);
        const overduePayments = this.customers.filter(customer => customer.paymentStatus === 'متأخر').length;

        document.getElementById('total-customers').textContent = totalCustomers;
        document.getElementById('active-shops').textContent = activeShops;
        document.getElementById('total-rent').textContent = this.formatCurrency(totalRent);
        document.getElementById('overdue-payments').textContent = overduePayments;
    }

    // فلترة العملاء
    filterCustomers() {
        const searchTerm = document.getElementById('search-customers').value.toLowerCase();
        const businessTypeFilter = document.getElementById('business-type-filter').value;
        const paymentStatusFilter = document.getElementById('payment-status-filter').value;

        let filteredCustomers = this.customers;

        // تطبيق البحث النصي
        if (searchTerm) {
            filteredCustomers = filteredCustomers.filter(customer => 
                customer.name.toLowerCase().includes(searchTerm) ||
                customer.businessType.toLowerCase().includes(searchTerm) ||
                customer.phone.includes(searchTerm) ||
                (customer.electricityAccount && customer.electricityAccount.toLowerCase().includes(searchTerm)) ||
                (customer.shopDetails && customer.shopDetails.toLowerCase().includes(searchTerm))
            );
        }

        // تطبيق فلتر نوع النشاط
        if (businessTypeFilter) {
            filteredCustomers = filteredCustomers.filter(customer => 
                customer.businessType === businessTypeFilter
            );
        }

        // تطبيق فلتر حالة الدفع
        if (paymentStatusFilter) {
            filteredCustomers = filteredCustomers.filter(customer => 
                customer.paymentStatus === paymentStatusFilter
            );
        }

        this.renderCustomers(filteredCustomers);
    }

    // فتح نافذة إضافة عميل جديد
    openAddModal() {
        this.currentEditingId = null;
        document.getElementById('modal-title').textContent = '➕ إضافة عميل جديد';
        document.getElementById('customer-form').reset();
        document.getElementById('save-customer-btn').textContent = '💾 حفظ العميل';
        this.showModal();
    }

    // فتح نافذة تعديل عميل
    editCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (!customer) return;

        this.currentEditingId = id;
        document.getElementById('modal-title').textContent = `✏️ تعديل بيانات ${customer.name}`;
        document.getElementById('save-customer-btn').textContent = '💾 حفظ التعديلات';

        // ملء النموذج ببيانات العميل
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('business-type').value = customer.businessType;
        document.getElementById('shop-numbers').value = customer.shopNumbers;
        document.getElementById('shop-details').value = customer.shopDetails || '';
        document.getElementById('monthly-rent').value = customer.monthlyRent;
        document.getElementById('electricity-account').value = customer.electricityAccount || '';
        document.getElementById('payment-status').value = customer.paymentStatus;
        document.getElementById('deposit-amount').value = customer.depositAmount || '';
        document.getElementById('customer-phone').value = customer.phone;
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('start-date').value = customer.startDate;
        document.getElementById('contract-duration').value = customer.contractDuration || 12;
        document.getElementById('contract-link').value = customer.contractLink || '';
        document.getElementById('notes').value = customer.notes || '';

        this.showModal();
    }

    // عرض تفاصيل العميل
    viewCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (!customer) return;

        const content = document.getElementById('customer-details-content');
        content.innerHTML = `
            <div class="customer-details">
                <div class="details-grid">
                    <div class="detail-section">
                        <h4>📋 المعلومات الأساسية</h4>
                        <div class="detail-item">
                            <span class="detail-label">الاسم:</span>
                            <span class="detail-value">${customer.name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">نوع النشاط:</span>
                            <span class="detail-value">${customer.businessType}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">عدد المحلات:</span>
                            <span class="detail-value">${customer.shopNumbers}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">تفاصيل المحلات:</span>
                            <span class="detail-value">${customer.shopDetails || 'غير محدد'}</span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>💰 المعلومات المالية</h4>
                        <div class="detail-item">
                            <span class="detail-label">الإيجار الشهري:</span>
                            <span class="detail-value">${this.formatCurrency(customer.monthlyRent)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">مبلغ التأمين:</span>
                            <span class="detail-value">${customer.depositAmount ? this.formatCurrency(customer.depositAmount) : 'غير محدد'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">رقم حساب الكهرباء:</span>
                            <span class="detail-value">${customer.electricityAccount || 'غير محدد'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">حالة الدفع:</span>
                            <span class="detail-value">
                                <span class="payment-status status-${this.getStatusClass(customer.paymentStatus)}">${customer.paymentStatus}</span>
                            </span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>📞 معلومات الاتصال</h4>
                        <div class="detail-item">
                            <span class="detail-label">الهاتف:</span>
                            <span class="detail-value"><a href="tel:${customer.phone}">${customer.phone}</a></span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">البريد الإلكتروني:</span>
                            <span class="detail-value">${customer.email ? `<a href="mailto:${customer.email}">${customer.email}</a>` : 'غير محدد'}</span>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>📅 معلومات العقد</h4>
                        <div class="detail-item">
                            <span class="detail-label">تاريخ البداية:</span>
                            <span class="detail-value">${this.formatDate(customer.startDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">مدة العقد:</span>
                            <span class="detail-value">${customer.contractDuration || 12} شهر</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">تاريخ انتهاء العقد:</span>
                            <span class="detail-value">${this.calculateEndDate(customer.startDate, customer.contractDuration || 12)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">ملف العقد:</span>
                            <span class="detail-value">
                                ${customer.contractLink ? `<a href="${customer.contractLink}" target="_blank" class="contract-link">📄 عرض العقد</a>` : 'غير محدد'}
                            </span>
                        </div>
                    </div>
                </div>

                ${customer.notes ? `
                    <div class="detail-section" style="grid-column: 1 / -1; margin-top: 1rem;">
                        <h4>📝 ملاحظات</h4>
                        <p style="background: white; padding: 1rem; border-radius: 5px; margin: 0;">${customer.notes}</p>
                    </div>
                ` : ''}

                <div class="form-actions" style="margin-top: 2rem;">
                    <button class="btn-primary" onclick="customersManager.editCustomer(${customer.id})">✏️ تعديل البيانات</button>
                    <button class="btn-secondary" onclick="customersManager.closeDetailsModal()">❌ إغلاق</button>
                </div>
            </div>
        `;

        this.showDetailsModal();
    }

    // حذف عميل
    deleteCustomer(id) {
        const customer = this.customers.find(c => c.id === id);
        if (!customer) return;

        if (confirm(`هل أنت متأكد من حذف العميل "${customer.name}"؟\n\nسيتم حذف جميع بياناته نهائياً ولا يمكن التراجع عن هذا الإجراء.`)) {
            this.customers = this.customers.filter(c => c.id !== id);
            this.saveCustomers();
            this.renderCustomers();
            this.updateStats();
            
            // عرض رسالة نجاح
            this.showAlert('تم حذف العميل بنجاح', 'success');
        }
    }

    // حفظ بيانات العميل
    saveCustomer(event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById('customer-name').value.trim(),
            businessType: document.getElementById('business-type').value,
            shopNumbers: parseInt(document.getElementById('shop-numbers').value),
            shopDetails: document.getElementById('shop-details').value.trim(),
            monthlyRent: parseFloat(document.getElementById('monthly-rent').value),
            electricityAccount: document.getElementById('electricity-account').value.trim(),
            paymentStatus: document.getElementById('payment-status').value,
            depositAmount: parseFloat(document.getElementById('deposit-amount').value) || 0,
            phone: document.getElementById('customer-phone').value.trim(),
            email: document.getElementById('customer-email').value.trim(),
            startDate: document.getElementById('start-date').value,
            contractDuration: parseInt(document.getElementById('contract-duration').value) || 12,
            contractLink: document.getElementById('contract-link').value.trim(),
            notes: document.getElementById('notes').value.trim()
        };

        // التحقق من صحة البيانات
        if (!this.validateCustomerData(formData)) {
            return;
        }

        if (this.currentEditingId) {
            // تعديل عميل موجود
            const index = this.customers.findIndex(c => c.id === this.currentEditingId);
            if (index !== -1) {
                this.customers[index] = { ...this.customers[index], ...formData };
                this.showAlert('تم تحديث بيانات العميل بنجاح', 'success');
            }
        } else {
            // إضافة عميل جديد
            const newCustomer = {
                id: Date.now(),
                ...formData,
                createdAt: new Date().toISOString()
            };
            this.customers.push(newCustomer);
            this.showAlert('تم إضافة العميل بنجاح', 'success');
        }

        this.saveCustomers();
        this.renderCustomers();
        this.updateStats();
        this.closeModal();
    }

    // التحقق من صحة بيانات العميل
    validateCustomerData(data) {
        if (!data.name) {
            this.showAlert('يجب إدخال اسم العميل', 'error');
            return false;
        }
        if (!data.businessType) {
            this.showAlert('يجب اختيار نوع النشاط التجاري', 'error');
            return false;
        }
        if (!data.shopNumbers || data.shopNumbers < 1) {
            this.showAlert('يجب إدخال عدد صحيح للمحلات', 'error');
            return false;
        }
        if (!data.monthlyRent || data.monthlyRent <= 0) {
            this.showAlert('يجب إدخال مبلغ صحيح للإيجار الشهري', 'error');
            return false;
        }
        if (!data.phone) {
            this.showAlert('يجب إدخال رقم الهاتف', 'error');
            return false;
        }
        if (!data.startDate) {
            this.showAlert('يجب إدخال تاريخ بداية العقد', 'error');
            return false;
        }
        return true;
    }

    // تصدير البيانات
    exportData() {
        try {
            const dataToExport = {
                customers: this.customers,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `aseel-customers-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showAlert('تم تصدير البيانات بنجاح', 'success');
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            this.showAlert('حدث خطأ أثناء تصدير البيانات', 'error');
        }
    }

    // فتح نافذة استيراد البيانات
    openImportDialog() {
        document.getElementById('import-file').click();
    }

    // استيراد البيانات
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.customers && Array.isArray(data.customers)) {
                    if (confirm(`سيتم استيراد ${data.customers.length} عميل. هل تريد المتابعة؟\n\nملاحظة: سيتم دمج البيانات مع البيانات الموجودة.`)) {
                        // دمج البيانات
                        const maxId = Math.max(...this.customers.map(c => c.id), 0);
                        const importedCustomers = data.customers.map((customer, index) => ({
                            ...customer,
                            id: maxId + index + 1
                        }));

                        this.customers = [...this.customers, ...importedCustomers];
                        this.saveCustomers();
                        this.renderCustomers();
                        this.updateStats();
                        
                        this.showAlert(`تم استيراد ${importedCustomers.length} عميل بنجاح`, 'success');
                    }
                } else {
                    this.showAlert('ملف البيانات غير صحيح', 'error');
                }
            } catch (error) {
                console.error('خطأ في استيراد البيانات:', error);
                this.showAlert('حدث خطأ أثناء قراءة الملف', 'error');
            }
        };
        reader.readAsText(file);
        
        // إعادة تعيين قيمة المدخل
        event.target.value = '';
    }

    // عرض النافذة المنبثقة
    showModal() {
        document.getElementById('customer-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // إغلاق النافذة المنبثقة
    closeModal() {
        document.getElementById('customer-modal').classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentEditingId = null;
    }

    // عرض نافذة التفاصيل
    showDetailsModal() {
        document.getElementById('customer-details-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // إغلاق نافذة التفاصيل
    closeDetailsModal() {
        document.getElementById('customer-details-modal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // عرض رسالة تنبيه
    showAlert(message, type = 'info') {
        // إزالة التنبيهات السابقة
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;

        // إدراج التنبيه في أعلى الصفحة
        const container = document.querySelector('.admin-panel');
        container.insertBefore(alert, container.firstChild);

        // إزالة التنبيه تلقائياً بعد 5 ثواني
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    // دوال مساعدة
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-OM', {
            style: 'currency',
            currency: 'OMR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace(/\.$/, '');
    }

    formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }

    calculateEndDate(startDate, duration) {
        if (!startDate || !duration) return 'غير محدد';
        const start = new Date(startDate);
        const end = new Date(start);
        end.setMonth(start.getMonth() + duration);
        return end.toLocaleDateString('ar-SA');
    }

    getStatusClass(status) {
        switch (status) {
            case 'مدفوع': return 'paid';
            case 'مستحق': return 'due';
            case 'متأخر': return 'overdue';
            default: return 'due';
        }
    }
}

// تهيئة نظام إدارة العملاء
const customersManager = new CustomersManager();
