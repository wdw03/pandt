// =========================================================
// LOGIN PAGE AUTHENTICATION LOGIC
// =========================================================

const authViews = document.querySelectorAll('.auth-view');
const API_URL = '/api';
const verifySignupMessage = document.getElementById('verifySignupMessage');
const resetPasswordMessage = document.getElementById('resetPasswordMessage');
const loginTopbarShell = document.getElementById('loginTopbarShell');
const loginMenuToggle = document.getElementById('loginMenuToggle');
const loginMobileNav = document.getElementById('loginMobileNav');
const loginMobileNavClose = document.getElementById('loginMobileNavClose');
const loginMobileProfile = document.getElementById('loginMobileProfile');
const loginMobileProfileTrigger = document.getElementById('loginMobileProfileTrigger');
const loginMobileProfileClose = document.getElementById('loginMobileProfileClose');
const loginMobileOverlay = document.getElementById('loginMobileOverlay');

let loginActivePanel = '';

function syncLoginPanelState(panelName) {
    loginActivePanel = panelName;

    const isNavOpen = panelName === 'nav';
    const isProfileOpen = panelName === 'profile';
    const hasOpenPanel = Boolean(panelName);

    loginTopbarShell?.classList.toggle('is-nav-open', isNavOpen);
    loginMenuToggle?.setAttribute('aria-expanded', isNavOpen ? 'true' : 'false');
    loginMobileNav?.classList.toggle('is-open', isNavOpen);
    loginMobileProfile?.classList.toggle('is-open', isProfileOpen);
    loginMobileOverlay?.classList.toggle('is-open', hasOpenPanel);
    loginMobileNav?.setAttribute('aria-hidden', isNavOpen ? 'false' : 'true');
    loginMobileProfile?.setAttribute('aria-hidden', isProfileOpen ? 'false' : 'true');
}

function openLoginPanel(panelName) {
    syncLoginPanelState(panelName);
}

function closeLoginPanels() {
    syncLoginPanelState('');
}

loginMenuToggle?.addEventListener('click', () => {
    openLoginPanel(loginActivePanel === 'nav' ? '' : 'nav');
});

loginMobileProfileTrigger?.addEventListener('click', () => {
    openLoginPanel(loginActivePanel === 'profile' ? '' : 'profile');
});

loginMobileNavClose?.addEventListener('click', closeLoginPanels);
loginMobileProfileClose?.addEventListener('click', closeLoginPanels);
loginMobileOverlay?.addEventListener('click', closeLoginPanels);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeLoginPanels();
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 920) {
        closeLoginPanels();
    }
});

// Check if already logged in, redirect to home
if (localStorage.getItem('tmToken')) {
    window.location.href = 'index.html';
}

// Switch Views
function switchAuthView(viewId) {
    authViews.forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

document.getElementById('linkSignup')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthView('viewSignup'); });
document.getElementById('linkLoginFromSignup')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthView('viewLogin'); });
document.getElementById('linkForgotPassword')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthView('viewForgotPassword'); });
document.getElementById('linkLoginFromForgot')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthView('viewLogin'); });
document.getElementById('linkLoginFromReset')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthView('viewLogin'); });
document.getElementById('linkLoginFromVerify')?.addEventListener('click', (e) => { e.preventDefault(); switchAuthView('viewLogin'); });

// Password Visibility Toggle
document.querySelectorAll('.auth-password-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = 'Hide';
        } else {
            input.type = 'password';
            this.textContent = 'Show';
        }
    });
});

// --- API Calls ---

// Register
document.getElementById('formSignup')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.success) {
            sessionStorage.setItem('signupEmail', email);
            if (verifySignupMessage) {
                verifySignupMessage.textContent = `A 6-digit OTP has been sent to ${email}. Enter it below to verify your account.`;
            }
            switchAuthView('viewVerifySignup');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        alert('Network Error: Make sure you are accessing http://localhost:5000 and not Live Server (5500). ' + err.message);
    }
});

// Verify Signup OTP
document.getElementById('formVerifySignup')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('verifyOtp').value;
    const email = sessionStorage.getItem('signupEmail');

    if (!email) return alert('Email session expired. Try signing up again.');

    try {
        const res = await fetch(`${API_URL}/auth/verify-signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('tmToken', data.token);
            if (data.user) {
                localStorage.setItem('tmUser', JSON.stringify(data.user));
            }
            alert('Verification Successful! You are now logged in.');
            window.location.href = 'index.html'; // Redirect to home
        } else {
            alert(data.message || 'Verification failed');
        }
    } catch (err) {
        alert('Network Error: Make sure you are accessing http://localhost:5000 and not Live Server (5500). ' + err.message);
    }
});

// Login
document.getElementById('formLogin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('tmToken', data.token);
            if (data.user) {
                localStorage.setItem('tmUser', JSON.stringify(data.user));
            }
            window.location.href = 'index.html'; // Redirect to home
        } else if (data.needsVerification) {
            alert(data.message);
            switchAuthView('viewSignup');
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        alert('Network Error: Make sure you are accessing http://localhost:5000 and not Live Server (5500). ' + err.message);
    }
});

// Forgot Password (OTP)
document.getElementById('formForgotPassword')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
            // Temporarily store email for reset step
            sessionStorage.setItem('resetEmail', email);
            if (resetPasswordMessage) {
                resetPasswordMessage.textContent = `A 6-digit OTP has been sent to ${email}. Enter it below and create a new password.`;
            }
            switchAuthView('viewResetPassword');
        } else {
            alert(data.message || 'Failed to send OTP');
        }
    } catch (err) {
        alert('Network Error: Make sure you are accessing http://localhost:5000 and not Live Server (5500). ' + err.message);
    }
});

// Reset Password
document.getElementById('formResetPassword')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = document.getElementById('resetOtp').value;
    const password = document.getElementById('resetPassword').value;
    const email = sessionStorage.getItem('resetEmail');

    if (!email) return alert('Email session expired. Try again.');

    try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, password })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('tmToken', data.token);
            if (data.user) {
                localStorage.setItem('tmUser', JSON.stringify(data.user));
            }
            sessionStorage.removeItem('resetEmail');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Reset failed');
        }
    } catch (err) {
        alert('Network Error: Make sure you are accessing http://localhost:5000 and not Live Server (5500). ' + err.message);
    }
});
