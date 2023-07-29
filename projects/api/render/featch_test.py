import http.client
import json

def fetch_api_data():
    try:
        connection = http.client.HTTPConnection('api.football-data.org')
        headers = { 'X-Auth-Token': '41ed52b4ab48496ba781b4f7cd0961e8' }
        connection.request('GET', '/v4/competitions/PL/teams', None, headers)
        response = json.loads(connection.getresponse().read().decode())
        return response
    except Exception as e:
        print(f"Error occurred while fetching data from API: {e}")
        return None

data = fetch_api_data()
if data is not None:
    print(json.dumps(data, indent=4))