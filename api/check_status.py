from http.server import BaseHTTPRequestHandler
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import time

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        user_id = self.path.split('=')[-1] if '=' in self.path else '1592079038'
        
        try:
            status = self.check_roblox_status(user_id)
            self.send_success_response(status)
        except Exception as e:
            self.send_error_response(str(e))
    
    def send_success_response(self, data):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error_response(self, error_message):
        self.send_response(500)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            'error': error_message,
            'online': None,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }).encode())
    
    def check_roblox_status(self, user_id):
        url = f"https://www.roblox.com/users/{user_id}/profile"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Cache-Control": "no-cache"
        }
        
        # Try with both www and without to handle redirects
        for attempt in range(3):
            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
                
                # Check for redirect to login page (which means profile is private)
                if "login" in response.url:
                    raise Exception("Profile is private or doesn't exist")
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # More robust online status detection
                online_status = soup.find('span', {'class': 'profile-status'})
                if not online_status:
                    raise Exception("Could not determine online status")
                
                is_online = 'icon-online' in str(online_status)
                
                game_info = None
                game_link = None
                
                if is_online:
                    game_element = soup.find('a', {'class': 'text-game'})
                    if game_element:
                        game_info = game_element.get_text(strip=True)
                        game_link = "https://www.roblox.com" + game_element.get('href', '')
                
                return {
                    'online': is_online,
                    'game': game_info,
                    'game_url': game_link,
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                
            except requests.exceptions.RequestException as e:
                if attempt == 2:  # Last attempt
                    raise Exception(f"Failed to fetch profile after 3 attempts: {str(e)}")
                time.sleep(1)  # Wait before retrying
                continue
