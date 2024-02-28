import express from "express";
import { PrismaClient } from "@prisma/client";
import passport from "passport";
import {check} from "express-validator";
import app from "../app.js";
import {parse} from "nodemon/lib/cli/index.js";
const router = express.Router();
const prisma = new PrismaClient();

const admincheck = (req, res, next)=>{
    if (!req.user.isAdmin) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
}
next()
}


router.post('/book/create', admincheck, async (req, res, next) => {
    try {
        // 管理者権限を持つかどうかを確認するロジックを追加する

        const { isbn13, title, author, publishDate } = req.body;

        // 書籍をデータベースに作成する
        const newBook = await prisma.book.create({
            data: {
                isbn13: parseFloat(isbn13),
                title,
                author,
                publishDate: new Date(publishDate),
            },
        });

        // 登録成功のレスポンスを返す
        res.status(201).json({
            result: "OK",
            newBook
        });
    } catch (error) {
        console.error(error);
        // エラーが発生した場合は400エラーを返す
        res.status(400).json({ result: "NG" });
    }
});

router.put('/book/update', admincheck, async (req, res, next) => {
    try {
        const { bookId, isbn13, title, author, publishDate } = req.body;
        // 書籍を更新する
        const updatedBook = await prisma.book.update({
            where: {
                id: bookId,
            },
            data: {
                isbn13: parseFloat(isbn13),
                title,
                author,
                publishDate: new Date(publishDate),
            },
        });

        // 更新成功のレスポンスを返す
        res.json({
            updatedBook,
            result: "OK",
        });
    } catch (error) {
        console.error(error);
        // エラーが発生した場合は400エラーを返す
        res.status(400).json({ result: "NG" });
    }
});


export default router;