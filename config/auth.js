const jwt = require("jsonwebtoken");

require("dotenv").config();

const checkAuth = async (req, res, next) => {
  try {
    let token = JSON.parse(req.headers.authorization.split(" ")[1]);
    console.log("token", token);
    const refreshToken = token.refreshToken;
    token = token.token;

    if (token && refreshToken) {
      let auth;
      try {
        auth = jwt.verify(token, process.env.secretJWT);
        if (auth) {
          req.phoneNumber = auth.phoneNumber;
          req._id = auth._id;

          next();
        }
      } catch (error) {
        try {
          auth = jwt.verify(refreshToken, process.env.secretJWT);
          if (auth) {
            const user = await Account.findOne({
              _id: auth._id,
              verified: true,
            });
            if (!user) {
              res.clearCookie("token");
              res.clearCookie("refreshToken");

              return res.status(404).json({ error: "not authorized" });
            }
            let generatedToken = await user.generateToken();

            res.cookie("token", generatedToken.token, {
              httpOnly: true,
              sameSite: "Strict",
            });
            res.cookie("refreshToken", generatedToken.refreshToken, {
              httpOnly: true,
              sameSite: "Strict",
            });
            req.phoneNumber = auth.phoneNumber;
            req._id = auth._id;
            next();
          }
        } catch (error) {
          console.log(error);
          return res.status(401).json({ error: "not authorized" });
        }
      }
    } else {
      res.status(400).send({
        error: "not authorized",
      });
    }
  } catch (error) {
    res.status(500).send("Internal server error " + error.message);
  }
};
async function checkAuthMerchant(req, res, next) {
  try {
    const token = req.cookies.token;
    console.log("token", token);

    if (token) {
      const auth = jwt.verify(token, process.env.secretJWT);
      console.log(auth);
      if (auth) {
        req._id = auth.username;
        next();
      } else {
        res.status(400).send({
          message: "not authorized",
        });
      }
    } else {
      res.status(400).send({
        message: "not authorized",
      });
    }
  } catch (err) {
    res.status(500).send("Internal server error" + err.message);
  }
}
module.exports = { checkAuth, checkAuthMerchant };
