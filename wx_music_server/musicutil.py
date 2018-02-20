#coding=utf8
import urllib2  
from musicutils import xxxutil

def getmusic(keyword):
    try:
        title_artist,album,url = xxxutil.getinfo(keyword)
        if url == None or str(url).strip() == '':
            # print 'change qq'
            title_artist,album,url = xxxutil.getinfo(keyword)
        if url == None or str(url).strip() == '':
            # print 'change xiami'
            title_artist,album,url = xxxutil.getinfo(keyword)
        return title_artist,album,url

    except Exception as e:
        print e
        return '','',None


if __name__ == '__main__':
    getmusic(u'周杰伦')
