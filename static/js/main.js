document.addEventListener('DOMContentLoaded', () => {
    
    // --- DASHBOARD LOGIC ---
    const emailForm = document.getElementById('emailScanForm');
    const passwordForm = document.getElementById('passwordScanForm');
    const demoBtn = document.getElementById('demoModeBtn');
    const privacyToggle = document.getElementById('privacyToggle');
    const togglePassword = document.getElementById('togglePassword');
    
    if (emailForm) {
        emailForm.addEventListener('submit', (e) => handleScan(e, 'email'));
    }
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => handleScan(e, 'password'));
    }
    if(togglePassword) {
        togglePassword.addEventListener('click', () => {
            const pwdInput = document.getElementById('password');
            if(pwdInput.type === 'password') {
                pwdInput.type = 'text';
                togglePassword.classList.remove('fa-eye');
                togglePassword.classList.add('fa-eye-slash');
            } else {
                pwdInput.type = 'password';
                togglePassword.classList.remove('fa-eye-slash');
                togglePassword.classList.add('fa-eye');
            }
        });
    }

    // --- DEMO MODE LOGIC ---
    if (demoBtn) {
        let lastDemoIndex = -1;
        demoBtn.addEventListener('click', () => {
            const demoData = getDemoDatasets();
            
            // Randomize but prevent immediate repeat
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * demoData.length);
            } while(randomIndex === lastDemoIndex && demoData.length > 1);
            lastDemoIndex = randomIndex;
            
            const selectedDemo = demoData[randomIndex];
            
            // Auto fill
            document.getElementById('email').value = selectedDemo.email_results.email_scanned;
            document.getElementById('password').value = selectedDemo.demo_password;
            
            // Trigger animation and mock API simulation
            simulateDemoScan(selectedDemo);
        });
    }
    
    if(privacyToggle) {
        privacyToggle.addEventListener('change', (e) => {
            document.getElementById('privacyLabelText').textContent = e.target.checked ? "Privacy Mode: ON 🔒" : "Privacy Mode: OFF";
        });
    }

    // --- GENERATOR LOGIC ---
    const btnGen = document.getElementById('generatePwdBtn');
    const btnCopy = document.getElementById('copyPwdBtn');
    const lengthSlider = document.getElementById('genLength');
    
    if (btnGen) {
        btnGen.addEventListener('click', generatePassword);
        lengthSlider.addEventListener('input', function() {
            document.getElementById('genLengthVal').textContent = this.value;
        });
        // Auto-gen on load
        generatePassword();
    }
    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            const pwdInput = document.getElementById('genPwdDisplay');
            if (pwdInput.value) {
                navigator.clipboard.writeText(pwdInput.value);
                const icon = btnCopy.querySelector('i');
                icon.className = 'fa-solid fa-check text-Low';
                setTimeout(() => { icon.className = 'fa-solid fa-copy'; }, 2000);
            }
        });
    }
});

function getDemoDatasets() {
    return [
        // LOW RISK SCENARIOS
        {
            unified_risk_score: "Low",
            demo_password: "M!x3dStr0ngPassw0rd",
            email_results: { email_scanned: "safe@example.com", breach_count: 0, breaches: [] },
            password_results: { password_scanned: "Yes", pwned_count: 0, strength_score: 4, strength_label: "Strong" },
            dynamic_advice: { email_advice: "Maintain current security practices.", password_advice: "Your password is safe from known lists." },
            recommendations: ["🟢 Maintain good security hygiene."]
        },
        {
            unified_risk_score: "Low",
            demo_password: "mediumPass123",
            email_results: { email_scanned: "newbie@tech.com", breach_count: 0, breaches: [] },
            password_results: { password_scanned: "Yes", pwned_count: 0, strength_score: 2, strength_label: "Fair" },
            dynamic_advice: { email_advice: "Clean identity.", password_advice: "Consider adding special characters for better strength." },
            recommendations: ["🟢 Consider upgrading password complexity."]
        },
        {
            unified_risk_score: "Low",
            demo_password: "C0mpl3x+Unkn0wn",
            email_results: { email_scanned: "oldtimer@yahoo.com", breach_count: 1, breaches: [{name: "MySpace", breach_year: 2008}] },
            password_results: { password_scanned: "Yes", pwned_count: 0, strength_score: 4, strength_label: "Strong" },
            dynamic_advice: { email_advice: "Old minor breach detected. Monitor activity.", password_advice: "Good password. Maintain security hygiene." },
            recommendations: ["🟡 Old minor breach found. Refresh passwords if reused."]
        },
        // MEDIUM RISK SCENARIOS
        {
            unified_risk_score: "Medium",
            demo_password: "spring2024",
            email_results: { email_scanned: "freelancer@design.com", breach_count: 2, breaches: [{name: "Canva", breach_year: 2019}, {name: "Adobe", breach_year: 2013}] },
            password_results: { password_scanned: "Yes", pwned_count: 0, strength_score: 2, strength_label: "Fair" },
            dynamic_advice: { email_advice: "Change passwords on all affected platforms immediately.", password_advice: "Use at least 12 characters with uppercase, numbers, and symbols." },
            recommendations: ["🟡 Email found in design-related breaches."]
        },
        {
            unified_risk_score: "Medium",
            demo_password: "Ultra#Secur3$2026",
            email_results: { email_scanned: "socialite@gmail.com", breach_count: 3, breaches: [{name: "Facebook", breach_year: 2018}, {name: "Twitter", breach_year: 2020}, {name: "Dropbox", breach_year: 2012}] },
            password_results: { password_scanned: "Yes", pwned_count: 0, strength_score: 4, strength_label: "Strong" },
            dynamic_advice: { email_advice: "Multiple social exposures. Enable 2FA.", password_advice: "Your password is strong. Avoid reuse across platforms." },
            recommendations: ["🟡 Great password, but high email exposure. Do not reuse."]
        },
        {
            unified_risk_score: "Medium",
            demo_password: "justapassword",
            email_results: { email_scanned: "student@school.edu", breach_count: 0, breaches: [] },
            password_results: { password_scanned: "Yes", pwned_count: 15, strength_score: 1, strength_label: "Weak" },
            dynamic_advice: { email_advice: "No breaches recorded.", password_advice: "This password appears in breach datasets. Change immediately." },
            recommendations: ["🔴 Your password is fundamentally compromised."]
        },
        // HIGH RISK SCENARIOS
        {
            unified_risk_score: "High",
            demo_password: "password123",
            email_results: { email_scanned: "admin@company.com", breach_count: 4, breaches: [{name: "LinkedIn", breach_year: 2012}, {name: "Adobe", breach_year: 2013}, {name: "Equifax", breach_year: 2017}, {name: "Yahoo", breach_year: 2013}] },
            password_results: { password_scanned: "Yes", pwned_count: 854032, strength_score: 0, strength_label: "Very Weak" },
            dynamic_advice: { email_advice: "CRITICAL: Multiple sensitive breaches found.", password_advice: "This password appears in breach datasets heavily. Change immediately." },
            recommendations: ["🚨 CRITICAL ACTION REQUIRED: Exposure across sensitive sets."]
        },
        {
            unified_risk_score: "High",
            demo_password: "letmein",
            email_results: { email_scanned: "gamer@gaming.network", breach_count: 2, breaches: [{name: "Sony", breach_year: 2011}, {name: "Twitch", breach_year: 2021}] },
            password_results: { password_scanned: "Yes", pwned_count: 230910, strength_score: 1, strength_label: "Weak" },
            dynamic_advice: { email_advice: "Exposure in major gaming leaks. Reset accounts.", password_advice: "Use at least 12 characters with uppercase, numbers, and symbols." },
            recommendations: ["🚨 Frequent exposure detected with a weak password."]
        },
        {
            unified_risk_score: "High",
            demo_password: "dragon",
            email_results: { email_scanned: "personal.data@web.com", breach_count: 5, breaches: [{name: "Canva", breach_year: 2019}, {name: "Facebook", breach_year: 2018}, {name: "MyFitnessPal", breach_year: 2018}, {name: "Zynga", breach_year: 2019}, {name: "Evite", breach_year: 2019}] },
            password_results: { password_scanned: "Yes", pwned_count: 4001, strength_score: 0, strength_label: "Very Weak" },
            dynamic_advice: { email_advice: "High widespread exposure across 5 platforms.", password_advice: "This password appears in breach datasets. Change immediately." },
            recommendations: ["🚨 You are at high risk of credential stuffing."]
        }
    ];
}

async function simulateDemoScan(demoData) {
    // UI Reset
    const overlay = document.getElementById('loadingOverlay');
    const summaryBlock = document.getElementById('summaryBlock');
    const summaryPlaceholder = document.getElementById('summaryPlaceholder');
    
    if(summaryBlock) summaryBlock.classList.add('hidden');
    if(summaryPlaceholder) summaryPlaceholder.classList.add('hidden');
    document.getElementById('emailResultBlock').classList.add('hidden');
    document.getElementById('passwordResultBlock').classList.add('hidden');
    
    if(overlay) overlay.classList.remove('hidden');
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    if(overlay) overlay.classList.add('hidden');
    renderResults(demoData, 'hybrid_demo');
}

async function handleScan(e, type) {
    if(e && e.preventDefault) e.preventDefault();
    
    let email = '';
    let password = '';
    const isPrivacyOn = document.getElementById('privacyToggle') ? document.getElementById('privacyToggle').checked : false;
    
    if (type === 'email' || type === 'hybrid_demo') {
        email = document.getElementById('email').value.trim();
    }
    if (type === 'password' || type === 'hybrid_demo') {
        password = document.getElementById('password').value;
    }
    
    if (!email && !password) return;
    
    const overlay = document.getElementById('loadingOverlay');
    const summaryBlock = document.getElementById('summaryBlock');
    const summaryPlaceholder = document.getElementById('summaryPlaceholder');
    
    if(summaryBlock) summaryBlock.classList.add('hidden');
    if(summaryPlaceholder) summaryPlaceholder.classList.add('hidden');
    
    if(type === 'email' || type === 'hybrid_demo') {
        document.getElementById('emailResultBlock').classList.add('hidden');
    }
    if(type === 'password' || type === 'hybrid_demo') {
        document.getElementById('passwordResultBlock').classList.add('hidden');
    }
    
    if(overlay) overlay.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password, privacy_mode: isPrivacyOn })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            renderResults(data, type);
        } else {
            alert(data.error || 'An error occurred during the scan.');
        }
    } catch (error) {
        console.error('Scan failed:', error);
        alert('API Connection Failed. Please check backend server.');
    } finally {
        if(overlay) overlay.classList.add('hidden');
    }
}

function renderResults(data, type) {
    const summaryBlock = document.getElementById('summaryBlock');
    const riskVal = document.getElementById('riskScoreValue');
    const adviceEmail = document.getElementById('dynamicAdviceEmail');
    const advicePassword = document.getElementById('dynamicAdvicePassword');
    
    summaryBlock.classList.remove('hidden');
    
    riskVal.textContent = data.unified_risk_score;
    riskVal.className = `text-center risk-display text-${data.unified_risk_score}`;
    
    if(data.email_results.email_scanned) {
        adviceEmail.innerHTML = `<strong>Email Threat:</strong> ${data.dynamic_advice.email_advice || "Review affected services below."}`;
        adviceEmail.style.display = 'block';
    } else { adviceEmail.style.display = 'none'; }
    
    if(data.password_results.password_scanned === "Yes") {
        advicePassword.innerHTML = `<strong>Password Threat:</strong> ${data.dynamic_advice.password_advice || "Ensure strength."}`;
        advicePassword.style.display = 'block';
    } else { advicePassword.style.display = 'none'; }
    
    // 2. Email Block Details (Comma separated list requested)
    if ((type === 'email' || type === 'hybrid_demo') && data.email_results.email_scanned) {
        const emailBox = document.getElementById('emailResultBlock');
        const emailOut = document.getElementById('emailOutput');
        emailBox.classList.remove('hidden');
        
        if(data.email_results.breach_count > 0) {
            let breachNamesString = data.email_results.breaches.map(b => b.name).join(", ");
            emailOut.innerHTML = `
                <h4 class="text-High">${data.email_results.breach_count} Breaches Found!</h4>
                <p class="mt-10 mb-10 text-main" style="line-height:2; font-weight:600; padding:10px; background:rgba(255,255,255,0.05); border-radius:6px; font-family:monospace; font-size:1.05rem;">
                    <i class="fa-solid fa-layer-group text-accent"></i> ${breachNamesString}
                </p>
                <p class="text-sm text-muted">A total of ${data.email_results.breach_count} compromised ecosystems expose your data footprint.</p>`;
        } else {
            emailOut.innerHTML = `<h4 class="text-Low"><i class="fa-solid fa-circle-check"></i> Safe. No breaches detected.</h4>`;
        }
    }
    
    // 3. Password Block Details + Smart Recommendation Model
    if ((type === 'password' || type === 'hybrid_demo') && data.password_results.password_scanned === "Yes") {
        const passBox = document.getElementById('passwordResultBlock');
        const passOut = document.getElementById('passwordOutput');
        const meterBar = document.getElementById('pwdMeterBar');
        const inlineAdv = document.getElementById('inlinePasswordAdvice');
        passBox.classList.remove('hidden');
        
        let p_res = data.password_results;
        
        // Update Meter
        let percentage = (p_res.strength_score / 4) * 100;
        meterBar.style.width = `${percentage}%`;
        if(p_res.strength_score <= 1) meterBar.style.backgroundColor = 'var(--color-red)';
        else if(p_res.strength_score === 2) meterBar.style.backgroundColor = 'var(--color-yellow)';
        else meterBar.style.backgroundColor = 'var(--color-green)';
        
        let text = p_res.pwned_count > 0 
            ? `<h4 class="text-High mt-10">Pwned ${p_res.pwned_count.toLocaleString()} times!</h4>` 
            : `<h4 class="text-Low mt-10">Valid. Zero known leaks.</h4>`;
            
        text += `<p class="text-muted mt-10">Strength: <strong class="badge bg-${p_res.strength_score <= 1 ? 'High' : (p_res.strength_score === 2 ? 'Medium' : 'Low')}" style="padding:4px 8px; font-size:0.8rem;">${p_res.strength_label}</strong></p>`;
        passOut.innerHTML = text;
        
        // Inline Smart Recommendation Logic
        inlineAdv.classList.remove('hidden');
        if (p_res.pwned_count > 0) {
            inlineAdv.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> This password appears in breach datasets. Change immediately.`;
            inlineAdv.style.borderLeftColor = 'var(--color-red)';
        } else if (p_res.strength_score <= 1) {
            inlineAdv.innerHTML = `<i class="fa-solid fa-circle-info"></i> Use at least 12 characters with uppercase, numbers, and symbols.`;
            inlineAdv.style.borderLeftColor = 'var(--color-red)';
        } else if (p_res.strength_score === 2) {
            inlineAdv.innerHTML = `<i class="fa-solid fa-circle-info"></i> Consider adding special characters for better strength.`;
            inlineAdv.style.borderLeftColor = 'var(--color-yellow)';
        } else {
            inlineAdv.innerHTML = `<i class="fa-solid fa-shield-check"></i> Good password. Avoid reuse across platforms.`;
            inlineAdv.style.borderLeftColor = 'var(--color-green)';
        }
    }
}

// --- PASSWORD GENERATOR ---
function generatePassword() {
    const length = parseInt(document.getElementById('genLength').value, 10);
    const useUpper = document.getElementById('chkUpper') ? document.getElementById('chkUpper').checked : true;
    const useNums = document.getElementById('chkNumbers') ? document.getElementById('chkNumbers').checked : true;
    const useSym = document.getElementById('chkSymbols') ? document.getElementById('chkSymbols').checked : true;
    
    let charset = "abcdefghijklmnopqrstuvwxyz";
    if (useUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useNums) charset += "0123456789";
    if (useSym) charset += "!@#$%^&*-=_+?";
    
    let retVal = "";
    const cryptoObj = window.crypto || window.msCrypto; 
    
    if (cryptoObj && cryptoObj.getRandomValues) {
        const randomValues = new Uint32Array(length);
        cryptoObj.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            retVal += charset[randomValues[i] % charset.length];
        }
    } else {
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
    }
    
    const displayElement = document.getElementById('genPwdDisplay');
    if(displayElement) displayElement.value = retVal;
    
    calculateCrackTime(length, charset.length);
}

function calculateCrackTime(length, poolSize) {
    const crackOutput = document.getElementById('crackTimeEstimate');
    if(!crackOutput) return;
    
    const combinations = Math.pow(poolSize, length);
    const guessesPerSecond = 1e11; // 100 Billion per second modern cluster
    const secondsToCrack = combinations / guessesPerSecond;
    
    let timeString = "";
    if (secondsToCrack < 1) timeString = "Instantly";
    else if (secondsToCrack < 3600) timeString = `${Math.round(secondsToCrack / 60)} minutes`;
    else if (secondsToCrack < 86400) timeString = `${Math.round(secondsToCrack / 3600)} hours`;
    else if (secondsToCrack < 31536000) timeString = `${Math.round(secondsToCrack / 86400)} days`;
    else if (secondsToCrack < 31536000 * 1000) timeString = `${Math.round(secondsToCrack / 31536000)} years`;
    else timeString = "Centuries / Uncrackable";
    
    crackOutput.innerHTML = `Estimated AI crack time: <strong style="color:var(--color-blue);">${timeString}</strong>`;
}
