// ===== 戒烟记录应用 =====

class QuitSmokingApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentQuantity = 0;
        this.currentUser = null;
        this.users = this.loadUsers();
        this.records = this.loadRecords();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
        this.renderCalendar();
        this.updateStats();
        this.renderChart();
        this.selectDate(new Date());
    }

    // ===== 用户管理 =====
    loadUsers() {
        const saved = localStorage.getItem('smokingUsers');
        const users = saved ? JSON.parse(saved) : {};
        // 默认添加管理员账号
        if (!users.admin) {
            users.admin = {
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            this.saveUsers(users);
        }
        return users;
    }

    saveUsers(users) {
        localStorage.setItem('smokingUsers', JSON.stringify(users));
    }

    register(username, password) {
        if (this.users[username]) {
            return { success: false, message: '用户名已存在' };
        }
        
        this.users[username] = {
            password: password,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        this.saveUsers(this.users);
        return { success: true, message: '注册成功' };
    }

    login(username, password) {
        const user = this.users[username];
        if (!user) {
            return { success: false, message: '用户名不存在' };
        }
        if (user.password !== password) {
            return { success: false, message: '密码错误' };
        }
        
        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        this.updateAuthUI();
        this.renderSocialSection();
        return { success: true, message: '登录成功' };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        this.hideSocialSection();
    }

    checkAuth() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser && this.users[savedUser]) {
            this.currentUser = savedUser;
            this.updateAuthUI();
            this.renderSocialSection();
        }
    }

    updateAuthUI() {
        const currentUserEl = document.getElementById('currentUser');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const socialSection = document.getElementById('socialSection');
        
        if (this.currentUser) {
            currentUserEl.textContent = `欢迎，${this.currentUser}`;
            currentUserEl.style.display = 'block';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            socialSection.style.display = 'block';
        } else {
            currentUserEl.style.display = 'none';
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            socialSection.style.display = 'none';
        }
    }

    // ===== 数据存储 =====
    loadRecords() {
        const saved = localStorage.getItem('smokingRecords');
        return saved ? JSON.parse(saved) : {};
    }

    saveRecords() {
        localStorage.setItem('smokingRecords', JSON.stringify(this.records));
    }

    getUserRecords(username) {
        if (!this.records[username]) {
            this.records[username] = {};
        }
        return this.records[username];
    }

    // ===== 事件绑定 =====
    bindEvents() {
        // 月份导航
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // 数量选择
        document.getElementById('decreaseBtn').addEventListener('click', () => {
            if (this.currentQuantity >= 0.5) {
                this.currentQuantity -= 0.5;
                this.updateQuantityDisplay();
            }
        });

        document.getElementById('increaseBtn').addEventListener('click', () => {
            this.currentQuantity += 0.5;
            this.updateQuantityDisplay();
        });

        // 保存记录
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveRecord();
        });

        // 登录/注册模态框
        const authModal = document.getElementById('authModal');
        const loginBtn = document.getElementById('loginBtn');
        const closeModal = document.getElementById('closeModal');
        const logoutBtn = document.getElementById('logoutBtn');

        loginBtn.addEventListener('click', () => {
            authModal.classList.add('show');
        });

        closeModal.addEventListener('click', () => {
            authModal.classList.remove('show');
        });

        // 点击模态框外部关闭
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.remove('show');
            }
        });

        // 切换登录/注册标签
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
                tab.classList.add('active');
                document.getElementById(`${tabName}Form`).style.display = 'flex';
                document.getElementById('modalTitle').textContent = tabName === 'login' ? '登录' : '注册';
            });
        });

        // 登录表单提交
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const result = this.login(username, password);
            if (result.success) {
                authModal.classList.remove('show');
                this.showToast(result.message);
            } else {
                alert(result.message);
            }
        });

        // 注册表单提交
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致');
                return;
            }
            
            const result = this.register(username, password);
            if (result.success) {
                alert(result.message);
                // 切换到登录表单
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.style.display = 'none');
                document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
                document.getElementById('loginForm').style.display = 'flex';
                document.getElementById('modalTitle').textContent = '登录';
                // 填充用户名
                document.getElementById('loginUsername').value = username;
            } else {
                alert(result.message);
            }
        });

        // 退出登录
        logoutBtn.addEventListener('click', () => {
            this.logout();
            this.showToast('已退出登录');
        });
    }

    // ===== 日历渲染 =====
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 更新月份标题
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                           '七月', '八月', '九月', '十月', '十一月', '十二月'];
        document.getElementById('currentMonth').textContent = `${year}年 ${monthNames[month]}`;

        // 获取日历数据
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        // 上个月的日期
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // 渲染上个月的日期（灰色显示）
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day other-month';
            dayDiv.textContent = prevMonthLastDay - i;
            calendarDays.appendChild(dayDiv);
        }

        // 渲染当月日期
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;

            const dateKey = this.getDateKey(new Date(year, month, day));
            const dayRecords = this.records[dateKey];

            // 检查是否是今天
            if (year === today.getFullYear() && 
                month === today.getMonth() && 
                day === today.getDate()) {
                dayDiv.classList.add('today');
            }

            // 检查是否有记录
            if (dayRecords && dayRecords.length > 0) {
                dayDiv.classList.add('has-record');
                const total = dayRecords.reduce((sum, r) => sum + r.quantity, 0);
                const countSpan = document.createElement('span');
                countSpan.className = 'day-count';
                countSpan.textContent = total > 0 ? total : '';
                dayDiv.appendChild(countSpan);
            }

            // 检查是否选中
            if (year === this.selectedDate.getFullYear() && 
                month === this.selectedDate.getMonth() && 
                day === this.selectedDate.getDate()) {
                dayDiv.classList.add('selected');
            }

            dayDiv.addEventListener('click', () => {
                this.selectDate(new Date(year, month, day));
            });

            calendarDays.appendChild(dayDiv);
        }

        // 渲染下个月的日期（填充剩余格子）
        const totalCells = startDayOfWeek + daysInMonth;
        const remainingCells = 42 - totalCells; // 6行 x 7列 = 42
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day other-month';
            dayDiv.textContent = day;
            calendarDays.appendChild(dayDiv);
        }
    }

    // ===== 日期选择 =====
    selectDate(date) {
        this.selectedDate = date;
        this.currentQuantity = 0;
        this.updateQuantityDisplay();
        
        // 更新选中日期显示
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        document.getElementById('selectedDate').textContent = date.toLocaleDateString('zh-CN', options);
        
        // 清空备注
        document.getElementById('noteInput').value = '';
        
        // 重新渲染日历以更新选中状态
        this.renderCalendar();
        
        // 显示当日记录
        this.renderDayRecords();
    }

    // ===== 数量显示更新 =====
    updateQuantityDisplay() {
        document.getElementById('quantity').textContent = 
            this.currentQuantity % 1 === 0 ? this.currentQuantity : this.currentQuantity.toFixed(1);
    }

    // ===== 保存记录 =====
    saveRecord() {
        if (!this.currentUser) {
            alert('请先登录');
            return;
        }

        if (this.currentQuantity < 0) {
            alert('抽烟数量不能为负数');
            return;
        }

        const userRecords = this.getUserRecords(this.currentUser);
        const dateKey = this.getDateKey(this.selectedDate);
        const note = document.getElementById('noteInput').value.trim();
        
        if (!userRecords[dateKey]) {
            userRecords[dateKey] = [];
        }

        const record = {
            id: Date.now(),
            quantity: this.currentQuantity,
            note: note,
            timestamp: new Date().toISOString()
        };

        userRecords[dateKey].push(record);
        this.saveRecords();
        
        // 重置输入
        this.currentQuantity = 0;
        this.updateQuantityDisplay();
        document.getElementById('noteInput').value = '';
        
        // 更新界面
        this.renderCalendar();
        this.renderDayRecords();
        this.updateStats();
        this.renderChart();
        this.renderSocialSection();
        
        // 显示成功提示
        this.showToast('记录已保存');
    }

    // ===== 删除记录 =====
    deleteRecord(dateKey, recordId) {
        if (!this.currentUser) {
            alert('请先登录');
            return;
        }

        const userRecords = this.getUserRecords(this.currentUser);
        if (userRecords[dateKey]) {
            userRecords[dateKey] = userRecords[dateKey].filter(r => r.id !== recordId);
            if (userRecords[dateKey].length === 0) {
                delete userRecords[dateKey];
            }
            this.saveRecords();
            this.renderCalendar();
            this.renderDayRecords();
            this.updateStats();
            this.renderChart();
            this.renderSocialSection();
            this.showToast('记录已删除');
        }
    }

    // ===== 渲染当日记录 =====
    renderDayRecords() {
        if (!this.currentUser) {
            const recordsList = document.getElementById('recordsList');
            recordsList.innerHTML = '<div class="empty-state">请先登录</div>';
            return;
        }

        const userRecords = this.getUserRecords(this.currentUser);
        const dateKey = this.getDateKey(this.selectedDate);
        const dayRecords = userRecords[dateKey] || [];
        const recordsList = document.getElementById('recordsList');
        
        if (dayRecords.length === 0) {
            recordsList.innerHTML = '<div class="empty-state">暂无记录</div>';
            return;
        }

        recordsList.innerHTML = dayRecords.map(record => {
            const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const quantity = record.quantity % 1 === 0 ? record.quantity : record.quantity.toFixed(1);
            
            return `
                <div class="record-item">
                    <div class="record-info">
                        <div class="record-time">${time}</div>
                        <div class="record-count">${quantity} 根</div>
                        ${record.note ? `<div class="record-note">${record.note}</div>` : ''}
                    </div>
                    <button class="delete-btn" data-id="${record.id}" title="删除">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        // 绑定删除事件
        recordsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = parseInt(e.currentTarget.dataset.id);
                this.deleteRecord(dateKey, recordId);
            });
        });
    }

    // ===== 更新统计 =====
    updateStats() {
        const today = new Date();
        
        if (!this.currentUser) {
            // 未登录时显示默认值
            document.getElementById('todayCount').textContent = '0';
            document.getElementById('weekCount').textContent = '0';
            document.getElementById('monthCount').textContent = '0';
            document.getElementById('quitDays').textContent = '0';
            return;
        }

        const userRecords = this.getUserRecords(this.currentUser);
        const todayKey = this.getDateKey(today);
        
        // 今日统计
        const todayRecords = userRecords[todayKey] || [];
        const todayCount = todayRecords.reduce((sum, r) => sum + r.quantity, 0);
        document.getElementById('todayCount').textContent = 
            todayCount % 1 === 0 ? todayCount : todayCount.toFixed(1);

        // 本周统计
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        let weekCount = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const key = this.getDateKey(date);
            if (userRecords[key]) {
                weekCount += userRecords[key].reduce((sum, r) => sum + r.quantity, 0);
            }
        }
        document.getElementById('weekCount').textContent = 
            weekCount % 1 === 0 ? weekCount : weekCount.toFixed(1);

        // 本月统计
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        let monthCount = 0;
        for (const [key, records] of Object.entries(userRecords)) {
            const recordDate = new Date(key);
            if (recordDate >= monthStart && recordDate <= today) {
                monthCount += records.reduce((sum, r) => sum + r.quantity, 0);
            }
        }
        document.getElementById('monthCount').textContent = 
            monthCount % 1 === 0 ? monthCount : monthCount.toFixed(1);

        // 抽烟天数（有记录的天数）
        let smokingDays = 0;
        for (const [key, records] of Object.entries(userRecords)) {
            if (records.length > 0) {
                const dayTotal = records.reduce((sum, r) => sum + r.quantity, 0);
                if (dayTotal > 0) {
                    smokingDays++;
                }
            }
        }
        document.getElementById('quitDays').textContent = smokingDays;
    }

    // ===== 渲染趋势图表 =====
    renderChart() {
        const canvas = document.getElementById('trendChart');
        const ctx = canvas.getContext('2d');
        
        // 设置canvas尺寸
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        
        if (!this.currentUser) {
            // 未登录时显示提示
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#C7C7CC';
            ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('请先登录', width / 2, height / 2);
            return;
        }

        const userRecords = this.getUserRecords(this.currentUser);
        
        // 获取近7天数据
        const data = [];
        const labels = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const key = this.getDateKey(date);
            const records = userRecords[key] || [];
            const total = records.reduce((sum, r) => sum + r.quantity, 0);
            data.push(total);
            labels.push(date.getDate() + '日');
        }

        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        if (data.every(d => d === 0)) {
            // 没有数据时显示提示
            ctx.fillStyle = '#C7C7CC';
            ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据，开始记录吧！', width / 2, height / 2);
            return;
        }

        const maxValue = Math.max(...data, 1);
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // 绘制网格线
        ctx.strokeStyle = '#E5E5EA';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            
            // Y轴标签
            ctx.fillStyle = '#86868B';
            ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'right';
            const value = maxValue * (1 - i / 4);
            ctx.fillText(value % 1 === 0 ? value : value.toFixed(1), padding.left - 8, y + 3);
        }

        // 绘制折线
        ctx.strokeStyle = '#007AFF';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * index;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // 绘制数据点
        data.forEach((value, index) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * index;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            
            // 外圈
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // 内圈
            ctx.fillStyle = '#007AFF';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // X轴标签
            ctx.fillStyle = '#86868B';
            ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x, height - 10);
        });

        // 绘制渐变填充
        ctx.fillStyle = 'rgba(0, 122, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);
        data.forEach((value, index) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * index;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(width - padding.right, padding.top + chartHeight);
        ctx.closePath();
        ctx.fill();
    }

    // ===== 社交功能 =====
    renderSocialSection() {
        if (!this.currentUser) return;

        const friendsList = document.getElementById('friendsList');
        const friendsRecordsList = document.getElementById('friendsRecordsList');

        // 渲染好友列表
        const users = Object.keys(this.users);
        friendsList.innerHTML = users.map(username => {
            if (username === this.currentUser) return '';
            return `
                <div class="friend-item" data-username="${username}">
                    <div class="friend-avatar">${username[0].toUpperCase()}</div>
                    <div class="friend-name">${username}</div>
                </div>
            `;
        }).join('');

        // 绑定好友点击事件
        friendsList.querySelectorAll('.friend-item').forEach(item => {
            item.addEventListener('click', () => {
                const username = item.dataset.username;
                this.showFriendRecords(username);
                // 更新选中状态
                friendsList.querySelectorAll('.friend-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // 默认显示第一个好友的记录
        if (users.length > 1) {
            const firstFriend = users.find(username => username !== this.currentUser);
            if (firstFriend) {
                this.showFriendRecords(firstFriend);
                const firstFriendItem = friendsList.querySelector(`[data-username="${firstFriend}"]`);
                if (firstFriendItem) {
                    firstFriendItem.classList.add('active');
                }
            }
        }
    }

    showFriendRecords(username) {
        const friendsRecordsList = document.getElementById('friendsRecordsList');
        const friendRecords = this.getUserRecords(username);

        // 收集所有记录并按时间排序
        const allRecords = [];
        for (const [dateKey, records] of Object.entries(friendRecords)) {
            records.forEach(record => {
                allRecords.push({
                    ...record,
                    date: dateKey
                });
            });
        }

        // 按时间降序排序
        allRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (allRecords.length === 0) {
            friendsRecordsList.innerHTML = '<div class="empty-state">暂无记录</div>';
            return;
        }

        // 显示最近的10条记录
        const recentRecords = allRecords.slice(0, 10);
        friendsRecordsList.innerHTML = recentRecords.map(record => {
            const time = new Date(record.timestamp).toLocaleString('zh-CN', { 
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const quantity = record.quantity % 1 === 0 ? record.quantity : record.quantity.toFixed(1);
            
            return `
                <div class="friend-record-item">
                    <div class="friend-record-header">
                        <span class="friend-record-user">${username}</span>
                        <span class="friend-record-time">${time}</span>
                    </div>
                    <div class="friend-record-count">抽了 ${quantity} 根烟</div>
                    ${record.note ? `<div class="friend-record-note">${record.note}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    hideSocialSection() {
        const socialSection = document.getElementById('socialSection');
        socialSection.style.display = 'none';
    }

    // ===== 工具方法 =====
    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    showToast(message) {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // 显示动画
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.quitSmokingApp = new QuitSmokingApp();
});

// 窗口大小改变时重新渲染图表
window.addEventListener('resize', () => {
    const app = window.quitSmokingApp;
    if (app) {
        app.renderChart();
    }
});
