/**
 * db 文件:
 *      封装了操作 MySQL 数据库的一些连接
 */

const mysql = require('mysql');
  
module.exports = function(sql,params,callback) {
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password:'15828182346zzhKYBS@',
        database: 'blog2',
        port:'3306'
    })
    connection.connect(function(err){
        if (err) {
            console.log('---:'+err);
            return;
        }
        console.log('连接成功');
    })
    connection.query(sql,params,function(err,results,fields){
        if (err) {
            console.log('数据操作失败');
            throw err
        }
        callback && callback(results,fields);
    })
    connection.end(function(err){
        if(err){
            console.log('关闭数据库连接失败！');
            throw err;
        }
        console.log('关闭数据库')
    })
}