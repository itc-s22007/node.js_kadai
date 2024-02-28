import express from "express";
import {check, validationResult} from "express-validator";
import {calcHash, generateSalt} from "../util/auth.js";
import {PrismaClient} from "@prisma/client";
import passport from "passport";
import * as scrypt from "../util/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", (req, res, next) => {
  if (!req.user) {
    const err = new Error("unauthenticated");
    res.status(400).json({
      message: "NG"
    });
    throw err;
  }
  res.json({
    message: "logged in"
  });
});

router.post("/login", passport.authenticate("local", {
  failWithError: true
}), (req, res, next) => {
const isAdmin = req.user.isAdmin
  res.json({
    result: "OK",
    isAdmin: isAdmin
  });
});

router.post("/register", [
  // 入力値チェックミドルウェア
  check("email").notEmpty({ignore_whitespace: true}),
  check("name").notEmpty({ignore_whitespace: true}),
  check("password").notEmpty({ignore_whitespace: true})
], async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    res.status(401).json({
      result: "NG"
    });
    return;
  }
  const {email, name, password} = req.body;
  const salt = generateSalt();
  const hashed = calcHash(password, salt);
  try {
    await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashed,
        salt
      }
    });
    res.status(201).json({
      message: "created"
    });
  } catch (error) {
    switch (error.code) {
      case "P2002":
        res.status(400).json({
          message: "NG"
        });
        break;
      default:
        console.error(error);
        res.status(500).json({
          message: "NG"
        });
    }
  }
})

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({message: "Logout"})
  });
});

router.get("/logout", (req, res) => {
  req.logout((err) => {res.status(200).json({ result: "OK" });});
});

export default router;












