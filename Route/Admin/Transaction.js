const express = require("express");
const router = express.Router();
const transactionController = require("../../Controller/Admin/Transaction");

router.post("/transaction", transactionController.transactions);
router.post("/makePayment", transactionController?.makepayment);
router.get("/alltransaction", transactionController.getTransaction);
router.get("/transactionhistory/:id", transactionController.byIdTransaction);

module.exports = router;
