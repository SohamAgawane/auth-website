const express = require ("express");
const jwt = require ("jsonwebtoken");
const JWT_SECRET = "sohamrandomtoken";

const app = express();
const PORT = 4000;

app.use(express.json());

const users = [];

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
})

app.post("/signup", logger, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    users.push({
        username: username,
        password: password,
    });

    res.json({
        message: "You are signed up"
    });

    // console.log(users);
});

app.post("/signin", logger, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    let foundUser = users.find(user => user.username === username && user.password === password);

    if (foundUser) {
        // convert usernmae over to jwt
        const token = jwt.sign({
            username: username
        }, JWT_SECRET);

        foundUser.token = token;
        res.json({
            token: token,
        })
        // console.log(users);
    } else {
        res.status(403).send({
            message: "Invalid username or password"
        });
    }
});

function auth(req, res, next) {
    const token = req.headers.token;

    const decodedInformation = jwt.verify(token, JWT_SECRET);

    if(decodedInformation.username) {
        req.token = token;
        req.username = decodedInformation.username;
        next();
    } else {
        res.json({
            message: "You are not logged in"
        })
    }
}

function logger(req, res, next) {
    console.log(`${req.method} request came`);
    next();
}

app.get("/me", logger, auth, (req, res) => {
    let foundUser = users.find(foundUser => foundUser.token === req.token);

    const username = req.username;

    if(foundUser) {
        res.send({
            username: foundUser.username,
        });
    } else {
        res.send({
            message: "invalid token",
        });
    }
});

app.listen(PORT, () => console.log(`Sever started on PORT: ${PORT}`));