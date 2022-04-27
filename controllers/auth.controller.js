const db = require('../dbConnection')
const bcrypt = require('bcrypt')
const {validationResult} = require("express-validator");
const tokenService = require('../service/token.service')
const jwt = require("jsonwebtoken");
require('dotenv').config()


class AuthController{

  async logIn(req, res) {
    try{
      const {username, password} = req.body
      const candidate = await db.query('SELECT * FROM adminauth WHERE username=$1', [username])
      if(candidate.rows.length===0){
        return res.status(404).json({message:username+' does not exists'})
      }

      const userPassword = await db.query('SELECT password FROM adminauth WHERE username=$1', [username])
      const isMatch = await bcrypt.compare(password, userPassword.rows[0].password)
      if(!isMatch){
        return res.status(409).json({message:"Wrong password, try again"})
      }

      const adminID = await db.query('SELECT adminid FROM adminauth WHERE username=$1', [username])
      const adminIDValue = adminID.rows[0].adminid
      const payload = {username: username, adminID: adminIDValue}
      const token = tokenService.generateToken({...payload})
      await tokenService.saveToken(adminIDValue, token.refreshToken)

      res.json({userID: adminIDValue, token})
    }catch (e) {
      res.status(500).json({message: e.message})
    }
  }

  async signUp(req, res) {
    try{
      const error = validationResult(req)

      if (!error.isEmpty()) {
        return res.status(400).json({
          errors: error.array(),
          message: 'Incorrect username or password'
        })
      }

      const {username, password} = req.body

      const candidate = await db.query('SELECT * FROM adminauth WHERE username=$1', [username])

      if(candidate.rows.length>0){
        return res.status(409).json({message:username+' already exists'})
      }

      const hashedPassword = await bcrypt.hash(password, 12)

      await db.query('INSERT INTO adminauth(username, password) VALUES($1, $2)', [username, hashedPassword]).catch(error =>{
        res.json({
          message:error
        })
      })
      res.status(201).json({message:'User completely created'})
    }catch (e) {
      res.status(500).json({message:e})
    }

  }

  async logout(req, res) {
    try{
      req.body = null
      const userID = req.body.userID
      await db.query('UPDATE tokens SET refreshtoken=NULL WHERE adminid=$1', [userID]);
      res.status(200).json("You logged out successfully.");
    }catch (e) {
      res.json({message: e.message})
    }
  }
  
  async refresh(req, res) {
    try{
      process.env.JWTSECRETTOKEN = 'thats-good-secret-key'
      const refreshToken = req.body.token;
      const username = req.body

      if(!refreshToken) return res.status(401).json("You are not authenticated")
      if(!refreshToken.includes(refreshToken)) return res.status(403).json("Refresh token is not valid")

      jwt.verify(refreshToken, "myRefreshSecretKey", async (err, user) => {
        err && console.log(err);
        await db.query('UPDATE tokens SET refreshtoken=NULL WHERE adminid=$1', [userID]);

        const adminID = await db.query('SELECT adminid FROM adminauth WHERE username=$1', [username])
        const adminIDValue = adminID.rows[0].adminid
        const payload = {username: username, adminID: adminIDValue}

        const newTokens = tokenService.generateToken(payload);

        await db.query('UPDATE tokens SET refreshtoken=$1 WHERE adminid=$2', [newTokens.refreshToken, adminID]);

        res.status(200).json({userID: adminIDValue, ...newTokens});
      })
    }
      catch (e) {
      res.json({message: e.message})
    }
  }
}

module.exports = new AuthController()

