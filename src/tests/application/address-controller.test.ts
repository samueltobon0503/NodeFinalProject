import { Request, Response } from "express";
import * as addressService from "../../domain/services/address-service";
import { createAddress, isValidPostalCode } from "../../application/controllers/address-controller";

jest.mock("../../domain/services/address-service", () => ({
  saveAddress: jest.fn(),
}));

const mockedService = addressService as unknown as {
  saveAddress: jest.Mock;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body: any = {}): Request => ({ body } as Request);

describe("address-controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isValidPostalCode", () => {
    it("retorna true si el código postal es válido (6 dígitos y no empieza con 0)", () => {
      expect(isValidPostalCode("123456")).toBe(true);
    });

    it("retorna false si tiene menos de 6 dígitos", () => {
      expect(isValidPostalCode("12345")).toBe(false);
    });

    it("retorna false si empieza con 0", () => {
      expect(isValidPostalCode("023456")).toBe(false);
    });

    it("retorna false si contiene letras", () => {
      expect(isValidPostalCode("12A456")).toBe(false);
    });
  });

  describe("createAddress", () => {
    it("devuelve 400 si el código postal no es válido", async () => {
      const req = mockRequest({
        userId: "u1",
        street: "Calle 1",
        postalCode: "012345",
        state: "Antioquia",
        city: "Medellín",
        country: "Colombia",
      });
      const res = mockResponse();

      await createAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          message: expect.stringContaining("no es válido"),
        })
      );
      expect(mockedService.saveAddress).not.toHaveBeenCalled();
    });

    it("crea la dirección exitosamente si los datos son válidos", async () => {
      const req = mockRequest({
        userId: "user123",
        street: "Calle 45 #12",
        postalCode: "123456",
        state: "Antioquia",
        city: "Medellín",
        country: "Colombia",
      });
      const res = mockResponse();

      const fakeResult = { id: "addr123", ...req.body };
      mockedService.saveAddress.mockResolvedValueOnce(fakeResult);

      await createAddress(req, res);

      expect(mockedService.saveAddress).toHaveBeenCalledWith(expect.objectContaining({
        userId: "user123",
        city: "Medellín",
        postalCode: "123456",
      }));

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: true,
          staus: "created",
          data: fakeResult,
        })
      );
    });

    it("maneja correctamente errores del servicio con status 500", async () => {
      const req = mockRequest({
        userId: "u1",
        street: "Calle Falsa 123",
        postalCode: "123456",
        state: "Antioquia",
        city: "Medellín",
        country: "Colombia",
      });
      const res = mockResponse();

      mockedService.saveAddress.mockRejectedValueOnce(new Error("DB error"));

      await createAddress(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          message: "Error al crear la direccion",
          error: "DB error",
        })
      );
    });
  });
});
