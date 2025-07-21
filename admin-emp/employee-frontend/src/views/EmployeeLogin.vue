<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Employee Login</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="username" type="text" required placeholder="Enter username" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required placeholder="Enter password" />
        </div>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'EmployeeLogin',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      this.error = ''
      if (!this.username || !this.password) {
        this.error = 'Please fill in all fields'
        return
      }
      this.loading = true
      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          username: this.username,
          password: this.password,
          role: 'employee'
        })
        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
          this.$router.push('/dashboard')
        } else {
          this.error = 'Invalid credentials'
        }
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed'
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
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin-bottom: 20px;
  color: #2d3748;
  font-weight: 600;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #4299e1;
}

.btn {
  width: 100%;
  padding: 12px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  background: #3182ce;
}

.error-message {
  margin-top: 15px;
  color: #e53e3e;
  font-weight: 600;
  text-align: center;
}
</style>
