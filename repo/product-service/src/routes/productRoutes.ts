import  express  from "express";
import ProductController from "../controllers/productController";
import { verifyToken, vendorRoleCheck } from "../middleware/authMiddleware";

const productRouter = express.Router();
const productController = new ProductController();

productRouter.get('/all-product', productController.getAllProducts);
productRouter.get('/:id', productController.getProductById);
productRouter.post('/create-product', verifyToken, vendorRoleCheck,  productController.createProduct);
productRouter.put('/:id', verifyToken, vendorRoleCheck, productController.updateProduct);
productRouter.delete('/:id', verifyToken, vendorRoleCheck, productController.deleteProduct);

export default productRouter;