// src/tests/services/user.service.test.ts
import * as userService from '../../domain/services/user-service'; // ajusta según la ruta real de tu service
import { User } from '../../domain/interfaces/User'; // IMPORTANTE: usa exactamente la misma ruta que tu service usa

// Mock del módulo que exporta User (constructor + métodos estáticos)
jest.mock('../../domain/interfaces/User', () => {
  const find = jest.fn();
  const findOne = jest.fn();
  const findByIdAndUpdate = jest.fn();

  // Constructor mock (instancia con save)
  const UserMock = jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue(data),
  }));

  (UserMock as any).find = find;
  (UserMock as any).findOne = findOne;
  (UserMock as any).findByIdAndUpdate = findByIdAndUpdate;

  return {
    User: UserMock,
    __esModule: true,
  };
});

describe('user.service', () => {
  // Tipado cómodo para acceder a los mocks
  const UserMock = User as unknown as jest.Mock & {
    find: jest.Mock;
    findOne: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('devuelve usuarios cuando User.find resuelve', async () => {
      const users = [{ name: 'A', email: 'a@test', active: true }];
      UserMock.find.mockResolvedValueOnce(users);

      const result = await userService.getUsers();

      expect(UserMock.find).toHaveBeenCalled();
      expect(result).toBe(users);
    });

    it('lanza el mensaje correcto cuando find falla', async () => {
      UserMock.find.mockRejectedValueOnce(new Error('db fail'));

      await expect(userService.getUsers())
        .rejects
        .toThrow('Hubo un error obteniendo los usuarios');
    });
  });

  describe('getUserByEmail', () => {
    it('devuelve el usuario cuando findOne por email funciona', async () => {
      const user = { name: 'B', email: 'b@test' };
      UserMock.findOne.mockResolvedValueOnce(user);

      const result = await userService.getUserByEmail('b@test');

      expect(UserMock.findOne).toHaveBeenCalledWith({ email: 'b@test' });
      expect(result).toBe(user);
    });

    it('lanza error con mensaje cuando findOne falla', async () => {
      UserMock.findOne.mockRejectedValueOnce(new Error('fail'));

      await expect(userService.getUserByEmail('x@test'))
        .rejects
        .toThrow('Hubo un error obteniendo el usuario');
    });
  });

  describe('getUserById', () => {
    it('devuelve el usuario cuando findOne por id funciona', async () => {
      const user = { _id: 'id1', name: 'C' };
      UserMock.findOne.mockResolvedValueOnce(user);

      const result = await userService.getUserById('id1');

      expect(UserMock.findOne).toHaveBeenCalledWith({ _id: 'id1' });
      expect(result).toBe(user);
    });

    it('lanza error con mensaje cuando findOne falla', async () => {
      UserMock.findOne.mockRejectedValueOnce(new Error('fail'));

      await expect(userService.getUserById('nope'))
        .rejects
        .toThrow('Hubo un error obteniendo el usuario');
    });
  });

  describe('saveUser', () => {
    it('crea y devuelve el usuario cuando save tiene éxito', async () => {
      const payload = { name: 'User', email: 'u@test', active: true };

      // Hacemos que la instancia devuelta por el constructor tenga un save que resuelve
      (UserMock as jest.Mock).mockImplementationOnce(() => ({
        ...payload,
        save: jest.fn().mockResolvedValue(payload),
      }));

      const result = await userService.saveUser(payload as any);

      expect(UserMock).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expect.objectContaining(payload));
    });

    it('propaga el mensaje de error cuando save falla', async () => {
      const payload = { name: 'User', email: 'u@test', active: true };

      (UserMock as jest.Mock).mockImplementationOnce(() => ({
        ...payload,
        save: jest.fn().mockRejectedValue(new Error('save fail')),
      }));

      await expect(userService.saveUser(payload as any))
        .rejects
        .toThrow('save fail');
    });
  });

  describe('updateLUser', () => {
    it('retorna el usuario actualizado cuando findByIdAndUpdate funciona', async () => {
      const id = 'uid123';
      const updated = { _id: id, name: 'Updated', active: true };
      UserMock.findByIdAndUpdate.mockResolvedValueOnce(updated);

      const result = await userService.updateLUser(id, updated as any);

      expect(UserMock.findByIdAndUpdate).toHaveBeenCalledWith(id, updated, { new: true });
      expect(result).toEqual(updated);
    });

    it('lanza error con mensaje cuando findByIdAndUpdate falla', async () => {
      UserMock.findByIdAndUpdate.mockRejectedValueOnce(new Error('update fail'));

      await expect(userService.updateLUser('idX', {} as any))
        .rejects
        .toThrow('Hubo un error actualizando el usuario');
    });
  });

  describe('inactiveLUser', () => {
    it('retorna el usuario inactivado cuando findByIdAndUpdate funciona', async () => {
      const id = 'inact1';
      const updated = { _id: id, name: 'Z', active: false };
      UserMock.findByIdAndUpdate.mockResolvedValueOnce(updated);

      const result = await userService.inactiveLUser(id);

      expect(UserMock.findByIdAndUpdate).toHaveBeenCalledWith(id, { active: false }, { new: true });
      expect(result).toEqual(updated);
    });

    it('lanza error con mensaje cuando findByIdAndUpdate falla', async () => {
      UserMock.findByIdAndUpdate.mockRejectedValueOnce(new Error('fail'));

      await expect(userService.inactiveLUser('idY'))
        .rejects
        .toThrow('Hubo un error inactivando el usuario');
    });
  });

  describe('verifyUserEmail', () => {
    it('retorna el usuario cuando el token coincide', async () => {
      const token = 'tok123';
      const user = { _id: 'u1', verificationToken: token };
      UserMock.findOne.mockResolvedValueOnce(user);

      const result = await userService.verifyUserEmail(token);

      expect(UserMock.findOne).toHaveBeenCalledWith({ verificationToken: token });
      expect(result).toBe(user);
    });

    it('lanza error con mensaje cuando findOne falla', async () => {
      UserMock.findOne.mockRejectedValueOnce(new Error('fail'));

      await expect(userService.verifyUserEmail('bad'))
        .rejects
        .toThrow('Error al verificar el token del correo');
    });
  });
});
