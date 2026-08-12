import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), CustomerController.getAll);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), CustomerController.getById);
router.post('/', authorizeRoles(Role.ADMIN, Role.SALES), CustomerController.create);
router.put('/:id', authorizeRoles(Role.ADMIN, Role.SALES), CustomerController.update);
router.delete('/:id', authorizeRoles(Role.ADMIN), CustomerController.delete);
router.post('/:id/notes', authorizeRoles(Role.ADMIN, Role.SALES), CustomerController.addFollowUpNote);

export default router;
