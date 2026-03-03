import os
import requests

key = os.getenv('GEMINI_API_KEY')
endpoint = os.getenv('GEMINI_API_ENDPOINT')
print('key', key)
print('endpoint', endpoint)

url = endpoint
if url and '?key=' not in url:
    url = url + ('&' if '?' in url else '?') + 'key=' + key
print('final url', url)

data = {
    'contents':[{'parts':[{'text':'hello world'}]}],
    'generationConfig':{'temperature':0,'maxOutputTokens':10}
}
try:
    resp = requests.post(url, json=data)
    print('status', resp.status_code)
    print(resp.text)
except Exception as e:
    print('error', e)
