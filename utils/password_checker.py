import hashlib
import requests
import re

def check_password_pwned(password):
    """
    Checks if a password has been compromised using the HIBP API (k-anonymity model).
    Returns the integer count of times it has been seen in breaches.
    """
    if not password:
        return 0

    # Hash the password with SHA-1
    sha1 = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]

    # Request the HIBP API with first 5 chars
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return 0
    except requests.RequestException:
        # Avoid crashing the app if there's no internet or HIBP is down
        return 0

    # The API returns a list of suffix:count pairs. Let's see if ours is there.
    hashes = (line.split(':') for line in response.text.splitlines())
    for h_suffix, count in hashes:
        if h_suffix == suffix:
            return int(count)
    return 0

def evaluate_password_strength(password):
    """
    Evaluates password strength.
    Returns a tuple (score: int, label: str).
    Score ranges 0-4.
    """
    if not password:
        return 0, "Empty"
        
    score = 0
    
    # Check length
    if len(password) >= 8:
        score += 1
    if len(password) >= 12:
        score += 1
        
    # Check complexity
    if re.search(r'[A-Z]', password) and re.search(r'[a-z]', password):
        score += 1
    if re.search(r'\d', password):
        score += 1
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
        
    # Cap score at 4
    score = min(score, 4)
    
    labels = {
        0: "Very Weak",
        1: "Weak",
        2: "Fair",
        3: "Good",
        4: "Strong"
    }
    
    return score, labels.get(score, "Unknown")
