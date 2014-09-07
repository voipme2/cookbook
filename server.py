#!/opt/bin/python

from SimpleHTTPServer import SimpleHTTPRequestHandler
from BaseHTTPServer import HTTPServer
from SocketServer import ThreadingMixIn
import threading
import re
import cgi
import simplejson

class LocalData(object):
    records = []
    outfile = "data/recipes.json"

    @staticmethod
    def add(recordID, data):
        LocalData.records.insert(recordID, data)
        LocalData.save()

    @staticmethod
    def remove(recordID):
        del LocalData.records[recordID]
        LocalData.save()

    @staticmethod
    def load():
        f = open(LocalData.outfile, "r")
        LocalData.records = simplejson.load(f)
        f.close()

    @staticmethod
    def save():
        f = open(LocalData.outfile, "w")
        simplejson.dump(LocalData.records, f)
        f.close()

class CookbookHandler(SimpleHTTPRequestHandler):

    def do_POST(self):
        # TODO: autogenerate ID if we don't already have one
        if None != re.search('/cookbook/api/recipes/*', self.path):
            ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
            if ctype == 'application/json':
                self.data_string = self.rfile.read(int(self.headers['Content-Length']))
                data = simplejson.loads(self.data_string)
                recordID = self.path.split('/')[-1]
                if recordID == None or recordID == "recipes":
                    recordID = len(LocalData.records)
                    data['id'] = recordID
                LocalData.add(recordID, data)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(LocalData.records[recordID])
            else:
                self.send_response(415)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
        else:
            self.send_response(403)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

        return

    def do_DELETE(self):
        if None != re.search('/cookbook/api/recipes/*', self.path):
            recordID = int(self.path.split('/')[-1])
            if recordID != 'recipes' and LocalData.records[recordID]:
                LocalData.remove(recordID)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
        else:
        	self.send_response(403)
 	    	self.send_header('Content-Type', 'application/json')
 	    	self.end_headers()
        return

    def do_GET(self):
        if None != re.search('/cookbook/api/recipes/*', self.path):
            recordID = self.path.split('/')[-1]
            if (len(recordID) == 0 or recordID == "recipes"):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                simplejson.dump(LocalData.records, self.wfile)
            else:
                if LocalData.records[recordID]:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    simplejson.dump(LocalData.records[recordID], self.wfile)
                else:
                    self.send_response(404, 'Bad Request: record does not exist')
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
            return
        else:
            # just serve up files for the directory if not an API call
            return SimpleHTTPRequestHandler.do_GET(self)

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    allow_reuse_address = True

    def shutdown(self):
        self.socket.close()
        HTTPServer.shutdown(self)

class CookbookServer():
    def __init__(self, ip, port):
    	self.server = ThreadedHTTPServer((ip,port), CookbookHandler)

    def start(self):
    	self.server_thread = threading.Thread(target=self.server.serve_forever)
    	self.server_thread.daemon = True
    	self.server_thread.start()

    def waitForThread(self):
    	self.server_thread.join()

    def stop(self):
    	self.server.shutdown()
    	self.waitForThread()

if __name__=='__main__':

    LocalData.load()
    server = CookbookServer("", 8000)
    print 'Start cooking at http://localhost:8000/'
    server.start()
    server.waitForThread()
