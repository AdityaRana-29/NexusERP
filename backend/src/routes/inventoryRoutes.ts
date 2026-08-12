import { Router } from 'express';
import { InventoryController } from '../controllers/productController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

router.get('/stock-movement', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), InventoryController.getStockMovements);
router.post('/stock-movement', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), InventoryController.recordMovement);

export default router;
