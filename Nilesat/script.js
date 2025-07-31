 // Password Check for main dashboard
    function checkPassword() {
      const password = document.getElementById('passwordInput').value;
      const errorMessage = document.getElementById('errorMessage');

      // List of acceptable passwords (for demo purposes)
      const validPasswords = ['MElbadry', 'Nilesat2023', 'SatOps2023'];

      if (validPasswords.includes(password)) {
        document.getElementById('firstPage').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        errorMessage.style.display = 'none';
        // Start checking for calendar events
        setTimeout(checkEvents, 1000);
      } else {
        errorMessage.style.display = 'block';
        document.getElementById('passwordInput').value = '';
        document.getElementById('passwordInput').focus();
      }
    }

    // Allow pressing Enter to submit password
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        checkPassword();
      }
    });

    // Tab17 switching functionality
    function showTab(tabId) {
      // Hide all tab contents
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Show selected tab content
      document.getElementById(tabId).classList.add('active');
      
      // Update active tab button
      document.querySelectorAll('.tab').forEach(tabBtn => {
        tabBtn.classList.remove('active');
      });
      event.currentTarget.classList.add('active');
    }

    // Timesheet System JavaScript
    // Enhanced Employee data storage with departments
    const employeeData = {};
    const employeeDepartments = {
      '1': 'تقنية المعلومات',
      '2': 'تقنية المعلومات',
      '3': 'تقنية المعلومات',
      '4': 'العمليات',
      '5': 'العمليات',
      '6': 'العمليات',
      '7': 'المالية',
      '8': 'المالية',
      '9': 'المالية',
      '10': 'الموارد البشرية',
      '11': 'الموارد البشرية',
      '12': 'الموارد البشرية'
    };

    // Enhanced Employee passwords with more security (in a real app, use proper hashing)
    const employeePasswords = {
      '1': 'Nilesat@2023',
      '2': 'Nilesat@2023',
      '3': 'Nilesat@2023',
      '4': 'Nilesat@2023',
      '5': 'Nilesat@2023',
      '6': 'Nilesat@2023',
      '7': 'Nilesat@2023',
      '8': 'Nilesat@2023',
      '9': 'Nilesat@2023',
      '10': 'Nilesat@2023',
      '11': 'Nilesat@2023',
      '12': 'Nilesat@2023',
      'admin': 'NilesatAdmin@2023' // Administrator password
    };

    // Employee positions
    const employeePositions = {
      '1': 'مهندس نظم',
      '2': 'مبرمج',
      '3': 'مدير قواعد بيانات',
      '4': 'مهندس تشغيل',
      '5': 'فني أرضي',
      '6': 'مدير عمليات',
      '7': 'محاسب',
      '8': 'مراجع مالي',
      '9': 'مدير مالي',
      '10': 'أخصائي موارد بشرية',
      '11': 'مدير تدريب',
      '12': 'مدير موارد بشرية',
      'admin': 'مدير النظام'
    };

    // Current user info
    let currentUser = null;
    let isAdmin = false;
    let currentDepartment = null;

    // Official holidays (month is 0-indexed)
    let officialHolidays = [
      { day: 7, month: 0 }, // 7 يناير - عيد الميلاد
      { day: 25, month: 0 }, // 25 يناير - ثورة 25 يناير
      { day: 25, month: 3 }, // 25 أبريل - عيد تحرير سيناء
      { day: 1, month: 4 }, // 1 مايو - عيد العمال
      { day: 23, month: 6 }, // 23 يوليو - ثورة 23 يوليو
      { day: 6, month: 9 }, // 6 أكتوبر - عيد القوات المسلحة
      // Add more holidays as needed
    ];

    // Initialize data for all employees
    function initializeEmployeeData() {
      const employeeSelect = document.getElementById('employee');
      for (let i = 0; i < employeeSelect.options.length; i++) {
        const optgroup = employeeSelect.options[i].parentNode;
        if (optgroup.tagName === 'OPTGROUP') {
          for (let j = 0; j < optgroup.options.length; j++) {
            const empId = optgroup.options[j].value;
            employeeData[empId] = JSON.parse(localStorage.getItem(`nilesat_timesheet_${empId}`)) || {};
            
            // Load holidays if saved
            const savedHolidays = JSON.parse(localStorage.getItem(`nilesat_holidays_${empId}`));
            if (savedHolidays) {
              officialHolidays = savedHolidays;
            }
          }
        }
      }
    }

    // Show notification
    function showTimesheetNotification(message, type = 'success') {
      const notification = document.getElementById('timesheet-notification');
      const notificationMessage = document.getElementById('timesheet-notification-message');
      
      notification.className = `notification ${type}`;
      notificationMessage.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }

    // Generate days for the selected month and year
    function generateDays() {
      const month = parseInt(document.getElementById('month').value);
      const year = parseInt(document.getElementById('year').value);
      const employeeId = document.getElementById('employee').value;

      // Get the first and last day of the month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      const tbody = document.getElementById('timesheet-body');
      tbody.innerHTML = '';

      // Arabic day names
      const arabicDays = ['الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعة', 'السبت'];

      // Check if we have saved data for this employee and month/year
      const monthYearKey = `${month}_${year}`;
      const savedData = employeeData[employeeId]?.[monthYearKey] || {};

      let workingDaysCount = 0;
      let vacationDaysCount = 0;
      let totalOvertime = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        const arabicDay = arabicDays[dayOfWeek];
        
        const row = document.createElement('tr');

        // Check if this date is an official holiday
        const isOfficialHoliday = officialHolidays.some(holiday => 
          holiday.day === day && holiday.month === month
        );

        // Weekend days (Friday and Saturday)
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

        // Highlight official holidays with yellow background
        if (isOfficialHoliday) {
          row.classList.add('holiday');
        }

        // Mark weekend days but keep them enabled for input
        if (isWeekend) {
          row.classList.add('weekend');
        }

        // Check if this date is in saved data
        const dateKey = day.toString();
        const dayData = savedData[dateKey] || {};

        // Calculate if this is a working day (now weekends are considered working days)
        const isWorkingDay = true; // All days are working days now
        
        if (!isOfficialHoliday) workingDaysCount++;
        else vacationDaysCount++;

        row.innerHTML = `
          <td>${arabicDay}</td>
          <td>${day}/${month + 1}/${year}</td>
          <td><input type="time" class="time-input start-time" data-day="${day}" value="${dayData.startTime || ''}"></td>
          <td><input type="time" class="time-input end-time" data-day="${day}" value="${dayData.endTime || ''}"></td>
          <td><input type="text" class="hours-input actual-hours" data-day="${day}" value="${dayData.actualHours || ''}" readonly></td>
          <td><input type="number" class="hours-input overtime-hours" data-day="${day}" value="${dayData.overtimeHours || ''}" min="0" max="24" step="0.25"></td>
          <td>
            <select class="multiplier-input multiplier" data-day="${day}">
              <option value="1" ${dayData.multiplier === '1' ? 'selected' : ''}>1</option>
              <option value="1.5" ${dayData.multiplier === '1.5' ? 'selected' : ''}>1.5</option>
              <option value="2" ${dayData.multiplier === '2' ? 'selected' : (isOfficialHoliday ? 'selected' : '')}>2</option>
            </select>
          </td>
          <td><input type="text" class="hours-input total-overtime" data-day="${day}" value="${dayData.totalOvertime || ''}" readonly></td>
          <td>
            <select class="notes-input notes-select" data-day="${day}">
              <option value="">-- لا يوجد --</option>
              <option value="طوارئ و تأمين أداء" ${dayData.notes === 'طوارئ و تأمين أداء' ? 'selected' : ''}>طوارئ و تأمين أداء</option>
              <option value="مناوب" ${dayData.notes === 'مناوب' ? 'selected' : ''}>مناوب</option>
              <option value="اجازة اعتيادية" ${dayData.notes === 'اجازة اعتيادية' ? 'selected' : ''}>اجازة اعتيادية</option>
              <option value="اجازة مرضية" ${dayData.notes === 'اجازة مرضية' ? 'selected' : ''}>اجازة مرضية</option>
              <option value="اجازة رسمية" ${dayData.notes === 'اجازة رسمية' ? 'selected' : ''}>اجازة رسمية</option>
              <option value="اجازة بدون مرتب" ${dayData.notes === 'اجازة بدون مرتب' ? 'selected' : ''}>اجازة بدون مرتب</option>
              <option value="تدريب" ${dayData.notes === 'تدريب' ? 'selected' : ''}>تدريب</option>
              <option value="مهمة عمل" ${dayData.notes === 'مهمة عمل' ? 'selected' : ''}>مهمة عمل</option>
            </select>
          </td>
          <td class="no-print">
            <button class="btn-danger clear-row-btn" data-day="${day}" title="مسح بيانات اليوم">
              <i class="fas fa-trash-alt"></i>
            </button>
            ${isOfficialHoliday ? `
              <button class="btn-admin holiday-btn" data-day="${day}" data-month="${month}" data-year="${year}" title="إزالة يوم إجازة">
                <i class="fas fa-calendar-minus"></i>
              </button>
            ` : `
              <button class="btn-admin holiday-btn" data-day="${day}" data-month="${month}" data-year="${year}" title="تعيين يوم إجازة">
                <i class="fas fa-calendar-plus"></i>
              </button>
            `}
          </td>
        `;

        tbody.appendChild(row);

        // Add to total overtime if exists
        if (dayData.totalOvertime) {
          totalOvertime += parseFloat(dayData.totalOvertime) || 0;
        }
      }

      // Add summary row
      const tfoot = document.getElementById('timesheet-footer');
      tfoot.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: left; font-weight: bold;">الإجمالي:</td>
          <td class="total-hours" id="month-total-overtime">${totalOvertime.toFixed(2)}</td>
          <td colspan="2"></td>
        </tr>
      `;

      // Update stats
      document.getElementById('total-overtime').textContent = totalOvertime.toFixed(2);
      document.getElementById('working-days').textContent = workingDaysCount;
      document.getElementById('vacation-days').textContent = vacationDaysCount;
      document.getElementById('total-payment').textContent = (totalOvertime * 50).toFixed(2) + ' ج.م'; // Assuming 50 EGP per overtime hour

      // Add event listeners to all inputs
      addEventListeners();
      
      // Calculate all hours
      calculateAllHours();
    }

    // Add event listeners to inputs
    function addEventListeners() {
      // Calculate hours when start or end time changes
      document.querySelectorAll('.start-time, .end-time').forEach(input => {
        input.addEventListener('change', function() {
          const day = this.getAttribute('data-day');
          calculateHours(day);
          updateMonthTotal();
        });
      });

      // Calculate overtime when overtime hours or multiplier changes
      document.querySelectorAll('.overtime-hours, .multiplier').forEach(input => {
        input.addEventListener('change', function() {
          const day = this.getAttribute('data-day');
          calculateOvertime(day);
          updateMonthTotal();
        });
      });

      // Handle notes selection changes
      document.querySelectorAll('.notes-select').forEach(select => {
        select.addEventListener('change', function() {
          const day = this.getAttribute('data-day');
          const row = this.closest('tr');
          const actualHoursInput = row.querySelector('.actual-hours');
          
          const dayOfWeek = new Date(
            parseInt(document.getElementById('year').value),
            parseInt(document.getElementById('month').value),
            parseInt(day)
          ).getDay();

          // Check if this date is an official holiday
          const isOfficialHoliday = officialHolidays.some(holiday => 
            holiday.day === parseInt(day) && holiday.month === parseInt(document.getElementById('month').value)
          );

          // Handle "اجازة اعتيادية" (Regular Vacation)
          if (this.value === 'اجازة اعتيادية') {
            actualHoursInput.value = '8.50'; // 8 hours and 30 minutes
            row.querySelector('.overtime-hours').value = '';
            calculateOvertime(day);
          }
          // Handle "مناوب" (Shift Work)
          else if (this.value === 'مناوب') {
            // Weekend (Friday or Saturday) or holiday - empty hours
            if (dayOfWeek === 5 || dayOfWeek === 6 || isOfficialHoliday) {
              actualHoursInput.value = '0.00';
              row.querySelector('.overtime-hours').value = '';
            }
            // Normal work day - 8.5 hours
            else {
              actualHoursInput.value = '8.50';
              row.querySelector('.overtime-hours').value = '';
            }
            calculateOvertime(day);
          }
          
          updateMonthTotal();
        });
      });

      // Clear row button
      document.querySelectorAll('.clear-row-btn').forEach(button => {
        button.addEventListener('click', function() {
          const day = this.getAttribute('data-day');
          const row = this.closest('tr');
          
          // Clear all inputs
          row.querySelector('.start-time').value = '';
          row.querySelector('.end-time').value = '';
          row.querySelector('.overtime-hours').value = '';
          row.querySelector('.notes-select').value = '';
          
          // Calculate hours to update totals
          calculateHours(day);
          updateMonthTotal();
          
          showTimesheetNotification('تم مسح بيانات اليوم', 'success');
        });
      });

      // Holiday toggle button
      document.querySelectorAll('.holiday-btn').forEach(button => {
        button.addEventListener('click', function() {
          const day = parseInt(this.getAttribute('data-day'));
          const month = parseInt(this.getAttribute('data-month'));
          const year = parseInt(this.getAttribute('data-year'));
          const isHoliday = this.innerHTML.includes('minus'); // If minus icon, it's currently a holiday
          
          // Toggle holiday status
          if (isHoliday) {
            // Remove from holidays
            officialHolidays = officialHolidays.filter(h => !(h.day === day && h.month === month));
            this.innerHTML = '<i class="fas fa-calendar-plus"></i>';
            this.title = 'تعيين يوم إجازة';
          } else {
            // Add to holidays
            officialHolidays.push({ day, month });
            this.innerHTML = '<i class="fas fa-calendar-minus"></i>';
            this.title = 'إزالة يوم إجازة';
          }
          
          // Save holidays to localStorage
          const employeeId = document.getElementById('employee').value;
          localStorage.setItem(`nilesat_holidays_${employeeId}`, JSON.stringify(officialHolidays));
          
          // Regenerate days to reflect changes
          generateDays();
          
          showTimesheetNotification(isHoliday ? 'تم إزالة اليوم من الإجازات' : 'تم تعيين اليوم كإجازة رسمية', 'success');
        });
      });
    }

    // Calculate working hours for a specific day
    function calculateHours(day) {
      const row = document.querySelector(`.start-time[data-day="${day}"]`).closest('tr');
      const startTime = row.querySelector('.start-time').value;
      const endTime = row.querySelector('.end-time').value;
      const actualHoursInput = row.querySelector('.actual-hours');
      const overtimeHoursInput = row.querySelector('.overtime-hours');
      const notesSelect = row.querySelector('.notes-select');
      
      // Skip calculation if "اجازة اعتيادية" or "مناوب" is selected (handled in notes change event)
      if (notesSelect.value === 'اجازة اعتيادية' || notesSelect.value === 'مناوب') {
        return;
      }
      
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        
        // Handle overnight shifts (end time is next day)
        if (end < start) {
          end.setDate(end.getDate() + 1);
        }
        
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);
        actualHoursInput.value = diffHours.toFixed(2);
        
        // Auto-fill overtime hours if empty (assuming standard 8-hour workday)
        if (!overtimeHoursInput.value && diffHours > 8) {
          overtimeHoursInput.value = (diffHours - 8).toFixed(2);
        }
      } else {
        actualHoursInput.value = '';
        overtimeHoursInput.value = '';
      }
      
      calculateOvertime(day);
    }

    // Calculate overtime for a specific day
    function calculateOvertime(day) {
      const row = document.querySelector(`.overtime-hours[data-day="${day}"]`).closest('tr');
      const overtimeHours = parseFloat(row.querySelector('.overtime-hours').value) || 0;
      const multiplier = parseFloat(row.querySelector('.multiplier').value) || 0;
      const totalOvertimeInput = row.querySelector('.total-overtime');
      
      const totalOvertime = overtimeHours * multiplier;
      totalOvertimeInput.value = totalOvertime.toFixed(2);
    }

    // Calculate hours for all days
    function calculateAllHours() {
      const month = parseInt(document.getElementById('month').value);
      const year = parseInt(document.getElementById('year').value);
      const lastDay = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= lastDay; day++) {
        calculateHours(day);
      }
    }

    // Update month total overtime
    function updateMonthTotal() {
      let totalOvertime = 0;
      
      document.querySelectorAll('.total-overtime').forEach(input => {
        totalOvertime += parseFloat(input.value) || 0;
      });
      
      document.getElementById('month-total-overtime').textContent = totalOvertime.toFixed(2);
      document.getElementById('total-overtime').textContent = totalOvertime.toFixed(2);
      document.getElementById('total-payment').textContent = (totalOvertime * 50).toFixed(2) + ' ج.م';
    }

    // Save data to localStorage
    function saveData() {
      const employeeId = document.getElementById('employee').value;
      const month = parseInt(document.getElementById('month').value);
      const year = parseInt(document.getElementById('year').value);
      const monthYearKey = `${month}_${year}`;
      
      // Initialize employee data if not exists
      if (!employeeData[employeeId]) {
        employeeData[employeeId] = {};
      }
      
      // Initialize month/year data if not exists
      if (!employeeData[employeeId][monthYearKey]) {
        employeeData[employeeId][monthYearKey] = {};
      }
      
      const lastDay = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= lastDay; day++) {
        const dateKey = day.toString();
        const row = document.querySelector(`.start-time[data-day="${day}"]`)?.closest('tr');
        if (!row) continue;
        
        employeeData[employeeId][monthYearKey][dateKey] = {
          startTime: row.querySelector('.start-time').value,
          endTime: row.querySelector('.end-time').value,
          actualHours: row.querySelector('.actual-hours').value,
          overtimeHours: row.querySelector('.overtime-hours').value,
          multiplier: row.querySelector('.multiplier').value,
          totalOvertime: row.querySelector('.total-overtime').value,
          notes: row.querySelector('.notes-select').value
        };
      }
      
      // Save to localStorage
      localStorage.setItem(`nilesat_timesheet_${employeeId}`, JSON.stringify(employeeData[employeeId]));
      
      showTimesheetNotification('تم حفظ البيانات بنجاح', 'success');
    }

    // Export to Excel (CSV format)
    function exportToExcel() {
      const employeeId = document.getElementById('employee').value;
      const employeeName = document.getElementById('employee').options[document.getElementById('employee').selectedIndex].text;
      const month = parseInt(document.getElementById('month').value);
      const year = parseInt(document.getElementById('year').value);
      const monthName = document.getElementById('month').options[document.getElementById('month').selectedIndex].text;
      
      let csv = `اسم الموظف,${employeeName}\n`;
      csv += `الإدارة,${employeeDepartments[employeeId] || 'غير محدد'}\n`;
      csv += `الوظيفة,${employeePositions[employeeId] || 'غير محدد'}\n`;
      csv += `الشهر,${monthName} ${year}\n\n`;
      
      csv += `اليوم,التاريخ,من الساعة,الى الساعة,عدد الساعات الفعلية,عدد الساعات الاضافية,المعامل,اجمالى الساعات الاضافيه,ملاحظات\n`;
      
      const rows = document.querySelectorAll('#timesheet-body tr');
      rows.forEach(row => {
        const cells = row.cells;
        const rowData = [
          cells[0].textContent,
          cells[1].textContent,
          cells[2].querySelector('input').value,
          cells[3].querySelector('input').value,
          cells[4].querySelector('input').value,
          cells[5].querySelector('input').value,
          cells[6].querySelector('select').value,
          cells[7].querySelector('input').value,
          cells[8].querySelector('select').value
        ];
        csv += rowData.join(',') + '\n';
      });
      
      // Add summary
      csv += `\nإجمالي الساعات الإضافية,${document.getElementById('month-total-overtime').textContent}\n`;
      csv += `إجمالي المستحقات,${(parseFloat(document.getElementById('month-total-overtime').textContent) * 50).toFixed(2)} ج.م\n`;
      
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `timesheet_${employeeName}_${monthName}_${year}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showTimesheetNotification('تم تصدير البيانات إلى ملف Excel', 'success');
    }

    // Reset current month data
    function resetData() {
      if (confirm('هل أنت متأكد من أنك تريد إعادة تعيين جميع بيانات هذا الشهر؟ سيتم فقدان جميع البيانات غير المحفوظة.')) {
        const employeeId = document.getElementById('employee').value;
        const month = parseInt(document.getElementById('month').value);
        const year = parseInt(document.getElementById('year').value);
        const monthYearKey = `${month}_${year}`;
        
        // Clear from memory
        if (employeeData[employeeId] && employeeData[employeeId][monthYearKey]) {
          delete employeeData[employeeId][monthYearKey];
        }
        
        // Clear from localStorage
        localStorage.setItem(`nilesat_timesheet_${employeeId}`, JSON.stringify(employeeData[employeeId]));
        
        // Regenerate days
        generateDays();
        
        showTimesheetNotification('تم إعادة تعيين بيانات الشهر', 'success');
      }
    }

    // Print the timesheet
    function printTimesheet() {
      window.print();
    }

    // Print all timesheets (admin only)
    function printAllTimesheets() {
      // In a real app, you would generate a comprehensive report here
      alert('سيتم طباعة جميع سجلات الموظفين لهذا الشهر');
      window.print();
    }

    // Handle login
    function handleTimesheetLogin(event) {
      event.preventDefault();
      
      const employeeId = document.getElementById('timesheet-login-employee').value;
      const password = document.getElementById('timesheet-login-password').value;
      const errorElement = document.getElementById('timesheet-login-error');
      
      if (!employeeId) {
        errorElement.textContent = 'الرجاء اختيار موظف';
        errorElement.style.display = 'block';
        return;
      }
      
      if (!password) {
        errorElement.textContent = 'الرجاء إدخال كلمة المرور';
        errorElement.style.display = 'block';
        return;
      }
      
      // Check password
      if (employeePasswords[employeeId] && employeePasswords[employeeId] === password) {
        // Successful login
        currentUser = employeeId;
        isAdmin = (employeeId === 'admin');
        currentDepartment = employeeDepartments[employeeId] || null;
        
        // Hide login page, show app
        document.getElementById('timesheet-login-page').style.display = 'none';
        document.getElementById('timesheet-app-container').style.display = 'block';
        
        // Update user info
        document.getElementById('current-user-name').textContent = 
          document.getElementById('timesheet-login-employee').options[document.getElementById('timesheet-login-employee').selectedIndex].text;
        document.getElementById('current-user-role').textContent = 
          employeePositions[employeeId] || (isAdmin ? 'مدير النظام' : 'موظف');
        
        // If admin, show admin controls and department filter
        if (isAdmin) {
          document.getElementById('print-all-btn').style.display = 'inline-block';
          document.getElementById('department-filter').style.display = 'block';
          document.getElementById('employee').disabled = false;
        } else {
          // For regular employees, lock the employee dropdown to their own account
          document.getElementById('employee').value = currentUser;
          document.getElementById('employee').disabled = true;
        }
        
        // Initialize the app
        initializeEmployeeData();
        generateDays();
        
        showTimesheetNotification(`مرحباً ${document.getElementById('current-user-name').textContent}`, 'success');
      } else {
        errorElement.textContent = 'كلمة المرور غير صحيحة';
        errorElement.style.display = 'block';
      }
    }

    // Handle logout
    function handleTimesheetLogout() {
      // Reset the app
      currentUser = null;
      isAdmin = false;
      currentDepartment = null;
      
      // Show login page, hide app
      document.getElementById('timesheet-login-page').style.display = 'block';
      document.getElementById('timesheet-app-container').style.display = 'none';
      
      // Reset form
      document.getElementById('timesheet-login-form').reset();
      document.getElementById('timesheet-login-error').style.display = 'none';
      
      // Enable employee dropdown
      document.getElementById('employee').disabled = false;
    }

    // Toggle password visibility
    function toggleTimesheetPasswordVisibility() {
      const passwordInput = document.getElementById('timesheet-login-password');
      const toggleIcon = document.getElementById('timesheet-toggle-password');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
      } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
      }
    }

    // Initialize the timesheet application
    document.addEventListener('DOMContentLoaded', function() {
      // Set up login form
      document.getElementById('timesheet-login-form').addEventListener('submit', handleTimesheetLogin);
      
      // Set up logout button
      document.getElementById('timesheet-logout-btn').addEventListener('click', handleTimesheetLogout);
      
      // Toggle password visibility
      document.getElementById('timesheet-toggle-password').addEventListener('click', toggleTimesheetPasswordVisibility);
      
      // Event listeners for buttons
      document.getElementById('update-btn').addEventListener('click', generateDays);
      document.getElementById('save-btn').addEventListener('click', saveData);
      document.getElementById('export-btn').addEventListener('click', exportToExcel);
      document.getElementById('print-btn').addEventListener('click', printTimesheet);
      document.getElementById('print-all-btn').addEventListener('click', printAllTimesheets);
      document.getElementById('reset-btn').addEventListener('click', resetData);
      
      // When employee changes, load their data (only for admin)
      document.getElementById('employee').addEventListener('change', function() {
        if (isAdmin) {
          generateDays();
        }
      });
      
      // Department filter for admin
      document.getElementById('filter-department').addEventListener('change', function() {
        if (!isAdmin) return;
        
        const department = this.value;
        const employeeSelect = document.getElementById('employee');
        
        // Show all options first
        for (let i = 0; i < employeeSelect.options.length; i++) {
          const optgroup = employeeSelect.options[i].parentNode;
          if (optgroup.tagName === 'OPTGROUP') {
            optgroup.style.display = '';
            for (let j = 0; j < optgroup.options.length; j++) {
              optgroup.options[j].style.display = '';
            }
          }
        }
        
        // Filter if not "all"
        if (department !== 'all') {
          for (let i = 0; i < employeeSelect.options.length; i++) {
            const optgroup = employeeSelect.options[i].parentNode;
            if (optgroup.tagName === 'OPTGROUP') {
              if (optgroup.label !== `إدارة ${department}`) {
                optgroup.style.display = 'none';
                for (let j = 0; j < optgroup.options.length; j++) {
                  optgroup.options[j].style.display = 'none';
                }
              }
            }
          }
        }
      });
    });




    // News Bar Functionality
 // News Bar Functionality
        let isPlaying = true;
        let newsBar = document.getElementById('newsBar');
        let newsText = document.getElementById('newsText');
        let newsInput = document.getElementById('newsInput');
        let textColor = document.getElementById('textColor');
        let backgroundColor = document.getElementById('backgroundColor');
        let borderColor = document.getElementById('borderColor');
        let borderWidth = document.getElementById('borderWidth');
        let fontSize = document.getElementById('fontSize');
        let fontFamily = document.getElementById('fontFamily');
        let speed = document.getElementById('speed');
        let playPauseBtn = document.getElementById('playPauseBtn');
        
        // Message history
        let messageHistory = [];
        let scheduledMessages = [];

        function updateNews() {
            // Update text
            const message = newsInput.value || "Nilesat Operations Dashboard - Monitoring satellites 201 and 301";
            newsText.textContent = message;
            
            // Add to history
            addToHistory(message);
            
            // Update styles
            newsText.style.color = textColor.value;
            newsBar.style.backgroundColor = backgroundColor.value;
            newsBar.style.borderColor = borderColor.value;
            newsBar.style.borderWidth = `${borderWidth.value}px`;
            newsBar.style.borderStyle = 'solid';
            newsText.style.fontSize = `${fontSize.value}px`;
            newsText.style.fontFamily = fontFamily.value;
            
            // Update animation speed
            newsBar.style.animationDuration = `${speed.value}s`;
        }

        function addToHistory(message) {
            const timestamp = new Date().toLocaleString();
            messageHistory.unshift({
                text: message,
                time: timestamp,
                color: textColor.value,
                bgColor: backgroundColor.value
            });
            
            // Keep only last 50 messages
            if (messageHistory.length > 50) {
                messageHistory.pop();
            }
            
            renderMessageHistory();
        }

        function renderMessageHistory() {
            const historyContainer = document.getElementById('messageHistory');
            historyContainer.innerHTML = messageHistory.map(msg => `
                <div class="message-item" style="border-left-color: ${msg.bgColor}">
                    <div class="message-time">${msg.time}</div>
                    <div class="message-text" style="color: ${msg.color}">${msg.text}</div>
                </div>
            `).join('');
        }

        function scheduleMessage() {
            const message = newsInput.value;
            const scheduleTime = document.getElementById('scheduleTime').value;
            
            if (!message || !scheduleTime) {
                alert('Please enter both a message and schedule time');
                return;
            }
            
            const scheduledMsg = {
                text: message,
                time: scheduleTime,
                color: textColor.value,
                bgColor: backgroundColor.value,
                fontSize: fontSize.value,
                fontFamily: fontFamily.value,
                borderWidth: borderWidth.value,
                borderColor: borderColor.value,
                speed: speed.value
            };
            
            scheduledMessages.push(scheduledMsg);
            renderScheduledMessages();
            
            // Set up the scheduled update
            const now = new Date();
            const scheduledDate = new Date(scheduleTime);
            const delay = scheduledDate.getTime() - now.getTime();
            
            if (delay > 0) {
                setTimeout(() => {
                    applyScheduledMessage(scheduledMsg);
                }, delay);
            }
            
            // Clear inputs
            newsInput.value = '';
            document.getElementById('scheduleTime').value = '';
        }

        function applyScheduledMessage(msg) {
            newsText.textContent = msg.text;
            newsText.style.color = msg.color;
            newsBar.style.backgroundColor = msg.bgColor;
            newsBar.style.borderColor = msg.borderColor;
            newsBar.style.borderWidth = `${msg.borderWidth}px`;
            newsText.style.fontSize = `${msg.fontSize}px`;
            newsText.style.fontFamily = msg.fontFamily;
            newsBar.style.animationDuration = `${msg.speed}s`;
            
            // Add to history
            addToHistory(msg.text);
            
            // Remove from scheduled
            scheduledMessages = scheduledMessages.filter(m => m.time !== msg.time);
            renderScheduledMessages();
        }

        function renderScheduledMessages() {
            const container = document.getElementById('scheduledMessages');
            container.innerHTML = scheduledMessages.map((msg, index) => `
                <div class="scheduled-item">
                    <div>
                        <div class="scheduled-time">Scheduled for: ${new Date(msg.time).toLocaleString()}</div>
                        <div class="message-text">${msg.text}</div>
                    </div>
                    <button class="delete-scheduled" onclick="deleteScheduledMessage(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        function deleteScheduledMessage(index) {
            scheduledMessages.splice(index, 1);
            renderScheduledMessages();
        }

        function clearNews() {
            // Reset to default
            newsInput.value = '';
            textColor.value = '#ffffff';
            backgroundColor.value = '#1e3a8a';
            borderColor.value = '#3b82f6';
            borderWidth.value = '2';
            fontSize.value = '16';
            fontFamily.value = 'Arial, sans-serif';
            speed.value = '20';
            updateNews();
        }

        function playPauseNews() {
            if (isPlaying) {
                newsBar.style.animationPlayState = 'paused';
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            } else {
                newsBar.style.animationPlayState = 'running';
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
            isPlaying = !isPlaying;
        }

        // Initialize default settings
        updateNews();

        // Tab Switching Function
        function showTab(tabName) {
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.style.display = 'none');
            document.getElementById(tabName).style.display = 'block';
            
            const tabButtons = document.querySelectorAll('.tab');
            tabButtons.forEach(button => button.classList.remove('active'));
            document.querySelector(`.tab[onclick="showTab('${tabName}')"]`).classList.add('active');
            
            // Special handling for certain tabs
            if (tabName === 'tab12') {
                // Initialize analytics chart when tab is shown
                setTimeout(initializeAnalyticsChart, 100);
            }
        }

        // Open URL in New Tab
        function openUrl(url) {
            if (url.startsWith('http')) {
                window.open(url, '_blank');
            } else {
                alert('This feature is not yet implemented or the URL is invalid.');
            }
        }

    // Initialize the first tab as active
    showTab('tab1');

        // Enhanced Link Budget Calculator (Tab 2)
        function calculateLinkBudget() {
            // Validate inputs
            if (!validateLinkBudgetInputs()) {
                return;
            }
            
            const EARTH_RADIUS = 6371e3; // meters
            const GEO_ALTITUDE = 35786e3; // meters
            const c = 299792458; // Speed of light
            const k = 1.380649e-23; // Boltzmann constant
            
            // Collect coordinates
            const satLon = parseFloat(document.getElementById('satLon').value);
            const gsLat = parseFloat(document.getElementById('gsLat').value);
            const gsLon = parseFloat(document.getElementById('gsLon').value);
            const gsAlt = parseFloat(document.getElementById('gsAlt').value) || 0;
            
            // Calculate angular separation
            const dLon = (satLon - gsLon) * Math.PI / 180;
            const gsLatRad = gsLat * Math.PI / 180;
            
            // Calculate ground station distance from Earth center
            const R_gs = EARTH_RADIUS + gsAlt;
            
            // Satellite position (geostationary orbit)
            const R_sat = EARTH_RADIUS + GEO_ALTITUDE;
            const satLatRad = 0; // Geostationary satellites are equatorial
            
            // Calculate slant range using spherical law of cosines
            const cosTheta = Math.sin(gsLatRad) * Math.sin(satLatRad) +
                            Math.cos(gsLatRad) * Math.cos(satLatRad) * Math.cos(dLon);
            const theta = Math.acos(cosTheta);
            
            // Slant range calculation
            const R = Math.sqrt(R_gs**2 + R_sat**2 - 2 * R_gs * R_sat * cosTheta);
            
            // Collect other parameters
            const frequency = parseFloat(document.getElementById('frequency').value);
            const frequencyUnit = document.getElementById('frequencyUnit').value;
            const efficiency = parseFloat(document.getElementById('efficiency').value);
            const dtx = parseFloat(document.getElementById('dtx').value);
            const drx = parseFloat(document.getElementById('drx').value);
            const ptx = parseFloat(document.getElementById('ptx').value);
            const ptxUnit = document.getElementById('ptxUnit').value;
            const ltx = parseFloat(document.getElementById('ltx').value);
            const lrx = parseFloat(document.getElementById('lrx').value);
            const lm = parseFloat(document.getElementById('lm').value);
            const Tsys = parseFloat(document.getElementById('systemNoiseTemp').value);
            const B = parseFloat(document.getElementById('bandwidth').value) * 1e6; // MHz to Hz
            
            // Frequency conversion
            let freqHz = frequency;
            switch (frequencyUnit) {
                case 'kHz': freqHz *= 1e3; break;
                case 'MHz': freqHz *= 1e6; break;
                case 'GHz': freqHz *= 1e9; break;
            }
            
            // Calculate wavelength
            const lambda = c / freqHz;
            
            // Convert PTX to dBm
            const ptx_dBm = ptxUnit === 'W' ? 10 * Math.log10(ptx / 0.001) : ptx;
            
            // Calculate antenna gains
            const gtx = 10 * Math.log10(efficiency * (Math.PI * dtx / lambda) ** 2);
            const grx = 10 * Math.log10(efficiency * (Math.PI * drx / lambda) ** 2);
            
            // Calculate FSPL
            const fspl = 20 * Math.log10(4 * Math.PI * R / lambda);
            
            // Calculate received power
            const prx = ptx_dBm + gtx + grx - fspl - ltx - lrx - lm;
            
            // Calculate G/T
            const G_over_T = grx - 10 * Math.log10(Tsys);
            
            // Calculate C/N
            const N = 10 * Math.log10(k * Tsys * B);
            const C_over_N = prx - N;
            
            // Calculate Eb/N0
            const bitRate = B; // Assuming 1 bit/Hz for simplicity
            const EbN0 = C_over_N - 10 * Math.log10(bitRate / B);
            
            // Calculate elevation angle for visualization
            const elevation = (180/Math.PI) * Math.atan(
                (cosTheta - (EARTH_RADIUS / R_sat)) / Math.sqrt(1 - cosTheta**2)
            );
            
            // Prepare results
            const results = [
                { name: 'PTX', value: `${ptx_dBm.toFixed(2)} dBm`, hint: 'Transmitter power output' },
                { name: 'GTX', value: `${gtx.toFixed(2)} dB`, hint: `10·log₁₀(η·(π·D/λ)² where η=${efficiency}` },
                { name: 'GRX', value: `${grx.toFixed(2)} dB`, hint: `10·log₁₀(η·(π·D/λ)² where η=${efficiency}` },
                { name: 'Range', value: `${(R / 1000).toFixed(2)} km`, hint: 'Calculated from coordinates' },
                { name: 'Elevation Angle', value: `${elevation.toFixed(2)}°`, hint: 'Angle from ground station to satellite' },
                { name: 'FSPL', value: `${fspl.toFixed(2)} dB`, hint: '20·log₁₀(4πR/λ)' },
                { name: 'LTX', value: `${ltx} dB`, hint: 'User-provided transmitter losses' },
                { name: 'LRX', value: `${lrx} dB`, hint: 'User-provided receiver losses' },
                { name: 'LM', value: `${lm} dB`, hint: 'User-provided miscellaneous losses' },
                { name: 'G/T', value: `${G_over_T.toFixed(2)} dB/K`, hint: 'Figure of merit (Receiver gain to system noise temperature ratio)' },
                { name: 'System Noise Temp', value: `${Tsys} K`, hint: 'User-provided system noise temperature' },
                { name: 'Thermal Noise (N)', value: `${N.toFixed(2)} dBW`, hint: 'k·T·B where k=Boltzmann constant' },
                { name: 'PRX', value: `${prx.toFixed(2)} dBm`, hint: 'PTX + GTX + GRX - FSPL - LTX - LRX - LM' },
                { name: 'C/N', value: `${C_over_N.toFixed(2)} dB`, hint: 'Carrier-to-noise ratio' },
                { name: 'Eb/N0', value: `${EbN0.toFixed(2)} dB`, hint: 'Energy per bit to noise density' }
            ];
            
            // Display results
            const resultsBody = document.getElementById('resultsBody');
            resultsBody.innerHTML = results.map(r => `
                <tr>
                    <td>${r.name}</td>
                    <td>${r.value}</td>
                    <td class="hint">${r.hint}</td>
                </tr>
            `).join('');
            
            document.getElementById('results').style.display = 'block';
            
            // Create visualization charts
            createLinkBudgetChart([
                { label: 'Transmitter Power (PTX)', value: ptx_dBm },
                { label: 'TX Antenna Gain (GTX)', value: gtx },
                { label: 'RX Antenna Gain (GRX)', value: grx },
                { label: 'Free Space Loss (FSL)', value: -fspl },
                { label: 'TX Losses (LTX)', value: -ltx },
                { label: 'RX Losses (LRX)', value: -lrx },
                { label: 'Misc Losses (LM)', value: -lm },
                { label: 'Received Power (PRX)', value: prx }
            ]);
            
            createPowerBudgetChart([
                { label: 'C/N', value: C_over_N },
                { label: 'Eb/N0', value: EbN0 },
                { label: 'G/T', value: G_over_T }
            ]);
        }

        function validateLinkBudgetInputs() {
            const requiredInputs = [
                'satLon', 'gsLat', 'gsLon', 'frequency', 'ptx', 
                'efficiency', 'dtx', 'drx', 'ltx', 'lrx', 'lm',
                'systemNoiseTemp', 'bandwidth'
            ];
            
            let isValid = true;
            
            requiredInputs.forEach(id => {
                const input = document.getElementById(id);
                if (!input.value || isNaN(parseFloat(input.value))) {
                    input.style.borderColor = 'red';
                    isValid = false;
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                alert('Please fill in all required fields with valid numbers');
                return false;
            }
            
            // Validate efficiency range
            const efficiency = parseFloat(document.getElementById('efficiency').value);
            if (efficiency < 0 || efficiency > 1) {
                alert('Antenna efficiency must be between 0 and 1');
                document.getElementById('efficiency').style.borderColor = 'red';
                return false;
            }
            
            return true;
        }

        function createLinkBudgetChart(data) {
            const ctx = document.getElementById('linkBudgetChart').getContext('2d');
            
            // Destroy previous chart if it exists
            if (window.linkBudgetChart) {
                window.linkBudgetChart.destroy();
            }
            
            window.linkBudgetChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item.label),
                    datasets: [{
                        label: 'Power Budget (dB)',
                        data: data.map(item => item.value),
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Power (dB)'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.raw.toFixed(2)} dB`;
                                }
                            }
                        }
                    }
                }
            });
        }

        function createPowerBudgetChart(data) {
            const ctx = document.getElementById('powerBudgetChart').getContext('2d');
            
            // Destroy previous chart if it exists
            if (window.powerBudgetChart) {
                window.powerBudgetChart.destroy();
            }
            
            window.powerBudgetChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item.label),
                    datasets: [{
                        label: 'Performance Metrics (dB)',
                        data: data.map(item => item.value),
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Value (dB)'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.raw.toFixed(2)} dB`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Initialize the dashboard
        document.addEventListener('DOMContentLoaded', function() {
            // Set default values for link budget calculator
            document.getElementById('systemNoiseTemp').value = '290';
            document.getElementById('bandwidth').value = '36';
            
            // Load any saved messages from localStorage
            const savedMessages = localStorage.getItem('newsBarMessages');
            if (savedMessages) {
                messageHistory = JSON.parse(savedMessages);
                renderMessageHistory();
            }
            
            const savedScheduled = localStorage.getItem('scheduledMessages');
            if (savedScheduled) {
                scheduledMessages = JSON.parse(savedScheduled);
                renderScheduledMessages();
                
                // Set up scheduled messages
                const now = new Date();
                scheduledMessages.forEach(msg => {
                    const scheduledDate = new Date(msg.time);
                    const delay = scheduledDate.getTime() - now.getTime();
                    
                    if (delay > 0) {
                        setTimeout(() => {
                            applyScheduledMessage(msg);
                        }, delay);
                    }
                });
            }
        });

        // Save messages to localStorage when leaving the page
        window.addEventListener('beforeunload', function() {
            localStorage.setItem('newsBarMessages', JSON.stringify(messageHistory));
            localStorage.setItem('scheduledMessages', JSON.stringify(scheduledMessages));
        });
    // Tab 3: Satellite Tubes
    let sheetData = [];
let workbook;
let allWords = new Set(); // To store all words for dropdown suggestions

// Load data from a publicly shared Google Sheet
async function loadGoogleSheet() {
    const spreadsheetUrl = document.getElementById("spreadsheetUrl").value.trim();
    
    if (!spreadsheetUrl) {
        alert("Please enter the Google Sheet link.");
        return;
    }

    try {
        // Extract spreadsheet ID from URL
        let spreadsheetId;
        if (spreadsheetUrl.includes('/d/')) {
            const match = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
                spreadsheetId = match[1];
            }
        } else {
            spreadsheetId = spreadsheetUrl;
        }

        if (!spreadsheetId) {
            throw new Error("Could not extract spreadsheet ID from URL");
        }

        const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv`;
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvData = await response.text();
        sheetData = parseCSV(csvData);
        
        // Extract all words for search suggestions
        extractAllWords();
        
        alert(`The Google Sheet loaded successfully with ${sheetData.length - 1} rows of data.`);
    } catch (error) {
        console.error('Error loading Google Sheet:', error);
        alert(`An error occurred while loading Google Sheet: ${error.message}`);
    }
}

// Parse CSV Data
function parseCSV(csv) {
    const lines = csv.split(/\r?\n/);
    return lines.map(line => {
        // Handle quoted fields with commas
        const result = [];
        let inQuotes = false;
        let currentField = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        result.push(currentField);
        return result;
    });
}

// Extract all words for search suggestions
function extractAllWords() {
    allWords = new Set();
    if (sheetData.length === 0) return;

    // Skip header row and process all other rows
    for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        for (let j = 0; j < row.length; j++) {
            const cellValue = String(row[j]);
            // Split into words and add to set
            cellValue.split(/\s+/).forEach(word => {
                if (word.length > 2) { // Only consider words longer than 2 characters
                    allWords.add(word.toLowerCase());
                }
            });
        }
    }
}

// Show search suggestions

// Search data with enhanced functionality
// Enhanced searchData function for acronyms
function searchData() {
    if (!sheetData || sheetData.length === 0) {
        alert("Please load Google Sheet or Excel first.");
        return;
    }

    const searchTerm = document.getElementById("searchTerm").value.trim();
    if (searchTerm === "") {
        alert("Please enter a search term.");
        return;
    }

    const sheetType = document.getElementById("sheetType").value;
    const isAcronymsSearch = sheetType === 'acronyms';
    
    const resultsDiv = document.getElementById("satelliteTubesResults");
    resultsDiv.innerHTML = "";
    
    const headers = sheetData[0];
    const results = [];
    let totalMatches = 0;

    // Search through all rows (except header)
    for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        let matchFound = false;
        let matchingCells = [];
        
        // For acronyms, only search first column (column A)
        if (isAcronymsSearch) {
            const acronym = String(row[0]).toLowerCase();
            if (acronym.includes(searchTerm.toLowerCase())) {
                matchFound = true;
                matchingCells.push(0); // Only column A
                totalMatches++;
            }
        } 
        // For other sheets, search all columns
        else {
            for (let j = 0; j < row.length; j++) {
                const cellValue = String(row[j]).toLowerCase();
                if (cellValue.includes(searchTerm.toLowerCase())) {
                    matchFound = true;
                    matchingCells.push(j);
                    totalMatches++;
                }
            }
        }

        if (matchFound) {
            results.push({
                row: row,
                matchingColumns: matchingCells,
                rowIndex: i
            });
        }
    }

    if (results.length === 0) {
        resultsDiv.innerHTML = "<p>No results found.</p>";
        return;
    }

    // Create enhanced results table
    const table = document.createElement("table");
    table.className = "enhanced-results-table";

    // Create header row
    const headerRow = document.createElement("tr");
    headerRow.className = "table-header";
    
    // Add row number header
    const rowNumHeader = document.createElement("th");
    rowNumHeader.textContent = "#";
    headerRow.appendChild(rowNumHeader);
    
    // Add column headers - for acronyms we show both columns but only search first
    if (isAcronymsSearch) {
        ['Acronym', 'Description'].forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
    } else {
        headers.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
    }
    table.appendChild(headerRow);

    // Create result rows with highlighting
    results.forEach((result, resultIndex) => {
        const tr = document.createElement("tr");
        
        // Add row number
        const rowNumCell = document.createElement("td");
        rowNumCell.textContent = resultIndex + 1;
        tr.appendChild(rowNumCell);
        
        if (isAcronymsSearch) {
            // For acronyms, always show both columns but only highlight matches in first column
            const acronymCell = document.createElement("td");
            const descriptionCell = document.createElement("td");
            
            // Highlight matching acronym
            const acronymText = String(result.row[0]);
            if (result.matchingColumns.includes(0)) {
                const regex = new RegExp(searchTerm, 'gi');
                acronymCell.innerHTML = acronymText.replace(regex, match => 
                    `<span class="highlight-match">${match}</span>`
                );
                acronymCell.classList.add("has-match");
            } else {
                acronymCell.textContent = acronymText;
            }
            
            // Add description (no highlighting)
            descriptionCell.textContent = result.row[1] || '';
            
            tr.appendChild(acronymCell);
            tr.appendChild(descriptionCell);
        } else {
            // For other sheets, process all columns normally
            result.row.forEach((cell, colIndex) => {
                const td = document.createElement("td");
                
                if (result.matchingColumns.includes(colIndex)) {
                    // Highlight matching text within cell
                    const cellText = String(cell);
                    const regex = new RegExp(searchTerm, 'gi');
                    const highlightedText = cellText.replace(regex, match => 
                        `<span class="highlight-match">${match}</span>`
                    );
                    td.innerHTML = highlightedText;
                    td.classList.add("has-match");
                } else {
                    td.textContent = cell;
                }
                
                tr.appendChild(td);
            });
        }
        
        table.appendChild(tr);
    });

    // Add result count information
    const resultInfo = document.createElement("div");
    resultInfo.className = "result-info";
    resultInfo.innerHTML = `
        Found ${results.length} matching ${isAcronymsSearch ? 'acronyms' : 'rows'} with ${totalMatches} total matches.
        ${isAcronymsSearch ? '<br><small>Only searching acronym column</small>' : ''}
    `;
    
    resultsDiv.appendChild(resultInfo);
    resultsDiv.appendChild(table);
}
// Clear results
function clearResults() {
    document.getElementById("satelliteTubesResults").innerHTML = "";
    document.getElementById("searchTerm").value = "";
    document.getElementById("searchSuggestions").style.display = "none";
}

    // Contacts functionality
    const contacts = [
      { name: "Dr. Amr Emam", phone: "201009992362" },
      { name: "Emad Elbana", phone: "201006366832" },
      { name: "Dr. M. Ghany", phone: "201009992672" },
      { name: "Abd Aleem", phone: "201009992699" },
      { name: "M. Elbadry", phone: "201117687864" }
    ];

    // Populate the dropdown with contacts
    document.addEventListener("DOMContentLoaded", function() {
      const phoneSelect = document.getElementById("phoneSelect");
      
      // Clear existing options
      phoneSelect.innerHTML = '<option value="">Select a contact</option>';
      
      // Add contacts to the dropdown
      contacts.forEach(contact => {
        const option = document.createElement("option");
        option.value = contact.phone;
        option.textContent = `${contact.name} (${contact.phone})`;
        phoneSelect.appendChild(option);
      });
    });

    // Handle the "Send via WhatsApp" button click
    document.getElementById("sendButton").addEventListener("click", function() {
      const phoneSelect = document.getElementById("phoneSelect");
      const phoneInput = document.getElementById("phoneInput").value.trim();
      const selectedPhoneNumber = phoneSelect.value.trim();
      const messageInput = document.getElementById("messageInput").value.trim();
      
      // Use the selected phone number or the manually entered phone number
      const phone = phoneInput || selectedPhoneNumber;
      
      if (!phone) {
        alert("Please select a phone number or enter one manually.");
        return;
      }
      
      if (!messageInput) {
        alert("Please enter a message.");
        return;
      }
      
      // Format phone number for WhatsApp
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      const whatsappLink = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(messageInput)}`;
      
      // Open WhatsApp link
      window.open(whatsappLink, "_blank");
    });

    // Handle the "Import Contacts" button click
    document.getElementById("importButton").addEventListener("click", function() {
      alert("This feature would import contacts from your device or Google Contacts when implemented.");
    });

    // Tab 6: Satellite Parameter Calculator
    const results = []; // Array to store all computed results

    document.getElementById('parameter').addEventListener('change', function() {
      const parameter = this.value;
      const inputFields = document.getElementById('inputFields');
      inputFields.innerHTML = ''; // Clear previous inputs
      
      // Hide visualization containers by default
      document.getElementById('calculationChartContainer').style.display = 'none';
      document.getElementById('orbitContainer').style.display = 'none';

      switch (parameter) {
        case 'antennaGain':
          inputFields.innerHTML = `
            <div>
              <label for="frequencysat">Frequency (GHz):</label>
              <input type="number" id="frequencysat" step="0.01" value="12" required>
            </div>
            
            <div>
              <label for="diameter">Antenna Diameter (m):</label>
              <input type="number" id="diameter" step="0.01" value="1.8" required>
            </div>
            
            <div>
              <label for="antennaEfficiency">Antenna Efficiency (η):</label>
              <input type="number" id="antennaEfficiency" step="0.01" min="0" max="1" value="0.6" required>
            </div>
          `;
          break;
          
        case 'freeSpaceLoss':
          inputFields.innerHTML = `
            <div>
              <label for="frequencysat">Frequency (GHz):</label>
              <input type="number" id="frequencysat" step="0.01" value="12" required>
            </div>
            
            <div>
              <label for="distance">Distance to Satellite (km):</label>
              <input type="number" id="distance" value="36000" required>
            </div>
          `;
          break;
          
        case 'eirp':
          inputFields.innerHTML = `
            <div>
              <label for="transmitterPower">Transmitter Power (P_t) (dBW):</label>
              <input type="number" id="transmitterPower" step="0.01" value="10" required>
            </div>
            
            <div>
              <label for="antennaGain">Antenna Gain (G_t) (dBi):</label>
              <input type="number" id="antennaGain" step="0.01" value="45" required>
            </div>
            
            <div>
              <label for="transmitterLosses">Transmitter Losses (L_t) (dB):</label>
              <input type="number" id="transmitterLosses" step="0.01" value="2" required>
            </div>
          `;
          break;
          
        case 'GT':
          inputFields.innerHTML = `
            <div>
              <label for="antennaGain">Antenna Gain (G_r) (dBi):</label>
              <input type="number" id="antennaGain" step="0.01" value="40" required>
            </div>
            
            <div>
              <label for="systemNoiseTemperature">System Noise Temperature (T_sys) (K):</label>
              <input type="number" id="systemNoiseTemperature" step="1" value="300" required>
            </div>
          `;
          break;
          
        case 'thermalNoise':
          inputFields.innerHTML = `
            <div>
              <label for="boltzmannConstant">Boltzmann Constant (k) (J/K):</label>
              <input type="number" id="boltzmannConstant" step="1e-25" value="1.38e-23" required>
            </div>
            
            <div>
              <label for="systemNoiseTemperature">System Noise Temperature (T_sys) (K):</label>
              <input type="number" id="systemNoiseTemperature" step="1" value="300" required>
            </div>
            
            <div>
              <label for="bandwidth">Bandwidth (B) (Hz):</label>
              <input type="number" id="bandwidth" step="1e6" value="36e6" required>
            </div>
          `;
          break;
          
        case 'CI':
          inputFields.innerHTML = `
            <div>
              <label for="carrierPower">Carrier Power (C) (dBW):</label>
              <input type="number" id="carrierPower" step="0.01" value="-90" required>
            </div>
            
            <div>
              <label for="interferingPower">Interfering Signal Power (I) (dBW):</label>
              <input type="number" id="interferingPower" step="0.01" value="-100" required>
            </div>
            
            <div>
              <label for="antennaDiscrimination">Antenna Discrimination (D) (dB):</label>
              <input type="number" id="antennaDiscrimination" step="0.01" value="30" required>
            </div>
            
            <div>
              <label for="polarizationIsolation">Polarization Isolation (Xpol) (dB):</label>
              <input type="number" id="polarizationIsolation" step="0.01" value="25" required>
            </div>
            
            <div>
              <label for="bandwidthOverlap">Bandwidth Overlap Factor (B) (dB):</label>
              <input type="number" id="bandwidthOverlap" step="0.01" value="3" required>
            </div>
          `;
          break;
          
        case 'overlapBandwidth':
          inputFields.innerHTML = `
            <div>
              <label for="f1">Frequency 1 (f1) (GHz):</label>
              <input type="number" id="f1" step="0.01" value="12.5" required>
            </div>
            
            <div>
              <label for="f2">Frequency 2 (f2) (GHz):</label>
              <input type="number" id="f2" step="0.01" value="12.6" required>
            </div>
          `;
          break;
          
        case 'bandwidthOverlapFactor':
          inputFields.innerHTML = `
            <div>
              <label for="overlapBandwidth">Overlap Bandwidth (Hz):</label>
              <input type="number" id="overlapBandwidth" step="1e6" value="10e6" required>
            </div>
            
            <div>
              <label for="totalBandwidth">Total Bandwidth (Hz):</label>
              <input type="number" id="totalBandwidth" step="1e6" value="36e6" required>
            </div>
          `;
          break;
          
        case 'earthStationAntennaDiameter':
          inputFields.innerHTML = `
            <div>
              <label for="frequencysat">Frequency (GHz):</label>
              <input type="number" id="frequencysat" step="0.01" value="12" required>
            </div>
            
            <div>
              <label for="antennaGain">Antenna Gain (G) (dBi):</label>
              <input type="number" id="antennaGain" step="0.01" value="45" required>
            </div>
            
            <div>
              <label for="antennaEfficiency">Antenna Efficiency (η):</label>
              <input type="number" id="antennaEfficiency" step="0.01" value="0.6" required>
            </div>
          `;
          break;
          
        case 'satelliteAntennaDiameter':
          inputFields.innerHTML = `
            <div>
              <label for="frequencysat">Frequency (GHz):</label>
              <input type="number" id="frequencysat" step="0.01" value="12" required>
            </div>
            
            <div>
              <label for="antennaGain">Antenna Gain (G) (dBi):</label>
              <input type="number" id="antennaGain" step="0.01" value="30" required>
            </div>
            
            <div>
              <label for="antennaEfficiency">Antenna Efficiency (η):</label>
              <input type="number" id="antennaEfficiency" step="0.01" value="0.6" required>
            </div>
          `;
          break;
          
        case 'timeConversion':
          inputFields.innerHTML = `
            <div>
              <label for="localEpoch">Egypt Local Epoch (YYYY-MM-DDTHH:MM:SS):</label>
              <input type="datetime-local" id="localEpoch" required>
            </div>
            
            <div>
              <label for="longitude">Longitude (degrees):</label>
              <input type="number" id="longitude" step="0.01" value="31.2357" required>
            </div>
          `;
          break;
          
        case 'orbitalParameters':
          inputFields.innerHTML = `
            <div>
              <label for="semiMajorAxis">Semi-major Axis (km):</label>
              <input type="number" id="semiMajorAxis" step="100" value="42164" required>
            </div>
            
            <div>
              <label for="eccentricity">Eccentricity:</label>
              <input type="number" id="eccentricity" step="0.0001" value="0.0001" required>
            </div>
            
            <div>
              <label for="inclination">Inclination (degrees):</label>
              <input type="number" id="inclination" step="0.1" value="0.1" required>
            </div>
          `;
          // Show orbit visualization
          document.getElementById('orbitContainer').style.display = 'block';
          break;
          
        case 'lookAngles':
          inputFields.innerHTML = `
            <div>
              <label for="satLon">Satellite Longitude (deg.):</label>
              <input type="number" id="satLon" step="0.1" value="7.0" required>
            </div>
            
            <div>
              <label for="gsLat">Ground Station Latitude (deg.):</label>
              <input type="number" id="gsLat" step="0.1" value="30.0" required>
            </div>
            
            <div>
              <label for="gsLon">Ground Station Longitude (deg.):</label>
              <input type="number" id="gsLon" step="0.1" value="31.2" required>
            </div>
          `;
          break;
          
        case 'coverageArea':
          inputFields.innerHTML = `
            <div>
              <label for="satAltitude">Satellite Altitude (km):</label>
              <input type="number" id="satAltitude" step="100" value="35786" required>
            </div>
            
            <div>
              <label for="beamwidth">Antenna Beamwidth (degrees):</label>
              <input type="number" id="beamwidth" step="0.1" value="2.0" required>
            </div>
          `;
          break;
          
        case 'linkMargin':
          inputFields.innerHTML = `
            <div>
              <label for="receivedPower">Received Power (dBW):</label>
              <input type="number" id="receivedPower" step="0.1" value="-90" required>
            </div>
            
            <div>
              <label for="requiredPower">Required Power (dBW):</label>
              <input type="number" id="requiredPower" step="0.1" value="-95" required>
            </div>
          `;
          break;
           /* New Parameters */
                case 'beamwidth':
                    inputFields.innerHTML = `
                        <div>
                            <label for="frequencysat">Frequency (GHz):</label>
                            <input type="number" id="frequencysat" step="0.01" value="12" required>
                        </div>
                        <div>
                            <label for="diameter">Antenna Diameter (m):</label>
                            <input type="number" id="diameter" step="0.01" value="1.8" required>
                        </div>
                        <div class="advanced-param">
                            <h4>Advanced Parameters</h4>
                            <label for="beamwidthFactor">Beamwidth Factor (k):</label>
                            <input type="number" id="beamwidthFactor" step="0.1" value="70" required>
                            <small>Typical values: 58-70 (depends on antenna type)</small>
                        </div>
                    `;
                    break;
                    
                case 'pathLoss':
                    inputFields.innerHTML = `
                        <div>
                            <label for="frequencysat">Frequency (GHz):</label>
                            <input type="number" id="frequencysat" step="0.01" value="12" required>
                        </div>
                        <div>
                            <label for="distance">Distance (km):</label>
                            <input type="number" id="distance" value="36000" required>
                        </div>
                        <div class="advanced-param">
                            <h4>Atmospheric Losses</h4>
                            <label for="rainRate">Rain Rate (mm/hr):</label>
                            <input type="number" id="rainRate" step="0.1" value="10">
                            <label for="gaseousAttenuation">Gaseous Attenuation (dB):</label>
                            <input type="number" id="gaseousAttenuation" step="0.1" value="0.5">
                            <label for="cloudAttenuation">Cloud Attenuation (dB):</label>
                            <input type="number" id="cloudAttenuation" step="0.1" value="0.2">
                        </div>
                    `;
                    break;
                    
                case 'dopplerShift':
                    inputFields.innerHTML = `
                        <div>
                            <label for="frequency">Frequency (GHz):</label>
                            <input type="number" id="frequency" step="0.01" value="12" required>
                        </div>
                        <div>
                            <label for="relativeVelocity">Relative Velocity (km/s):</label>
                            <input type="number" id="relativeVelocity" step="0.01" value="3.07" required>
                        </div>
                        <div>
                            <label for="angle">Angle (degrees):</label>
                            <input type="number" id="angle" step="1" value="0" required>
                        </div>
                    `;
                    break;
                    
                case 'satelliteVelocity':
                    inputFields.innerHTML = `
                        <div>
                            <label for="altitude">Altitude (km):</label>
                            <input type="number" id="altitude" step="100" value="35786" required>
                        </div>
                        <div class="advanced-param">
                            <h4>Advanced Parameters</h4>
                            <label for="eccentricity">Eccentricity:</label>
                            <input type="number" id="eccentricity" step="0.0001" value="0.0001">
                            <label for="trueAnomaly">True Anomaly (degrees):</label>
                            <input type="number" id="trueAnomaly" step="1" value="0">
                        </div>
                    `;
                    break;
                    
                case 'orbitalPeriod':
                    inputFields.innerHTML = `
                        <div>
                            <label for="semiMajorAxis">Semi-major Axis (km):</label>
                            <input type="number" id="semiMajorAxis" step="100" value="42164" required>
                        </div>
                    `;
                    break;
                    
                case 'slantRange':
                    inputFields.innerHTML = `
                        <div>
                            <label for="satAltitude">Satellite Altitude (km):</label>
                            <input type="number" id="satAltitude" step="100" value="35786" required>
                        </div>
                        <div>
                            <label for="elevationAngle">Elevation Angle (degrees):</label>
                            <input type="number" id="elevationAngle" step="0.1" value="45" required>
                        </div>
                    `;
                    break;
                    
                case 'rainAttenuation':
                    inputFields.innerHTML = `
                        <div>
                            <label for="frequency">Frequency (GHz):</label>
                            <input type="number" id="frequency" step="0.01" value="12" required>
                        </div>
                        <div>
                            <label for="rainRate">Rain Rate (mm/hr):</label>
                            <input type="number" id="rainRate" step="0.1" value="10" required>
                        </div>
                        <div>
                            <label for="pathLength">Path Length (km):</label>
                            <input type="number" id="pathLength" step="0.1" value="5" required>
                        </div>
                        <div class="advanced-param">
                            <h4>Advanced Parameters</h4>
                            <label for="polarization">Polarization:</label>
                            <select id="polarization">
                                <option value="horizontal">Horizontal</option>
                                <option value="vertical">Vertical</option>
                            </select>
                            <label for="temperature">Temperature (°C):</label>
                            <input type="number" id="temperature" step="1" value="20">
                        </div>
                    `;
                    break;
      }
    });

    document.getElementById('parameterForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const parameter = document.getElementById('parameter').value;
      let result;
      
      // Clear previous results if not time conversion (which adds multiple results)
      if (parameter !== 'timeConversion') {
        results.length = 0;
      }
      
      switch (parameter) {
        case 'antennaGain':
          const frequency = parseFloat(document.getElementById('frequencysat').value) * 1e9; // GHz to Hz
          const diameter = parseFloat(document.getElementById('diameter').value);
          const eta = parseFloat(document.getElementById('antennaEfficiency').value);
          const wavelength = 3e8 / frequency; // Speed of light = 3e8 m/s
          result = 10 * Math.log10(eta * Math.pow((Math.PI * diameter) / wavelength, 2));
          results.push({ parameter: 'Antenna Gain (G)', value: result.toFixed(2) + ' dBi' });
          break;
          
        case 'freeSpaceLoss':
          const freq = parseFloat(document.getElementById('frequencysat').value) * 1e9; // GHz to Hz
          const dist = parseFloat(document.getElementById('distance').value) * 1e3; // km to m
          const lambda = 3e8 / freq; // Speed of light = 3e8 m/s
          result = 20 * Math.log10((4 * Math.PI * dist) / lambda);
          results.push({ parameter: 'Free Space Loss (FSL)', value: result.toFixed(2) + ' dB' });
          break;
          
        case 'eirp':
          const Pt = parseFloat(document.getElementById('transmitterPower').value);
          const Gt = parseFloat(document.getElementById('antennaGain').value);
          const Lt = parseFloat(document.getElementById('transmitterLosses').value);
          result = Pt + Gt - Lt;
          results.push({ parameter: 'EIRP', value: result.toFixed(2) + ' dBW' });
          break;
          
        case 'GT':
          const Gr = parseFloat(document.getElementById('antennaGain').value);
          const Tsys = parseFloat(document.getElementById('systemNoiseTemperature').value);
          result = Gr - 10 * Math.log10(Tsys);
          results.push({ parameter: 'G/T', value: result.toFixed(2) + ' dB/K' });
          break;
          
        case 'thermalNoise':
          const k = parseFloat(document.getElementById('boltzmannConstant').value);
          const TsysN = parseFloat(document.getElementById('systemNoiseTemperature').value);
          const B = parseFloat(document.getElementById('bandwidth').value);
          result = 10 * Math.log10(k * TsysN * B);
          results.push({ parameter: 'Thermal Noise (N)', value: result.toFixed(2) + ' dBW' });
          break;
          
        case 'CI':
          const C = parseFloat(document.getElementById('carrierPower').value);
          const I = parseFloat(document.getElementById('interferingPower').value);
          const D = parseFloat(document.getElementById('antennaDiscrimination').value);
          const Xpol = parseFloat(document.getElementById('polarizationIsolation').value);
          const Boverlap = parseFloat(document.getElementById('bandwidthOverlap').value);
          result = C - I + D + Xpol - Boverlap;
          results.push({ parameter: 'C/I', value: result.toFixed(2) + ' dB' });
          break;
          
        case 'overlapBandwidth':
          const f1 = parseFloat(document.getElementById('f1').value) * 1e9; // GHz to Hz
          const f2 = parseFloat(document.getElementById('f2').value) * 1e9; // GHz to Hz
          result = Math.abs(f1 - f2);
          results.push({ parameter: 'Overlap Bandwidth', value: result.toFixed(2) + ' Hz' });
          break;
          
        case 'bandwidthOverlapFactor':
          const overlapBW = parseFloat(document.getElementById('overlapBandwidth').value);
          const totalBW = parseFloat(document.getElementById('totalBandwidth').value);
          result = overlapBW / totalBW;
          results.push({ parameter: 'Bandwidth Overlap Factor (B)', value: result.toFixed(4) });
          break;
          
        case 'earthStationAntennaDiameter':
          const freqES = parseFloat(document.getElementById('frequencysat').value) * 1e9; // GHz to Hz
          const GainES = parseFloat(document.getElementById('antennaGain').value);
          const etaES = parseFloat(document.getElementById('antennaEfficiency').value);
          const wavelengthES = 3e8 / freqES; // Speed of light = 3e8 m/s
          result = (wavelengthES / Math.PI) * Math.sqrt(Math.pow(10, GainES / 10) / etaES);
          results.push({ parameter: 'Earth Station Antenna Diameter', value: result.toFixed(2) + ' meters' });
          break;
          
        case 'satelliteAntennaDiameter':
          const freqSat = parseFloat(document.getElementById('frequencysat').value) * 1e9; // GHz to Hz
          const GainSat = parseFloat(document.getElementById('antennaGain').value);
          const etaSat = parseFloat(document.getElementById('antennaEfficiency').value);
          const wavelengthSat = 3e8 / freqSat; // Speed of light = 3e8 m/s
          result = (wavelengthSat / Math.PI) * Math.sqrt(Math.pow(10, GainSat / 10) / etaSat);
          results.push({ parameter: 'Satellite Antenna Diameter', value: result.toFixed(2) + ' meters' });
          break;
          
        case 'timeConversion':
          const localEpoch = document.getElementById('localEpoch').value;
          const longitude = parseFloat(document.getElementById('longitude').value);
          
          if (!localEpoch) {
            alert('Please enter a valid date and time.');
            return;
          }
          
          // Convert local epoch to Date object
          const localDate = new Date(localEpoch);
          
          // Compute Sidereal Time
          const siderealTime = computeSiderealTime(localDate, longitude);
          results.push({ parameter: 'Sidereal Time', value: siderealTime.toFixed(4) + ' hours' });
          
          // Compute UTC Time
          const utcTime = localDate.toUTCString();
          results.push({ parameter: 'UTC Time', value: utcTime });
          
          // Compute UT Time (same as UTC for most purposes)
          results.push({ parameter: 'UT Time', value: utcTime });
          
          // Compute Atomic Time (TAI)
          const taiTime = computeTAITime(localDate);
          results.push({ parameter: 'Atomic Time (TAI)', value: taiTime.toISOString() });
          
          // Compute Julian Time
          const julianTime = computeJulianTime(localDate);
          results.push({ parameter: 'Julian Time', value: julianTime.toFixed(6) });
          
          // Compute Terrestrial Time (TT)
          const ttTime = computeTTTime(localDate);
          results.push({ parameter: 'Terrestrial Time (TT)', value: ttTime.toISOString() });
          break;
          
        case 'orbitalParameters':
          const semiMajorAxis = parseFloat(document.getElementById('semiMajorAxis').value) * 1000; // km to m
          const eccentricity = parseFloat(document.getElementById('eccentricity').value);
          const inclination = parseFloat(document.getElementById('inclination').value) * Math.PI / 180; // deg to rad
          
          // Earth's gravitational parameter (m^3/s^2)
          const mu = 3.986004418e14;
          
          // Calculate orbital period in seconds
          const period = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
          results.push({ parameter: 'Orbital Period', value: (period / 3600).toFixed(2) + ' hours' });
          
          // Calculate orbital velocity (circular orbit approximation)
          const velocity = Math.sqrt(mu / semiMajorAxis);
          results.push({ parameter: 'Orbital Velocity', value: (velocity / 1000).toFixed(2) + ' km/s' });
          
          // Calculate angular velocity (rad/s)
          const angularVelocity = 2 * Math.PI / period;
          results.push({ parameter: 'Angular Velocity', value: angularVelocity.toFixed(8) + ' rad/s' });
          
          // Update orbit visualization
          updateOrbitVisualization(semiMajorAxis, eccentricity, inclination);
          break;
          
        case 'lookAngles':
          const satLon = parseFloat(document.getElementById('satLon').value);
          const gsLat = parseFloat(document.getElementById('gsLat').value) * Math.PI / 180; // deg to rad
          const gsLon = parseFloat(document.getElementById('gsLon').value);
          
          // Calculate geostationary look angles
          const dLon = (satLon - gsLon) * Math.PI / 180;
          
          // Earth radius and geostationary altitude
          const earthRadius = 6371e3; // meters
          const geoAltitude = 35786e3; // meters
          const geoRadius = earthRadius + geoAltitude;
          
          // Calculate elevation angle
          const cosElev = Math.sqrt(1 - Math.pow(earthRadius / geoRadius * Math.cos(gsLat), 2));
          const elevation = Math.atan(
            (Math.cos(dLon) * Math.cos(gsLat) - earthRadius / geoRadius) / 
            Math.sqrt(1 - Math.pow(Math.cos(dLon) * Math.cos(gsLat), 2))
          ) * 180 / Math.PI;
          
          // Calculate azimuth angle
          const azimuth = Math.atan(Math.tan(dLon) / Math.sin(gsLat)) * 180 / Math.PI;
          let correctedAzimuth = azimuth;
          
          if (Math.sin(dLon) < 0) {
            correctedAzimuth += 180;
          } else if (Math.cos(dLon) < 0) {
            correctedAzimuth += 360;
          }
          
          results.push({ parameter: 'Elevation Angle', value: elevation.toFixed(2) + '°' });
          results.push({ parameter: 'Azimuth Angle', value: correctedAzimuth.toFixed(2) + '°' });
          break;
          
        case 'coverageArea':
          const satAltitude = parseFloat(document.getElementById('satAltitude').value) * 1000; // km to m
          const beamwidth = parseFloat(document.getElementById('beamwidth').value) * Math.PI / 180; // deg to rad
          
          // Earth radius
          const earthR = 6371e3; // meters
          
          // Calculate coverage angle
          const coverageAngle = Math.acos(earthR / (earthR + satAltitude));
          
          // Calculate footprint diameter
          const footprintDiameter = 2 * satAltitude * Math.tan(beamwidth / 2);
          
          results.push({ parameter: 'Coverage Angle', value: (coverageAngle * 180 / Math.PI).toFixed(2) + '°' });
          results.push({ parameter: 'Footprint Diameter', value: (footprintDiameter / 1000).toFixed(2) + ' km' });
          break;
          
        case 'linkMargin':
          const receivedPower = parseFloat(document.getElementById('receivedPower').value);
          const requiredPower = parseFloat(document.getElementById('requiredPower').value);
          const margin = receivedPower - requiredPower;
          
          results.push({ parameter: 'Link Margin', value: margin.toFixed(2) + ' dB' });
          
          // Create a simple chart showing the margin
          createCalculationChart([
            { label: 'Received Power', value: receivedPower },
            { label: 'Required Power', value: requiredPower },
            { label: 'Link Margin', value: margin }
          ]);
          break;
           /* New Parameter Calculations */
                case 'beamwidth':
                    const beamFreq = parseFloat(document.getElementById('frequencysat').value) * 1e9; // GHz to Hz
                    const beamDiam = parseFloat(document.getElementById('diameter').value);
                    const kFactor = parseFloat(document.getElementById('beamwidthFactor').value);
                    const beamWavelength = 3e8 / beamFreq;
                    const beamwidthDeg = kFactor * (beamWavelength / beamDiam);
                    results.push({ parameter: 'Antenna Beamwidth', value: beamwidthDeg.toFixed(2) + '°' });
                    break;
           case 'pathLoss':
                    const pathFreq = parseFloat(document.getElementById('frequencysat').value) * 1e9; // GHz to Hz
                    const pathDist = parseFloat(document.getElementById('distance').value) * 1e3; // km to m
                    const pathLambda = 3e8 / pathFreq;
                    const fspl = 20 * Math.log10((4 * Math.PI * pathDist) / pathLambda);
                    
                    // Additional losses
                    const rainRate = parseFloat(document.getElementById('rainRate').value) || 0;
                    const gaseousAttn = parseFloat(document.getElementById('gaseousAttenuation').value) || 0;
                    const cloudAttn = parseFloat(document.getElementById('cloudAttenuation').value) || 0;
                    
                    const totalLoss = fspl + gaseousAttn + cloudAttn + (rainRate > 0 ? calculateRainAttenuation(pathFreq, rainRate, pathDist/1000) : 0);
                    
                    results.push({ parameter: 'Free Space Path Loss', value: fspl.toFixed(2) + ' dB' });
                    if (gaseousAttn > 0) results.push({ parameter: 'Gaseous Attenuation', value: gaseousAttn.toFixed(2) + ' dB' });
                    if (cloudAttn > 0) results.push({ parameter: 'Cloud Attenuation', value: cloudAttn.toFixed(2) + ' dB' });
                    if (rainRate > 0) results.push({ parameter: 'Rain Attenuation', value: calculateRainAttenuation(pathFreq, rainRate, pathDist/1000).toFixed(2) + ' dB' });
                    results.push({ parameter: 'Total Path Loss', value: totalLoss.toFixed(2) + ' dB' });
                    break;
                    
                case 'dopplerShift':
                    const dopplerFreq = parseFloat(document.getElementById('frequency').value) * 1e9; // GHz to Hz
                    const relVelocity = parseFloat(document.getElementById('relativeVelocity').value) * 1000; // km/s to m/s
                    const angle = parseFloat(document.getElementById('angle').value) * Math.PI / 180; // deg to rad
                    const shift = (relVelocity * dopplerFreq * Math.cos(angle)) / 3e8;
                    results.push({ parameter: 'Doppler Shift', value: (shift/1e3).toFixed(2) + ' kHz' });
                    break;
           case 'satelliteVelocity':
                    const alt = parseFloat(document.getElementById('altitude').value) * 1000; // km to m
                    const ecc = parseFloat(document.getElementById('eccentricity').value) || 0;
                    const trueAnomaly = parseFloat(document.getElementById('trueAnomaly').value) * Math.PI / 180 || 0; // deg to rad
                    
                    // Earth's gravitational parameter (m^3/s^2)
                    const muEarth = 3.986004418e14;
                    const semiMajor = alt / (1 - ecc);
                    const r = semiMajor * (1 - ecc*ecc) / (1 + ecc * Math.cos(trueAnomaly));
                    const vel = Math.sqrt(muEarth * (2/r - 1/semiMajor));
                    
                    results.push({ parameter: 'Satellite Velocity', value: (vel/1000).toFixed(2) + ' km/s' });
                    break;
                           case 'orbitalPeriod':
    try {
        const semiMajorAxis = parseFloat(document.getElementById('semiMajorAxis').value);
        
        // Validate input
        if (isNaN(semiMajorAxis) || semiMajorAxis <= 0) {
            throw new Error("Please enter a valid positive number for semi-major axis");
        }

        // Earth's gravitational parameter (m^3/s^2)
        const MU_EARTH = 3.986004418e14;
        
        // Convert km to meters
        const semiMajorAxisMeters = semiMajorAxis * 1000;
        
        // Calculate orbital period in seconds
        const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisMeters, 3) / MU_EARTH);
        
        // Convert to hours
        const periodHours = periodSeconds / 3600;

        results.push({ parameter: 'Orbital Period', value: periodHours.toFixed(2) + ' hours' });
    } catch (error) {
        alert(error.message);
        return;
    }
    break;
                case 'slantRange':
                    const satAlt = parseFloat(document.getElementById('satAltitude').value) * 1000; // km to m
                    const elevAngle = parseFloat(document.getElementById('elevationAngle').value) * Math.PI / 180; // deg to rad
                    const earthRad = 6371e3; // meters
                    
                    // Calculate slant range
                    const term = (earthRad + satAlt) / earthRad;
                    const slantRange = earthRad * Math.sqrt(term*term - 2*term*Math.cos(elevAngle) + 1);
                    
                    results.push({ parameter: 'Slant Range', value: (slantRange/1000).toFixed(2) + ' km' });
                    break;
   case 'rainAttenuation':
    try {
        const frequency = parseFloat(document.getElementById('frequency').value);
        const rainRate = parseFloat(document.getElementById('rainRate').value);
        const pathLength = parseFloat(document.getElementById('pathLength').value);
        const polarization = document.getElementById('polarization').value;
        const temperature = parseFloat(document.getElementById('temperature').value) || 20;

        // Validate inputs
        if (isNaN(frequency) || isNaN(rainRate) || isNaN(pathLength)) {
            throw new Error("Please enter valid numbers for all fields");
        }
        if (frequency < 4 || frequency > 30) {
            throw new Error("Frequency must be between 4 and 30 GHz");
        }
        if (rainRate < 0) {
            throw new Error("Rain rate cannot be negative");
        }
        if (pathLength <= 0) {
            throw new Error("Path length must be positive");
        }

        // Coefficients for rain attenuation calculation
        const kH = 0.0000257; // Horizontal polarization coefficient
        const kV = 0.0000315; // Vertical polarization coefficient
        const alphaH = 1.154;  // Horizontal polarization exponent
        const alphaV = 1.128;  // Vertical polarization exponent

        // Calculate specific attenuation (gammaR)
        const k = polarization === 'horizontal' ? kH * Math.pow(frequency, alphaH) : kV * Math.pow(frequency, alphaV);
        const alpha = polarization === 'horizontal' ? alphaH : alphaV;
        const gammaR = k * Math.pow(rainRate, alpha);

        // Calculate effective path length (simplified)
        const r001 = 1 / (1 + pathLength / 35 * Math.exp(-0.015 * rainRate));
        const tempFactor = 1 + 0.02 * (temperature - 20);
        const effectivePathLength = pathLength * r001 * tempFactor;

        // Total rain attenuation
        const rainAttenuation = gammaR * effectivePathLength;

        results.push({ parameter: 'Rain Attenuation', value: rainAttenuation.toFixed(2) + ' dB' });
    } catch (error) {
        alert(error.message);
        return;
    }
    break;
              
      }
      
      // Display Results in Table
      const tableBody = document.querySelector('#resultsTable tbody');
      tableBody.innerHTML = results.map(row => `
        <tr>
          <td>${row.parameter}</td>
          <td>${row.value}</td>
        </tr>
      `).join('');
    });

    // Helper functions for time conversions
    function computeSiderealTime(date, longitude) {
      const JD = computeJulianTime(date);
      const T = (JD - 2451545.0) / 36525.0;
      const GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
      const LMST = (GMST + longitude) % 360;
      return LMST / 15; // Convert degrees to hours
    }

    function computeJulianTime(date) {
      const time = date.getTime();
      const tzOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
      const JD = (time - tzOffset) / 86400000 + 2440587.5;
      return JD;
    }

    function computeTAITime(date) {
      // TAI is approximately UTC + 37 seconds (as of 2023)
      const taiOffset = 37; // Seconds
      const taiDate = new Date(date.getTime() + taiOffset * 1000);
      return taiDate;
    }

    function computeTTTime(date) {
      // TT is approximately TAI + 32.184 seconds
      const ttOffset = 32.184; // Seconds
      const ttDate = new Date(date.getTime() + (37 + ttOffset) * 1000);
      return ttDate;
    }

    // Delete results
    document.getElementById('deleteResults').addEventListener('click', function() {
      results.length = 0;
      document.querySelector('#resultsTable tbody').innerHTML = '';
      document.getElementById('calculationChartContainer').style.display = 'none';
    });

    // Create chart for calculation results
    function createCalculationChart(data) {
      const ctx = document.getElementById('calculationChart').getContext('2d');
      
      // Destroy previous chart if it exists
      if (window.calculationChart) {
        window.calculationChart.destroy();
      }
      
      window.calculationChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.label),
          datasets: [{
            label: 'Power (dB)',
            data: data.map(item => item.value),
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(75, 192, 192, 0.7)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Power (dB)'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.raw.toFixed(2)} dB`;
                }
              }
            }
          }
        }
      });
      
      // Show the chart container
      document.getElementById('calculationChartContainer').style.display = 'block';
    }

    // Orbit visualization functions
    function updateOrbitVisualization(semiMajorAxis, eccentricity, inclination) {
      const orbitPath = document.getElementById('orbitPath');
      const satellite = document.getElementById('satellite');
      
      // Calculate orbit dimensions based on semi-major axis and eccentricity
      const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
      
      // Scale for visualization (convert meters to pixels)
      const scale = 200 / semiMajorAxis; // 200px for semi-major axis
      const width = semiMajorAxis * scale * 2;
      const height = semiMinorAxis * scale * 2;
      
      // Set orbit path dimensions
      orbitPath.style.width = `${width}px`;
      orbitPath.style.height = `${height}px`;
      
      // Rotate orbit based on inclination
      orbitPath.style.transform = `translate(-50%, -50%) rotate(${inclination}rad)`;
      
      // Position satellite (start at "right" side of ellipse)
      satellite.style.left = `calc(50% + ${width/2}px)`;
      satellite.style.top = '50%';
      
      // Animate satellite
      animateSatellite(satellite, width, height, inclination);
      
      // Show the orbit container
      document.getElementById('orbitContainer').style.display = 'block';
    }

    function animateSatellite(satellite, width, height, inclination) {
      let angle = 0;
      const centerX = width / 2;
      const centerY = height / 2;
      const a = width / 2; // semi-major axis
      const b = height / 2; // semi-minor axis
      
      // Stop any existing animation
      if (window.satelliteAnimation) {
        cancelAnimationFrame(window.satelliteAnimation);
      }
      
      function animate() {
        // Calculate position on ellipse
        const x = centerX + a * Math.cos(angle);
        const y = centerY + b * Math.sin(angle);
        
        // Update satellite position
        satellite.style.left = `calc(50% + ${x - centerX}px)`;
        satellite.style.top = `calc(50% + ${y - centerY}px)`;
        
        // Increment angle
        angle += 0.005;
        if (angle > 2 * Math.PI) {
          angle = 0;
        }
        
        window.satelliteAnimation = requestAnimationFrame(animate);
      }
      
      animate();
    }

    // Close Approach Calculator (Tab 7)
    function showCloseApproachCalculator() {
      document.getElementById('closeApproachCalculator').style.display = 'block';
      document.getElementById('caResults').style.display = 'none';
      
      // Set default dates (now and +7 days)
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 7);
      
      document.getElementById('caStartDate').value = now.toISOString().slice(0, 16);
      document.getElementById('caEndDate').value = future.toISOString().slice(0, 16);
    }

    function calculateCloseApproach() {
      const primarySatId = document.getElementById('primarySatId').value;
      const secondarySatId = document.getElementById('secondarySatId').value;
      const startDate = document.getElementById('caStartDate').value;
      const endDate = document.getElementById('caEndDate').value;
      
      if (!primarySatId || !secondarySatId || !startDate || !endDate) {
        alert('Please fill in all fields.');
        return;
      }
      
      // In a real implementation, this would call an API to get close approach data
      // For demo purposes, we'll simulate some results
      simulateCloseApproachResults(primarySatId, secondarySatId, startDate, endDate);
    }

    function simulateCloseApproachResults(primarySatId, secondarySatId, startDate, endDate) {
      const results = [
        {
          time: new Date(new Date(startDate).getTime() + 86400000 * 1).toISOString(),
          distance: (100 + Math.random() * 50).toFixed(2),
          velocity: (7 + Math.random() * 3).toFixed(2),
          probability: (Math.random() * 0.1).toFixed(6)
        },
        {
          time: new Date(new Date(startDate).getTime() + 86400000 * 2).toISOString(),
          distance: (50 + Math.random() * 30).toFixed(2),
          velocity: (5 + Math.random() * 2).toFixed(2),
          probability: (Math.random() * 0.05).toFixed(6)
        },
        {
          time: new Date(new Date(startDate).getTime() + 86400000 * 3).toISOString(),
          distance: (20 + Math.random() * 10).toFixed(2),
          velocity: (3 + Math.random() * 1).toFixed(2),
          probability: (Math.random() * 0.01).toFixed(6)
        }
      ];
      
      // Display results
      const resultsBody = document.getElementById('caResultsBody');
      resultsBody.innerHTML = results.map(r => `
        <tr>
          <td>${new Date(r.time).toLocaleString()}</td>
          <td>${r.distance} km</td>
          <td>${r.velocity} km/s</td>
          <td>${r.probability}</td>
        </tr>
      `).join('');
      
      // Create chart
      createCAChart(results);
      
      // Show results
      document.getElementById('caResults').style.display = 'block';
    }

    function createCAChart(data) {
      const ctx = document.getElementById('caChart').getContext('2d');
      
      // Destroy previous chart if it exists
      if (window.caChart) {
        window.caChart.destroy();
      }
      
      window.caChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => new Date(item.time).toLocaleTimeString()),
          datasets: [
            {
              label: 'Miss Distance (km)',
              data: data.map(item => item.distance),
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              yAxisID: 'y'
            },
            {
              label: 'Probability of Collision',
              data: data.map(item => item.probability * 1000), // Scale for visibility
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Miss Distance (km)'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Probability (x1000)'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      });
    }

    function showRiskAssessment() {
      alert('Risk assessment tool would be implemented here with actual data from close approach analysis.');
    }

    function showCollisionProbability() {
      alert('Collision probability calculator would be implemented here with actual orbital data.');
    }

    function showManeuverPlanning() {
      alert('Maneuver planning tool would be implemented here to calculate optimal avoidance maneuvers.');
    }

    function showHistoricalAnalysis() {
      alert('Historical analysis tool would show past close approaches and their outcomes.');
    }

    // Calendar functionality (Tab 11)
   // Calendar functionality
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let events = [];
let currentEventId = null;

// Load events from localStorage when the page loads
window.addEventListener('load', function() {
  const savedEvents = localStorage.getItem('calendarEvents');
  if (savedEvents) {
    events = JSON.parse(savedEvents, (key, value) => {
      if (key === 'date') return new Date(value); // Convert date strings back to Date objects
      return value;
    });
  }
  renderCalendar();
  renderEventList();
});

// Render the calendar
function renderCalendar() {
  const monthYear = document.getElementById('calendar-month-year');
  const daysContainer = document.getElementById('calendar-days');
  
  // Set month/year header
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  // Clear previous days
  daysContainer.innerHTML = '';
  
  // Get first day of month and total days in month
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get days from previous month
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  
  // Create day elements
  let dayCount = 1;
  let nextMonthDay = 1;
  
  // Create 6 rows (weeks) to ensure all dates are shown
  for (let i = 0; i < 42; i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (i < firstDay) {
      // Days from previous month
      const prevDay = prevMonthDays - firstDay + i + 1;
      dayElement.innerHTML = `<div class="calendar-day-number">${prevDay}</div>`;
      dayElement.classList.add('other-month');
    } else if (dayCount <= daysInMonth) {
      // Days in current month
      dayElement.innerHTML = `<div class="calendar-day-number">${dayCount}</div>`;
      
      // Check if today
      const today = new Date();
      if (dayCount === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
        dayElement.classList.add('today');
      }
      
      // Add events for this day
      const dayEvents = getEventsForDay(dayCount);
      if (dayEvents.length > 0) {
        const eventsHtml = dayEvents.map(event => 
          `<div class="calendar-event-dot" style="background-color: ${event.color}"></div>`
        ).join('');
        dayElement.innerHTML += `<div class="calendar-day-events">${eventsHtml}</div>`;
      }
      
      // Add click event
      dayElement.addEventListener('click', () => {
        openEventFormForDay(dayCount);
      });
      
      dayCount++;
    } else {
      // Days from next month
      dayElement.innerHTML = `<div class="calendar-day-number">${nextMonthDay}</div>`;
      dayElement.classList.add('other-month');
      nextMonthDay++;
    }
    
    daysContainer.appendChild(dayElement);
  }
}

// Get events for a specific day
function getEventsForDay(day) {
  const date = new Date(currentYear, currentMonth, day);
  return events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate.getDate() === date.getDate() && 
           eventDate.getMonth() === date.getMonth() && 
           eventDate.getFullYear() === date.getFullYear();
  });
}

// Navigation functions
function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function goToToday() {
  const today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  renderCalendar();
}

// Event form handling
function openEventFormForDay(day) {
  const date = new Date(currentYear, currentMonth, day);
  const startDate = date.toISOString().slice(0, 16);
  
  document.getElementById('eventStartDate').value = startDate;
  document.getElementById('eventEndDate').value = startDate;
  document.getElementById('eventTitle').focus();
  
  // Hide delete button for new events
  document.getElementById('deleteEventBtn').style.display = 'none';
  currentEventId = null;
}

function clearEventForm() {
  document.getElementById('calendarForm').reset();
  document.getElementById('deleteEventBtn').style.display = 'none';
  currentEventId = null;
}

function deleteCurrentEvent() {
  if (currentEventId && confirm('Are you sure you want to delete this event?')) {
    events = events.filter(event => event.id !== currentEventId);
    saveEvents();
    renderCalendar();
    renderEventList();
    clearEventForm();
  }
}

// Handle form submission
document.getElementById('calendarForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const title = document.getElementById('eventTitle').value;
  const startDate = document.getElementById('eventStartDate').value;
  const endDate = document.getElementById('eventEndDate').value || startDate;
  const description = document.getElementById('eventDescription').value;
  const color = document.getElementById('eventColor').value;
  const priority = document.getElementById('eventPriority').value;
  const repeat = document.getElementById('eventRepeat').value;
  const reminder = document.getElementById('eventReminder').value;
  
  const eventData = {
    id: currentEventId || Date.now().toString(),
    title,
    startDate,
    endDate,
    description,
    color,
    priority,
    repeat,
    reminder
  };
  
  // Handle custom repeat options if needed
  if (repeat === 'custom') {
    eventData.repeatEvery = document.getElementById('repeatEvery').value;
    eventData.repeatFrequency = document.getElementById('repeatFrequency').value;
    
    if (eventData.repeatFrequency === 'weeks') {
      const checkedDays = Array.from(document.querySelectorAll('input[name="weekday"]:checked')).map(el => el.value);
      eventData.repeatDays = checkedDays;
    }
    
    const repeatEnd = document.querySelector('input[name="repeatEnd"]:checked').value;
    eventData.repeatEnd = repeatEnd;
    
    if (repeatEnd === 'after') {
      eventData.repeatOccurrences = document.getElementById('repeatOccurrences').value;
    } else if (repeatEnd === 'on') {
      eventData.repeatEndDate = document.getElementById('repeatEndDate').value;
    }
  }
  
  // Handle custom reminder if needed
  if (reminder === 'custom') {
    eventData.reminderValue = document.getElementById('customReminderValue').value;
    eventData.reminderUnit = document.getElementById('customReminderUnit').value;
  }
  
  if (currentEventId) {
    // Update existing event
    const index = events.findIndex(event => event.id === currentEventId);
    if (index !== -1) {
      events[index] = eventData;
    }
  } else {
    // Add new event
    events.push(eventData);
  }
  
  saveEvents();
  renderCalendar();
  renderEventList();
  clearEventForm();
});

// Save events to localStorage
function saveEvents() {
  localStorage.setItem('calendarEvents', JSON.stringify(events));
}

// Render event list
function renderEventList() {
  const eventList = document.getElementById('eventList');
  const filter = document.getElementById('eventListFilter').value;
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  
  // Filter events
  let filteredEvents = sortedEvents;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (filter) {
    case 'today':
      filteredEvents = sortedEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      });
      break;
    case 'week':
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);
      filteredEvents = sortedEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= today && eventDate <= weekEnd;
      });
      break;
    case 'month':
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      filteredEvents = sortedEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= today && eventDate <= monthEnd;
      });
      break;
    case 'high':
      filteredEvents = sortedEvents.filter(event => event.priority === 'high');
      break;
    case 'critical':
      filteredEvents = sortedEvents.filter(event => event.priority === 'critical');
      break;
  }
  
  // Create event list HTML
  if (filteredEvents.length === 0) {
    eventList.innerHTML = '<div class="no-events">No events found</div>';
    return;
  }
  
  eventList.innerHTML = filteredEvents.map(event => {
    const eventDate = new Date(event.startDate);
    const timeString = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = eventDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    
    return `
      <div class="event-item ${event.priority}" onclick="editEvent('${event.id}')">
        <div class="event-time">${dateString} at ${timeString}</div>
        <div class="event-title">${event.title}</div>
        ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
      </div>
    `;
  }).join('');
}

// Edit event
function editEvent(eventId) {
  const event = events.find(e => e.id === eventId);
  if (!event) return;
  
  document.getElementById('eventTitle').value = event.title;
  document.getElementById('eventStartDate').value = event.startDate.slice(0, 16);
  document.getElementById('eventEndDate').value = event.endDate.slice(0, 16);
  document.getElementById('eventDescription').value = event.description || '';
  document.getElementById('eventColor').value = event.color;
  document.getElementById('eventPriority').value = event.priority;
  document.getElementById('eventRepeat').value = event.repeat;
  document.getElementById('eventReminder').value = event.reminder;
  
  // Show delete button
  document.getElementById('deleteEventBtn').style.display = 'block';
  currentEventId = event.id;
}

// Export calendar
function exportCalendar() {
  const data = {
    calendarEvents: events,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nilesat-calendar-export-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Print calendar
function printCalendar() {
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Nilesat Calendar - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e3a8a; }
          .calendar-header { text-align: center; margin-bottom: 20px; }
          .event-list { margin-top: 30px; }
          .event-item { border-left: 4px solid #3b82f6; padding: 10px; margin-bottom: 10px; }
          .event-item.critical { border-left-color: #ef4444; }
          .event-item.high { border-left-color: #f59e0b; }
          .event-time { color: #666; font-size: 0.9em; }
          .event-title { font-weight: bold; }
          @page { size: auto; margin: 10mm; }
        </style>
      </head>
      <body>
        <h1>Nilesat Operations Calendar</h1>
        <div class="calendar-header">
          <h2>${document.getElementById('calendar-month-year').textContent}</h2>
        </div>
        <div class="event-list">
          <h3>Upcoming Events</h3>
          ${document.getElementById('eventList').innerHTML}
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// Event listeners for dynamic options
document.getElementById('eventRepeat').addEventListener('change', function() {
  const customOptions = document.getElementById('customRepeatOptions');
  const weekdaysOptions = document.getElementById('weekdaysOptions');
  
  if (this.value === 'custom') {
    customOptions.style.display = 'block';
  } else {
    customOptions.style.display = 'none';
  }
  
  if (this.value === 'weekly') {
    weekdaysOptions.style.display = 'block';
  } else {
    weekdaysOptions.style.display = 'none';
  }
});

document.getElementById('repeatFrequency').addEventListener('change', function() {
  const weekdaysOptions = document.getElementById('weekdaysOptions');
  if (this.value === 'weeks') {
    weekdaysOptions.style.display = 'block';
  } else {
    weekdaysOptions.style.display = 'none';
  }
});

document.getElementById('eventReminder').addEventListener('change', function() {
  const customOptions = document.getElementById('customReminderOptions');
  if (this.value === 'custom') {
    customOptions.style.display = 'block';
  } else {
    customOptions.style.display = 'none';
  }
});

document.getElementById('eventListFilter').addEventListener('change', renderEventList);

// Initialize date inputs with current date
document.addEventListener('DOMContentLoaded', function() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 16);
  
  document.getElementById('eventStartDate').value = todayStr;
  document.getElementById('eventEndDate').value = todayStr;
  
  // Set minimum date for repeat end date to today
  document.getElementById('repeatEndDate').min = now.toISOString().slice(0, 10);
});    // Push event message to the news bar with custom colors
    function pushToNews(message, fontColor, backgroundColor) {
      const newsText = document.getElementById('newsText');
      newsText.textContent = `Event: ${message}`;
      newsText.style.color = fontColor;
      newsBar.style.backgroundColor = backgroundColor;
      
      // Reset after 30 seconds
      setTimeout(() => {
        newsText.textContent = "Nilesat Operations Dashboard - Monitoring satellites 201 and 301";
        newsText.style.color = textColor.value;
        newsBar.style.backgroundColor = backgroundColor.value;
      }, 30000);
    }

    // Analytics Tab (Tab 12)
    let analyticsChart;
    let currentChartType = 'power';

    function initializeAnalyticsChart() {
      const ctx = document.getElementById('analyticsChart').getContext('2d');
      
      // Destroy previous chart if it exists
      if (analyticsChart) {
        analyticsChart.destroy();
      }
      
      // Create initial chart
      analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: generateTimeLabels('24h'),
          datasets: [{
            label: 'Power Subsystem Voltage (V)',
            data: generateRandomData(24, 27, 30),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
      
      currentChartType = 'power';
    }

    function showTelemetryChart(type) {
      const ctx = document.getElementById('analyticsChart').getContext('2d');
      currentChartType = type;
      
      let dataset;
      
      switch (type) {
        case 'power':
          dataset = {
            label: 'Power Subsystem Voltage (V)',
            data: generateRandomData(24, 27, 30),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          };
          break;
          
        case 'thermal':
          dataset = {
            label: 'Temperature (°C)',
            data: generateRandomData(24, 15, 25),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
          };
          break;
          
        case 'attitude':
          dataset = {
            label: 'Attitude Error (degrees)',
            data: generateRandomData(24, 0, 0.5),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
          };
          break;
          
        case 'propulsion':
          dataset = {
            label: 'Tank Pressure (kPa)',
            data: generateRandomData(24, 200, 220),
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)'
          };
          break;
          
        case 'communications':
          dataset = {
            label: 'Signal Strength (dBm)',
            data: generateRandomData(24, -70, -60),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)'
          };
          break;
      }
      
      analyticsChart.data.datasets = [dataset];
      analyticsChart.update();
    }

    function showPerformanceChart(type) {
      const ctx = document.getElementById('analyticsChart').getContext('2d');
      currentChartType = type;
      
      let dataset;
      
      switch (type) {
        case 'signal':
          dataset = {
            label: 'Signal Quality (BER)',
            data: generateRandomData(24, 1e-6, 1e-5, true),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)'
          };
          break;
          
        case 'throughput':
          dataset = {
            label: 'Data Throughput (Mbps)',
            data: generateRandomData(24, 45, 50),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          };
          break;
          
        case 'availability':
          dataset = {
            label: 'Service Availability (%)',
            data: generateRandomData(24, 99.9, 100),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)'
          };
          break;
          
        case 'anomalies':
          dataset = {
            label: 'Anomalies (count)',
            data: generateRandomData(24, 0, 3),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)'
          };
          break;
          
        case 'trends':
          dataset = {
            label: 'Long-term Performance Index',
            data: generateRandomData(24, 85, 95),
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)'
          };
          break;
      }
      
      analyticsChart.data.datasets = [dataset];
      analyticsChart.update();
    }

    function updateAnalyticsChart() {
      const timeRange = document.getElementById('timeRange').value;
      
      if (timeRange === 'custom') {
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        
        if (!dateFrom || !dateTo) {
          alert('Please select both start and end dates.');
          return;
        }
        
        // Generate labels for custom range
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 0) {
          alert('End date must be after start date.');
          return;
        }
        
        const labels = [];
        for (let i = 0; i <= diffDays; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          labels.push(date.toLocaleDateString());
        }
        
        analyticsChart.data.labels = labels;
      } else {
        analyticsChart.data.labels = generateTimeLabels(timeRange);
      }
      
      // Update data based on current chart type
      if (currentChartType === 'power' || currentChartType === 'thermal' || 
          currentChartType === 'attitude' || currentChartType === 'propulsion' || 
          currentChartType === 'communications') {
        showTelemetryChart(currentChartType);
      } else {
        showPerformanceChart(currentChartType);
      }
    }

    // Helper function to generate time labels
    function generateTimeLabels(range) {
      const now = new Date();
      const labels = [];
      let count;
      
      switch (range) {
        case '24h':
          count = 24;
          for (let i = count; i >= 0; i--) {
            const time = new Date(now);
            time.setHours(time.getHours() - i);
            labels.push(time.getHours() + ':00');
          }
          break;
          
        case '7d':
          count = 7;
          for (let i = count; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString());
          }
          break;
          
        case '30d':
          count = 30;
          for (let i = count; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.getDate() + '/' + (date.getMonth() + 1));
          }
          break;
          
        case '90d':
          count = 12; // 90 days in ~12 weeks
          for (let i = count; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i * 7);
            labels.push('Week ' + (count - i + 1));
          }
          break;
          
        case '1y':
          count = 12;
          for (let i = count; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear());
          }
          break;
      }
      
      return labels;
    }

    // Helper function to generate random data
    function generateRandomData(count, min, max, logarithmic = false) {
      const data = [];
      for (let i = 0; i <= count; i++) {
        if (logarithmic) {
          // Generate logarithmic data (for BER, etc.)
          const logMin = Math.log10(min);
          const logMax = Math.log10(max);
          const value = Math.pow(10, logMin + Math.random() * (logMax - logMin));
          data.push(value);
        } else {
          data.push(min + Math.random() * (max - min));
        }
      }
      return data;
    }

    // Show/hide custom date range inputs
    document.getElementById('timeRange').addEventListener('change', function() {
      const customRangeContainer = document.getElementById('customRangeContainer');
      customRangeContainer.style.display = this.value === 'custom' ? 'block' : 'none';
    });

    // Initialize analytics chart when tab is shown
    document.querySelector('.tab[onclick="showTab(\'tab12\')"]').addEventListener('click', function() {
      setTimeout(initializeAnalyticsChart, 100);
    });
  
// Nilesat Dashboard Tab 13 JavaScript
let readings201 = [];
let readings301 = [];
let thresholds = {
  201: {},
  301: {}
};

function getSelectedSatellite() {
  return document.getElementById("satelliteSelect").value;
}

function getReadingInputs() {
  return {
    number: parseInt(document.getElementById("readingNumber").value) || 1,
    date: document.getElementById("readingDate").value,
    time: document.getElementById("readingTime").value,
    range: parseFloat(document.getElementById("range").value),
    azimuth: parseFloat(document.getElementById("azimuth").value),
    elevation: parseFloat(document.getElementById("elevation").value)
  };
}

function resetReadingInputs(nextNumber) {
  document.getElementById("readingNumber").value = nextNumber;
  document.getElementById("readingDate").value = "";
  document.getElementById("readingTime").value = "";
  document.getElementById("range").value = "";
  document.getElementById("azimuth").value = "";
  document.getElementById("elevation").value = "";
}

function applyThresholdHighlight(inputId, value, min, max) {
  const input = document.getElementById(inputId);
  if (min !== undefined && max !== undefined && (value < min || value > max)) {
    input.style.backgroundColor = "red";
    return false;
  } else {
    input.style.backgroundColor = "white";
    return true;
  }
}

function saveReading() {
  const sat = getSelectedSatellite();
  const reading = getReadingInputs();
  const checkRange = applyThresholdHighlight("range", reading.range, thresholds[sat].rangeMin, thresholds[sat].rangeMax);
  const checkAzimuth = applyThresholdHighlight("azimuth", reading.azimuth, thresholds[sat].azimuthMin, thresholds[sat].azimuthMax);
  const checkElevation = applyThresholdHighlight("elevation", reading.elevation, thresholds[sat].elevationMin, thresholds[sat].elevationMax);

  let list = (sat === "201") ? readings201 : readings301;

  // Duplicate check
  list.forEach(r => {
    if (r.range === reading.range || r.azimuth === reading.azimuth || r.elevation === reading.elevation) {
      reading.duplicate = true;
    }
  });

  list.push(reading);
  updateHiddenTable(sat);
  resetReadingInputs(reading.number + 1);
}

function updateHiddenTable(sat) {
  let tableDiv = document.getElementById(`hiddenTable${sat}`);
  let list = (sat === "201") ? readings201 : readings301;
  let html = `<table><tr><th>#</th><th>Date</th><th>Time</th><th>Range</th><th>Azimuth</th><th>Elevation</th></tr>`;
  list.forEach(r => {
    const red = 'style="background-color:red"';
    const green = 'style="background-color:lightgreen"';
    const styleRange = (r.range < thresholds[sat].rangeMin || r.range > thresholds[sat].rangeMax) ? red : green;
    const styleAzimuth = (r.azimuth < thresholds[sat].azimuthMin || r.azimuth > thresholds[sat].azimuthMax) ? red : green;
    const styleElevation = (r.elevation < thresholds[sat].elevationMin || r.elevation > thresholds[sat].elevationMax) ? red : green;

    html += `<tr>
      <td>${r.number}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td ${r.duplicate ? red : styleRange}>${r.range}</td>
      <td ${r.duplicate ? red : styleAzimuth}>${r.azimuth}</td>
      <td ${r.duplicate ? red : styleElevation}>${r.elevation}</td>
    </tr>`;
  });
  html += `</table>`;
  tableDiv.innerHTML = html;
}

function deleteLast() {
  const sat = getSelectedSatellite();
  const list = (sat === "201") ? readings201 : readings301;
  if (list.length > 0) {
    list.pop();
    updateHiddenTable(sat);
    const lastNumber = list.length > 0 ? list[list.length - 1].number + 1 : 1;
    document.getElementById("readingNumber").value = lastNumber;
  }
}

function openSettings() {
  const panel = document.getElementById("settingsPanel");
  panel.classList.toggle("hidden");
  const sat = getSelectedSatellite();
  panel.innerHTML = `
    <h3>Settings for Nilesat ${sat}</h3>
    <label>Range Min: <input type='number' id='rangeMin'></label>
    <label>Range Max: <input type='number' id='rangeMax'></label>
    <label>Azimuth Min: <input type='number' id='azimuthMin'></label>
    <label>Azimuth Max: <input type='number' id='azimuthMax'></label>
    <label>Elevation Min: <input type='number' id='elevationMin'></label>
    <label>Elevation Max: <input type='number' id='elevationMax'></label>
    <button onclick='saveThresholds(${sat})'>Save Thresholds</button>
  `;
}

function saveThresholds(sat) {
  thresholds[sat] = {
    rangeMin: parseFloat(document.getElementById('rangeMin').value),
    rangeMax: parseFloat(document.getElementById('rangeMax').value),
    azimuthMin: parseFloat(document.getElementById('azimuthMin').value),
    azimuthMax: parseFloat(document.getElementById('azimuthMax').value),
    elevationMin: parseFloat(document.getElementById('elevationMin').value),
    elevationMax: parseFloat(document.getElementById('elevationMax').value),
  };
  document.getElementById("settingsPanel").classList.add("hidden");
}

function displayLocTable() {
  document.getElementById("hiddenTable201").style.display = "block";
  document.getElementById("hiddenTable301").style.display = "block";
}

function copyData() {
  // Get all the data to copy
  const engineerName = document.getElementById("engineerName").value || "Not specified";
  const pathUsed = document.getElementById("pathUsed").value || "Not specified";
  const startDateTime = document.getElementById("startDateTime").value || "Not specified";
  const endDateTime = document.getElementById("endDateTime").value || "Not specified";
  const addressName = document.getElementById("addressName").value || "Not specified";
  const campaign = document.getElementById("localizationCampaign").value || "Not specified";
  
  // Create header information
  let textToCopy = `Nilesat Localization Campaign Data\n`;
  textToCopy += `================================\n`;
  textToCopy += `Engineer Name: ${engineerName}\n`;
  textToCopy += `Path Used: ${pathUsed}\n`;
  textToCopy += `Start DateTime: ${startDateTime}\n`;
  textToCopy += `End DateTime: ${endDateTime}\n`;
  textToCopy += `Address Name: ${addressName}\n`;
  textToCopy += `Campaign: ${campaign}\n\n`;
  
  // Add data for Nilesat 201
  if (readings201.length > 0) {
    textToCopy += `Nilesat 201 Data\n`;
    textToCopy += `--------------\n`;
    textToCopy += `No.\tDate\t\tTime\t\tRange\tAzimuth\tElevation\n`;
    readings201.forEach(r => {
      textToCopy += `${r.number}\t${r.date}\t${r.time}\t${r.range}\t${r.azimuth}\t${r.elevation}\n`;
    });
    textToCopy += `\n`;
  }
  
  // Add data for Nilesat 301
  if (readings301.length > 0) {
    textToCopy += `Nilesat 301 Data\n`;
    textToCopy += `--------------\n`;
    textToCopy += `No.\tDate\t\tTime\t\tRange\tAzimuth\tElevation\n`;
    readings301.forEach(r => {
      textToCopy += `${r.number}\t${r.date}\t${r.time}\t${r.range}\t${r.azimuth}\t${r.elevation}\n`;
    });
  }
  
  // Copy to clipboard
  navigator.clipboard.writeText(textToCopy).then(() => {
    alert("Data copied to clipboard!");
  }).catch(err => {
    console.error('Failed to copy: ', err);
    alert("Failed to copy data. Please try again.");
  });
}

function exportToExcel() {
  // Create a workbook with two sheets (201 and 301)
  const wb = XLSX.utils.book_new();
  
  // Prepare data for Nilesat 201
  const ws201Data = [
    ["Nilesat 201 Localization Data"],
    ["Engineer Name:", document.getElementById("engineerName").value || ""],
    ["Path Used:", document.getElementById("pathUsed").value || ""],
    ["Start DateTime:", document.getElementById("startDateTime").value || ""],
    ["End DateTime:", document.getElementById("endDateTime").value || ""],
    ["Address Name:", document.getElementById("addressName").value || ""],
    ["Campaign:", document.getElementById("localizationCampaign").value || ""],
    [],
    ["No.", "Date", "Time", "Range", "Azimuth", "Elevation"]
  ];
  
  readings201.forEach(r => {
    ws201Data.push([r.number, r.date, r.time, r.range, r.azimuth, r.elevation]);
  });
  
  const ws201 = XLSX.utils.aoa_to_sheet(ws201Data);
  XLSX.utils.book_append_sheet(wb, ws201, "Nilesat 201");
  
  // Prepare data for Nilesat 301
  const ws301Data = [
    ["Nilesat 301 Localization Data"],
    ["Engineer Name:", document.getElementById("engineerName").value || ""],
    ["Path Used:", document.getElementById("pathUsed").value || ""],
    ["Start DateTime:", document.getElementById("startDateTime").value || ""],
    ["End DateTime:", document.getElementById("endDateTime").value || ""],
    ["Address Name:", document.getElementById("addressName").value || ""],
    ["Campaign:", document.getElementById("localizationCampaign").value || ""],
    [],
    ["No.", "Date", "Time", "Range", "Azimuth", "Elevation"]
  ];
  
  readings301.forEach(r => {
    ws301Data.push([r.number, r.date, r.time, r.range, r.azimuth, r.elevation]);
  });
  
  const ws301 = XLSX.utils.aoa_to_sheet(ws301Data);
  XLSX.utils.book_append_sheet(wb, ws301, "Nilesat 301");
  
  // Generate and download the Excel file
  const fileName = `Nilesat_Localization_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function clearAllData() {
  readings201 = [];
  readings301 = [];
  updateHiddenTable("201");
  updateHiddenTable("301");
  resetReadingInputs(1);
}

function showChart(type) {
  const sat = getSelectedSatellite();
  let data = (sat === "201") ? readings201 : readings301;
  drawChart(data, type, sat);
}

function showAllCharts() {
  const sat = getSelectedSatellite();
  let data = (sat === "201") ? readings201 : readings301;
  drawChart(data, "range", sat);
  drawChart(data, "azimuth", sat);
  drawChart(data, "elevation", sat);
}

function showSummaryCharts() {
  // Clear existing charts
  document.getElementById("chartsContainer").innerHTML = "";
  
  // Create a container for summary charts
  const summaryContainer = document.createElement("div");
  summaryContainer.style.display = "grid";
  summaryContainer.style.gridTemplateColumns = "1fr 1fr";
  summaryContainer.style.gap = "20px";
  document.getElementById("chartsContainer").appendChild(summaryContainer);
  
  // Draw combined range chart
  const rangeContainer = document.createElement("div");
  summaryContainer.appendChild(rangeContainer);
  drawCombinedChart("range", rangeContainer);
  
  // Draw combined azimuth chart
  const azimuthContainer = document.createElement("div");
  summaryContainer.appendChild(azimuthContainer);
  drawCombinedChart("azimuth", azimuthContainer);
  
  // Draw combined elevation chart
  const elevationContainer = document.createElement("div");
  summaryContainer.appendChild(elevationContainer);
  drawCombinedChart("elevation", elevationContainer);
}

function drawCombinedChart(type, container) {
  const title = type.charAt(0).toUpperCase() + type.slice(1) + " Comparison";
  
  // Prepare data for both satellites
  const data201 = readings201.map(r => ({ 
    label: `${r.date} ${r.time}`, 
    value: r[type],
    satellite: "201"
  }));
  
  const data301 = readings301.map(r => ({ 
    label: `${r.date} ${r.time}`, 
    value: r[type],
    satellite: "301"
  }));
  
  // Combine labels (unique dates/times)
  const allLabels = [...new Set([...data201.map(d => d.label), ...data301.map(d => d.label)])];
  
  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 400;
  
  // Add title and canvas to container
  container.innerHTML = "";
  container.appendChild(document.createElement("h4")).innerText = title;
  container.appendChild(canvas);
  
  // Create chart
  new Chart(canvas, {
    type: "line",
    data: {
      labels: allLabels,
      datasets: [
        {
          label: "Nilesat 201",
          data: allLabels.map(label => {
            const point = data201.find(d => d.label === label);
            return point ? point.value : null;
          }),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: false,
          tension: 0.1
        },
        {
          label: "Nilesat 301",
          data: allLabels.map(label => {
            const point = data301.find(d => d.label === label);
            return point ? point.value : null;
          }),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: false,
          tension: 0.1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title
        },
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: type === "range" ? "Range (km)" : 
                  type === "azimuth" ? "Azimuth (degrees)" : "Elevation (degrees)"
          }
        },
        x: {
          title: {
            display: true,
            text: "Date/Time"
          }
        }
      }
    }
  });
}

function drawChart(data, type, sat) {
  const container = document.getElementById("chartsContainer");
  const title = `${type.charAt(0).toUpperCase() + type.slice(1)} - Nilesat ${sat}`;
  let chartData = data.map(r => ({ label: `${r.date} ${r.time}`, value: r[type] }));

  let canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 300;
  container.appendChild(document.createElement("hr"));
  container.appendChild(document.createElement("h3")).innerText = title;
  container.appendChild(canvas);

  new Chart(canvas, {
    type: "line",
    data: {
      labels: chartData.map(d => d.label),
      datasets: [{
        label: title,
        data: chartData.map(d => d.value),
        borderColor: "blue",
        backgroundColor: "lightblue",
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: { 
        legend: { display: true },
        title: {
          display: true,
          text: title
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: type === "range" ? "Range (km)" : 
                  type === "azimuth" ? "Azimuth (degrees)" : "Elevation (degrees)"
          }
        },
        x: {
          title: {
            display: true,
            text: "Date/Time"
          }
        }
      }
    }
  });
}

// Predefined URLs (itu,channel,tm,tc)for different satellite tubes
const predefinedUrls = {
  itu: "https://docs.google.com/spreadsheets/d/1DfKlMY_CFTPg2wXd_tNsrgnlxw0HOgW2/edit?usp=drive_link&ouid=103846440588901770481&rtpof=true&sd=true",
  channel: "https://docs.google.com/spreadsheets/d/1LJj9nqPJQzJYCM6-dfIf-fc8ENCWHdEBSdRtAhnq39I/edit",
  tm: "https://docs.google.com/spreadsheets/d/1zSHYpJRfUCkR8mF4pBwRN2jnW7Zz9kPRCo3YkorGpfo/edit?usp=drive_link",
  tc: "https://docs.google.com/spreadsheets/d/1whroynOkqDFxaTljrx9oFUP7HqcNiPaeBBRlAbI8KbI/edit?usp=drive_link",
  acronyms: "https://docs.google.com/spreadsheets/d/1elMhieS15kka226-i-pIeXOkgpzkuHIx/edit?usp=drive_link&ouid=103846440588901770481&rtpof=true&sd=true",
  sheet1: "https://docs.google.com/spreadsheets/d/1DoBqHJ6B3Z2_BODn75Z6YauETlzFyEnbzpnJmDlmWbY/edit",
  sheet2: "https://docs.google.com/spreadsheets/d/1iw_8TDQx8vofonE-961DP-TLx8CVXd4XR2yz7SnphMY/edit",
  sheet3: "https://docs.google.com/spreadsheets/d/1__uKEamZbDxXQvFpD9q3DIV9yGrC3RHpVk1LA2Vn_GI/edit"
};

// Update the URL input based on selected sheet type
function updateSheetUrl() {
  const sheetType = document.getElementById('sheetType').value;
  const urlInput = document.getElementById('spreadsheetUrl');
  
  if (sheetType === 'custom') {
    urlInput.value = '';
    urlInput.placeholder = 'Enter custom Google Sheet URL';
    urlInput.disabled = false;
  } else if (sheetType && predefinedUrls[sheetType]) {
    urlInput.value = predefinedUrls[sheetType];
    urlInput.disabled = true;
  } else {
    urlInput.value = '';
    urlInput.placeholder = 'Google Sheet URL';
    urlInput.disabled = false;
  }
}

    // Training Centre Configuration
    const TRAINING_XLSX_URLS = {
      course: {
        control: {
          file: 'https://docs.google.com/spreadsheets/d/1IbKHGa4A7gxkjInhRNsglIzQtNeZucL4/export?format=xlsx',
          view: 'https://docs.google.com/spreadsheets/d/1IbKHGa4A7gxkjInhRNsglIzQtNeZucL4/edit'
        },
        satellite: {
          file: 'https://docs.google.com/spreadsheets/d/1BbcDL30fjSuz4KaW0C4Z3NstH2KXcliG/export?format=xlsx',
          view: 'https://docs.google.com/spreadsheets/d/1BbcDL30fjSuz4KaW0C4Z3NstH2KXcliG/edit'
        },
        maintenance: {
          file: 'https://docs.google.com/spreadsheets/d/1x-serfbMt5KEFCX6-30ACATBxWxUbdTKplZItLcUG2Q/export?format=xlsx',
          view: 'https://docs.google.com/spreadsheets/d/1x-serfbMt5KEFCX6-30ACATBxWxUbdTKplZItLcUG2Q/edit'
        }
      },
      team: {
        control: {
          file: 'https://docs.google.com/spreadsheets/d/1h1iTHSzKiy_OSpZAHGrxuomE2d-RSc8Hry_nBuWkaYA/export?format=xlsx',
          view: 'https://docs.google.com/spreadsheets/d/1h1iTHSzKiy_OSpZAHGrxuomE2d-RSc8Hry_nBuWkaYA/edit'
        },
        satellite: {
          file: 'https://docs.google.com/spreadsheets/d/1JQhPwNHDNlG48hkMz00dz3SQhQNRElTQP2pT9Rpjjag/export?format=xlsx',
          view: 'https://docs.google.com/spreadsheets/d/1JQhPwNHDNlG48hkMz00dz3SQhQNRElTQP2pT9Rpjjag/edit'
        },
        maintenance: {
          file: 'https://docs.google.com/spreadsheets/d/1Ma_0mft9k-65CZ_-lp28vrrMdPU1gJCTD0ZBOsEKBSU/export?format=xlsx',
          view: 'https://docs.google.com/spreadsheets/d/1Ma_0mft9k-65CZ_-lp28vrrMdPU1gJCTD0ZBOsEKBSU/edit'
        }
      }
    };

    const TRAINING_LABELS = {
      course: ['control', 'satellite', 'maintenance'],
      team: ['control', 'satellite', 'maintenance']
    };

    let currentTrainingTab = 'course';
    let currentTrainingSheet = '';
    let trainingTableData = [];
    let trainingAllWords = new Set();

    // Initialize the training centre
    document.addEventListener('DOMContentLoaded', () => {
      setupEventListeners();
      switchTrainingTab('course');
    });

    function setupEventListeners() {
      // Tab buttons
      document.querySelectorAll('.training-tab-btn').forEach(button => {
        button.addEventListener('click', function() {
          const tab = this.getAttribute('data-tab');
          switchTrainingTab(tab);
        });
      });

      // Open Source button
      document.getElementById('openSourceBtn').addEventListener('click', openTrainingOriginalFile);

      // Import file handler
      document.getElementById('trainingImportFile').addEventListener('change', importTrainingCSV);
    }

    function showTrainingLoading() {
      document.getElementById('trainingLoading').style.display = 'flex';
    }

    function hideTrainingLoading() {
      document.getElementById('trainingLoading').style.display = 'none';
    }

    function switchTrainingTab(tab) {
      currentTrainingTab = tab;
      createTrainingButtons(tab);
      
      // Update active tab button
      document.querySelectorAll('.training-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
      });
    }

    function createTrainingButtons(tab) {
      const container = document.getElementById('training-buttons-container');
      container.innerHTML = '';
      
      TRAINING_LABELS[tab].forEach(sheet => {
        const label = sheet.charAt(0).toUpperCase() + sheet.slice(1);
        const buttonText = tab === 'team' ? 
          `<i class="fas fa-user"></i> ${label} Engineer` : 
          `<i class="fas fa-book-open"></i> ${label} Course`;
        
        const btn = document.createElement('button');
        btn.innerHTML = buttonText;
        btn.onclick = () => loadTrainingExcelFile(tab, sheet);
        container.appendChild(btn);
      });
    }

    async function loadTrainingExcelFile(tab, sheetKey) {
      currentTrainingSheet = sheetKey;
      const url = TRAINING_XLSX_URLS[tab][sheetKey].file;
      
      try {
        showTrainingLoading();
        
        let response = await fetch(url);
        
        if (!response.ok) {
          const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
          response = await fetch(proxyUrl, {
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const data = await blob.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        trainingTableData = jsonData;
        const headers = Object.keys(jsonData[0] || {});
        
        renderTrainingTable(headers, jsonData);
        extractTrainingWords(jsonData);
        hideTrainingLoading();
        
      } catch (error) {
        hideTrainingLoading();
        console.error('Error loading training file:', error);
        alert(`Failed to load ${sheetKey} data. Please check the URL or try again later.`);
      }
    }

    function renderTrainingTable(headers, rows) {
      const head = document.getElementById('trainingTableHead');
      const body = document.getElementById('trainingTableBody');
      head.innerHTML = '';
      body.innerHTML = '';

      // Create header row
      const headerRow = document.createElement('tr');
      headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
      });
      head.appendChild(headerRow);

      // Create data rows
      if (rows.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = headers.length;
        emptyCell.textContent = 'No data available';
        emptyCell.style.textAlign = 'center';
        emptyRow.appendChild(emptyCell);
        body.appendChild(emptyRow);
        return;
      }

      rows.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
          const td = document.createElement('td');
          let val = row[h] !== undefined ? row[h] : '';
          
          if (typeof val === 'string') {
            val = val.trim();
            // Handle URLs - more comprehensive detection
            if (val.match(/^(https?:\/\/|www\.)[^\s]+$/i)) {
              let url = val;
              if (val.startsWith('www.')) {
                url = 'http://' + val; // Add protocol if missing
              }
              td.innerHTML = `<a href="${url}" target="_blank" class="training-table-link">${val}</a>`;
            } 
            // Handle email addresses
            else if (val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
              td.innerHTML = `<a href="mailto:${val}">${val}</a>`;
            } 
            // Regular text
            else {
              td.textContent = val;
            }
          } 
          // Non-string values (numbers, dates, etc.)
          else {
            td.textContent = val;
          }
          
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
    }

    function extractTrainingWords(data) {
      trainingAllWords = new Set();
      if (!data || data.length === 0) return;

      data.forEach(row => {
        Object.values(row).forEach(val => {
          if (val && typeof val === 'string') {
            val.toString().trim().split(/\s+/).forEach(word => {
              if (word.length > 2) {
                trainingAllWords.add(word.toLowerCase());
              }
            });
          }
        });
      });
    }

    function showTrainingSearchSuggestions() {
      const input = document.getElementById('trainingSearchInput').value.toLowerCase();
      const suggestions = document.getElementById('trainingSearchSuggestions');
      
      if (input.length < 2) {
        suggestions.style.display = 'none';
        return;
      }
      
      const matches = Array.from(trainingAllWords).filter(word => 
        word.includes(input)
      ).slice(0, 10);
      
      if (matches.length === 0) {
        suggestions.style.display = 'none';
        return;
      }
      
      suggestions.innerHTML = matches.map(word => 
        `<div onclick="selectTrainingSuggestion('${word}')">${word}</div>`
      ).join('');
      
      suggestions.style.display = 'block';
    }

    function selectTrainingSuggestion(word) {
      document.getElementById('trainingSearchInput').value = word;
      document.getElementById('trainingSearchSuggestions').style.display = 'none';
      filterTrainingTable();
    }

    function filterTrainingTable() {
      const query = document.getElementById('trainingSearchInput').value.toLowerCase();
      const suggestions = document.getElementById('trainingSearchSuggestions');
      suggestions.style.display = 'none';
      
      if (!query || !trainingTableData.length) {
        const headers = Object.keys(trainingTableData[0] || {});
        renderTrainingTable(headers, trainingTableData);
        return;
      }
      
      const filtered = trainingTableData.filter(row =>
        Object.values(row).some(val => 
          val && val.toString().toLowerCase().includes(query)
        )
      );
      
      if (filtered.length > 0) {
        renderTrainingTable(Object.keys(filtered[0]), filtered);
      } else {
        const headers = Object.keys(trainingTableData[0] || {});
        renderTrainingTable(headers, []);
      }
    }

    function exportTrainingCSV() {
      if (!trainingTableData.length) {
        alert("No data to export.");
        return;
      }
      
      try {
        const worksheet = XLSX.utils.json_to_sheet(trainingTableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TrainingData");
        XLSX.writeFile(workbook, `Training_${currentTrainingTab}_${currentTrainingSheet}.xlsx`);
      } catch (error) {
        console.error("Export error:", error);
        alert("Failed to export data. Please try again.");
      }
    }

    function exportTrainingSearchResult() {
      const query = document.getElementById('trainingSearchInput').value.toLowerCase();
      const filtered = trainingTableData.filter(row =>
        Object.values(row).some(val => 
          val && val.toString().toLowerCase().includes(query)
        )
      );

      if (filtered.length === 0) {
        alert("No matching data to export.");
        return;
      }

      try {
        const worksheet = XLSX.utils.json_to_sheet(filtered);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SearchResults");
        XLSX.writeFile(workbook, `Training_Search_${currentTrainingTab}_${currentTrainingSheet}.xlsx`);
      } catch (error) {
        console.error("Export error:", error);
        alert("Failed to export search results. Please try again.");
      }
    }

    function importTrainingCSV(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          trainingTableData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          const headers = Object.keys(trainingTableData[0] || {});
          renderTrainingTable(headers, trainingTableData);
          extractTrainingWords(trainingTableData);
        } catch (error) {
          console.error("Import error:", error);
          alert("Failed to import file. Please check the file format.");
        }
      };
      reader.readAsArrayBuffer(file);
    }

    function printTrainingTable() {
      const content = document.getElementById('training-table-container').cloneNode(true);
      const printWindow = window.open('', '', 'height=700,width=900');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Training Data - ${currentTrainingTab} ${currentTrainingSheet}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
              th { background-color: #f2f2f2; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              a { color: #0066cc; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h2>Training Data - ${currentTrainingTab} ${currentTrainingSheet}</h2>
            ${content.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 200);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    function printTrainingSearch() {
      const query = document.getElementById('trainingSearchInput').value.toLowerCase();
      const filtered = trainingTableData.filter(row =>
        Object.values(row).some(val => 
          val && val.toString().toLowerCase().includes(query)
        )
      );
      
      if (filtered.length === 0) {
        alert("No matching data to print.");
        return;
      }

      const headers = Object.keys(filtered[0] || {});
      let tableHtml = `
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${filtered.map(row => `
              <tr>
                ${headers.map(h => {
                  let val = row[h] !== undefined ? row[h] : '';
                  if (typeof val === 'string') {
                    val = val.trim();
                    if (val.match(/^(https?:\/\/|www\.)[^\s]+$/i)) {
                      let url = val.startsWith('www.') ? 'http://' + val : val;
                      return `<td><a href="${url}">${val}</a></td>`;
                    } else if (val.includes('@') && !val.includes(' ')) {
                      return `<td><a href="mailto:${val}">${val}</a></td>`;
                    }
                  }
                  return `<td>${val}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      const printWindow = window.open('', '', 'height=700,width=900');
      printWindow.document.write(`
        <html>
          <head>
            <title>Training Search Results - ${query}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
              th { background-color: #f2f2f2; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              a { color: #0066cc; text-decoration: none; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h2>Training Search Results for "${query}"</h2>
            ${tableHtml}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 200);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }

    function openTrainingOriginalFile() {
      try {
        if (!currentTrainingTab || !currentTrainingSheet) {
          throw new Error("No tab or sheet selected");
        }
        
        const url = TRAINING_XLSX_URLS[currentTrainingTab][currentTrainingSheet]?.view;
        if (!url) {
          throw new Error("Missing file link");
        }
        
        window.open(url, '_blank').focus();
      } catch (e) {
        console.error("Error opening file:", e);
        alert(`Failed to open file: ${e.message}`);
      }
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', function(event) {
      const suggestions = document.getElementById('trainingSearchSuggestions');
      const input = document.getElementById('trainingSearchInput');
      
      if (event.target !== input && event.target !== suggestions) {
        suggestions.style.display = 'none';
      }
    });
 // tab 16 day log
(() => {
 
  const urls = {
    controlA: "https://docs.google.com/spreadsheets/d/1ltdnFw2_5RUT_JjBZSN_3oThSWPRX72chKElo-17phQ/edit?usp=drive_link",
    controlB: "https://docs.google.com/spreadsheets/d/12kbJiqTn7uDt3_WRZXERJHzEyFH6IL8oURrgCX2kLW4/edit?usp=drive_link",
    controlC: "https://docs.google.com/spreadsheets/d/19l2TSsLOjBhld9Zafyb7XeaxJphM9u41DEKDQD_f8uk/edit?usp=drive_link",
    satellite: "url4.xlsx",
    maintenance: "url5.xlsx",
    controlAAlex: "https://docs.google.com/spreadsheets/d/1Z068ZudVmOuovxbktNsa6JkHLsknz4cNIQJhgzgX7yk/edit?usp=drive_link",
    controlBAlex: "https://docs.google.com/spreadsheets/d/1LXyF6GBcRNPolMKpKKlvT2LFMhA5h3qqUswCIf2eJGg/edit?usp=drive_link",
    controlCAlex: "https://docs.google.com/spreadsheets/d/1uDdQ6Wrg8HMsv7Y_mEOplR8I-wzHD6HsNgbBFetsSZQ/edit?usp=drive_link",
    satelliteAlex: "url4.xlsx",
    maintenanceAlex: "url5.xlsx"
  };

  const deptClassMap = {
    controlA: "dept-controlA",
    controlB: "dept-controlB",
    controlC: "dept-controlC",
    satellite: "dept-satellite",
    maintenance: "dept-maintenance",
    controlAAlex: "dept-controlAAlex",
    controlBAlex: "dept-controlBAlex",
    controlCAlex: "dept-controlCAlex",
    satelliteAlex: "dept-satelliteAlex",
    maintenanceAlex: "dept-maintenanceAlex"
  };

  // Month names for date formatting
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // DOM elements
  const dqDeptSelect = document.getElementById("dqDeptSelect");
  const dqDateFrom = document.getElementById("dqDateFrom");
  const dqDateTo = document.getElementById("dqDateTo");
  const dqSearchInput = document.getElementById("dqSearchInput");
  const dqLoadBtn = document.getElementById("dqLoadBtn");
  const dqProcessBtn = document.getElementById("dqProcessBtn");
  const dqExportBtn = document.getElementById("dqExportBtn");
  const dqPrintBtn = document.getElementById("dqPrintBtn");
  const dqUndoBtn = document.getElementById("dqUndoBtn");
  const dqTable = document.getElementById("dayQualityTable");
  const dqTableHead = dqTable.querySelector("thead");
  const dqTableBody = dqTable.querySelector("tbody");
  const dqProcessingPanel = document.getElementById("dqProcessingPanel");
  const dqColumnSelect = document.getElementById("dqColumnSelect");
  const dqDeleteColBtn = document.getElementById("dqDeleteColBtn");
  const dqSelectAllRows = document.getElementById("dqSelectAllRows");
  const dqDeselectAllRows = document.getElementById("dqDeselectAllRows");
  const dqDeleteRowsBtn = document.getElementById("dqDeleteRowsBtn");
  const dqColumnCheckboxes = document.getElementById("dqColumnCheckboxes");
  const dqMakeSmartTableBtn = document.getElementById("dqMakeSmartTableBtn");
  const smartTableControls = document.getElementById("smartTableControls");
  const dqFilterColumn = document.getElementById("dqFilterColumn");
  const dqFilterValue = document.getElementById("dqFilterValue");
  const dqApplyFilterBtn = document.getElementById("dqApplyFilterBtn");
  const dqClearFilterBtn = document.getElementById("dqClearFilterBtn");
  const dqStatusBar = document.getElementById("dqStatusBar");
  const dqRowCount = document.getElementById("dqRowCount");
  const dqLastUpdate = document.getElementById("dqLastUpdate");

  let combinedData = []; // Original loaded data
  let processedData = []; // Data after processing (filtering, column/row deletions)
  let allColumns = []; // All available columns
  let visibleColumns = []; // Currently visible columns
  let selectedRows = new Set(); // Set of selected row indices
  let undoStack = []; // Stack to keep track of changes for undo
  let isSmartTable = false; // Whether smart table features are enabled
  let currentSort = { column: null, direction: null }; // Current sorting state

  // Format date from mm/dd/yyyy to "Jan dd yyyy"
  function formatDate(dateStr) {
    if (!dateStr) return "";
    
    // Try parsing different date formats
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing mm/dd/yyyy format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        date = new Date(parts[2], parts[0] - 1, parts[1]);
      }
    }
    
    if (isNaN(date.getTime())) return dateStr; // Return original if still invalid
    
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
  }

  // Update status bar
  function updateStatusBar() {
    if (processedData.length) {
      dqStatusBar.style.display = 'flex';
      dqRowCount.textContent = `${processedData.length} rows displayed`;
      dqLastUpdate.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    } else {
      dqStatusBar.style.display = 'none';
    }
  }

  // Push current state to undo stack
  function pushToUndoStack() {
    undoStack.push({
      processedData: JSON.parse(JSON.stringify(processedData)),
      allColumns: [...allColumns],
      visibleColumns: [...visibleColumns]
    });
    dqUndoBtn.disabled = undoStack.length === 0;
  }

  // Undo the last operation
  function undoLastOperation() {
    if (undoStack.length === 0) return;
    
    const lastState = undoStack.pop();
    processedData = lastState.processedData;
    allColumns = lastState.allColumns;
    visibleColumns = lastState.visibleColumns;
    
    buildTable(processedData);
    dqUndoBtn.disabled = undoStack.length === 0;
    updateStatusBar();
  }

  // Fetch XLSX file and parse to JSON (array of objects)
  async function fetchXLSX(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    // Assume data is on the first sheet
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    // Convert sheet to JSON (array of objects)
    const data = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
    
    // Format any date fields
    return data.map(row => {
      const newRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (key.toLowerCase().includes('date') && typeof value === 'string') {
          newRow[key] = formatDate(value);
        } else {
          newRow[key] = value;
        }
      }
      return newRow;
    });
  }

  // Initialize the table with data
  function buildTable(data) {
    dqTableHead.innerHTML = "";
    dqTableBody.innerHTML = "";
    
    if (!data.length) {
      dqTableHead.innerHTML = "<tr><th>No data found matching your criteria</th></tr>";
      dqProcessBtn.disabled = true;
      updateStatusBar();
      return;
    }

    // Get all columns from first data row (excluding Department if it exists)
    allColumns = Object.keys(data[0]).filter(k => k.toLowerCase() !== "department");
    // Make Department the first column if it exists in data
    if (data[0].Department) {
      allColumns.unshift("Department");
    }
    
    // Set visible columns if not already set
    if (visibleColumns.length === 0) {
      visibleColumns = [...allColumns];
    }

    // Update column selector checkboxes
    updateColumnCheckboxes();

    // Create header row with only visible columns
    const trHead = document.createElement("tr");
    visibleColumns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col;
      
      // Add sorting indicators if smart table is enabled
      if (isSmartTable) {
        if (currentSort.column === col) {
          th.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
        th.addEventListener("click", () => sortTable(col));
      }
      
      trHead.appendChild(th);
    });
    dqTableHead.appendChild(trHead);

    // Create body rows with only visible columns
    data.forEach((row, rowIndex) => {
      const tr = document.createElement("tr");
      // Add class for dept color
      if (row.Department) {
        tr.classList.add(deptClassMap[row.Department] || "");
      }
      // Add row selection class if selected
      if (selectedRows.has(rowIndex)) {
        tr.classList.add("row-selected");
      }
      // Add click handler for row selection
      tr.addEventListener("click", (e) => {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd click for multi-select
          if (selectedRows.has(rowIndex)) {
            selectedRows.delete(rowIndex);
            tr.classList.remove("row-selected");
          } else {
            selectedRows.add(rowIndex);
            tr.classList.add("row-selected");
          }
        } else {
          // Regular click - clear all and select this one
          clearRowSelection();
          selectedRows.add(rowIndex);
          tr.classList.add("row-selected");
        }
      });

      // Add cells for visible columns only
      visibleColumns.forEach(col => {
        const td = document.createElement("td");
        td.textContent = row[col] ?? "";
        tr.appendChild(td);
      });
      dqTableBody.appendChild(tr);
    });

    // Enable processing button
    dqProcessBtn.disabled = false;
    updateStatusBar();
  }

  // Sort the table by a specific column
  function sortTable(column) {
    if (!processedData.length) return;
    
    // Determine new sort direction
    let direction = 'asc';
    if (currentSort.column === column && currentSort.direction === 'asc') {
      direction = 'desc';
    }
    
    // Sort the data
    processedData.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      
      // Handle numeric values
      if (!isNaN(valA) && !isNaN(valB)) {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      
      // Handle dates (try to parse)
      const dateA = tryParseDate(valA);
      const dateB = tryParseDate(valB);
      if (dateA && dateB) {
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Default to string comparison
      const strA = String(valA || "").toLowerCase();
      const strB = String(valB || "").toLowerCase();
      return direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
    
    // Update current sort state
    currentSort = { column, direction };
    
    // Rebuild table with sorted data
    buildTable(processedData);
  }

  // Try to parse a date string
  function tryParseDate(dateStr) {
    if (!dateStr) return null;
    
    // Try parsing formatted date (Jan dd yyyy)
    const dateMatch = dateStr.match(/([A-Za-z]{3}) (\d{1,2}) (\d{4})/);
    if (dateMatch) {
      const month = monthNames.indexOf(dateMatch[1]);
      const day = parseInt(dateMatch[2], 10);
      const year = parseInt(dateMatch[3], 10);
      return new Date(year, month, day).getTime();
    }
    
    // Try parsing as ISO date
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.getTime();
  }

  // Update column selector checkboxes
  function updateColumnCheckboxes() {
    dqColumnCheckboxes.innerHTML = "";
    dqColumnSelect.innerHTML = "";
    dqFilterColumn.innerHTML = "";
    
    allColumns.forEach(col => {
      // Add to column select dropdown (for deletion)
      const option = document.createElement("option");
      option.value = col;
      option.textContent = col;
      dqColumnSelect.appendChild(option);
      
      // Add to filter column dropdown if smart table is enabled
      if (isSmartTable) {
        const filterOption = document.createElement("option");
        filterOption.value = col;
        filterOption.textContent = col;
        dqFilterColumn.appendChild(filterOption);
      }
      
      // Add checkbox for column visibility
      const checkboxDiv = document.createElement("div");
      checkboxDiv.className = "column-checkbox";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `col-${col}`;
      checkbox.checked = visibleColumns.includes(col);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          if (!visibleColumns.includes(col)) {
            visibleColumns.push(col);
          }
        } else {
          visibleColumns = visibleColumns.filter(c => c !== col);
        }
        buildTable(processedData);
      });
      
      const label = document.createElement("label");
      label.htmlFor = `col-${col}`;
      label.textContent = col;
      
      checkboxDiv.appendChild(checkbox);
      checkboxDiv.appendChild(label);
      dqColumnCheckboxes.appendChild(checkboxDiv);
    });
  }

  // Clear all row selections
  function clearRowSelection() {
    selectedRows.clear();
    dqTableBody.querySelectorAll("tr").forEach(tr => {
      tr.classList.remove("row-selected");
    });
  }

  // Filter data by selected date range and search term
  function filterData(data, dateFrom, dateTo, searchTerm) {
    if (!data.length) return [];
    
    // Detect date column name ignoring case
    const dateCol = Object.keys(data[0]).find(c => c.toLowerCase() === "date");

    return data.filter(row => {
      // Date filter
      if (dateCol && row[dateCol]) {
        const rowDateStr = row[dateCol];
        // Parse formatted date (Jan dd yyyy)
        const dateMatch = rowDateStr.match(/([A-Za-z]{3}) (\d{1,2}) (\d{4})/);
        if (dateMatch) {
          const month = monthNames.indexOf(dateMatch[1]);
          const day = parseInt(dateMatch[2], 10);
          const year = parseInt(dateMatch[3], 10);
          const rowDate = new Date(year, month, day);
          
          if (dateFrom && rowDate < dateFrom) return false;
          if (dateTo && rowDate > dateTo) return false;
        }
      }
      // Search filter (case-insensitive substring search in any field)
      if (searchTerm) {
        const lowSearch = searchTerm.toLowerCase();
        const found = Object.values(row).some(val =>
          String(val).toLowerCase().includes(lowSearch)
        );
        if (!found) return false;
      }
      return true;
    });
  }

  // Apply column filter for smart table
  function applyColumnFilter() {
    const column = dqFilterColumn.value;
    const value = dqFilterValue.value.trim().toLowerCase();
    
    if (!column || !value) return;
    
    pushToUndoStack();
    
    processedData = processedData.filter(row => {
      const cellValue = String(row[column] || "").toLowerCase();
      return cellValue.includes(value);
    });
    
    buildTable(processedData);
  }

  // Clear column filter
  function clearColumnFilter() {
    dqFilterValue.value = "";
    pushToUndoStack();
    processedData = [...combinedData];
    buildTable(processedData);
  }

  // Export displayed table data as CSV
  function exportCSV() {
    if (!processedData.length) {
      alert("No data to export.");
      return;
    }
    
    // Use only visible columns
    const columns = visibleColumns.length ? visibleColumns : allColumns;
    
    // Build CSV string
    let csv = columns.join(",") + "\n";
    processedData.forEach(row => {
      const line = columns.map(c => `"${(row[c] ?? "").toString().replace(/"/g, '""')}"`).join(",");
      csv += line + "\n";
    });

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satellite_data_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Print current table view
  function printTable() {
    if (!processedData.length) {
      alert("No data to print.");
      return;
    }
    
    const printWindow = window.open("", "_blank");
    printWindow.document.write("<html><head><title>Satellite Logbook Data Print</title>");
    printWindow.document.write("<style>");
    printWindow.document.write("body { font-family: Arial; margin: 20px; }");
    printWindow.document.write("h1 { color: #333; font-size: 18px; margin-bottom: 15px; }");
    printWindow.document.write("table { width: 100%; border-collapse: collapse; font-size: 12px; }");
    printWindow.document.write("th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }");
    printWindow.document.write("th { background-color: #2c3e50; color: white; }");
    printWindow.document.write(".dept-controlA { background-color: #d4e6f1 !important; }");
    printWindow.document.write(".dept-controlB { background-color: #d5f5e3 !important; }");
    printWindow.document.write(".dept-controlC { background-color: #f9e79f !important; }");
    printWindow.document.write(".dept-satellite { background-color: #ebdef0 !important; }");
    printWindow.document.write(".dept-maintenance { background-color: #fadbd8 !important; }");
    printWindow.document.write(".dept-controlAAlex { background-color: #e8f8f5 !important; }");
    printWindow.document.write(".dept-controlBAlex { background-color: #fef9e7 !important; }");
    printWindow.document.write(".dept-controlCAlex { background-color: #eaf2f8 !important; }");
    printWindow.document.write(".dept-satelliteAlex { background-color: #f5eef8 !important; }");
    printWindow.document.write(".dept-maintenanceAlex { background-color: #fddede !important; }");
    printWindow.document.write("@page { size: auto; margin: 10mm; }");
    printWindow.document.write("@media print { body { margin: 0; padding: 0; } }");
    printWindow.document.write("</style>");
    printWindow.document.write("</head><body>");
    
    // Add title with date range
    printWindow.document.write(`<h1>Satellite Logbook Data - ${new Date().toLocaleDateString()}</h1>`);
    
    // Add date range info if specified
    if (dqDateFrom.value || dqDateTo.value) {
      printWindow.document.write(`<p>Date range: ${dqDateFrom.value || 'Start'} to ${dqDateTo.value || 'End'}</p>`);
    }
    
    // Create the table
    printWindow.document.write("<table>");
    
    // Add header
    printWindow.document.write("<thead><tr>");
    visibleColumns.forEach(col => {
      printWindow.document.write(`<th>${col}</th>`);
    });
    printWindow.document.write("</tr></thead>");
    
    // Add body
    printWindow.document.write("<tbody>");
    processedData.forEach(row => {
      printWindow.document.write("<tr>");
      visibleColumns.forEach(col => {
        printWindow.document.write(`<td>${row[col] ?? ""}</td>`);
      });
      printWindow.document.write("</tr>");
    });
    printWindow.document.write("</tbody>");
    
    printWindow.document.write("</table>");
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }

  // Load selected department files, merge, filter, display
  async function loadData() {
    dqLoadBtn.disabled = true;
    dqLoadBtn.classList.add("loading");
    dqProcessBtn.disabled = true;
    dqExportBtn.disabled = true;
    dqPrintBtn.disabled = true;

    const selectedDepts = Array.from(dqDeptSelect.selectedOptions).map(opt => opt.value);
    if (!selectedDepts.length) {
      alert("Please select at least one department.");
      dqLoadBtn.disabled = false;
      dqLoadBtn.classList.remove("loading");
      return;
    }

    combinedData = [];
    processedData = [];
    visibleColumns = [];
    selectedRows.clear();
    undoStack = [];
    dqUndoBtn.disabled = true;

    try {
      // Show loading state
      dqTableHead.innerHTML = "<tr><th>Loading data, please wait...</th></tr>";
      dqTableBody.innerHTML = "";

      // Fetch all selected dept files concurrently
      const fetchPromises = selectedDepts.map(dept => fetchXLSX(urls[dept])
        .then(data => {
          // Add Department field to each row if not already present
          data.forEach(r => {
            if (!r.Department) r.Department = dept;
          });
          return data;
        })
      );
      const results = await Promise.all(fetchPromises);

      // Combine all arrays
      combinedData = results.flat();

      // Apply filters
      const dateFromVal = dqDateFrom.value ? new Date(dqDateFrom.value) : null;
      const dateToVal = dqDateTo.value ? new Date(dqDateTo.value) : null;
      const searchVal = dqSearchInput.value.trim();

      processedData = filterData(combinedData, dateFromVal, dateToVal, searchVal);

      buildTable(processedData);

      if (processedData.length) {
        dqExportBtn.disabled = false;
        dqPrintBtn.disabled = false;
      } else {
        alert("No data matches your filters.");
      }

    } catch (err) {
      console.error("Error loading data:", err);
      alert("Error loading data: " + err.message);
      dqTableHead.innerHTML = "<tr><th>Error loading data</th></tr>";
      dqTableBody.innerHTML = "";
    }
    dqLoadBtn.disabled = false;
    dqLoadBtn.classList.remove("loading");
  }

  // Delete selected columns
  function deleteSelectedColumns() {
    const selectedCols = Array.from(dqColumnSelect.selectedOptions).map(opt => opt.value);
    if (selectedCols.length === 0) {
      alert("Please select at least one column to delete.");
      return;
    }
    
    pushToUndoStack();
    
    // Remove from visibleColumns if present
    visibleColumns = visibleColumns.filter(col => !selectedCols.includes(col));
    
    // Remove from allColumns
    allColumns = allColumns.filter(col => !selectedCols.includes(col));
    
    // Remove from processed data
    processedData = processedData.map(row => {
      const newRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (!selectedCols.includes(key)) {
          newRow[key] = value;
        }
      }
      return newRow;
    });
    
    // Rebuild table
    buildTable(processedData);
  }

  // Delete selected rows
  function deleteSelectedRows() {
    if (selectedRows.size === 0) {
      alert("Please select at least one row to delete.");
      return;
    }
    
    pushToUndoStack();
    
    // Convert Set to array and sort in descending order to avoid index issues
    const rowsToDelete = Array.from(selectedRows).sort((a, b) => b - a);
    
    // Delete rows from processedData
    rowsToDelete.forEach(rowIndex => {
      processedData.splice(rowIndex, 1);
    });
    
    // Clear selection
    selectedRows.clear();
    
    // Rebuild table
    buildTable(processedData);
  }

  // Enable smart table features
  function makeSmartTable() {
    isSmartTable = !isSmartTable;
    dqMakeSmartTableBtn.textContent = isSmartTable ? "Disable Smart Table" : "Enable Smart Table";
    smartTableControls.style.display = isSmartTable ? "flex" : "none";
    
    // Rebuild table to show/hide sorting indicators
    buildTable(processedData);
  }

  // Search input live filter (debounced)
  let searchTimeout = null;
  dqSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (!combinedData.length) return;
      const dateFromVal = dqDateFrom.value ? new Date(dqDateFrom.value) : null;
      const dateToVal = dqDateTo.value ? new Date(dqDateTo.value) : null;
      const searchVal = dqSearchInput.value.trim();
      processedData = filterData(combinedData, dateFromVal, dateToVal, searchVal);
      buildTable(processedData);
    }, 400);
  });

  // Date filter change triggers filtering on loaded data
  dqDateFrom.addEventListener("change", () => {
    if (!combinedData.length) return;
    const dateFromVal = dqDateFrom.value ? new Date(dqDateFrom.value) : null;
    const dateToVal = dqDateTo.value ? new Date(dqDateTo.value) : null;
    const searchVal = dqSearchInput.value.trim();
    processedData = filterData(combinedData, dateFromVal, dateToVal, searchVal);
    buildTable(processedData);
  });
  
  dqDateTo.addEventListener("change", () => {
    if (!combinedData.length) return;
    const dateFromVal = dqDateFrom.value ? new Date(dqDateFrom.value) : null;
    const dateToVal = dqDateTo.value ? new Date(dqDateTo.value) : null;
    const searchVal = dqSearchInput.value.trim();
    processedData = filterData(combinedData, dateFromVal, dateToVal, searchVal);
    buildTable(processedData);
  });

  // Button events
  dqLoadBtn.addEventListener("click", loadData);
  dqProcessBtn.addEventListener("click", () => {
    dqProcessingPanel.style.display = dqProcessingPanel.style.display === "block" ? "none" : "block";
  });
  dqExportBtn.addEventListener("click", exportCSV);
  dqPrintBtn.addEventListener("click", printTable);
  dqUndoBtn.addEventListener("click", undoLastOperation);
  dqDeleteColBtn.addEventListener("click", deleteSelectedColumns);
  dqSelectAllRows.addEventListener("click", () => {
    dqTableBody.querySelectorAll("tr").forEach((tr, index) => {
      selectedRows.add(index);
      tr.classList.add("row-selected");
    });
  });
  dqDeselectAllRows.addEventListener("click", () => {
    clearRowSelection();
  });
  dqDeleteRowsBtn.addEventListener("click", deleteSelectedRows);
  dqMakeSmartTableBtn.addEventListener("click", makeSmartTable);
  dqApplyFilterBtn.addEventListener("click", applyColumnFilter);
  dqClearFilterBtn.addEventListener("click", clearColumnFilter);

  // Set default dates (last 30 days)
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);
  
  dqDateFrom.valueAsDate = lastMonth;
  dqDateTo.valueAsDate = today;
})();

