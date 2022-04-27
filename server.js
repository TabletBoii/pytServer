const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const cookie = require('cookie-parser')
const routes = require('./routes/auth.route')
const dataRoute = require('./routes/data.route')

const app = express()

app.use(cors({
  origin: 'http://localhost:3000'
}))

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: true}));


app.use('/api/',routes)
app.use('/getinfo/', dataRoute)

/*app.use(expressWinston.errorLogger({
  transports: [
      new winston.transports.Console()
  ],
  format:winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
}))*/


const PORT = process.env.PORT || 8080
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
async function start() {
  try{
    app.listen(PORT, () => console.log(`listening on port ${PORT}`))
  }catch (e) {
    console.error('Server error', e.message)
    process.exit(1)
  }
}

start()


