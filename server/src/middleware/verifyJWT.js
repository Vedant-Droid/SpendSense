import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.cookies.TokenViaCookie;
  if (!token) {
    return res.status(401).json({ success: false, message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded)
    req.user = decoded;

    next();
  }catch (err){
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
export default verifyToken;
