function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
  
      if (token) {
        if (token === "") {
          req.token = token;
          next(); 
        } else {
          return res.status(403).json({ error: 'Not allowed' });
        }
      } else {
        return res.status(403).json({ error: 'Token missing from Authorization header' });
      }
    } else {
      return res.status(403).json({ error: 'Authorization header missing' });
    }
  }

module.exports = { verifyToken }
