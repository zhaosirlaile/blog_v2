/**
 * model.js 主要负责文件的一些逻辑处理
 * code: 0 表示失败，1 表示成功
 * 
 */
const db = require('./db');
const path = require('path');
const fs = require('fs');
const OSS = require('ali-oss');
const client = new OSS({        // oss 配置信息
    region: 'oss-cn-beijing',
    accessKeyId: 'LTAIR6aFO8IEPIrt',
    accessKeySecret: 'H4U6HcM4mEs012V4CKo3Qx3UpoUKJI',
    bucket: 'zhaosirlaile'
});
let imgType = '';

function tiemchange(time){
    let myDate = new Date(time);
    return `${myDate.getFullYear()}年${myDate.getMonth()+1}月${myDate.getDate()}日 ${myDate.getHours()}:${myDate.getMinutes()}:${myDate.getSeconds()}`
}
exports.getSomeInformation = function(req,res) {
    db('select * from article order by aTime desc limit ?,8',[Number(req.params.pageIndex)*8],function (result) {
        res.send(JSON.stringify(result));
    })
};
exports.getAllInformation = function(req,res) {
    db('select *  from article ',[],function (result) {
        res.send(JSON.stringify(result));
    })
};
exports.getCount = function(req,res) {
    db('select count(*) as count from article ',[],function (result) {
        res.send(JSON.stringify(result));
    })
};
exports.getOneArticle = function(req,res) {
    db('select * from article where aHref = ?',['/article/' +req.params.id],function (result) {
        res.send(JSON.stringify(result));
    });
    db('UPDATE article set aNumber = aNumber + 1 WHERE aHref LIKE ?',[`%${req.params.id}%`],function (result) {
    });
};
exports.getArticleContentById = function(req,res) {
    let url = path.join(__dirname,'/public/',req.params.id+'.txt');
    console.log(url);
    fs.readFile(url,function (err,data) {
        if(err) {
            res.send(JSON.stringify({
                code : 0,
                msg : '没有该文章',
            }))
        };
        res.send(data.toString());
    });
};
exports.sendCommentByArticleID = function(req,res) {
    console.log(req.body);
    let data = req.body;
    db('INSERT INTO comment(cEmail,cUsername,cSay,sArticleID) values(?,?,?,?)',[data.email,data.username,data.say,data.articleId],function (result) {
        if (result) {
            res.send(JSON.stringify({
                msg: '评论成功',
                code: 1,
            }));
        } else {
            res.send(JSON.stringify({
                msg: '评论失败',
                code: 0,
            }));
        }

    })
};
exports.getAllCommentByArticle = function(req,res) {
    db('select * from comment where sArticleID = ?',[parseInt(req.params.articleId)],function (result) {
        res.send(JSON.stringify(result));
    })
};
exports.search = function(req,res) {
    let searchContent = req.params.searchContent==='*' ? '%' : req.params.searchContent;
    db('SELECT * FROM article WHERE article.aTitle LIKE ?',['%'+searchContent+'%'],function (result) {
        res.send(JSON.stringify(result));
    })
};
exports.login = function (req,res) {
    let data = req.body;
    console.log(req.body,req.url);
    if (data.username === 'root' && data.password === '15828182346zzhKYBS') {
        req.session.username = 'root';
        res.json({
            code: 1,
            msg : '密码正确',
        })
    } else {
        res.json({
            code: 0,
            msg : '密码错误',
        })
    }
};
exports.blogmanage = function (req,res) {
    let dataTem = '';
    db('select * from article order by aTime desc',[],function(result){
        fs.readFile(path.join(__dirname,'/view/blogmanage.html'),function(err,data) {
            if (err) throw err;
            result.forEach(function(item){
                dataTem +=  `
                            <div class="contentitem" name='${item.aHref}'>
                                <div class="item">
                                    <h4 title='${item.aTitle}'>${item.aTitle}</h4>
                                    <div>
                                        <div class="item-left">
                                            <span class="time" titel='发布时间'>
                                                ${tiemchange(item.aTime)}
                                            </span>
                                            <span class="browse" title='观看总人数'>
                                                浏览量：${item.aNumber}
                                            </span>
                                        </div>
                                        <div class="item-right">
                                            <a class="check" href="#" title="查看">
                                                查看
                                            </a>
                                            <a class="edit" title="编辑">
                                                编辑
                                            </a>
                                            <a class="delete" title="删除">
                                                删除
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>`
            })
            res.send(data.toString().replace('{{data}}',dataTem));
        })
    })

};
exports.deleteByAhref = function (req,res) {
    db('DELETE FROM article WHERE aHref = ?',[req.body.id],function(result){
        if (result) {
            res.send(JSON.stringify({
                code: 1,
                msg : '删除成功',
            }))
        } else {
            res.send(JSON.stringify({
                code: 1,
                msg : '删除失败',
            }))
        }
    })
}
function complement(fileNumber){
    let str = '';
    let len = 5-(fileNumber + '').length;
    for (let i = 0; i < len; i++) {
        str += '0';
    }
    return str+fileNumber;
}
exports.issueBlog = function (req,res) {
    let fileNumber = fs.readdirSync(path.join(__dirname,'./public')).length +1;
    const fileNameNumber = complement(fileNumber);
    fs.writeFile(path.join(__dirname,'/public/' + fileNameNumber + '.txt'), req.body.content, (err) => {
        if (err) throw err;
        console.log('文件已被保存');
    });
    db('INSERT INTO article(aTitle,aTags,aDescribe,aHref,aImg) VALUES(?,?,?,?,?)',[req.body.title,req.body.tags,req.body.describe,`/article/${fileNameNumber}`,`http://zhaosirlaile.oss-cn-beijing.aliyuncs.com/img/${fileNameNumber}.${imgType}`],function(result) {

    })
}
exports.uploadImg = function(req,res) {
    let imgData = req.body.imgData;
    imgType = imgData.substring(11,14);
    let fileNumber = fs.readdirSync(path.join(__dirname,'./public')).length +1;
    const fileNameNumber = complement(fileNumber);
    var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
    client.put(`img/${fileNameNumber}.${imgType}`, new Buffer(base64Data, 'base64')).then((result) => {
    });
}
exports.alter = function(req,res) {
    db('SELECT * FROM article WHERE article.aHref = ?',[req.query.id],function (result) {
        if (result) {
            fs.readFile(path.join(__dirname,'/view/alter.html'),function(err,data) {
                if (err){
                    console.log(err);
                }else {
                    result = result[0];
                    let str = data.toString();
                    str = str.replace('{{title}}',result.aTitle);
                    str = str.replace('{{tags}}',result.aTags);
                    str = str.replace('{{describe}}',result.aDescribe);
                    str = str.replace('{{img}}',result.aImg);
                    fs.readFile(path.join(__dirname,`/public/${result.aID.substring(1)}.txt`),function(err,data){
                        if (err) {
                            console.log(err);
                        } else {
                            str = str.replace('{{content}}',data.toString());
                            res.send(str);
                        }
                    })
                }
            })
        }
    })
}
exports.manage = function (req,res) {

};


// client.useBucket('zhaosirlaile');
