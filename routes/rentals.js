import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
    if (!req.user) {
        // 未ログイン
        const err = new Error("unauthenticated");
        err.status = 401;
        throw err;
    }
    // 問題なければ次へ
    next();
});

router.post('/start', async (req, res) => {
    const {bookId} = req.body;
    const userId = req.user.id;

    try {
        const existingRental = await prisma.rental.findFirst({
            where: {
                bookId: BigInt(bookId),
                returnDate: null
            },
        });

        if (existingRental) {
            return res.status(409).send({message: '貸出中　失敗'});
        }

        // 貸出処理
        const today = new Date();
        const returnDeadline = new Date(today);
        returnDeadline.setDate(today.getDate() + 7);

        const newRental = await prisma.rental.create({

            data: {
                bookId: BigInt(bookId),
                userId: BigInt(userId),
                rentalDate: today,
                returnDeadline: returnDeadline,
            },
        });

        res.status(201).json({
            id: newRental.id,
            bookId: newRental.bookId,
            rentalDate: newRental.rentalDate,
            returnDeadline: newRental.returnDeadline,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({message: error})
    }
});


// router.post("/start", async (req, res) => {
//     try {
//         // リクエストデータから書籍IDを取得
//         const { bookId } = req.body;
//
//         // 書籍の貸出情報を取得
//         const rentalInfo = await prisma.rental.findFirst({
//             where: {
//                 bookId: parseInt(bookId),
//                 returnDate: null // まだ返却されていない貸出情報を検索
//             }
//         });
//
//         if (rentalInfo) {
//             // 貸出中の場合は409エラーを返す
//             return res.status(409).json({
//                 id: rentalInfo.id,
//                 bookId: rentalInfo.bookId,
//                 rentalDate: rentalInfo.rentalDate,
//                 returnDeadline: rentalInfo.returnDeadline
//             });
//         } else {
//             // 貸出情報を新規作成
//             const newRental = await prisma.rental.create({
//                 data: {
//                     bookId: parseInt(bookId),
//                     userId: req.user.id, // ユーザーIDは認証されたユーザーのIDを使用
//                     rentalDate: new Date(),
//                     returnDeadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // 返却期限は貸出日から7日後
//                 }
//             });
//
//             // 貸出成功のレスポンスを返す
//             return res.status(201).json({
//                 id: newRental.id,
//                 bookId: newRental.bookId,
//                 rentalDate: newRental.rentalDate,
//                 returnDeadline: newRental.returnDeadline
//             });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: "その他のエラー" });
//     }
// });

export default router;