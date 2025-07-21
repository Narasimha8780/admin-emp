<template>
  <div class="employee-dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Employee Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ user.username }}</span>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <section class="activity-section">
        <h2>My Activity</h2>
        <div v-if="activity">
          <p><strong>Screen Time:</strong> {{ formatTime(activity.screenTime) }}</p>
          <p><strong>Idle Time:</strong> {{ formatTime(activity.idleTime) }}</p>
          <p><strong>Active Time:</strong> {{ formatTime(activity.activeTime) }}</p>
          <h3>Applications Used:</h3>
          <ul>
            <li v-for="app in activity.applications" :key="app.name">
              {{ app.name }} - {{ app.timeSpent }} minutes
            </li>
          </ul>
        </div>
        <div v-else>
          <p>No activity data available.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'EmployeeDashboard',
  data() {
    return {
      user: {},
      activity: null
    }
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!this.user.id || this.user.role !== 'employee') {
      this.$router.push('/')
      return
    }
    await this.loadActivity()
  },
  methods: {
    async loadActivity() {
      try {
        const response = await axios.get(`http://localhost:3000/api/activity/${this.user.id}`)
        if (response.data.length > 0) {
          this.activity = response.data[0]
        }
      } catch (error) {
        console.error('Error loading activity:', error)
      }
    },
    formatTime(minutes) {
      if (!minutes) return '0 minutes'
      const hrs = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hrs}h ${mins}m`
    },
    logout() {
      localStorage.removeItem('user')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.employee-dashboard {
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
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
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
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.activity-section h2 {
  margin-bottom: 20px;
  color: #2d3748;
  font-weight: 600;
}

.activity-section p {
  margin-bottom: 10px;
  color: #4a5568;
}

.activity-section ul {
  list-style: none;
  padding-left: 0;
}

.activity-section li {
  margin-bottom: 5px;
  color: #4a5568;
}
</style>
