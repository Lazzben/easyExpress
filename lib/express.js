const url = require('url')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

const express = () => {
  let tasks = []
  let app = (req, res) => {
    makeQuery(req)
    makeResponse(res)
    addRender(req, res, app)

    let i = 0

    let next = () => {
      let task = tasks[i++]
      if(!task){
        return
      }
      if(task.routePath === null || url.parse(req.url, true).pathname === task.routePath){
        task.middleWare(req, res, next)
      }else{
        next()
      }
    }

    next()
  }

  app.use = (routePath, middleWare) => {
    if(typeof routePath === 'function'){
      middleWare = routePath
      routePath = null
    }
    tasks.push({
      routePath: routePath,
      middleWare: middleWare
    })
  }

  app.data = {} 

  app.set = (key, value) => {
    app.data[key] = value
  }

  app.get = (key) => {
    return app.data[key]
  }

  return app
}

express.static = (staticPath) => {
  return (req, res, next) => {
    let pathObj = url.parse(req.url, true)
    if(pathObj.pathname === '/'){
      pathObj.pathname = '/index.html'
    }
    let filePath = path.join(staticPath, pathObj.pathname)
    fs.readFile(filePath, "binary", (err, content)=>{
      if(err){
        next()
      }else{
        res.writeHead(200, "ok")
        res.end(content, 'binary')
      }
    })
  }
}

const makeQuery = (req) => {
  let pathObj = url.parse(req.url, true)
  req.query = pathObj.query
}

const makeResponse = (res) => {
  res.send = (toSend, str) => {
    if(typeof toSend === "string"){
      res.end(toSend)
    }
    if(typeof toSend === "object"){
      res.end(JSON.stringify(toSend))
    }
    if(typeof toSend === "number"){
      res.writeHead(toSend, str)
      res.end()
    }
  }
}

const addRender = (req, res, app) => {
  res.render = (tplPath, data) => {
    let fullPath = path.join(app.get('views'), tplPath)
    ejs.renderFile(fullPath, data, {}, (err, str)=>{
      if(err){
        res.writeHead(503, "system error")
        res.end()
      }else{
        res.setHeader('Content-Type', 'text/html')
        res.writeHead(200, "ok")
        res.write(str)
        res.end()
      }
    })
  }
}

module.exports = express