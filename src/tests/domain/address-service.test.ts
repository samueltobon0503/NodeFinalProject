import { Address } from "../../domain/interfaces/Adress";
import { IAddress } from "../../domain/models/IAddress";
import { saveAddress } from "../../domain/services/address-service";


jest.mock('../../domain/interfaces/Adress');

const MockedAddress = Address as jest.MockedClass<typeof Address>;

describe('saveAddress', () => {
  const mockAddressData: IAddress = {
      street: 'Calle Principal',
      city: 'Ciudad',
      country: 'País',
      userId: "345rtd",
      state: "dsfgdf",
      postalCode: "7575"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe guardar una dirección exitosamente', async () => {
    const mockSavedAddress = {
      _id: '507f1f77bcf86cd799439011',
      ...mockAddressData
    };

    const mockSave = jest.fn().mockResolvedValue(mockSavedAddress);
    MockedAddress.mockImplementation(() => ({
      save: mockSave,
    } as any));

    const result = await saveAddress(mockAddressData);

    expect(MockedAddress).toHaveBeenCalledWith(mockAddressData);
    expect(mockSave).toHaveBeenCalled();
    expect(result).toEqual(mockSavedAddress);
  });

  it('debe lanzar un error cuando la base de datos falla', async () => {
    const mockError = new Error('Error de base de datos');
    const mockSave = jest.fn().mockRejectedValue(mockError);
    MockedAddress.mockImplementation(() => ({
      save: mockSave,
    } as any));

    await expect(saveAddress(mockAddressData)).rejects.toThrow('Error de base de datos');
  });
});