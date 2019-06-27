const express = require('./lib/express')
const path = require('path')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'static')))

app.use((req, res, next) => {
  console.log("middleWare1")
  next()
})

app.use((req, res, next)=>{
  console.log("middleWare2")
  next()
})

app.use("/weather", (req, res)=>{
  res.send('get weather')
})

app.use('/about', function(req, res){
  res.render('about.html', {
    title: '开发者简介',
    author: 'lazyben',
    date: '2019/9',
    intro: ''
  })
})

app.use((req, res)=>{
  res.send(404, "notfound")
})


module.exports = app