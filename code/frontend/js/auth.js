let currentUser = null;
let otpStep = 1;
let userEmail = '';
let userPhone = '';

const API_BASE = 'http://localhost:5000/api';

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

// OTP Request
async function requestOTP() {
    const email = document.getElementById('email')?.value;
    const phone = document.getElementById('phone')?.value;

    if (!email || !phone) {
        showMessage('Please enter both email and phone', 'error', 'step1Message');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone }),
        });

        const data = await response.json();
        
        userEmail = email;
        userPhone = phone;

        // DEMO: Show OTP in console
        console.log('[DEMO OTP]', data.demo_otp || 'Check your email/SMS');

        // Move to OTP verification step
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        
        showMessage(`OTP sent! Demo code: ${data.demo_otp}`, 'success', 'step2Message');
    } catch (error) {
        showMessage('Error: ' + error.message, 'error', 'step1Message');
    }
}

// Verify OTP
async function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');

    if (otp.length !== 6) {
        showMessage('Please enter a valid 6-digit OTP', 'error', 'step2Message');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, otp }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'OTP verification failed');
        }

        // Store token and redirect
        setToken(data.token);
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));

        showMessage('Verification successful! Redirecting...', 'success', 'step2Message');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        showMessage('Error: ' + error.message, 'error', 'step2Message');
    }
}

function backToStep1() {
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.querySelectorAll('.otp-input').forEach(input => input.value = '');
}

function showMessage(message, type, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.className = `auth-message ${type}`;
        element.textContent = message;
    }
}

// Auto-focus next OTP input
document.addEventListener('DOMContentLoaded', () => {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    // Check if user is logged in
    const token = getToken();
    if (token && window.location.pathname.includes('auth.html')) {
        window.location.href = 'index.html';
    }

    updateAuthNav();
});

function updateAuthNav() {
    const authNav = document.getElementById('authNav');
    const token = getToken();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        authNav.innerHTML = `
            <a href="dashboard.html" class="nav-link">Dashboard</a>
            <button onclick="handleLogout()" class="nav-link">Logout</button>
        `;
    } else {
        authNav.innerHTML = `
            <a href="auth.html" class="nav-link">Login</a>
        `;
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    currentUser = null;
    updateAuthNav();
    window.location.href = 'index.html';
}
