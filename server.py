#!/opt/bin/python

import sqlite3

from SimpleHTTPServer import SimpleHTTPRequestHandler
from BaseHTTPServer import HTTPServer
from SocketServer import ThreadingMixIn
import threading
import re
import cgi
import simplejson
 
class LocalData(object):
	records = []

	def load(self):
		# TODO: read in the JSON file
		pass

	def save(self):
		# TODO: write out all records
		pass
 
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
 				LocalData.records.insert(recordID, data)
 				print "record %s is added/updated successfully" % recordID
 			else:
 				data = {}
 
 			self.send_response(200)
 			self.send_header('Content-Type', 'application/json')
 			self.end_headers()
 			self.wfile.write(LocalData.records[recordID])
 		else:
 			self.send_response(403)
 			self.send_header('Content-Type', 'application/json')
 			self.end_headers()
 
		return
 
	def do_DELETE(self):
		print "do_DELETE"
		if None != re.search('/cookbook/api/recipes/*', self.path):
			recordID = self.path.split('/')[-1]
			if LocalData.records.has_key(recordID):
				LocalData.records.pop(recordID, None);
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
		print "do_GET"
		if None != re.search('/cookbook/api/recipes/*', self.path):
 			recordID = self.path.split('/')[-1]
 			print "recordID: %s" % recordID
 			if (len(recordID) == 0 or recordID == "recipes"):
 				self.send_response(200)
	 			self.send_header('Content-Type', 'application/json')
				self.end_headers()
				simplejson.dump(LocalData.records, self.wfile)
 			else:
	 			if LocalData.records.has_key(recordID):
	 				self.send_response(200)
	 				self.send_header('Content-Type', 'application/json')
					self.end_headers()
	 				self.wfile.write(LocalData.records[recordID])
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
 
	def addRecord(self, recordID, jsonEncodedRecord):
 		LocalData.records[recordID] = jsonEncodedRecord
 
	def stop(self):
		self.server.shutdown()
		self.waitForThread()
 
if __name__=='__main__':
 
	server = CookbookServer("", 8000)
	print 'Start cooking at http://localhost:8000/'
	server.start()
	server.waitForThread()
