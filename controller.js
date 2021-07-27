const model = require("./model");
const appFile = require("./app");
const db = model.dbConnection;
const tables = model.tables;
const account = tables.account;
const tokens = tables.tokens;
const app = appFile.expressApp;
const cors = require("cors");
const crypto = require("crypto");
const { Console } = require("console");

app.post("/register", (req, res) => {
  const body = req.body;
  if (body == (undefined || null)) {
    res.status(400).end(
      JSON.stringify({
        status: 400,
        message: `Bad Request, Missing Body`,
        success: false,
      })
    );
  }
  if (
    body.username == (undefined || null) ||
    body.password == (undefined || null)
  ) {
    res.status(400).end(
      JSON.stringify({
        status: 400,
        message: `Bad Request, Incorrect Parameters or Data`,
        success: false,
      })
    );
  } else {
    account.findOne({ where: { username: body.username } }).then((result) => {
      if (result == null) {
        account.create({ username: body.username, password: body.password });
        res.status(200).end(
          JSON.stringify({
            status: 200,
            message: "Registration Successful",
            success: true,
          })
        );
      } else {
        res.status(200).end(
          JSON.stringify({
            status: 401,
            message: "Account already exists",
            success: false,
          })
        );
      }
    });
  }
});

app.post("/login", (req, res) => {
  const body = req.body;
  console.log(`BODY: ${body.username}`);
  if (
    body.username == (null || undefined || "") ||
    body.password == (null || undefined || "")
  ) {
    console.log("response ended!");
    res.end(
      JSON.stringify({ status: 400, message: "Bad Request", success: false })
    );
  } else {
    checkUserAvailability(body.username, body.password, res);
  }
});

function checkUserAvailability(username, password, res) {
  account.findByPk(username).then((result) => {
    if (result == null || undefined) {
      res.end(
        JSON.stringify({
          status: 404,
          message: "User not found!",
          success: false,
        })
      );
    }
    if (
      result.getDataValue("username") == username &&
      result.getDataValue("password") == password
    ) {
      generateToken(username, res);
      return true;
    } else {
      res.end(
        JSON.stringify({
          status: 401,
          message: `User not found!`,
          success: false,
        })
      );
      return false;
    }
  });
}

function generateToken(username, res) {
  // Also stores in DB
  console.log(`Now generating token!`);
  let asciiCode = 65 + Math.random() * 93;
  let generatedToken = ``;
  for (let i = 0; i < 64; i++) {
    generatedToken += String.fromCharCode(asciiCode);
    asciiCode = 65 + Math.random() * 59;
    console.info(asciiCode);
  }
  generatedToken = crypto
    .createHash("SHA512")
    .update(generatedToken)
    .digest("base64");
  let today = new Date();
  let expiryDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    today.getHours(), // Timezone
    today.getMinutes() + 1,
    today.getSeconds(),
    today.getMilliseconds()
  );
  account.findByPk(username).then((resultAccount) => {
    if (resultAccount.getDataValue("usertoken") == null) {
      tokens.create({ token: generatedToken, expiryDate: expiryDate });
      resultAccount.update({ usertoken: generatedToken });
      res.end(
        JSON.stringify({
          status: 200,
          message: `Login Successful. First ever token generated, new account.`,
          token: generatedToken,
          success: true,
        })
      );
    } else {
      // CONTINUE HERE, CHECK FOR TOKEN VALIDITY AND IF EXPIRES ASSIGN NEW TOKEN
      tokens
        .findByPk(resultAccount.getDataValue("usertoken"))
        .then((resultToken) => {
          let date = new Date(
            Date.parse(resultToken.getDataValue(`expiryDate`))
          );
          let nowDate = new Date(Date.now());
          if (nowDate.getTime() > date.getTime()) {
            // Error happens in this block
            resultToken.destroy();
            tokens.create({ token: generatedToken, expiryDate: expiryDate });
            resultAccount.setDataValue("usertoken", generatedToken);
            resultAccount.save();
            res.end(
              JSON.stringify({
                status: 200,
                message:
                  "Token expired. New token generated for existing account.",
                token: generatedToken,
                success: true,
              })
            );
          } else {
            res.end(
              JSON.stringify({
                status: 200,
                message: "Token still valid!",
                success: true,
              })
            );
          }
        });
    }
  });
}

app.post(`/validate`, (req, res) => {
  const token = req.headers.authorization.substr(6);
  tokens.findByPk(token).then((result) => {
    if (result == (null || undefined)) {
      res.end(
        JSON.stringify({
          status: 404,
          message: `Token not found!`,
          success: false,
        })
      );
    } else {
      let date = new Date(Date.parse(result.getDataValue(`expiryDate`)));
      let nowDate = new Date(Date.now());
      if (nowDate.getTime() > date.getTime()) {
        res.end(
          JSON.stringify({
            status: 401,
            message: "Token expired. Redirecting to login page.",
            success: false,
          })
        );
      } else {
        res.end(
          JSON.stringify({
            status: 200,
            message: "Token still valid!",
            success: true,
          })
        );
      }
    }
  });
});

function isExpired(now, tokenDate) {
  if (now > tokenDate) {
    return true;
  } else {
    return false;
  }
}
