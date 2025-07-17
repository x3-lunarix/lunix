from http.server import BaseHTTPRequestHandler
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        user_id = self.path.split('=')[-1] if '=' in self.path else '1592079038'
        
        status = self.check_roblox_status(user_id)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        self.wfile.write(json.dumps(status).encode())
        return

    def check_roblox_status(self, user_id):
        url = f"https://www.roblox.com/users/{user_id}/profile"
        
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')
            online_icon = soup.select_one('div.profile-status span.icon-online')
            
            if online_icon:
                game_element = soup.select_one('a.text-game')
                if game_element:
                    game_name = game_element.get_text(strip=True)
                    game_link = "https://www.roblox.com" + game_element.get('href', '')
                    return {
                        'online': True,
                        'game': game_name,
                        'game_url': game_link,
                        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                else:
                    return {
                        'online': True,
                        'game': None,
                        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
            else:
                return {
                    'online': False,
                    'game': None,
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }

        except Exception as e:
            return {
                'error': str(e),
                'online': None,
                'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
