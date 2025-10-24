import { Request, Response } from "express";
import * as productCategoryService from "../../domain/services/product-category-service";
import * as productService from "../../domain/services/product-service";
import * as productCategoryController from "../../application/controllers/product-category-controller";

const mockRequest = (body = {}, params = {}) =>
  ({ body, params } as unknown as Request);

const mockResponse = () => {
  const res = {} as unknown as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock("../../domain/services/product-category-service");
jest.mock("../../domain/services/product-service");

const mockedCategoryService = productCategoryService as unknown as {
  getProductCategories: jest.Mock;
  saveProductCategory: jest.Mock;
  inactiveLCategory: jest.Mock;
};

const mockedProductService = productService as unknown as {
  getProduct: jest.Mock;
};

describe("product-category-controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllProductCategories", () => {
    it("responde con las categorías si el servicio las devuelve", async () => {
      const categories = [{ name: "Ropa" }, { name: "Electrónica" }] as any;
      mockedCategoryService.getProductCategories.mockResolvedValueOnce(categories);

      const req = mockRequest();
      const res = mockResponse();

      await productCategoryController.getAllProductCategories(req, res);

      expect(mockedCategoryService.getProductCategories).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: categories,
      });
    });

    it("lanza error si el servicio falla", async () => {
      mockedCategoryService.getProductCategories.mockRejectedValueOnce(
        new Error("DB error")
      );

      const req = mockRequest();
      const res = mockResponse();

      await expect(
        productCategoryController.getAllProductCategories(req, res)
      ).rejects.toThrow("No se pudo obtener el producto");
    });
  });

  describe("createProductCategory", () => {
    it("crea la categoría correctamente", async () => {
      const body = { name: "Hogar" };
      const saved = { _id: "1", name: "Hogar", active: true };
      mockedCategoryService.saveProductCategory.mockResolvedValueOnce(saved);

      const req = mockRequest(body);
      const res = mockResponse();

      await productCategoryController.createProductCategory(req, res);

      expect(mockedCategoryService.saveProductCategory).toHaveBeenCalledWith({
        name: "Hogar",
        active: true,
      });

      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        staus: "created",
        data: saved,
      });
    });

    it("responde con error 500 si saveProductCategory falla", async () => {
      mockedCategoryService.saveProductCategory.mockRejectedValueOnce(
        new Error("Save failed")
      );

      const req = mockRequest({ name: "Hogar" });
      const res = mockResponse();

      await productCategoryController.createProductCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          message: "Error al crear la categoria",
        })
      );
    });
  });

  describe("inactiveCategory", () => {
    it("lanza error si hay productos activos", async () => {
      mockedProductService.getProduct.mockResolvedValueOnce([{ id: 1 }]);
      const req = mockRequest({}, { id: "123" });
      const res = mockResponse();

      await productCategoryController.inactiveCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          message: "Error al desactivar el usuario",
          error: "No se puede eliminar la categoría porque tiene productos activos.",
        })
      );
    });

    it("desactiva la categoría si no hay productos activos", async () => {
      mockedProductService.getProduct.mockResolvedValueOnce([]);
      const category = { _id: "123", name: "Deportes", active: false };
      mockedCategoryService.inactiveLCategory.mockResolvedValueOnce(category);

      const req = mockRequest({}, { id: "123" });
      const res = mockResponse();

      await productCategoryController.inactiveCategory(req, res);

      expect(mockedCategoryService.inactiveLCategory).toHaveBeenCalledWith("123");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: category,
      });
    });

    it("responde con error 500 si inactiveLCategory lanza error", async () => {
      mockedProductService.getProduct.mockResolvedValueOnce([]);
      mockedCategoryService.inactiveLCategory.mockRejectedValueOnce(
        new Error("DB error")
      );

      const req = mockRequest({}, { id: "123" });
      const res = mockResponse();

      await productCategoryController.inactiveCategory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          message: "Error al desactivar el usuario",
        })
      );
    });
  });
});
