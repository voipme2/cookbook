#!/opt/bin/python

import sqlite3

from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from SocketServer import ThreadingMixIn
import threading
import re
import cgi
import simplejson
 
class LocalData(object):
	nextID = 1
	records = {}
 
class HTTPRequestHandler(BaseHTTPRequestHandler):
 
	def do_POST(self):
		# TODO: autogenerate ID if we don't already have one
		print "do_POST"
 		if None != re.search('/cookbook/*', self.path):
 			ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))
 			if ctype == 'application/json':
 				length = int(self.headers.getheader('content-length'))
 				data = cgi.parse_qs(self.rfile.read(length), keep_blank_values=1)
 				recordID = self.path.split('/')[-1]
 				if recordID == None:
 					recordID = LocalData.nextID
 					LocalData.nextID += 1
 				LocalData.records[recordID] = data
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
		if None != re.search('/cookbook/*', self.path):
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
		if None != re.search('/cookbook/*', self.path):
 			recordID = self.path.split('/')[-1]
 			print "recordID: %s" % recordID
 			if (len(recordID) == 0):
 				self.send_response(200)
	 			self.send_header('Content-Type', 'application/json')
				self.end_headers()
				self.wfile.write("[")
				for k,v in LocalData.records.iteritems():
					self.wfile.write(v)
				self.wfile.write("]")
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
 		else:
			self.send_response(403)
 			self.send_header('Content-Type', 'application/json')
 			self.end_headers()
 		return
 
class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
	allow_reuse_address = True
 
	def shutdown(self):
		self.socket.close()
		HTTPServer.shutdown(self)
 
class SimpleHttpServer():
	def __init__(self, ip, port):
 		self.server = ThreadedHTTPServer((ip,port), HTTPRequestHandler)
 
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
 
	server = SimpleHttpServer("", 8000)
	print 'HTTP Server Running...........'
	server.start()
	server.waitForThread()
