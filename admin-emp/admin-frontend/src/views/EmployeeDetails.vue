<template>
  <div class="employee-details">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Employee Details</h1>
        <button @click="goBack" class="back-btn">Back</button>
      </div>
    </header>

    <div class="details-content">
      <div class="employee-info-card">
        <div class="employee-avatar">
          {{ employee.username ? employee.username.charAt(0).toUpperCase() : 'U' }}
        </div>
        <div class="employee-basic-info">
          <h2>{{ employee.username }}</h2>
          <p><strong>Role:</strong> {{ employee.role }}</p>
          <p><strong>Team Leader:</strong> {{ tlName }}</p>
          <p><strong>Status:</strong> 
            <span :class="['status-badge', currentStatus]">{{ currentStatus }}</span>
          </p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <h3>{{ totalScreenTime }}h</h3>
            <p>Total Screen Time</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">😴</div>
          <div class="stat-info">
            <h3>{{ totalIdleTime }}h</h3>
            <p>Total Idle Time</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h3>{{ totalActiveTime }}h</h3>
            <p>Total Active Time</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📱</div>
          <div class="stat-info">
            <h3>{{ totalApps }}</h3>
            <p>Apps Used</p>
          </div>
        </div>
      </div>

      <div class="details-grid">
        <section class="activity-section">
          <h3>Recent Activity Logs</h3>
          <div class="activity-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Screen Time</th>
                  <th>Idle Time</th>
                  <th>Active Time</th>
                  <th>Apps Used</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in activities" :key="activity._id">
                  <td>{{ formatDate(activity.date) }}</td>
                  <td>{{ Math.round(activity.screenTime / 60 * 10) / 10 }}h</td>
                  <td>{{ Math.round(activity.idleTime / 60 * 10) / 10 }}h</td>
                  <td>{{ Math.round(activity.activeTime / 60 * 10) / 10 }}h</td>
                  <td>
                    <div class="apps-list">
                      <span v-for="app in activity.applications" :key="app.name" class="app-tag">
                        {{ app.name }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="activities.length === 0" class="no-data">
              No activity data available
            </div>
          </div>
        </section>

        <section class="apps-section">
          <h3>App Installations</h3>
          <div class="app-installs">
            <div v-for="install in appInstalls" :key="install._id" class="install-item">
              <div class="install-info">
                <h4>{{ install.appName }}</h4>
                <p>{{ formatDate(install.installTime) }}</p>
                <div class="system-info">
                  <span>OS: {{ install.systemInfo?.os || 'Unknown' }}</span>
                  <span>Version: {{ install.systemInfo?.version || 'Unknown' }}</span>
                </div>
              </div>
            </div>
            <div v-if="appInstalls.length === 0" class="no-data">
              No app installations recorded
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'EmployeeDetails',
  data() {
    return {
      employee: {},
      activities: [],
      appInstalls: [],
      tlName: '',
      currentStatus: 'offline'
    }
  },
  computed: {
    totalScreenTime() {
      const total = this.activities.reduce((sum, activity) => sum + (activity.screenTime || 0), 0)
      return Math.round(total / 60 * 10) / 10
    },
    totalIdleTime() {
      const total = this.activities.reduce((sum, activity) => sum + (activity.idleTime || 0), 0)
      return Math.round(total / 60 * 10) / 10
    },
    totalActiveTime() {
      const total = this.activities.reduce((sum, activity) => sum + (activity.activeTime || 0), 0)
      return Math.round(total / 60 * 10) / 10
    },
    totalApps() {
      const apps = new Set()
      this.activities.forEach(activity => {
        activity.applications?.forEach(app => apps.add(app.name))
      })
      return apps.size
    }
  },
  async mounted() {
    const employeeId = this.$route.params.id
    await this.loadEmployee(employeeId)
    await this.loadActivities(employeeId)
    await this.loadAppInstalls(employeeId)
  },
  methods: {
    async loadEmployee(id) {
      try {
        const response = await axios.get(`http://localhost:3000/api/users/employee`)
        this.employee = response.data.find(emp => emp._id === id) || {}
        
        if (this.employee.tlId) {
          const tlResponse = await axios.get(`http://localhost:3000/api/users/tl`)
          const tl = tlResponse.data.find(t => t._id === this.employee.tlId)
          this.tlName = tl ? tl.username : 'Unknown'
        }
      } catch (error) {
        console.error('Error loading employee:', error)
      }
    },
    async loadActivities(employeeId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/activity/${employeeId}`)
        this.activities = response.data
        this.updateStatus()
      } catch (error) {
        console.error('Error loading activities:', error)
      }
    },
    async loadAppInstalls(employeeId) {
      try {
        const response = await axios.get('http://localhost:3000/api/app-installs')
        this.appInstalls = response.data.filter(install => install.employeeId === employeeId)
      } catch (error) {
        console.error('Error loading app installations:', error)
      }
    },
    updateStatus() {
      if (this.activities.length === 0) {
        this.currentStatus = 'offline'
        return
      }
      
      const latestActivity = this.activities[0]
      const now = new Date()
      const lastActivity = new Date(latestActivity.date)
      const diffMinutes = (now - lastActivity) / (1000 * 60)
      
      if (diffMinutes < 5) {
        this.currentStatus = 'active'
      } else if (diffMinutes < 30) {
        this.currentStatus = 'idle'
      } else {
        this.currentStatus = 'offline'
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString()
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.employee-details {
  min-height: 100vh;
  background: #f5f7fa;
}

.dashboard-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.header-content h1 {
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
}

.back-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #3182ce;
}

.details-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.employee-info-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
}

.employee-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4299e1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 32px;
}

.employee-basic-info h2 {
  color: #2d3748;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
}

.employee-basic-info p {
  color: #4a5568;
  margin-bottom: 8px;
  font-size: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #edf2f7;
  border-radius: 50%;
}

.stat-info h3 {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
}

.stat-info p {
  color: #718096;
  font-size: 14px;
}

.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.activity-section, .apps-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.activity-section h3, .apps-section h3 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #edf2f7;
}

.activity-table {
  overflow-x: auto;
}

.activity-table table {
  width: 100%;
  border-collapse: collapse;
}

.activity-table th,
.activity-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.activity-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.activity-table td {
  color: #4a5568;
}

.apps-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.app-tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.install-item {
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 15px;
}

.install-info h4 {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 5px;
}

.install-info p {
  color: #718096;
  font-size: 14px;
  margin-bottom: 10px;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.system-info span {
  color: #a0aec0;
  font-size: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.idle {
  background: #feebc8;
  color: #c05621;
}

.status-badge.offline {
  background: #e2e8f0;
  color: #4a5568;
}

.no-data {
  text-align: center;
  color: #a0aec0;
  padding: 40px;
  font-style: italic;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .employee-info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
