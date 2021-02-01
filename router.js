/**
 * 路由文件：
 *      主要负责路由的映射
 *      并且调用相关路由的模块功能
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const model = require('./model');
const router = express();

router.get('/',function(req,res){
   res.sendfile(path.join(__dirname,'/view/index.html'));
});
router.get('/admin',function (req,res) {
   fs.readFile(path.join(__dirname,'/view/login.html'),function(err,data){
      if (err) throw err;
      res.send(data.toString());
   })
});
router.get('/manage',function (req,res) {
   if (req.session.username) {
      res.sendfile(path.join(__dirname,'/view/manage.html'));
   } else {
      res.redirect('/admin');
   }
});
router.get('/edit',function (req,res) {
   if (req.session.username) {
      res.sendfile(path.join(__dirname,'/view/edit.html'));
   } else {
      res.redirect('/admin');
   }
});
router.post('/edit/issueBlog',function(req,res){
   model.issueBlog(req,res);
})
router.post('/edit/uploadImg',function(req,res){
   model.uploadImg(req,res);
})
router.get('/edit/alter',function(req,res){
   model.alter(req,res);
})
router.get('/blogmanage',function (req,res) {
   if (req.session.username) {
      model.blogmanage(req,res);
   } else {
      res.redirect('/admin');
   }
});
router.post('/blogmanage/deleteByAhref',function (req,res) {
   model.deleteByAhref(req,res);
});
router.post('/login',function (req,res) {
   model.login(req,res);
});
router.get('/getSomeInformation/:pageIndex',function(req,res){
   model.getSomeInformation(req,res);
});
router.get('/getCount',function(req,res){
   model.getCount(req,res);
});
router.get('/getAllInformation',function(req,res){
   model.getAllInformation(req,res);
});
router.get('/article/:id',function (req,res) {
   model.getOneArticle(req,res);
});
router.get('/getArticleContentById/:id',function (req,res) {
   model.getArticleContentById(req,res);
});
router.post('/sendCommentByArticleID',function (req,res) {
   model.sendCommentByArticleID(req,res);
});
router.get('/getAllCommentByArticle/:articleId',function(req,res){
   model.getAllCommentByArticle(req,res);
});
router.get('/search/:searchContent',function(req,res){
   model.search(req,res);
});


module.exports = router;