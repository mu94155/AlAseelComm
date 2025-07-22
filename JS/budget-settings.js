/**
 * Budget Settings Management System
 * Al-Aseel Commercial Complex Project
 * 
 * This file handles all budget-related functionality including:
 * - Budget calculations and validations
 * - Category management
 * - Project phases management
 * - Data persistence and export
 */

// Global variables
let totalBudget = 2500000;
let phaseCounter = 3;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeBudgetSettings();
});

/**
 * Initialize all event listeners and initial calculations
 */
function initializeBudgetSettings() {
    // Load saved settings if available
    loadSavedSettings();
    
    // Set up event listeners for total budget changes
    const totalBudgetInput = document.getElementById('totalBudget');
    if (totalBudgetInput) {
        totalBudgetInput.addEventListener('input', function() {
            totalBudget = parseFloat(this.value) || 0;
            updateBudgetCalculations();
        });
    }

    // Set up event listeners for category budget changes
    document.querySelectorAll('.category-budget').forEach(input => {
        input.addEventListener('input', updateBudgetCalculations);
    });

    // Set up event listeners for phase budget changes
    document.querySelectorAll('.phase-budget').forEach(input => {
        input.addEventListener('input', updatePhaseCalculations);
    });

    // Set up delete buttons for existing phases
    document.querySelectorAll('.phase-item .btn-outline-danger').forEach(button => {
        button.addEventListener('click', function() {
            removePhase(this);
        });
    });

    // Perform initial calculations
    updateBudgetCalculations();
    updatePhaseCalculations();
}

/**
 * Load saved budget settings from localStorage
 */
function loadSavedSettings() {
    try {
        const savedSettings = localStorage.getItem('budgetSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // Restore main project settings
            if (settings.totalBudget) {
                document.getElementById('totalBudget').value = settings.totalBudget;
                totalBudget = parseFloat(settings.totalBudget);
            }
            if (settings.projectName) {
                document.getElementById('projectName').value = settings.projectName;
            }
            if (settings.startDate) {
                document.getElementById('startDate').value = settings.startDate;
            }
            if (settings.endDate) {
                document.getElementById('endDate').value = settings.endDate;
            }
            if (settings.projectDescription) {
                document.getElementById('projectDescription').value = settings.projectDescription;
            }
            
            // Restore category budgets
            if (settings.categories) {
                Object.entries(settings.categories).forEach(([category, amount]) => {
                    const input = document.querySelector(`[data-category="${category}"]`);
                    if (input) {
                        input.value = amount;
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading saved settings:', error);
    }
}

/**
 * Update budget calculations and display
 */
function updateBudgetCalculations() {
    const totalBudgetEl = document.getElementById('totalBudget');
    const currentTotalBudget = parseFloat(totalBudgetEl.value) || 0;
    
    let totalAllocated = 0;
    
    // Calculate total allocated amount and update percentages
    document.querySelectorAll('.category-budget').forEach(input => {
        const amount = parseFloat(input.value) || 0;
        totalAllocated += amount;
        
        const category = input.getAttribute('data-category');
        if (category) {
            const percentage = currentTotalBudget > 0 ? (amount / currentTotalBudget * 100).toFixed(1) : 0;
            
            // Update percentage badge
            const percentageEl = document.getElementById(category + '-percentage');
            if (percentageEl) {
                percentageEl.textContent = percentage + '%';
            }
            
            // Update progress bar
            const progressBarEl = document.getElementById(category + '-bar');
            if (progressBarEl) {
                progressBarEl.style.width = percentage + '%';
            }
        }
    });

    // Update summary section
    const remaining = currentTotalBudget - totalAllocated;
    const allocationPercentage = currentTotalBudget > 0 ? (totalAllocated / currentTotalBudget * 100).toFixed(1) : 0;
    
    updateSummaryDisplay(totalAllocated, remaining, allocationPercentage, currentTotalBudget);
}

/**
 * Update the budget summary display
 */
function updateSummaryDisplay(totalAllocated, remaining, allocationPercentage, currentTotalBudget) {
    // Update display elements
    const elements = {
        totalAllocated: document.getElementById('totalAllocated'),
        remainingBudget: document.getElementById('remainingBudget'),
        allocationPercentage: document.getElementById('allocationPercentage'),
        budgetStatus: document.getElementById('budgetStatus')
    };

    if (elements.totalAllocated) {
        elements.totalAllocated.textContent = formatCurrency(totalAllocated);
    }
    
    if (elements.remainingBudget) {
        elements.remainingBudget.textContent = formatCurrency(remaining);
    }
    
    if (elements.allocationPercentage) {
        elements.allocationPercentage.textContent = allocationPercentage + '%';
    }
    
    // Determine budget status
    if (elements.budgetStatus) {
        let status = 'متوازن';
        let statusClass = 'text-success';
        
        if (remaining < 0) {
            status = 'تجاوز الميزانية';
            statusClass = 'text-danger';
        } else if (remaining > currentTotalBudget * 0.1) {
            status = 'غير مكتمل';
            statusClass = 'text-warning';
        }
        
        elements.budgetStatus.textContent = status;
        elements.budgetStatus.className = 'h4 ' + statusClass;
    }
}

/**
 * Update phase calculations
 */
function updatePhaseCalculations() {
    let totalPhasesBudget = 0;
    document.querySelectorAll('.phase-budget').forEach(input => {
        totalPhasesBudget += parseFloat(input.value) || 0;
    });
    
    // Could add phase-specific validations here
    return totalPhasesBudget;
}

/**
 * Format currency according to Omani standards
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-OM', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' ر.ع';
}

/**
 * Add a new project phase
 */
function addNewPhase() {
    phaseCounter++;
    const phasesContainer = document.getElementById('projectPhases');
    
    if (!phasesContainer) {
        console.error('Phases container not found');
        return;
    }
    
    const newPhase = document.createElement('div');
    newPhase.className = 'phase-item mb-4';
    newPhase.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <label class="form-label">اسم المرحلة</label>
                <input type="text" class="form-control" value="المرحلة الجديدة ${phaseCounter}" placeholder="اسم المرحلة">
            </div>
            <div class="col-md-3">
                <label class="form-label">الميزانية المخصصة</label>
                <div class="input-group">
                    <input type="number" class="form-control phase-budget" value="0" min="0" step="1000" 
                           title="أدخل الميزانية المخصصة للمرحلة" placeholder="ميزانية المرحلة">
                    <span class="input-group-text">ر.ع</span>
                </div>
            </div>
            <div class="col-md-2">
                <label class="form-label">تاريخ البداية</label>
                <input type="date" class="form-control" value="" 
                       title="أدخل تاريخ بداية المرحلة" placeholder="تاريخ البداية">
            </div>
            <div class="col-md-2">
                <label class="form-label">تاريخ الانتهاء</label>
                <input type="date" class="form-control" value="" 
                       title="أدخل تاريخ انتهاء المرحلة" placeholder="تاريخ الانتهاء">
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-outline-danger btn-sm" 
                        title="حذف المرحلة">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    phasesContainer.appendChild(newPhase);
    
    // Add event listeners to the new phase
    const newBudgetInput = newPhase.querySelector('.phase-budget');
    if (newBudgetInput) {
        newBudgetInput.addEventListener('input', updatePhaseCalculations);
    }
    
    const deleteButton = newPhase.querySelector('.btn-outline-danger');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            removePhase(this);
        });
    }
}

/**
 * Remove a project phase
 */
function removePhase(button) {
    if (confirm('هل أنت متأكد من حذف هذه المرحلة؟')) {
        const phaseItem = button.closest('.phase-item');
        if (phaseItem) {
            phaseItem.remove();
            updatePhaseCalculations();
        }
    }
}

/**
 * Save budget settings to localStorage
 */
function saveBudgetSettings() {
    try {
        const budgetData = gatherBudgetData();
        localStorage.setItem('budgetSettings', JSON.stringify(budgetData));
        
        showSuccessMessage('تم حفظ إعدادات الميزانية بنجاح!');
        console.log('Budget settings saved:', budgetData);
        
    } catch (error) {
        console.error('Error saving budget settings:', error);
        alert('حدث خطأ أثناء حفظ الإعدادات. يرجى المحاولة مرة أخرى.');
    }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    const successAlert = document.getElementById('successAlert');
    if (successAlert) {
        successAlert.classList.remove('d-none');
        
        // Update message if provided
        if (message) {
            const messageElement = successAlert.querySelector('strong');
            if (messageElement) {
                messageElement.nextSibling.textContent = ' ' + message;
            }
        }
        
        setTimeout(() => {
            successAlert.classList.add('d-none');
        }, 3000);
    }
}

/**
 * Preview budget in a new window
 */
function previewBudget() {
    try {
        const budgetData = gatherBudgetData();
        
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        if (!previewWindow) {
            alert('لا يمكن فتح نافذة المعاينة. تأكد من أن المتصفح يسمح بالنوافذ المنبثقة.');
            return;
        }
        
        previewWindow.document.write(generatePreviewHTML(budgetData));
        
    } catch (error) {
        console.error('Error generating preview:', error);
        alert('حدث خطأ أثناء إنشاء المعاينة. يرجى المحاولة مرة أخرى.');
    }
}

/**
 * Generate HTML for budget preview
 */
function generatePreviewHTML(budgetData) {
    return `
        <html dir="rtl">
        <head>
            <title>معاينة الميزانية</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    background-color: #f8f9fa;
                }
                .header { 
                    text-align: center; 
                    color: #007bff; 
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .section { 
                    margin: 20px 0; 
                    padding: 20px; 
                    border: 1px solid #ddd; 
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin: 10px 0; 
                    padding: 5px 0;
                    border-bottom: 1px solid #eee;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 12px 8px; 
                    text-align: right; 
                }
                th { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                }
                .actions {
                    text-align: center;
                    margin-top: 30px;
                    padding: 20px;
                }
                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    margin: 0 5px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .btn-primary { background: #007bff; color: white; }
                .btn-secondary { background: #6c757d; color: white; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>معاينة ميزانية المشروع</h1>
                <h2>${budgetData.projectName}</h2>
                <p>تم إنشاؤه في: ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            
            <div class="section">
                <h3>📊 معلومات عامة</h3>
                <div class="row"><span><strong>الميزانية الإجمالية:</strong></span><span>${formatCurrency(budgetData.totalBudget)}</span></div>
                <div class="row"><span><strong>تاريخ البداية:</strong></span><span>${budgetData.startDate}</span></div>
                <div class="row"><span><strong>تاريخ الانتهاء:</strong></span><span>${budgetData.endDate}</span></div>
                <div class="row"><span><strong>الوصف:</strong></span><span>${budgetData.projectDescription}</span></div>
            </div>
            
            <div class="section">
                <h3>🎯 توزيع الفئات</h3>
                <table>
                    <tr><th>الفئة</th><th>المبلغ</th><th>النسبة</th></tr>
                    ${Object.entries(budgetData.categories).map(([cat, amount]) => 
                        `<tr><td>${getCategoryNameArabic(cat)}</td><td>${formatCurrency(amount)}</td><td>${((amount/budgetData.totalBudget)*100).toFixed(1)}%</td></tr>`
                    ).join('')}
                </table>
            </div>
            
            <div class="section">
                <h3>📋 مراحل المشروع</h3>
                <table>
                    <tr><th>المرحلة</th><th>الميزانية</th><th>تاريخ البداية</th><th>تاريخ الانتهاء</th></tr>
                    ${budgetData.phases.map(phase => 
                        `<tr><td>${phase.name}</td><td>${formatCurrency(phase.budget)}</td><td>${phase.startDate}</td><td>${phase.endDate}</td></tr>`
                    ).join('')}
                </table>
            </div>
            
            <div class="actions">
                <button onclick="window.print()" class="btn btn-primary">🖨️ طباعة التقرير</button>
                <button onclick="window.close()" class="btn btn-secondary">❌ إغلاق</button>
            </div>
        </body>
        </html>
    `;
}

/**
 * Gather all budget data from the form
 */
function gatherBudgetData() {
    const budgetData = {
        totalBudget: parseFloat(document.getElementById('totalBudget')?.value) || 0,
        projectName: document.getElementById('projectName')?.value || '',
        startDate: document.getElementById('startDate')?.value || '',
        endDate: document.getElementById('endDate')?.value || '',
        projectDescription: document.getElementById('projectDescription')?.value || '',
        categories: {},
        phases: [],
        lastUpdated: new Date().toISOString()
    };

    // Gather category data
    document.querySelectorAll('.category-budget').forEach(input => {
        const category = input.getAttribute('data-category');
        if (category) {
            budgetData.categories[category] = parseFloat(input.value) || 0;
        }
    });

    // Gather phase data
    document.querySelectorAll('.phase-item').forEach(phaseEl => {
        const inputs = phaseEl.querySelectorAll('input');
        if (inputs.length >= 4) {
            budgetData.phases.push({
                name: inputs[0].value || '',
                budget: parseFloat(inputs[1].value) || 0,
                startDate: inputs[2].value || '',
                endDate: inputs[3].value || ''
            });
        }
    });

    return budgetData;
}

/**
 * Get Arabic name for category
 */
function getCategoryNameArabic(category) {
    const names = {
        'construction': 'أعمال البناء والإنشاءات',
        'materials': 'المواد والمعدات',
        'salaries': 'الرواتب والأجور',
        'utilities': 'المرافق والصيانة',
        'emergency': 'احتياطي الطوارئ'
    };
    return names[category] || category;
}

/**
 * Reset all settings to defaults
 */
function resetToDefaults() {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟ سيتم فقدان جميع التغييرات غير المحفوظة.')) {
        // Reset main project settings
        const defaults = {
            totalBudget: 2500000,
            projectName: 'مجمع الأصيل التجاري',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            projectDescription: 'مجمع تجاري متكامل يضم محلات تجارية ومكاتب إدارية ومرافق خدمية في موقع استراتيجي'
        };

        Object.entries(defaults).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.value = value;
            }
        });

        // Reset category budgets
        const categoryDefaults = {
            'construction': 1000000,
            'materials': 625000,
            'salaries': 500000,
            'utilities': 250000,
            'emergency': 125000
        };

        Object.entries(categoryDefaults).forEach(([category, value]) => {
            const input = document.querySelector(`[data-category="${category}"]`);
            if (input) {
                input.value = value;
            }
        });

        // Update calculations
        totalBudget = defaults.totalBudget;
        updateBudgetCalculations();
        updatePhaseCalculations();

        // Clear saved settings
        localStorage.removeItem('budgetSettings');

        showSuccessMessage('تم استعادة الإعدادات الافتراضية بنجاح!');
    }
}

/**
 * Export budget data as JSON (for backup/import)
 */
function exportBudgetData() {
    try {
        const budgetData = gatherBudgetData();
        const dataStr = JSON.stringify(budgetData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `budget-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessMessage('تم تصدير البيانات بنجاح!');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('حدث خطأ أثناء تصدير البيانات.');
    }
}

/**
 * Validate budget data
 */
function validateBudgetData() {
    const errors = [];
    
    // Check total budget
    const totalBudgetValue = parseFloat(document.getElementById('totalBudget')?.value);
    if (!totalBudgetValue || totalBudgetValue <= 0) {
        errors.push('الميزانية الإجمالية يجب أن تكون أكبر من صفر');
    }
    
    // Check project name
    const projectName = document.getElementById('projectName')?.value?.trim();
    if (!projectName) {
        errors.push('اسم المشروع مطلوب');
    }
    
    // Check dates
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        errors.push('تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية');
    }
    
    return errors;
}

// Make functions globally available
window.addNewPhase = addNewPhase;
window.removePhase = removePhase;
window.saveBudgetSettings = saveBudgetSettings;
window.previewBudget = previewBudget;
window.resetToDefaults = resetToDefaults;
window.exportBudgetData = exportBudgetData;
window.validateBudgetData = validateBudgetData;
