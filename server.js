const http = require('http')
const fs  = require('fs')
const url = require('url')
const path = require('path')

const router = {
  "/weather": (req, res)=>{
    if(req.body.province === "zhejiang" && req.body.city === "hangzhou"){
      res.end("hangzhou: sunny")
    }else{
      res.end("buzhidao")
    }
  }
}

const routePath = (req, res) => {
  let pathObj = url.parse(req.url)
  let handle = router[pathObj.pathname]
  if(handle){
    req.query = pathObj.query
    let body = ''
    req.on("data", (chunk)=>{
      body += chunk
    }).on("end", ()=>{
      req.body = parseBody(body)
      handle(req, res)
    })
  }else{
    staticRoot(path.join(__dirname, "static"), req, res)
  }
}

const staticRoot = (staticPath, req ,res) => {
  let pathObj = url.parse(req.url, true)
  
  if(pathObj.pathname === "/"){
    pathObj.pathname = '/index.html'
  }

  const failPath = path.join(staticPath, pathObj.pathname)

  fs.readFile(failPath, (err, data)=>{
    if(err){
      res.writeHead(404, "not found")
      res.end("404 NOT FOUND")
    }else{
      res.end(data)
    }
  })
}

const parseBody = (body)=>{
  let obj = {}
  body.split('&').forEach(str => {
    obj[str.split('=')[0]] = str.split('=')[1]
  });
  return obj
}

http.createServer((req, res)=>{
  routePath(req, res)
}).listen(8000)