<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>Employee Monitoring System</h2>
        <p>Please sign in to continue</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            required
            placeholder="Enter your username"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            placeholder="Enter your password"
          />
        </div>
        
        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="credentials.role" required>
            <option value="">Select your role</option>
            <option value="admin">Admin</option>
            <option value="tl">Team Leader</option>
            <option value="employee">Employee</option>
          </select>
        </div>
        
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
      
      <div class="demo-credentials">
        <h4>Demo Credentials:</h4>
        <p><strong>Admin:</strong> admin / admin123</p>
        <p><strong>TL:</strong> tl1 / tl123</p>
        <p><strong>Employee:</strong> employee1 / emp123</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        username: '',
        password: '',
        role: ''
      },
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = ''
      
      try {
        const response = await axios.post('http://localhost:3000/api/login', this.credentials)
        
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
          
          // Redirect based on role
          if (response.data.user.role === 'admin') {
            this.$router.push('/admin')
          } else if (response.data.user.role === 'tl') {
            this.$router.push('/tl')
          } else {
            this.error = 'Employee login not available in admin panel'
          }
        }
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e1e1;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  background: #fdf2f2;
  border-radius: 5px;
  border: 1px solid #fecaca;
}

.demo-credentials {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #667eea;
}

.demo-credentials h4 {
  color: #333;
  margin-bottom: 10px;
  font-size: 14px;
}

.demo-credentials p {
  color: #666;
  font-size: 12px;
  margin-bottom: 5px;
}
</style>
