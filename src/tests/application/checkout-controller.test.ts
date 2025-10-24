import { Request, Response } from "express";
import { confirmCheckout, confirmShippingInfo } from "../../application/controllers/checkout-controller";
import * as checkoutService from "../../domain/services/checkout-service";
import { AuthRequest } from "../../infraestructure/auth/jwt-service";

jest.mock("../../domain/services/checkout-service");

const mockedCheckoutService = checkoutService as unknown as {
    confirmCartBeforeCheckout: jest.Mock;
    validateShippingInfo: jest.Mock;
};

const mockRequest = (data: Partial<AuthRequest> = {}): AuthRequest =>
    ({
        user: { id: "user123", ...data.user },
        body: data.body || {},
        params: data.params || {},
    }) as AuthRequest;

const mockResponse = () => {
    const res = {} as unknown as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("checkout-controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("confirmCheckout", () => {
        it("devuelve confirmación del carrito si el servicio responde correctamente", async () => {
            const result = { total: 100, items: 3 };
            mockedCheckoutService.confirmCartBeforeCheckout.mockResolvedValueOnce(result);

            const req = mockRequest({
                user: {
                    id: "user123",
                    email: "test@example.com",
                    role: "user"
                }
            });
            const res = mockResponse();

            await confirmCheckout(req, res);

            expect(mockedCheckoutService.confirmCartBeforeCheckout).toHaveBeenCalledWith("user123");
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                message: "Confirmación de carrito lista para checkout",
                data: result,
            });
        });

        it("responde con status 400 si ocurre un error", async () => {
            mockedCheckoutService.confirmCartBeforeCheckout.mockRejectedValueOnce(
                new Error("Carrito vacío")
            );

            const req = mockRequest({
                user: {
                    id: "user123",
                    email: "test@example.com",
                    role: "user"
                }
            }); const res = mockResponse();

            await confirmCheckout(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: "Carrito vacío",
            });
        });
    });

    describe("confirmShippingInfo", () => {
        it("valida la información de envío correctamente", async () => {
            const result = { shippingCost: 20, estimatedDays: 3 };
            mockedCheckoutService.validateShippingInfo.mockResolvedValueOnce(result);

            const req = mockRequest({
                user: {
                    id: "user123",
                    email: "test@example.com",
                    role: "user"
                },
                body: { addressId: "addr1", shippingMethod: "express" },
            });
            const res = mockResponse();

            await confirmShippingInfo(req, res);

            expect(mockedCheckoutService.validateShippingInfo).toHaveBeenCalledWith(
                "user123",
                "addr1",
                "express"
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                message: "Información de envío validada correctamente",
                data: result,
            });
        });

        it("responde con status 400 si el servicio lanza error", async () => {
            mockedCheckoutService.validateShippingInfo.mockRejectedValueOnce(
                new Error("Dirección inválida")
            );

            const req = mockRequest({
                user: {
                    id: "user123",
                    email: "test@example.com",
                    role: "user"
                },
                body: { addressId: "addr1", shippingMethod: "standard" },
            });
            const res = mockResponse();

            await confirmShippingInfo(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: "Dirección inválida",
            });
        });
    });
});
