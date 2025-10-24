import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { login } from "../../application/controllers/auth-controller";
import * as userService from "../../domain/services/user-service";
import * as jwtService from "../../infraestructure/auth/jwt-service";

jest.mock("../../domain/services/user-service", () => ({
    getUserByEmail: jest.fn(),
    updateLUser: jest.fn(),
}));

jest.mock("../../infraestructure/auth/jwt-service", () => ({
    generateToken: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
    compare: jest.fn(),
}));

const mockedUserService = userService as jest.Mocked<typeof userService>;
const mockedJwtService = jwtService as jest.Mocked<typeof jwtService>;

const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockRequest = (data: Partial<Request> = {}): Request =>
    data as Request;

describe("user-controller: login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    it("retorna 422 si el usuario no existe", async () => {
        const req = mockRequest({ body: { email: "no@existe.com", password: "1234" } });
        const res = mockResponse();

        mockedUserService.getUserByEmail.mockResolvedValueOnce(null as any);

        await login(req, res);

        expect(mockedUserService.getUserByEmail).toHaveBeenCalledWith("no@existe.com");
        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            error: "Usuario no encontrado",
        });
    });

    it("retorna 403 si el usuario está bloqueado temporalmente", async () => {
        const futureDate = new Date(Date.now() + 2 * 60 * 1000);
        const req = mockRequest({ body: { email: "test@block.com", password: "pass" } });
        const res = mockResponse();

        mockedUserService.getUserByEmail.mockResolvedValueOnce({
            id: "u1",
            email: "test@block.com",
            password: "hashed",
            lockUntil: futureDate,
            failedAttempts: 0,
        } as any);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                ok: false,
                error: expect.stringContaining("Cuenta bloqueada temporalmente"),
            })
        );
    });


    it("retorna 422 si la contraseña es incorrecta e incrementa los intentos", async () => {
        const req = mockRequest({ body: { email: "user@test.com", password: "wrongpass" } });
        const res = mockResponse();

        const fakeUser = {
            id: "u2",
            email: "user@test.com",
            password: "hashedPass",
            failedAttempts: 1,
        } as any;

        mockedUserService.getUserByEmail.mockResolvedValueOnce(fakeUser);
        (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

        await login(req, res);

        expect(mockedUserService.updateLUser).toHaveBeenCalledWith(
            "u2",
            expect.objectContaining({ failedAttempts: 2 })
        );

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            error: "Credenciales incorrectas",
        });
    });

it("retorna 200 y token si las credenciales son válidas", async () => {
    const req = mockRequest({ body: { email: "valid@test.com", password: "1234" } });
    const res = mockResponse();

    const fakeUser = {
        id: "u3",
        email: "valid@test.com",
        password: "hashed",
        isAdmin: true,
        failedAttempts: 1,
        lockUntil: null,
    } as any;

    mockedUserService.getUserByEmail.mockResolvedValueOnce(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true); 
    mockedJwtService.generateToken.mockReturnValueOnce("fake.jwt.token");

    await login(req, res);

    expect(mockedUserService.updateLUser).toHaveBeenCalledWith(
        "u3",
        expect.objectContaining({
            failedAttempts: 0,
            lockUntil: null,
        })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: "fake.jwt.token",
    });
});


    it("retorna 500 si ocurre un error inesperado", async () => {
        const req = mockRequest({ body: { email: "crash@test.com", password: "123" } });
        const res = mockResponse();

        mockedUserService.getUserByEmail.mockRejectedValueOnce(new Error("DB crash"));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                ok: false,
                error: "Error interno al procesar el login",
                details: "DB crash",
            })
        );
    });
});
