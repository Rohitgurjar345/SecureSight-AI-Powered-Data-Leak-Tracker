from flask import Flask, render_template, request, jsonify
from database.db import init_db, log_search, get_recent_history, clear_history
from utils.breach_checker import check_email_breach
from utils.password_checker import check_password_pwned, evaluate_password_strength
from utils.risk_model import calculate_hybrid_score, generate_recommendations
import os

app = Flask(__name__)

if not os.path.exists('securesight.db'):
    init_db()

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/history')
def history_page():
    return render_template('history.html')

@app.route('/generator')
def generator():
    return render_template('generator.html')

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.json
    email = data.get('email', '').strip()
    password = data.get('password', '')
    privacy_mode = data.get('privacy_mode', False)
    
    if not email and not password:
        return jsonify({"error": "Please provide an email or password to scan."}), 400

    breaches = []
    pwd_pwned_count = 0
    pwd_strength_score = None
    pwd_strength_label = None
    
    if email:
        breaches = check_email_breach(email)
        
    if password:
        pwd_pwned_count = check_password_pwned(password)
        pwd_strength_score, pwd_strength_label = evaluate_password_strength(password)
        
    unified_score = calculate_hybrid_score(breaches, pwd_pwned_count, pwd_strength_score)
    recommendations = generate_recommendations(unified_score, breaches, pwd_pwned_count, pwd_strength_score)
    
    # Store dynamic advice mapped for UI blocks
    dynamic_advice = {
        "email_advice": "No known breaches detected. Keep your email private." if not breaches else "Change passwords on all affected platforms immediately.",
        "password_advice": "Your password is safe from known lists." if pwd_pwned_count == 0 else f"Compromised {pwd_pwned_count} times! Change immediately."
    }
    
    if pwd_strength_score is not None and pwd_strength_score <= 2 and pwd_pwned_count == 0:
        dynamic_advice["password_advice"] = "Password is weak. Ensure it is at least 12+ characters with symbols."
    
    if email and password:
        query_type = "hybrid"
        query_term = email
    elif email:
        query_type = "email"
        query_term = email
    else:
        query_type = "password"
        query_term = "********"
        
    # Respect Privacy Toggle
    if not privacy_mode:
        log_search(query_type, query_term, unified_score, len(breaches) if email else pwd_pwned_count)
    
    payload = {
        "unified_risk_score": unified_score,
        "dynamic_advice": dynamic_advice,
        "email_results": {
            "email_scanned": email if email else None,
            "breach_count": len(breaches),
            "breaches": breaches
        },
        "password_results": {
            "password_scanned": "Yes" if password else "No",
            "pwned_count": pwd_pwned_count,
            "strength_score": pwd_strength_score,
            "strength_label": pwd_strength_label
        },
        "recommendations": recommendations,
        "privacy_active": privacy_mode
    }
    
    return jsonify(payload)

@app.route('/api/history', methods=['GET'])
def get_history():
    records = get_recent_history(limit=50)
    return jsonify(records)

@app.route('/api/clear-history', methods=['POST'])
def handle_clear_history():
    clear_history()
    return jsonify({"success": True})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
