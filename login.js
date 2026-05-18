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
const verifyOtpInput = document.getElementById('verifyOtp');
const resetOtpInput = document.getElementById('resetOtp');
const resendSignupOtpBtn = document.getElementById('resendSignupOtpBtn');
const resendResetOtpBtn = document.getElementById('resendResetOtpBtn');

let loginActivePanel = '';

function persistAuthSession(data = {}) {
    if (!data.token) {
        return;
    }

    localStorage.setItem('tmToken', data.token);

    if (data.user) {
        localStorage.setItem('tmUser', JSON.stringify(data.user));
    }
}

function setInlineFeedback(element, message, state = 'info') {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.dataset.feedbackState = state;
}

function focusOtpField(field) {
    window.requestAnimationFrame(() => field?.focus());
}

function getButtonDefaultLabel(button) {
    if (!button) {
        return '';
    }

    if (!button.dataset.defaultLabel) {
        button.dataset.defaultLabel = button.textContent.trim();
    }

    return button.dataset.defaultLabel;
}

function resetButtonLabel(button) {
    if (!button) {
        return;
    }

    if (button._cooldownTimer) {
        window.clearInterval(button._cooldownTimer);
        button._cooldownTimer = null;
    }

    button.disabled = false;
    button.textContent = getButtonDefaultLabel(button);
}

function setButtonLoading(button, label = 'Sending...') {
    if (!button) {
        return;
    }

    getButtonDefaultLabel(button);
    button.disabled = true;
    button.textContent = label;
}

function startResendCooldown(button, seconds = 30) {
    if (!button) {
        return;
    }

    const defaultLabel = getButtonDefaultLabel(button);

    if (button._cooldownTimer) {
        window.clearInterval(button._cooldownTimer);
    }

    let remaining = seconds;
    button.disabled = true;
    button.textContent = `Resend in ${remaining}s`;

    button._cooldownTimer = window.setInterval(() => {
        remaining -= 1;

        if (remaining <= 0) {
            window.clearInterval(button._cooldownTimer);
            button._cooldownTimer = null;
            button.disabled = false;
            button.textContent = defaultLabel;
            return;
        }

        button.textContent = `Resend in ${remaining}s`;
    }, 1000);
}

function getPostLoginDestination() {
    const rawReturnTo = new URLSearchParams(window.location.search).get('returnTo');

    if (!rawReturnTo) {
        return 'index.html';
    }

    try {
        const resolvedUrl = new URL(rawReturnTo, window.location.origin);

        if (resolvedUrl.origin !== window.location.origin) {
            return 'index.html';
        }

        if (resolvedUrl.pathname.endsWith('/login.html') || resolvedUrl.pathname === '/login.html') {
            return 'index.html';
        }

        return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
    } catch (error) {
        return 'index.html';
    }
}

function redirectAfterAuth() {
    window.location.href = getPostLoginDestination();
}

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
    redirectAfterAuth();
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

    sessionStorage.setItem('signupEmail', email);
    setInlineFeedback(
        verifySignupMessage,
        `OTP request received for ${email}. Email aane me thoda time lag sakta hai. Jaise OTP aaye, niche enter karein.`,
        'pending'
    );
    switchAuthView('viewVerifySignup');
    focusOtpField(verifyOtpInput);
    setButtonLoading(resendSignupOtpBtn);

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.success) {
            setInlineFeedback(
                verifySignupMessage,
                `A 6-digit OTP has been sent to ${email}. Enter it below to verify your account.`,
                'success'
            );
            startResendCooldown(resendSignupOtpBtn);
        } else {
            resetButtonLabel(resendSignupOtpBtn);
            setInlineFeedback(
                verifySignupMessage,
                data.message || 'Registration failed. Please go back and try again.',
                'error'
            );
        }
    } catch (err) {
        resetButtonLabel(resendSignupOtpBtn);
        setInlineFeedback(
            verifySignupMessage,
            'Network error while requesting OTP. Make sure you are using http://localhost:5000 and try again.',
            'error'
        );
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
            persistAuthSession(data);
            sessionStorage.removeItem('signupEmail');
            alert('Verification Successful! You are now logged in.');
            redirectAfterAuth();
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
            persistAuthSession(data);
            redirectAfterAuth();
        } else if (data.needsVerification) {
            sessionStorage.setItem('signupEmail', email);
            setInlineFeedback(
                verifySignupMessage,
                `${data.message} Aap yahan OTP enter kar sakte hain ya resend kar sakte hain.`,
                'pending'
            );
            resetButtonLabel(resendSignupOtpBtn);
            switchAuthView('viewVerifySignup');
            focusOtpField(verifyOtpInput);
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
    sessionStorage.setItem('resetEmail', email);
    setInlineFeedback(
        resetPasswordMessage,
        `OTP request received for ${email}. Email aane me thoda time lag sakta hai. Jaise OTP aaye, niche enter karke password update karein.`,
        'pending'
    );
    switchAuthView('viewResetPassword');
    focusOtpField(resetOtpInput);
    setButtonLoading(resendResetOtpBtn);

    try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
            setInlineFeedback(
                resetPasswordMessage,
                `A 6-digit OTP has been sent to ${email}. Enter it below and create a new password.`,
                'success'
            );
            startResendCooldown(resendResetOtpBtn);
        } else {
            resetButtonLabel(resendResetOtpBtn);
            setInlineFeedback(
                resetPasswordMessage,
                data.message || 'Failed to send OTP. Please go back and try again.',
                'error'
            );
        }
    } catch (err) {
        resetButtonLabel(resendResetOtpBtn);
        setInlineFeedback(
            resetPasswordMessage,
            'Network error while requesting OTP. Make sure you are using http://localhost:5000 and try again.',
            'error'
        );
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
            persistAuthSession(data);
            sessionStorage.removeItem('resetEmail');
            redirectAfterAuth();
        } else {
            alert(data.message || 'Reset failed');
        }
    } catch (err) {
        alert('Network Error: Make sure you are accessing http://localhost:5000 and not Live Server (5500). ' + err.message);
    }
});

resendSignupOtpBtn?.addEventListener('click', async () => {
    const email = sessionStorage.getItem('signupEmail');

    if (!email) {
        setInlineFeedback(
            verifySignupMessage,
            'Signup email session expire ho gayi. Please sign up again.',
            'error'
        );
        switchAuthView('viewSignup');
        return;
    }

    setButtonLoading(resendSignupOtpBtn);

    try {
        const res = await fetch(`${API_URL}/auth/resend-signup-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (data.success) {
            setInlineFeedback(
                verifySignupMessage,
                `Fresh OTP ${email} par resend kar diya gaya hai. Jaise receive ho, niche enter karein.`,
                'success'
            );
            startResendCooldown(resendSignupOtpBtn);
            return;
        }

        resetButtonLabel(resendSignupOtpBtn);
        setInlineFeedback(
            verifySignupMessage,
            data.message || 'OTP resend nahi ho paya. Please try again.',
            'error'
        );
    } catch (error) {
        resetButtonLabel(resendSignupOtpBtn);
        setInlineFeedback(
            verifySignupMessage,
            'Network error while resending OTP. Please try again.',
            'error'
        );
    }
});

resendResetOtpBtn?.addEventListener('click', async () => {
    const email = sessionStorage.getItem('resetEmail');

    if (!email) {
        setInlineFeedback(
            resetPasswordMessage,
            'Reset email session expire ho gayi. Please start forgot password again.',
            'error'
        );
        switchAuthView('viewForgotPassword');
        return;
    }

    setButtonLoading(resendResetOtpBtn);

    try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (data.success) {
            setInlineFeedback(
                resetPasswordMessage,
                `Fresh reset OTP ${email} par resend ho gaya hai. Jaise receive ho, niche enter karein.`,
                'success'
            );
            startResendCooldown(resendResetOtpBtn);
            return;
        }

        resetButtonLabel(resendResetOtpBtn);
        setInlineFeedback(
            resetPasswordMessage,
            data.message || 'OTP resend nahi ho paya. Please try again.',
            'error'
        );
    } catch (error) {
        resetButtonLabel(resendResetOtpBtn);
        setInlineFeedback(
            resetPasswordMessage,
            'Network error while resending OTP. Please try again.',
            'error'
        );
    }
});
