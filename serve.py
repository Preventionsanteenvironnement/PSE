import http.server
import socketserver
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(('', 8086), handler)
print('Serving PSE on port 8086')
httpd.serve_forever()
