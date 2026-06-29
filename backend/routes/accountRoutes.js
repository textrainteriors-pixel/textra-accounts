import express from 'express';
import { 
  getAccounts, 
  createAccount,
  updateAccount,
  deleteAccount,
  updateOpeningBalance, 
  addTransaction, 
  deleteTransaction,
  updateTransaction,
  seedAccounts,
  clearAccounts,
  addProject
} from '../controllers/accountController.js';

const router = express.Router();

router.route('/').get(getAccounts).post(createAccount);
router.route('/:id').put(updateAccount).delete(deleteAccount);
router.route('/seed').post(seedAccounts);
router.route('/clear').delete(clearAccounts);
router.route('/:id/balance').put(updateOpeningBalance);
router.route('/:id/transactions').post(addTransaction);
router.route('/:id/transactions/:txId').delete(deleteTransaction).put(updateTransaction);
router.route('/:id/projects').post(addProject);

export default router;
