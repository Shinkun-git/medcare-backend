import jwt from "jsonwebtoken";

export const checkToken = (req, res) => {
  console.log("checkToken");
    const token = req.cookies?.token;
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // console.log('Decoded payload from token :- ',decoded);
      return res.status(200).json({ user: decoded });
    } catch (error) {
      return res.status(403).json({ message: "Invalid token" });
    }
  };
  