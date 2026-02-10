/**
 * Klinik Kesihatan Lunas - Dashboard Module
 * Handles statistics display, charts, and activity feed
 */

const Dashboard = {
    charts: {},
    stats: {},

    /**
     * Load dashboard
     */
    async load() {
        const content = document.getElementById('mainContent');
        
        content.innerHTML = `
            <!-- Hero Statistics -->
            <div class="hero-stats">
                ${this.renderStatCards()}
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-card">
                    <h3>📈 Trend Pendaftaran Mingguan</h3>
                    <p>Perbandingan pendaftaran MCH vs OPD untuk 7 hari terakhir</p>
                    <div class="chart-wrapper">
                        <canvas id="weeklyChart"></canvas>
                    </div>
                </div>

                <div class="chart-card">
                    <h3>🎯 Status Temujanji</h3>
                    <p>Pecahan status temujanji hari ini</p>
                    <div class="chart-wrapper">
                        <canvas id="statusChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Activity Feed -->
            <div class="activity-section">
                <div class="activity-header">
                    <h3>🕐 Aktiviti Terkini</h3>
                    <div class="activity-filters">
                        <button class="filter-btn active" onclick="Dashboard.filterActivity('all')">Semua</button>
                        <button class="filter-btn" onclick="Dashboard.filterActivity('today')">Hari Ini</button>
                        <button class="filter-btn" onclick="Dashboard.filterActivity('week')">Minggu Ini</button>
                    </div>
                </div>
                <div id="activityFeed">
                    ${this.renderActivityFeed()}
                </div>
            </div>
        `;

        // Load actual data and render
        await this.loadStats();
        this.renderCharts();
    },

    /**
     * Render statistics cards
     */
    renderStatCards() {
        const stats = this.getStatsFromStorage();

        return `
            <div class="hero-stat-card mch">
                <div class="stat-header">
                    <div class="stat-icon">👶</div>
                    <div class="stat-trend">
                        <span>↑ ${stats.mchTrend}%</span>
                    </div>
                </div>
                <div class="stat-label">Ibu & Anak (MCH)</div>
                <div class="stat-value" id="statMCH">${stats.mch}</div>
                <div class="stat-description">pesakit hari ini</div>
                <div class="stat-footer">
                    <span>Bulan ini: <strong id="statMCHMonth">${stats.mchMonth}</strong></span>
                    <span>↑ dari semalam</span>
                </div>
            </div>

            <div class="hero-stat-card opd">
                <div class="stat-header">
                    <div class="stat-icon">🏥</div>
                    <div class="stat-trend">
                        <span>↑ ${stats.opdTrend}%</span>
                    </div>
                </div>
                <div class="stat-label">Pesakit Luar (OPD)</div>
                <div class="stat-value" id="statOPD">${stats.opd}</div>
                <div class="stat-description">pesakit hari ini</div>
                <div class="stat-footer">
                    <span>Bulan ini: <strong id="statOPDMonth">${stats.opdMonth}</strong></span>
                    <span>↑ dari semalam</span>
                </div>
            </div>

            <div class="hero-stat-card success">
                <div class="stat-header">
                    <div class="stat-icon">✅</div>
                    <div class="stat-trend">
                        <span>↑ ${stats.completedTrend}%</span>
                    </div>
                </div>
                <div class="stat-label">Temujanji Selesai</div>
                <div class="stat-value" id="statCompleted">${stats.completed}</div>
                <div class="stat-description">daripada ${stats.totalAppointments} temujanji</div>
                <div class="stat-footer">
                    <span>Kadar: <strong>${stats.completionRate}%</strong></span>
                    <span>Sangat baik</span>
                </div>
            </div>

            <div class="hero-stat-card warning">
                <div class="stat-header">
                    <div class="stat-icon">⏰</div>
                    <div class="stat-trend ${stats.pendingTrend > 0 ? 'down' : ''}">
                        <span>${stats.pendingTrend > 0 ? '↑' : '↓'} ${Math.abs(stats.pendingTrend)}%</span>
                    </div>
                </div>
                <div class="stat-label">Menunggu</div>
                <div class="stat-value" id="statPending">${stats.pending}</div>
                <div class="stat-description">temujanji aktif</div>
                <div class="stat-footer">
                    <span>Purata: <strong>15 min</strong></span>
                    <span>Normal</span>
                </div>
            </div>

            <div class="hero-stat-card error">
                <div class="stat-header">
                    <div class="stat-icon">❌</div>
                    <div class="stat-trend down">
                        <span>↓ ${stats.missedTrend}%</span>
                    </div>
                </div>
                <div class="stat-label">Tidak Hadir</div>
                <div class="stat-value" id="statMissed">${stats.missed}</div>
                <div class="stat-description">terlepas temujanji</div>
                <div class="stat-footer">
                    <span>Kadar: <strong>${stats.missedRate}%</strong></span>
                    <span>↓ bertambah baik</span>
                </div>
            </div>

            <div class="hero-stat-card purple">
                <div class="stat-header">
                    <div class="stat-icon">🌍</div>
                    <div class="stat-trend">
                        <span>↑ ${stats.luarKawasanTrend}%</span>
                    </div>
                </div>
                <div class="stat-label">Luar Kawasan</div>
                <div class="stat-value" id="statLuarKawasan">${stats.luarKawasan}</div>
                <div class="stat-description">pesakit dari luar</div>
                <div class="stat-footer">
                    <span>Peratus: <strong>${stats.luarKawasanRate}%</strong></span>
                    <span>↑ dari purata</span>
                </div>
            </div>
        `;
    },

    /**
     * Get statistics from localStorage (demo data)
     */
    getStatsFromStorage() {
        const today = Utils.getCurrentDate();
        let stats = Utils.getFromStorage('dailyStats', {});

        // Reset if different day
        if (stats.date !== today) {
            stats = {
                date: today,
                mch: 0,
                opd: 0,
                completed: 0,
                pending: 0,
                missed: 0,
                luarKawasan: 0,
                totalAppointments: 0,
                mchMonth: 0,
                opdMonth: 0,
                mchTrend: 12,
                opdTrend: 8,
                completedTrend: 15,
                pendingTrend: 3,
                missedTrend: 25,
                luarKawasanTrend: 10,
                completionRate: 0,
                missedRate: 0,
                luarKawasanRate: 0
            };
            Utils.saveToStorage('dailyStats', stats);
        }

        // Calculate rates
        if (stats.totalAppointments > 0) {
            stats.completionRate = ((stats.completed / stats.totalAppointments) * 100).toFixed(1);
            stats.missedRate = ((stats.missed / stats.totalAppointments) * 100).toFixed(1);
        }

        const totalPatients = stats.mch + stats.opd;
        if (totalPatients > 0) {
            stats.luarKawasanRate = ((stats.luarKawasan / totalPatients) * 100).toFixed(1);
        }

        return stats;
    },

    /**
     * Load actual stats from API
     */
    async loadStats() {
        try {
            // In production, fetch from Google Sheets
            // const stats = await API.getStats('all', Utils.getCurrentDate());
            
            // For now, use localStorage
            this.stats = this.getStatsFromStorage();
            this.updateStatsDisplay();
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    /**
     * Update statistics display
     */
    updateStatsDisplay() {
        const stats = this.stats;
        
        const elements = {
            statMCH: stats.mch,
            statOPD: stats.opd,
            statCompleted: stats.completed,
            statPending: stats.pending,
            statMissed: stats.missed,
            statLuarKawasan: stats.luarKawasan,
            statMCHMonth: stats.mchMonth,
            statOPDMonth: stats.opdMonth
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    },

    /**
     * Increment stat counter
     */
    incrementStat(type) {
        const stats = this.getStatsFromStorage();
        
        if (type === 'mch') {
            stats.mch++;
            stats.mchMonth++;
        } else if (type === 'opd') {
            stats.opd++;
            stats.opdMonth++;
        } else if (type === 'completed') {
            stats.completed++;
            stats.totalAppointments++;
        } else if (type === 'pending') {
            stats.pending++;
            stats.totalAppointments++;
        } else if (type === 'luarKawasan') {
            stats.luarKawasan++;
        }

        Utils.saveToStorage('dailyStats', stats);
        this.updateStatsDisplay();
    },

    /**
     * Render charts
     */
    renderCharts() {
        this.renderWeeklyChart();
        this.renderStatusChart();
    },

    /**
     * Weekly trend chart
     */
    renderWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        // Demo data - in production, fetch from Google Sheets
        const data = {
            labels: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
            mch: [12, 19, 15, 17, 22, 0, 0],
            opd: [28, 34, 31, 38, 42, 0, 0]
        };

        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }

        this.charts.weekly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'MCH',
                    data: data.mch,
                    borderColor: '#E87D9E',
                    backgroundColor: 'rgba(232, 125, 158, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#E87D9E',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }, {
                    label: 'OPD',
                    data: data.opd,
                    borderColor: '#4A8280',
                    backgroundColor: 'rgba(74, 130, 128, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#4A8280',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 13,
                                weight: '600',
                                family: "'Inter', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        borderColor: '#fff',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: { size: 12, family: "'Inter', sans-serif" },
                            color: '#6B7C7C'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: { size: 12, family: "'Inter', sans-serif" },
                            color: '#6B7C7C'
                        }
                    }
                }
            }
        });
    },

    /**
     * Status pie chart
     */
    renderStatusChart() {
        const ctx = document.getElementById('statusChart');
        if (!ctx) return;

        const stats = this.getStatsFromStorage();

        if (this.charts.status) {
            this.charts.status.destroy();
        }

        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Selesai', 'Menunggu', 'Tidak Hadir'],
                datasets: [{
                    data: [stats.completed, stats.pending, stats.missed],
                    backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 13,
                                weight: '600',
                                family: "'Inter', sans-serif"
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        return {
                                            text: `${label}: ${value} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Render activity feed
     */
    renderActivityFeed() {
        // Demo data - in production, fetch from logs
        const activities = Auth.getActivityLogs(10);

        if (!activities || activities.length === 0) {
            return '<p style="text-align: center; color: #6B7C7C;">Tiada aktiviti terkini</p>';
        }

        let html = '';
        activities.forEach(activity => {
            const icon = this.getActivityIcon(activity.event);
            const time = this.getRelativeTime(activity.timestamp);
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon ${icon.class}">${icon.emoji}</div>
                    <div class="activity-content">
                        <h4>${this.getActivityTitle(activity)}</h4>
                        <p>${this.getActivityDescription(activity)}</p>
                    </div>
                    <div class="activity-time">${time}</div>
                </div>
            `;
        });

        return html;
    },

    getActivityIcon(event) {
        const icons = {
            login: { emoji: '🔐', class: 'opd' },
            logout: { emoji: '🚪', class: 'opd' },
            register_mch: { emoji: '👶', class: 'mch' },
            register_opd: { emoji: '🏥', class: 'opd' },
            create_appointment: { emoji: '📅', class: 'appointment' },
            password_change: { emoji: '🔑', class: 'opd' }
        };
        return icons[event] || { emoji: '📋', class: 'opd' };
    },

    getActivityTitle(activity) {
        const titles = {
            login: 'Log Masuk',
            logout: 'Log Keluar',
            register_mch: 'Pendaftaran MCH',
            register_opd: 'Pendaftaran OPD',
            create_appointment: 'Temujanji Dibuat',
            password_change: 'Password Ditukar'
        };
        return titles[activity.event] || activity.event;
    },

    getActivityDescription(activity) {
        if (activity.data) {
            if (activity.data.patientName) {
                return activity.data.patientName;
            }
            if (activity.data.username) {
                return `Oleh ${activity.data.username}`;
            }
        }
        return activity.user;
    },

    getRelativeTime(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Baru sahaja';
        if (diffMins < 60) return `${diffMins} min yang lalu`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} hari yang lalu`;
    },

    /**
     * Filter activity feed
     */
    filterActivity(filter) {
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Filter activities (implement actual filtering)
        // For now, just reload
        const feed = document.getElementById('activityFeed');
        if (feed) {
            feed.innerHTML = this.renderActivityFeed();
        }
    },

    /**
     * Refresh dashboard
     */
    async refresh() {
        await this.loadStats();
        this.renderCharts();
        
        const feed = document.getElementById('activityFeed');
        if (feed) {
            feed.innerHTML = this.renderActivityFeed();
        }

        Utils.showAlert('Dashboard dikemaskini', 'success', 1000);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}
