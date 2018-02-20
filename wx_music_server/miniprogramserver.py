#coding=utf8
import sys
import os

import web
import time
import urllib,urllib2
import json
import codecs
import re
from musicutils import neteaseutil,qqutil,xiamiutil
from mysqldbutil import MySQLDBUtil
import qqnewsdemo

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)
 
urls = (
	'/', 'Music',
	'/newslist', 'NewsList',
	'/lyric','Lyric',
	'/xmlyric','XMLyric'
 
)

app = web.application(urls, globals())

def getopenid(jscode):
	url = 'https://api.weixin.qq.com/sns/jscode2session'
	datas = {
		'appid' : '**************',
		'secret': '*************',
		'js_code' : jscode,
		'grant_type' : 'authorization_code'
	}
	req = urllib2.Request(url = '%s%s%s' % (url,'?',datas))
	res = urllib2.urlopen(req)
	res = res.read().decode('utf-8')
	print(res)
	# songjson = json.loads(res)

def lyricrepalce(data):
	mode = re.compile(r'<\d+>')
	result, number = mode.subn('', data)
	print result
	return result
def xiamilyric(url):
	data = urllib2.urlopen(url).read()
	if data[:3] == codecs.BOM_UTF8: 
		data = data[3:]
	data = lyricrepalce(data.decode("utf-8"))
	return data


class Music:
	def GET(self):
		data = web.input()
		try:
			keywords = str(data["keywords"])
			userNickName = str(data["userNickName"])
			MySQLDBUtil.Insert('tb******',userNickName,keywords)
			return xiamiutil.getinfo(keywords)
		except Exception as e:
			print e
			return ""
	
class lyric:
	def GET(self):
		data = web.input()
		try:
			sid = str(data["id"])
			return qqutil.qq_lyric(sid)
		except Exception as e:
			print e
			return ""

class XMLyric:
	def GET(self):
		data = web.input()
		try:
			url = str(data["lyric"])
			print url
			return xiamilyric(url)
		except Exception as e:
			print e
			return ""

class NewsList:
	def GET(self):
		# data = web.input()
		try:
			return qqnewsdemo.getnewslist()
		except Exception as e:
			print e
			return ""


if __name__ == '__main__':
    app.run()
	

