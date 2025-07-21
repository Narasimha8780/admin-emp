<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Admin Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ user.username }}</span>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <h3>{{ totalEmployees }}</h3>
            <p>Total Employees</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👨‍💼</div>
          <div class="stat-info">
            <h3>{{ totalTLs }}</h3>
            <p>Team Leaders</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📱</div>
          <div class="stat-info">
            <h3>{{ recentInstalls.length }}</h3>
            <p>Recent App Installs</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <h3>{{ averageScreenTime }}h</h3>
            <p>Avg Screen Time</p>
          </div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-section">
          <h2>Team Leaders</h2>
          <div class="tl-list">
            <div v-for="tl in teamLeaders" :key="tl._id" class="tl-card">
              <div class="tl-info">
                <h4>{{ tl.username }}</h4>
                <p>{{ getEmployeeCount(tl._id) }} employees</p>
              </div>
              <button @click="viewTLEmployees(tl._id)" class="view-btn">
                View Employees
              </button>
            </div>
          </div>
        </div>

        <div class="dashboard-section">
          <h2>Recent App Installations</h2>
          <div class="install-list">
            <div v-for="install in recentInstalls" :key="install._id" class="install-item">
              <div class="install-info">
                <h4>{{ install.appName }}</h4>
                <p>{{ install.employeeId?.username || 'Unknown Employee' }}</p>
                <span class="install-time">{{ formatTime(install.installTime) }}</span>
              </div>
              <div class="install-status">
                <span class="status-badge new">New</span>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-section full-width">
          <h2>All Employees Activity</h2>
          <div class="employee-table">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Team Leader</th>
                  <th>Screen Time</th>
                  <th>Idle Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="employee in allEmployees" :key="employee._id">
                  <td>{{ employee.username }}</td>
                  <td>{{ getTLName(employee.tlId) }}</td>
                  <td>{{ getEmployeeScreenTime(employee._id) }}h</td>
                  <td>{{ getEmployeeIdleTime(employee._id) }}h</td>
                  <td>
                    <span :class="['status-badge', getEmployeeStatus(employee._id)]">
                      {{ getEmployeeStatus(employee._id) }}
                    </span>
                  </td>
                  <td>
                    <button @click="viewEmployeeDetails(employee._id)" class="action-btn">
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Employee Modal -->
    <div v-if="showEmployeeModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Employees under {{ selectedTLName }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-for="employee in selectedTLEmployees" :key="employee._id" class="employee-item">
            <div class="employee-info">
              <h4>{{ employee.username }}</h4>
              <p>Screen Time: {{ getEmployeeScreenTime(employee._id) }}h</p>
              <p>Status: {{ getEmployeeStatus(employee._id) }}</p>
            </div>
            <button @click="viewEmployeeDetails(employee._id)" class="view-details-btn">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { io } from 'socket.io-client'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      user: {},
      teamLeaders: [],
      allEmployees: [],
      recentInstalls: [],
      activities: [],
      socket: null,
      showEmployeeModal: false,
      selectedTLEmployees: [],
      selectedTLName: ''
    }
  },
  computed: {
    totalEmployees() {
      return this.allEmployees.length
    },
    totalTLs() {
      return this.teamLeaders.length
    },
    averageScreenTime() {
      if (this.activities.length === 0) return 0
      const total = this.activities.reduce((sum, activity) => sum + (activity.screenTime || 0), 0)
      return Math.round((total / this.activities.length) / 60 * 10) / 10
    }
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!this.user.id || this.user.role !== 'admin') {
      this.$router.push('/')
      return
    }

    await this.loadData()
    this.setupSocket()
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect()
    }
  },
  methods: {
    async loadData() {
      try {
        // Load team leaders
        const tlResponse = await axios.get('http://localhost:3000/api/users/tl')
        this.teamLeaders = tlResponse.data

        // Load all employees
        const empResponse = await axios.get('http://localhost:3000/api/users/employee')
        this.allEmployees = empResponse.data

        // Load recent app installations
        const installResponse = await axios.get('http://localhost:3000/api/app-installs')
        this.recentInstalls = installResponse.data.slice(0, 10)

        // Load activities for all employees
        for (const employee of this.allEmployees) {
          try {
            const activityResponse = await axios.get(`http://localhost:3000/api/activity/${employee._id}`)
            this.activities.push(...activityResponse.data)
          } catch (error) {
            console.error(`Error loading activity for ${employee.username}:`, error)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    },
    setupSocket() {
      this.socket = io('http://localhost:3000')
      this.socket.emit('join-room', 'admin')
      
      this.socket.on('activity-update', (data) => {
        console.log('Activity update received:', data)
        this.loadData() // Refresh data
      })
      
      this.socket.on('app-installed', (notification) => {
        console.log('App installation notification:', notification)
        this.recentInstalls.unshift(notification)
        if (this.recentInstalls.length > 10) {
          this.recentInstalls.pop()
        }
      })
    },
    getEmployeeCount(tlId) {
      return this.allEmployees.filter(emp => emp.tlId === tlId).length
    },
    getTLName(tlId) {
      const tl = this.teamLeaders.find(t => t._id === tlId)
      return tl ? tl.username : 'Unknown'
    },
    getEmployeeScreenTime(employeeId) {
      const activity = this.activities.find(a => a.employeeId === employeeId)
      return activity ? Math.round((activity.screenTime || 0) / 60 * 10) / 10 : 0
    },
    getEmployeeIdleTime(employeeId) {
      const activity = this.activities.find(a => a.employeeId === employeeId)
      return activity ? Math.round((activity.idleTime || 0) / 60 * 10) / 10 : 0
    },
    getEmployeeStatus(employeeId) {
      const activity = this.activities.find(a => a.employeeId === employeeId)
      if (!activity) return 'offline'
      
      const now = new Date()
      const lastActivity = new Date(activity.date)
      const diffMinutes = (now - lastActivity) / (1000 * 60)
      
      if (diffMinutes < 5) return 'active'
      if (diffMinutes < 30) return 'idle'
      return 'offline'
    },
    async viewTLEmployees(tlId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/tl/${tlId}/employees`)
        this.selectedTLEmployees = response.data
        this.selectedTLName = this.getTLName(tlId)
        this.showEmployeeModal = true
      } catch (error) {
        console.error('Error loading TL employees:', error)
      }
    },
    viewEmployeeDetails(employeeId) {
      this.$router.push(`/employee/${employeeId}`)
    },
    closeModal() {
      this.showEmployeeModal = false
      this.selectedTLEmployees = []
      this.selectedTLName = ''
    },
    formatTime(dateString) {
      return new Date(dateString).toLocaleString()
    },
    logout() {
      localStorage.removeItem('user')
      if (this.socket) {
        this.socket.disconnect()
      }
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  color: #4a5568;
  font-weight: 500;
}

.logout-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: #c53030;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.dashboard-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dashboard-section.full-width {
  grid-column: 1 / -1;
}

.dashboard-section h2 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #edf2f7;
}

.tl-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 10px;
}

.tl-info h4 {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 5px;
}

.tl-info p {
  color: #718096;
  font-size: 14px;
}

.view-btn, .action-btn, .view-details-btn {
  background: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.view-btn:hover, .action-btn:hover, .view-details-btn:hover {
  background: #3182ce;
}

.install-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.install-item:last-child {
  border-bottom: none;
}

.install-info h4 {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 5px;
}

.install-info p {
  color: #718096;
  font-size: 14px;
  margin-bottom: 3px;
}

.install-time {
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

.status-badge.new {
  background: #fed7d7;
  color: #c53030;
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

.employee-table {
  overflow-x: auto;
}

.employee-table table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table th,
.employee-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.employee-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.employee-table td {
  color: #4a5568;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #a0aec0;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-body {
  padding: 20px;
}

.employee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 10px;
}

.employee-info h4 {
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 5px;
}

.employee-info p {
  color: #718096;
  font-size: 14px;
  margin-bottom: 3px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>
