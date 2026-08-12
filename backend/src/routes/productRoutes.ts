import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/rbacMiddleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), ProductController.getAll);
router.get('/:id', authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS), ProductController.getById);
router.post('/', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), ProductController.create);
router.put('/:id', authorizeRoles(Role.ADMIN, Role.WAREHOUSE), ProductController.update);
router.delete('/:id', authorizeRoles(Role.ADMIN), ProductController.delete);

export default router;
