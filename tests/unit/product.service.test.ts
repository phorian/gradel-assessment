import ProductService from '../../repo/product-service/src/services/productService';
import productModel from '../../repo/product-service/src/models/productModel';
import { IProduct, IProductInput } from '../../repo/product-service/src//types/product';

// Mock the productModel
jest.mock('../models/productModel');

describe('ProductService', () => {
  let productService: ProductService;
  
  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  const mockProduct: IProduct = {
    _id: '1',
    name: 'Test Product',
    description: 'A test product',
    price: 9.99,
    category: 'Test',
    quantity: 10,
  };

  const mockProductInput: IProductInput = {
    name: 'New Product',
    description: 'A new test product',
    price: 19.99,
    category: 'Test',
    quantity: 5,
  };

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      (productModel.find as jest.Mock).mockResolvedValue([mockProduct]);

      const result = await productService.getAllProducts();

      expect(result).toEqual([mockProduct]);
      expect(productModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      (productModel.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getProductById('1');

      expect(result).toEqual(mockProduct);
      expect(productModel.findById).toHaveBeenCalledWith('1');
    });

    it('should return null if product not found', async () => {
      (productModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await productService.getProductById('nonexistent');

      expect(result).toBeNull();
      expect(productModel.findById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const saveMock = jest.fn().mockResolvedValue({ ...mockProductInput, _id: '2' });
      (productModel as jest.Mock).mockImplementation(() => ({
        save: saveMock,
      }));

      const result = await productService.createProduct(mockProductInput);

      expect(result).toEqual({ ...mockProductInput, _id: '2' });
      expect(productModel).toHaveBeenCalledWith(mockProductInput);
      expect(saveMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      (productModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await productService.updateProduct('1', { name: 'Updated Product' });

      expect(result).toEqual(updatedProduct);
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith('1', { name: 'Updated Product' }, { new: true });
    });

    it('should return null if product not found', async () => {
      (productModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const result = await productService.updateProduct('nonexistent', { name: 'Updated Product' });

      expect(result).toBeNull();
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith('nonexistent', { name: 'Updated Product' }, { new: true });
    });
  });

  describe('deleteProduct', () => {
    it('should delete an existing product', async () => {
      (productModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct('1');

      expect(result).toBe(true);
      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should return false if product not found', async () => {
      (productModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await productService.deleteProduct('nonexistent');

      expect(result).toBe(false);
      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith('nonexistent');
    });
  });
});