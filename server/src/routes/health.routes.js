import { Router } from "express";

const router = Router();

router.route("/").get((req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'arthlete-backend',
        timestamp: new Date().toISOString(),
    });
});

export default router;
