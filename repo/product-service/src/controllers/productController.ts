import { Request, Response } from 'express';
import ProductService from '../services/productService';

const productService = new ProductService();

export default class ProductController {
    async createProduct( req: Request, res: Response):Promise<void> {
        try{
        const product = await productService.createProduct(req.body);
        res.status(201).json(product);
        } catch(err) {
            console.error('Error creating product:', err);
            res.status(400).json({
                message: 'Internal server error'
            });
        }
    }

    async getProductById(req: Request, res: Response):Promise<void> {
        try {
            const product = await productService.getProductById(req.params.id);
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({
                    message: 'Product not found'
                });
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    async getAllProducts(res: Response):Promise<void> {
        try {
            const products = await productService.getAllProducts()
            res.json(products);
        } catch (err) {
            console.error('Error fetching product:', err);
            res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

    async updateProduct( req: Request, res: Response): Promise<void> {
        try {
            const product = await productService.updateProduct(req.params.id, req.body);
            if(product) {
                res.json(product);
            } else {
                res.status(404).json({
                    message: 'Product not found'
                });
            }
        } catch (err) {
            console.error('Error updating product:', err);
            res.status(400).json({
                message: 'Internal server error'
            });
        }

    }

    async deleteProduct( req: Request, res: Response): Promise<void> {
        try {
            const success = await productService.deleteProduct(req.params.id);
            if(success) {
                res.status(204).send();
            } else {
                res.status(404).json({
                    message: 'Product not found'
                });
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            res.status(500).json({
                message: 'Internal server error'
            });
        }
    }
}