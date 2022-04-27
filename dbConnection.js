const Pool = require('pg').Pool

const pool = new Pool({
  user: 'zousyqjvdmkbtd',
  password: 'cf0137c1f00b9a464f2a748007ce3c30138cd9fd52e2afb8f78b96be236d0c8a',
  port: 5432,
  host: 'ec2-52-30-67-143.eu-west-1.compute.amazonaws.com',
  database: 'd6mv6r9in04pj3',
  ssl: true
})

module.exports = pool