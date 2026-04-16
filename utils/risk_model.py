def calculate_hybrid_score(breaches, pwd_pwned_count, pwd_strength_score):
    """
    Calculates unified risk score based on:
    - Number and type of email breaches
    - Password pwned status
    - Password strength
    
    Returns a string: 'Low', 'Medium', or 'High'
    """
    risk_points = 0
    
    # 1. Evaluate Email Breaches
    breach_count = len(breaches)
    sensitive_keywords = ['password', 'passwords', 'ssn', 'credit cards', 'banking']
    
    if breach_count >= 4:
        risk_points += 50
    elif 1 <= breach_count <= 3:
        risk_points += 20
        
    for b in breaches:
        # Check if sensitive data was leaked
        leaked_types = [dt.lower() for dt in b.get('data_types_leaked', [])]
        for kw in sensitive_keywords:
            if any(kw in dt for dt in leaked_types):
                risk_points += 40
                break # Only penalize once per breach for sensitivity

    # 2. Evaluate Password Leaks
    if pwd_pwned_count > 1000:
        risk_points += 60 # Widely distributed leaked password
    elif pwd_pwned_count > 0:
        risk_points += 40 # Hit in at least one known list
        
    # 3. Evaluate Password Strength (only if password was actually provided)
    # Password strength is 0-4. Lower strength = higher risk if weak
    # But only consider it a modifier if we tested a password.
    # We will assume if strength is evaluated, it has an impact.
    # Let's say: 0-1 = +30 points, 2 = +10 points, 3-4 = 0 points
    if pwd_strength_score != None:
        if pwd_strength_score <= 1:
            risk_points += 30
        elif pwd_strength_score == 2:
            risk_points += 10

    # Determine final level
    if risk_points >= 40:
        return "High"
    elif risk_points >= 20:
        return "Medium"
    else:
        return "Low"

def generate_recommendations(risk_level, breaches, pwd_pwned_count, pwd_strength_score):
    """
    Generate actionable insights based on the final risk profile.
    """
    recommendations = []
    
    if risk_level == "High":
        recommendations.append("🚨 IMMEDIATE ACTION REQUIRED: We detected critical vulnerabilities or numerous exposures.")
        
    if pwd_pwned_count > 0:
        recommendations.append(f"🔴 Your password has appeared in data breaches {pwd_pwned_count} times. CHANGE IT IMMEDIATELY everywhere it is used.")
    
    if len(breaches) > 0:
        recommendations.append("🟡 Your email was found in known data breaches. Ensure you have unique passwords for each service, especially those compromised.")
        # Mention specific services
        services = [b['name'] for b in breaches]
        recommendations.append(f"   Ensure no active shared passwords with: {', '.join(services)[:100]}")
        
    if pwd_strength_score is not None:
        if pwd_strength_score <= 2:
            recommendations.append("🟡 You are using a weak password. Consider using a Password Manager to generate and store 16+ character complex passwords.")
        else:
            recommendations.append("🟢 Your password strength is good, but maintain regular rotation if used broadly.")
            
    if risk_level == "Low":
        recommendations.append("🟢 No immediate threats detected. Maintain good security hygiene by enabling Two-Factor Authentication (2FA) wherever possible.")
        
    return recommendations
