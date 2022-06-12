import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
  const auth = req.header("Authorization");

  if (!auth) {
    const error = new Error();
    error.statusCode = 401;
    return next(error);
  }

  const token = auth.split(" ")[1];

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken) {
    const error = new Error("");
    error.statusCode = 401; // 401 Unauthorized
    return next(error);
  }

  req.userId = decodedToken.userId;
  next();
};
