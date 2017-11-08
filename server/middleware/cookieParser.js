const parseCookies = (req, res, next) => {
  var cookieStr = req.headers.cookie;
  if (cookieStr) {
    // console.log(cookieStr);
    var obj = {};
    var cookieArr = cookieStr.split('; ').map(cookie => cookie.split('=')).forEach(arr => obj[arr[0]] = arr[1]);
   
    req.cookies = obj;
    // console.log('if ', req.cookies);

  } else {
    req.cookies = {};
      // console.log('else ', req.cookies);

  }
  next();
  
};

module.exports = parseCookies;