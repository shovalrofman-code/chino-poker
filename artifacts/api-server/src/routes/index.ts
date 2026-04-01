import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playersRouter from "./players";
import sessionsRouter from "./sessions";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(playersRouter);
router.use(sessionsRouter);
router.use(statsRouter);

export default router;
