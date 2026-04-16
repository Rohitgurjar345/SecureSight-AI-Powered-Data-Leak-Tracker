import json
import os

def load_mock_breaches():
    file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'mock_breaches.json')
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def check_email_breach(email):
    """
    Search for email in the mock json dataset.
    Returns a list of breach dictionaries or empty list.
    """
    if not email:
        return []
    
    email = email.lower().strip()
    data = load_mock_breaches()
    return data.get(email, [])
