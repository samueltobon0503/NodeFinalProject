import * as productCategoryService from '../../domain/services/product-category-service';
import { ProductCategory } from '../../domain/interfaces/ProductCategory'; 

jest.mock('../../domain/interfaces/ProductCategory', () => {
  const find = jest.fn();
  const findByIdAndUpdate = jest.fn();

  const ProductCategoryMock = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  }));

  (ProductCategoryMock as any).find = find;
  (ProductCategoryMock as any).findByIdAndUpdate = findByIdAndUpdate;

  return {
    ProductCategory: ProductCategoryMock,
    __esModule: true,
  };
});

describe('productCategoryService', () => {
  const ProductCategoryMock = ProductCategory as unknown as jest.Mock & {
    find: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductCategories', () => {
    it('devuelve las categorias cuando ProductCategory.find resuelve', async () => {
      const categories = [{ name: 'A', active: true }];
      ProductCategoryMock.find.mockResolvedValueOnce(categories);

      const result = await productCategoryService.getProductCategories();

      expect(ProductCategoryMock.find).toHaveBeenCalled();
      expect(result).toBe(categories);
    });

    it('lanza error con el mensaje correcto cuando find falla', async () => {
      ProductCategoryMock.find.mockRejectedValueOnce(new Error('db fail'));

      await expect(productCategoryService.getProductCategories())
        .rejects
        .toThrow('Hubo un error obteniendo las categorias de los productos');
    });
  });

  describe('saveProductCategory', () => {
    it('crea y devuelve la categoria cuando save tiene éxito', async () => {
      const payload = { name: 'Test', active: true };

      (ProductCategoryMock as jest.Mock).mockImplementationOnce(() => ({
        ...payload,
        save: jest.fn().mockResolvedValue(payload),
      }));

      const result = await productCategoryService.saveProductCategory(payload as any);

      expect(ProductCategoryMock).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expect.objectContaining(payload));
    });

    it('propaga el mensaje de error cuando save falla', async () => {
      const payload = { name: 'Test', active: true };

      (ProductCategoryMock as jest.Mock).mockImplementationOnce(() => ({
        ...payload,
        save: jest.fn().mockRejectedValue(new Error('save fail')),
      }));

      await expect(productCategoryService.saveProductCategory(payload as any))
        .rejects
        .toThrow('save fail');
    });
  });

  describe('inactiveLCategory', () => {
    it('retorna la categoria inactivada cuando findByIdAndUpdate funciona', async () => {
      const id = 'abc123';
      const updated = { _id: id, name: 'X', active: false };

      ProductCategoryMock.findByIdAndUpdate.mockResolvedValueOnce(updated);

      const result = await productCategoryService.inactiveLCategory(id);

      expect(ProductCategoryMock.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { active: false },
        { new: true }
      );
      expect(result).toEqual(updated);
    });

    it('lanza error con mensaje cuando findByIdAndUpdate falla', async () => {
      ProductCategoryMock.findByIdAndUpdate.mockRejectedValueOnce(new Error('update fail'));

      await expect(productCategoryService.inactiveLCategory('id123'))
        .rejects
        .toThrow('Hubo un error inactivando el usuario');
    });
  });
});
