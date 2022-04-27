const jwt = require('jsonwebtoken')
const db = require('../dbConnection')


class TokenService{
  generateToken(payload){
    const accessToken = jwt.sign(payload, "thats-good-secret-key", {expiresIn:'30m'})
    const refreshToken = jwt.sign(payload, "thats-good-secret-key", {expiresIn:'30d'})
    return{
      accessToken,
      refreshToken
    }
  }

  async saveToken(adminID, refreshToken){
    const tokenData = await db.query('SELECT refreshToken FROM tokens WHERE adminID=$1', [adminID])
    if(tokenData.rows.length!==0){
      return await db.query('UPDATE tokens SET refreshToken=$1 WHERE adminID=$2',[refreshToken, adminID])
    }
    return await db.query('INSERT INTO tokens(adminid, refreshtoken) VALUES($1,$2)', [adminID, refreshToken])
  }
}

module.exports = new TokenService()