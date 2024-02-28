import express from "express";
import { PrismaClient } from "@prisma/client";
import passport from "passport";
const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
    if (!req.user) {
        const err = new Error("unauthenticated");
        err.status = 401;
        throw err;
    }
    next();
});

router.get('/list/:page?', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 10; // 1ページあたりのアイテム数
        const skip = (page - 1) * limit;

        const books = await prisma.book.findMany({
            skip: skip,
            take: limit,
            select: {
                id: true,
                title: true,
                author: true,
            },
            include: {
                rental: true, // rental情報を含める
            }
        });
        const booksWithRentalStatus = books.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            isRental: book.rental.length > 0, // 貸出中なら true
        }));
        res.json({
            books: booksWithRentalStatus,
        });
    } catch (error) {
        next(error);
    }
});


router.get("/detail/:id", async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);

        // 書籍情報を取得
        const book = await prisma.book.findUnique({
            where: {
                id: bookId
            },
            include: {
                rental: {
                    where: {
                        returnDate: null
                    },
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!book) {
            return res.status(404).json({ message: "書籍が見つかりません" });
        }

        let rentalInfo = null;
        if (book.rental.length > 0) {
            const latestRental = book.rental[0]; // 貸出履歴の最新のものを取得
            rentalInfo = {
                userName: latestRental.user.name,
                rentalDate: latestRental.rentalDate,
                returnDeadline: latestRental.returnDeadline
            };
        }

        // 書籍の詳細情報をレスポンス
        res.status(200).json({
            id: book.id,
            isbn13: book.isbn13,
            title: book.title,
            author: book.author,
            publishDate: book.publishDate,
            rentalInfo: rentalInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
export default router;

