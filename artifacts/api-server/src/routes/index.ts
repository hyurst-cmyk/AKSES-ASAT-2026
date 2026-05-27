import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tokenRouter from "./token";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tokenRouter);
router.use(settingsRouter);

export default router;
