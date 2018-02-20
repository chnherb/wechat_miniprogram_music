#coding=utf8
import requests
from bs4 import BeautifulSoup
import os
import sys
import json
default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

# abspath = os.path.dirname(sys.argv[0])   
# if not os.path.isdir(abspath):
#     abspath = sys.path[0]
# if not os.path.isdir(abspath):
#     abspath = os.path.dirname(__file__)
# os.chdir(abspath)

def getnewslist():
    url = "http://news.qq.com/"
    # 请求腾讯新闻的URL，获取其text文本
    wbdata = requests.get(url).text

    # print(wbdata)
    # with open("qqnews.html", 'w') as fr:
    #         fr.write(wbdata)
    # 对获取到的文本进行解析
    soup = BeautifulSoup(wbdata,'lxml')

    news = soup.select("div.Q-tpList > div.Q-tpWrap")
    newslist = []
    for n in news:
        newpic = n.select("a.pic > img.picto")
        title = ""
        link = ""
        pics = []
        for pic in newpic:
            src = pic.get("src")
            if src is None:
                src = pic.get("_src")
            pics.append(src)
        newtxt = n.select("div.text > em > a.linkto")
        for txt in newtxt:
            title = txt.get_text()
            link = txt.get("href")
        if (len(pics) != 0 and title !="" and link != ""):
            d = dict()
            d["pics"] = pics
            d["title"] = title
            d["link"] = link
            newslist.append(d)
        if len(newslist) >= 10:
            break
            # print(d)
    # print(len(newslist))  
    return json.dumps(newslist)
    
if __name__ == '__main__':
    print(getnewslist())

