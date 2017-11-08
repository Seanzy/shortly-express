const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  
  //check if we have cookie in our database
  //set a variable = to models.sessions 
  req.session = models.Sessions;
  req.session.create()
   
    .catch(err => console.log('err: ', err))
    .then(result => {
      req.session.get({id: result.insertId})
      .then(result => { //resulting promise that has the hash
        // req.cookies.shortlyid = result.hash;
         // req.cookies.shortlyid.session = {};
         // req.setHeader('set-cookie', result.hash);
        //  req.session.hash = result.hash;
        console.log('rescookies before ', res.cookies);
       req.session.hash = result.hash;

        
       res.cookie('shortlyid', { value: result.hash});
       console.log('re......', res);
       
       // res.setHeader('set-cookie', JSON.stringify({shortlyid: result.hash}));
       //res.cookies = {shortlyid: result.hash}; 
       console.log('res cookies after ', res.cookies.hasOwnProperty('shortlyid'));
      });
    });
    
  
    //if cookie is in our db, we redirect them to index
    
  
  
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

//