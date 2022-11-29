//Setup cors 
/**
 * @typedef {import('express').Request} Request
 */
/**
 * @typedef {import('express').Response} Response
 */
/**
 * @typedef {import('express').NextFunction} Next
 */

const http = require('http');
const bcrypt = require('bcryptjs');
const {User} = require('./modles');

function cors(rec,res,next){
      res.set('ACCESS-CONTROL-ALLOW-ORIGIN', '*');
      next();
}

/**
 * 
 * @param {Request} rec 
 * @param {Response} res 
 * @param {Next} next 
 * @returns 
 */
async function auth(rec,res,next){
      //1. Check for auth header 
      let header = rec.get('Authorization');
      //Intiates browser popup for authenticatiion
      //If the browser did not send us a auth header send 401 - set it if it does not exist 
      if(!header){
            res.set('WWW-AUTHENTICATE', 'Basic'); 
            res.status(401).send({"Error" : http.STATUS_CODES[401]});
            return;
      }
      //2. Check auth type and token 
      //Gets the base 64encoded string and splits it "Basic klnsdcknsdkj"
      let [type, token] = header.split(' ');
      if(type != 'Basic'|| !token ){
            res.status(401).send({"Error" : http.STATUS_CODES [401]});
            return
      }

      //3. Decode user name and password 
            let buffer = Buffer.from(token, 'base64');
            let decoded = buffer.toString('utf-8');

            //Username:Password
            let [userName, password] = decoded.split(':');

            if(!password){
                  res.status(401).send({"Error" : http.STATUS_CODES [401]});
                  return;
            }

      //4. Find user in db 

            try {
                  let user = await User.findOne({
                        where: {
                              userName: userName
                        }
                  });

                  //Checks password even if none exists so that the timing is the same allways 
                  let hash = user? user.get('password') : 'No match';

                  //Compare hash against password (True = sucess)
                  let success = await bcrypt.compare(password, hash);

                  if(success){
                        next();
                        return;
                  }
                  res.status(401).send({"Error" : http.STATUS_CODES [401]});

            } catch (error) {
                  res.status(500).send({"Error" : http.STATUS_CODES [500]});
                  next(error);
            }

}

module.exports = {cors, auth};