#coding=utf8
import MySQLdb
import sys
import time
default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

host = 'xxxx'
port = 1111
user = 'xxxx'
passwd = 'xxxx'
dbname = 'xxxx'

class MySQLDBUtil:
    @staticmethod
    def Insert(tableName,nickname,keywords):
        conn = MySQLdb.connect(host=host, port=port, user=user, passwd=passwd, db=dbname, charset='utf8')
        try:
            cursor = conn.cursor()
            curtime = time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))
            sql = "insert into %s values ('%s','%s','%s')" % (tableName, curtime, nickname, keywords)
            # print(sql)
            cursor.execute(sql)
            conn.commit()
        except Exception as e:
            conn.rollback()
            print("error:",e)
        finally:
            conn.close()
    @staticmethod
    def Select(tableName, stuinfo):
        stuinfo.replace("'","")
        stuinfo.replace(" ","")
        if len(stuinfo) == 0:
            return u'非法操作'
        conn = MySQLdb.connect(host=host, port=port, user=user, passwd=passwd, db=dbname, charset='utf8')
        try:
            cursor = conn.cursor(cursorclass=MySQLdb.cursors.DictCursor)
            sql = "select * from %s where stuno = '%s' or stuname like '%%%s%%'" %(tableName,stuinfo,stuinfo)
            cursor.execute(sql)
            # 获取所有记录列表
            results = cursor.fetchall()
            count = 1
            if len(results) < count:
                count = len(results)
            infolist = []
            for index,row in enumerate(results):
                no = row['stuno']
                name = row['stuname']
                dept = row['studept']
                grade = row['gradeinfo']
                infolist.append("第%d条记录："%(index+1))
                infolist.append("%s,%s,%s"%(no,name,dept))
                infolist.append(grade)
                if index >= count - 1:
                    break
            info = '\n'.join(infolist)
            info = u'查询到%d条记录，显示%d条记录：\n%s' % (len(results), count, info)
            # print info
            return info
        except Exception as e:
            conn.rollback()
            print e
        finally:
            conn.close()


if __name__ == '__main__':
    MySQLDBUtil.Insert('tbname',u'Huangbo',u'张宇')
    # MySQLDBUtil.Select('grade', u'想')
    