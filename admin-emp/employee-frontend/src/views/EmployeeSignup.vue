<template>
  <div class="signup-container">
    <div class="signup-card">
      <h2>Employee Signup</h2>
      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input id="firstName" v-model="firstName" type="text" required placeholder="Enter first name" />
        </div>
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input id="lastName" v-model="lastName" type="text" required placeholder="Enter last name" />
        </div>
        <div class="form-group">
          <label for="email">Email ID</label>
          <input id="email" v-model="email" type="email" required placeholder="Enter email" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required placeholder="Enter password" />
        </div>
        <button type="submit" :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Signing up...' : 'Sign Up' }}
        </button>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'EmployeeSignup',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      loading: false,
      error: '',
      success: ''
    }
  },
  methods: {
    async handleSignup() {
      this.error = ''
      this.success = ''
      if (!this.firstName || !this.lastName || !this.email || !this.password) {
        this.error = 'Please fill in all fields'
        return
      }
      this.loading = true
      try {
        const response = await axios.post('http://localhost:3000/api/signup', {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        })
        if (response.data.success) {
          this.success = 'Signup successful! You can now login.'
          this.firstName = ''
          this.lastName = ''
          this.email = ''
          this.password = ''
        } else {
          this.error = response.data.error || 'Signup failed'
        }
      } catch (err) {
        this.error = err.response?.data?.error || 'Signup failed'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.signup-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin-bottom: 20px;
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

.success-message {
  margin-top: 15px;
  color: #38a169;
  font-weight: 600;
  text-align: center;
}
</style>
