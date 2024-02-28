import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import authConfig from "./util/auth.js";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import booksRouter from "./routes/books.js";
import rentalsRouter from "./routes/rentals.js";
import adminRouter from "./routes/admin.js";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: "B02CGO2YqVlyDXbfQ7a6CX3zNLSHzLkXM0BjRqfhIoSiVxtH",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000}
}));
app.use(passport.authenticate("session"));
authConfig(passport);

app.use(cors({
    origin: "http://localhost:3040",
    credentials: true
}));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/books", booksRouter);
app.use("/rentals", rentalsRouter);
app.use("/admin", adminRouter);

app.use((req, res, next) => {
    res.status(404).json({message: "not found."});
});

BigInt.prototype.toJSON = function () {
    return this.toString()
}

// const errorHandler = (err, req, res, next) => {
//     let result = "Internal Server Error";
//     if (err.status === 401) {
//         result = "NG";
//     } else if (err.status === 403) {
//         result = "NG"
//     }
//     else {
//         console.error(err);
//     }
//     res.status(err.status || 500).json({result});
// };
// app.use(errorHandler);

export default app;
