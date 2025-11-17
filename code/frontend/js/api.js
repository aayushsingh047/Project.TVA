const API_BASE = 'http://localhost:5000/api';

class APIServiceClass {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  async call(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    console.log("[v0] API Call:", url);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("[v0] API Error:", data);
        throw new Error(data.error || 'API Error');
      }

      console.log("[v0] API Success:", data);
      return data;
    } catch (error) {
      console.error("[v0] Fetch Error:", error);
      throw error;
    }
  }

  // Auth methods
  async requestOTP(email, phone) {
    return this.call('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, phone }),
    });
  }

  async verifyOTP(email, otp) {
    const result = await this.call('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (result.token) {
      this.setToken(result.token);
      this.user = result.user;
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  }

  // Rooms methods
  async getRooms() {
    return this.call('/rooms');
  }

  async getRoom(id) {
    return this.call(`/rooms/${id}`);
  }

  // Booking methods
  async createBooking(roomId, checkInDate, checkOutDate, totalPrice) {
    return this.call('/bookings', {
      method: 'POST',
      body: JSON.stringify({ roomId, checkInDate, checkOutDate, totalPrice }),
    });
  }

  async getBookings() {
    return this.call('/bookings');
  }

  // Payment methods
  async createPaymentIntent(amount, bookingId) {
    return this.call('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, bookingId }),
    });
  }

  // Auth state
  isLoggedIn() {
    return !!this.token && !!this.user;
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

// Singleton instance
const APIService = new APIServiceClass();
