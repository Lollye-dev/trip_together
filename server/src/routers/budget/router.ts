const express = require("express");
const router = express.Router();

import { verifyToken } from "../../modules/auth/authMiddleware";
import budgetActions from "../../modules/budget/budgetAction";
import expenseShareActions from "../../modules/expenseShare/expenseShareActions";

router.get("/:id/budget", budgetActions.read);

router.use(verifyToken);

router.get("/:id/summary", budgetActions.getSummary);
router.post("/:id/shares", expenseShareActions.create);

router.get("/categories", budgetActions.getCategories);

router.get("/:id", budgetActions.getExpensesByTrip);
router.post("/:id", budgetActions.add);

router.delete("/:id", budgetActions.remove);

export default router;
