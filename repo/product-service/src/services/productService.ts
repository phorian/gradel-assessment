import productModel from "../models/productModel";
import { IProduct, IProductInput } from "../types/product";

export default class ProductService {
    async getAllProducts(): Promise<IProduct[]> {
        return await productModel.find();
    }

    async getProductById(id: string): Promise<IProduct | null> {
        return await productModel.findById(id);
    }

    async createProduct(productData: IProductInput):Promise<IProduct> {
        const product = new productModel(productData);
        return await product.save();
    }

    async updateProduct(id: string, productData: Partial<IProduct>):Promise<IProduct | null> {
        return await productModel.findByIdAndUpdate(id, productData, {new: true});
    }

    async deleteProduct(id: string): Promise<boolean> {
        const result= await productModel.findByIdAndDelete(id);
        return !!result;
    }
}