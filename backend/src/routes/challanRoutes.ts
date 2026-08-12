import { Router } from 'express';
import { ChallanController } from '../controllers/challanController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

router.post('/', authorizeRoles(Role.ADMIN, Role.SALES), ChallanController.create);
router.get('/', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), ChallanController.getAll);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), ChallanController.getById);
router.put('/:id/status', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE), ChallanController.updateStatus);

export default router;
