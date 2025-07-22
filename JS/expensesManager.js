/**
 * نظام إدارة المصاريف والدفعات المرحلية - مجمع الأصيل التجاري
 * Expenses and Milestone Payments Management System
 * Author: Al-Aseel Commercial Complex
 * Date: July 2025
 */

class ExpensesManager {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('alaseel_expenses')) || [];
        this.milestones = JSON.parse(localStorage.getItem('alaseel_milestones')) || this.getDefaultMilestones();
        this.budgetSettings = JSON.parse(localStorage.getItem('alaseel_budget_settings')) || {
            totalBudget: 2500000,
            warningThreshold: 80, // تحذير عند وصول 80% من الميزانية
            currency: 'ر.ع'
        };
        
        this.currentEditingExpense = null;
        this.currentEditingMilestone = null;
        
        this.init();
    }

    init() {
        this.loadExpenses();
        this.loadMilestones();
        this.updateSummary();
        this.setupEventListeners();
        this.checkBudgetWarnings();
    }

    // الحصول على المراحل الافتراضية
    getDefaultMilestones() {
        return [
            {
                id: 1,
                title: 'المرحلة الأولى: الأساسات والهيكل',
                amount: 800000,
                status: 'completed',
                dueDate: '2025-03-15',
                paymentDate: '2025-03-15',
                contractor: 'شركة البناء المتقدم',
                description: 'أعمال الحفريات والأساسات والهيكل الخرساني',
                expenses: [
                    { description: 'الحفريات وأعمال الأساسات', amount: 350000 },
                    { description: 'الخرسانة والحديد', amount: 280000 },
                    { description: 'رواتب العمال والمهندسين', amount: 120000 },
                    { description: 'معدات وآلات البناء', amount: 50000 }
                ]
            },
            {
                id: 2,
                title: 'المرحلة الثانية: البناء والتشطيبات الأساسية',
                amount: 950000,
                status: 'in-progress',
                dueDate: '2025-07-30',
                paymentDate: null,
                contractor: 'مقاولون متخصصون',
                description: 'أعمال البناء والتشطيبات الأساسية',
                expenses: [
                    { description: 'البناء والجدران', amount: 400000 },
                    { description: 'السقف والعزل', amount: 200000 },
                    { description: 'الأعمال الكهربائية الأساسية', amount: 150000 },
                    { description: 'السباكة والصرف الصحي', amount: 100000 },
                    { description: 'رواتب الشهر الثاني والثالث', amount: 100000 }
                ]
            },
            {
                id: 3,
                title: 'المرحلة الثالثة: التشطيبات النهائية والتجهيزات',
                amount: 750000,
                status: 'scheduled',
                dueDate: '2025-10-15',
                paymentDate: null,
                contractor: 'شركة التشطيبات الفاخرة',
                description: 'التشطيبات النهائية وتجهيز المحلات',
                expenses: [
                    { description: 'الدهانات والديكورات', amount: 180000 },
                    { description: 'البلاط والأرضيات', amount: 220000 },
                    { description: 'النوافذ والأبواب', amount: 120000 },
                    { description: 'أنظمة التكييف والتهوية', amount: 150000 },
                    { description: 'اللمسات الأخيرة والتنظيف', amount: 80000 }
                ]
            }
        ];
    }

    // حفظ البيانات في localStorage
    saveData() {
        localStorage.setItem('alaseel_expenses', JSON.stringify(this.expenses));
        localStorage.setItem('alaseel_milestones', JSON.stringify(this.milestones));
        localStorage.setItem('alaseel_budget_settings', JSON.stringify(this.budgetSettings));
    }

    // إعداد مستمعات الأحداث
    setupEventListeners() {
        // نموذج إضافة/تعديل المصروف
        document.getElementById('expenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });

        // نموذج إضافة/تعديل المرحلة
        document.getElementById('milestoneForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMilestoneSubmit();
        });

        // زر إلغاء التعديل
        document.getElementById('cancelEditExpense')?.addEventListener('click', () => {
            this.cancelExpenseEdit();
        });

        document.getElementById('cancelEditMilestone')?.addEventListener('click', () => {
            this.cancelMilestoneEdit();
        });

        // زر البحث والفلترة
        document.getElementById('searchExpenses')?.addEventListener('input', (e) => {
            this.searchExpenses(e.target.value);
        });

        document.getElementById('filterCategory')?.addEventListener('change', (e) => {
            this.filterExpensesByCategory(e.target.value);
        });
    }

    // إضافة أو تعديل مصروف
    handleExpenseSubmit() {
        const form = document.getElementById('expenseForm');
        const formData = new FormData(form);
        
        const expense = {
            id: this.currentEditingExpense?.id || Date.now(),
            description: formData.get('expenseDescription'),
            amount: parseFloat(formData.get('expenseAmount')),
            category: formData.get('expenseCategory'),
            date: formData.get('expenseDate'),
            notes: formData.get('expenseNotes') || '',
            createdAt: this.currentEditingExpense?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // التحقق من صحة البيانات
        if (!this.validateExpense(expense)) {
            return;
        }

        if (this.currentEditingExpense) {
            // تعديل مصروف موجود
            const index = this.expenses.findIndex(exp => exp.id === this.currentEditingExpense.id);
            if (index !== -1) {
                this.expenses[index] = expense;
                this.showMessage('تم تعديل المصروف بنجاح', 'success');
            }
        } else {
            // إضافة مصروف جديد
            this.expenses.push(expense);
            this.showMessage('تم إضافة المصروف بنجاح', 'success');
        }

        this.saveData();
        this.loadExpenses();
        this.updateSummary();
        this.resetExpenseForm();
    }

    // إضافة أو تعديل مرحلة
    handleMilestoneSubmit() {
        const form = document.getElementById('milestoneForm');
        const formData = new FormData(form);
        
        const milestone = {
            id: this.currentEditingMilestone?.id || Date.now(),
            title: formData.get('milestoneTitle'),
            amount: parseFloat(formData.get('milestoneAmount')),
            dueDate: formData.get('milestoneDate'),
            status: formData.get('milestoneStatus'),
            contractor: formData.get('milestoneContractor') || '',
            description: formData.get('milestoneDescription'),
            paymentDate: this.currentEditingMilestone?.paymentDate || null,
            expenses: this.currentEditingMilestone?.expenses || [],
            createdAt: this.currentEditingMilestone?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // التحقق من صحة البيانات
        if (!this.validateMilestone(milestone)) {
            return;
        }

        if (this.currentEditingMilestone) {
            // تعديل مرحلة موجودة
            const index = this.milestones.findIndex(ms => ms.id === this.currentEditingMilestone.id);
            if (index !== -1) {
                this.milestones[index] = milestone;
                this.showMessage('تم تعديل المرحلة بنجاح', 'success');
            }
        } else {
            // إضافة مرحلة جديدة
            this.milestones.push(milestone);
            this.showMessage('تم إضافة المرحلة بنجاح', 'success');
        }

        this.saveData();
        this.loadMilestones();
        this.updateSummary();
        this.resetMilestoneForm();
    }

    // التحقق من صحة بيانات المصروف
    validateExpense(expense) {
        if (!expense.description || expense.description.trim() === '') {
            this.showMessage('يرجى إدخال وصف المصروف', 'error');
            return false;
        }

        if (!expense.amount || expense.amount <= 0) {
            this.showMessage('يرجى إدخال مبلغ صحيح', 'error');
            return false;
        }

        if (!expense.category) {
            this.showMessage('يرجى اختيار فئة المصروف', 'error');
            return false;
        }

        if (!expense.date) {
            this.showMessage('يرجى إدخال تاريخ المصروف', 'error');
            return false;
        }

        // التحقق من الميزانية
        const totalExpenses = this.calculateTotalExpenses() + expense.amount;
        if (this.currentEditingExpense) {
            totalExpenses -= this.currentEditingExpense.amount;
        }

        if (totalExpenses > this.budgetSettings.totalBudget) {
            const exceed = totalExpenses - this.budgetSettings.totalBudget;
            if (!confirm(`هذا المصروف سيتجاوز الميزانية بمقدار ${exceed.toLocaleString()} ${this.budgetSettings.currency}. هل تريد المتابعة؟`)) {
                return false;
            }
        }

        return true;
    }

    // التحقق من صحة بيانات المرحلة
    validateMilestone(milestone) {
        if (!milestone.title || milestone.title.trim() === '') {
            this.showMessage('يرجى إدخال عنوان المرحلة', 'error');
            return false;
        }

        if (!milestone.amount || milestone.amount <= 0) {
            this.showMessage('يرجى إدخال مبلغ صحيح', 'error');
            return false;
        }

        if (!milestone.dueDate) {
            this.showMessage('يرجى إدخال تاريخ الاستحقاق', 'error');
            return false;
        }

        if (!milestone.status) {
            this.showMessage('يرجى اختيار حالة المرحلة', 'error');
            return false;
        }

        if (!milestone.description || milestone.description.trim() === '') {
            this.showMessage('يرجى إدخال وصف المرحلة', 'error');
            return false;
        }

        return true;
    }

    // تحميل وعرض المصاريف
    loadExpenses() {
        const container = document.getElementById('expensesTableBody');
        if (!container) return;

        if (this.expenses.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        لا توجد مصاريف مسجلة بعد
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = this.expenses.map(expense => `
            <tr>
                <td>${expense.description}</td>
                <td>${expense.amount.toLocaleString()} ${this.budgetSettings.currency}</td>
                <td><span class="badge bg-primary">${this.getCategoryName(expense.category)}</span></td>
                <td>${new Date(expense.date).toLocaleDateString('ar-EG')}</td>
                <td>${expense.notes || '-'}</td>
                <td>
                    <small class="text-muted">
                        ${new Date(expense.createdAt).toLocaleDateString('ar-EG')}
                    </small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="expensesManager.editExpense(${expense.id})" title="تعديل">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="expensesManager.deleteExpense(${expense.id})" title="حذف">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // تحميل وعرض المراحل
    loadMilestones() {
        const container = document.getElementById('milestonesContainer');
        if (!container) return;

        container.innerHTML = this.milestones.map(milestone => `
            <div class="card expense-card mb-4" data-milestone-id="${milestone.id}">
                <div class="card-header ${this.getMilestoneHeaderClass(milestone.status)} text-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="h5 mb-0">${milestone.title}</h3>
                        <div class="d-flex align-items-center gap-2">
                            <span class="milestone-badge">${this.getStatusName(milestone.status)}</span>
                            <div class="btn-group btn-group-sm" role="group">
                                <button type="button" class="btn btn-outline-light btn-sm" onclick="expensesManager.editMilestone(${milestone.id})" title="تعديل">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-outline-light btn-sm" onclick="expensesManager.deleteMilestone(${milestone.id})" title="حذف">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h4 class="h6 mb-3">تفاصيل المصاريف:</h4>
                            <ul class="list-group list-group-flush">
                                ${milestone.expenses.map(exp => `
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span>${exp.description}</span>
                                        <strong>${exp.amount.toLocaleString()} ${this.budgetSettings.currency}</strong>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="col-md-4">
                            <div class="text-center">
                                <h4 class="h6">إجمالي المرحلة</h4>
                                <p class="h4 ${this.getMilestoneAmountClass(milestone.status)}">${milestone.amount.toLocaleString()} ${this.budgetSettings.currency}</p>
                                <span class="payment-status ${this.getPaymentStatusClass(milestone.status)}">${this.getPaymentStatusText(milestone.status)}</span>
                                <p class="mt-2 small text-muted">
                                    ${milestone.paymentDate ? 
                                        `تاريخ الدفع: ${new Date(milestone.paymentDate).toLocaleDateString('ar-EG')}` : 
                                        `الدفع المتوقع: ${new Date(milestone.dueDate).toLocaleDateString('ar-EG')}`
                                    }
                                </p>
                                ${milestone.contractor ? `<p class="small text-muted">المقاول: ${milestone.contractor}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <h5 class="h6">وصف المرحلة:</h5>
                        <p class="text-muted small">${milestone.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // تحديث ملخص المشروع
    updateSummary() {
        const totalBudget = this.budgetSettings.totalBudget;
        const totalExpended = this.calculateTotalExpended();
        const totalRemaining = totalBudget - totalExpended;
        const completionPercentage = (totalExpended / totalBudget) * 100;

        // تحديث العناصر في الصفحة
        document.getElementById('totalBudget').textContent = `${totalBudget.toLocaleString()} ${this.budgetSettings.currency}`;
        document.getElementById('totalExpended').textContent = `${totalExpended.toLocaleString()} ${this.budgetSettings.currency}`;
        document.getElementById('totalRemaining').textContent = `${totalRemaining.toLocaleString()} ${this.budgetSettings.currency}`;
        document.getElementById('completionPercentage').textContent = `${Math.round(completionPercentage)}%`;
        
        // تحديث شريط التقدم
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${completionPercentage}%`;
            progressBar.setAttribute('aria-valuenow', completionPercentage);
        }

        // تحديث الألوان حسب النسبة
        if (completionPercentage > this.budgetSettings.warningThreshold) {
            progressBar?.classList.add('bg-warning');
            progressBar?.classList.remove('bg-success');
        } else {
            progressBar?.classList.add('bg-success');
            progressBar?.classList.remove('bg-warning');
        }
    }

    // حساب إجمالي المبلغ المنفق
    calculateTotalExpended() {
        const milestonesExpended = this.milestones
            .filter(m => m.status === 'completed')
            .reduce((sum, m) => sum + m.amount, 0);
        
        const regularExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        return milestonesExpended + regularExpenses;
    }

    // حساب إجمالي المصاريف
    calculateTotalExpenses() {
        return this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    }

    // تعديل مصروف
    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) return;

        this.currentEditingExpense = expense;
        
        // ملء النموذج بالبيانات
        document.getElementById('expenseDescription').value = expense.description;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseNotes').value = expense.notes || '';

        // تغيير عنوان النموذج وإظهار زر الإلغاء
        document.querySelector('#expenseForm .card-header h3').textContent = '✏️ تعديل المصروف';
        document.getElementById('expenseSubmitBtn').textContent = '💾 حفظ التعديل';
        document.getElementById('cancelEditExpense').style.display = 'inline-block';

        // التمرير إلى النموذج
        document.getElementById('expenseForm').scrollIntoView({ behavior: 'smooth' });
    }

    // حذف مصروف
    deleteExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) return;

        if (confirm(`هل أنت متأكد من حذف المصروف "${expense.description}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
            this.expenses = this.expenses.filter(exp => exp.id !== id);
            this.saveData();
            this.loadExpenses();
            this.updateSummary();
            this.showMessage('تم حذف المصروف بنجاح', 'success');
        }
    }

    // تعديل مرحلة
    editMilestone(id) {
        const milestone = this.milestones.find(ms => ms.id === id);
        if (!milestone) return;

        this.currentEditingMilestone = milestone;
        
        // ملء النموذج بالبيانات
        document.getElementById('milestoneTitle').value = milestone.title;
        document.getElementById('milestoneAmount').value = milestone.amount;
        document.getElementById('milestoneDate').value = milestone.dueDate;
        document.getElementById('milestoneStatus').value = milestone.status;
        document.getElementById('milestoneContractor').value = milestone.contractor || '';
        document.getElementById('milestoneDescription').value = milestone.description;

        // تغيير عنوان النموذج وإظهار زر الإلغاء
        document.querySelector('#milestoneForm .card-header h3').textContent = '✏️ تعديل المرحلة';
        document.getElementById('milestoneSubmitBtn').textContent = '📋 حفظ التعديل';
        document.getElementById('cancelEditMilestone').style.display = 'inline-block';

        // التمرير إلى النموذج
        document.getElementById('milestoneForm').scrollIntoView({ behavior: 'smooth' });
    }

    // حذف مرحلة
    deleteMilestone(id) {
        const milestone = this.milestones.find(ms => ms.id === id);
        if (!milestone) return;

        if (confirm(`هل أنت متأكد من حذف المرحلة "${milestone.title}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
            this.milestones = this.milestones.filter(ms => ms.id !== id);
            this.saveData();
            this.loadMilestones();
            this.updateSummary();
            this.showMessage('تم حذف المرحلة بنجاح', 'success');
        }
    }

    // إلغاء تعديل المصروف
    cancelExpenseEdit() {
        this.currentEditingExpense = null;
        this.resetExpenseForm();
    }

    // إلغاء تعديل المرحلة
    cancelMilestoneEdit() {
        this.currentEditingMilestone = null;
        this.resetMilestoneForm();
    }

    // إعادة تعيين نموذج المصروف
    resetExpenseForm() {
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        document.querySelector('#expenseForm .card-header h3').textContent = '➕ إضافة مصروف جديد';
        document.getElementById('expenseSubmitBtn').textContent = '💾 حفظ المصروف';
        document.getElementById('cancelEditExpense').style.display = 'none';
        this.currentEditingExpense = null;
    }

    // إعادة تعيين نموذج المرحلة
    resetMilestoneForm() {
        document.getElementById('milestoneForm').reset();
        document.querySelector('#milestoneForm .card-header h3').textContent = '📅 جدولة دفعة مرحلية جديدة';
        document.getElementById('milestoneSubmitBtn').textContent = '📋 جدولة المرحلة';
        document.getElementById('cancelEditMilestone').style.display = 'none';
        this.currentEditingMilestone = null;
    }

    // البحث في المصاريف
    searchExpenses(query) {
        const rows = document.querySelectorAll('#expensesTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const show = query === '' || text.includes(query.toLowerCase());
            row.style.display = show ? '' : 'none';
        });
    }

    // فلترة المصاريف حسب الفئة
    filterExpensesByCategory(category) {
        if (category === '') {
            this.loadExpenses();
            return;
        }

        const filteredExpenses = this.expenses.filter(exp => exp.category === category);
        const container = document.getElementById('expensesTableBody');
        
        if (filteredExpenses.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-filter fs-1 d-block mb-2"></i>
                        لا توجد مصاريف في فئة "${this.getCategoryName(category)}"
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = filteredExpenses.map(expense => `
            <tr>
                <td>${expense.description}</td>
                <td>${expense.amount.toLocaleString()} ${this.budgetSettings.currency}</td>
                <td><span class="badge bg-primary">${this.getCategoryName(expense.category)}</span></td>
                <td>${new Date(expense.date).toLocaleDateString('ar-EG')}</td>
                <td>${expense.notes || '-'}</td>
                <td>
                    <small class="text-muted">
                        ${new Date(expense.createdAt).toLocaleDateString('ar-EG')}
                    </small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="expensesManager.editExpense(${expense.id})" title="تعديل">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger" onclick="expensesManager.deleteExpense(${expense.id})" title="حذف">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // تصدير البيانات
    exportData(format = 'csv') {
        if (format === 'csv') {
            this.exportToCSV();
        } else if (format === 'excel') {
            this.exportToExcel();
        }
    }

    // تصدير إلى CSV
    exportToCSV() {
        let csvContent = "\uFEFF"; // BOM for UTF-8
        
        // إضافة ملخص المشروع
        csvContent += "=== ملخص مصاريف مجمع الأصيل التجاري ===\n";
        csvContent += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}\n\n`;
        
        // المصاريف العادية
        csvContent += "*** المصاريف العادية ***\n";
        csvContent += "الوصف,المبلغ (ر.ع),الفئة,التاريخ,الملاحظات\n";
        this.expenses.forEach(expense => {
            csvContent += `"${expense.description}",${expense.amount},"${this.getCategoryName(expense.category)}","${expense.date}","${expense.notes || ''}"\n`;
        });
        
        csvContent += "\n*** المراحل والدفعات ***\n";
        csvContent += "المرحلة,المبلغ (ر.ع),الحالة,تاريخ الاستحقاق,المقاول,الوصف\n";
        this.milestones.forEach(milestone => {
            csvContent += `"${milestone.title}",${milestone.amount},"${this.getStatusName(milestone.status)}","${milestone.dueDate}","${milestone.contractor || ''}","${milestone.description}"\n`;
        });

        // تنزيل الملف
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const fileName = `تقرير_مصاريف_الأصيل_${dateStr}.csv`;
        
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('تم تصدير التقرير بنجاح', 'success');
    }

    // التحقق من تحذيرات الميزانية
    checkBudgetWarnings() {
        const totalExpended = this.calculateTotalExpended();
        const percentage = (totalExpended / this.budgetSettings.totalBudget) * 100;
        
        if (percentage >= this.budgetSettings.warningThreshold) {
            this.showMessage(`تحذير: تم استنفاد ${Math.round(percentage)}% من الميزانية`, 'warning');
        }
    }

    // عرض رسالة للمستخدم
    showMessage(message, type = 'info') {
        // إنشاء عنصر الرسالة
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // إزالة الرسالة تلقائياً بعد 5 ثواني
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // دوال مساعدة للأسماء والتصنيفات
    getCategoryName(category) {
        const categories = {
            'construction': 'أعمال البناء',
            'materials': 'مواد البناء',
            'salaries': 'الرواتب والأجور',
            'utilities': 'المرافق والكهرباء',
            'maintenance': 'الصيانة',
            'equipment': 'المعدات والآلات',
            'other': 'أخرى'
        };
        return categories[category] || category;
    }

    getStatusName(status) {
        const statuses = {
            'scheduled': 'مجدول',
            'in-progress': 'قيد التنفيذ',
            'completed': 'مكتمل',
            'pending': 'معلق'
        };
        return statuses[status] || status;
    }

    getMilestoneHeaderClass(status) {
        const classes = {
            'scheduled': 'bg-warning',
            'in-progress': 'bg-info',
            'completed': 'bg-success',
            'pending': 'bg-secondary'
        };
        return classes[status] || 'bg-primary';
    }

    getMilestoneAmountClass(status) {
        const classes = {
            'scheduled': 'text-warning',
            'in-progress': 'text-info',
            'completed': 'text-success',
            'pending': 'text-secondary'
        };
        return classes[status] || 'text-primary';
    }

    getPaymentStatusClass(status) {
        const classes = {
            'scheduled': 'status-pending',
            'in-progress': 'status-pending',
            'completed': 'status-paid',
            'pending': 'status-pending'
        };
        return classes[status] || 'status-pending';
    }

    getPaymentStatusText(status) {
        const texts = {
            'scheduled': 'مجدول',
            'in-progress': 'قيد المراجعة',
            'completed': 'تم الدفع',
            'pending': 'معلق'
        };
        return texts[status] || 'غير محدد';
    }
}

// تهيئة مدير المصاريف عند تحميل الصفحة
let expensesManager;
document.addEventListener('DOMContentLoaded', function() {
    expensesManager = new ExpensesManager();
});
