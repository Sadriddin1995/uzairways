import { CompaniesService } from '../src/modules/companies/companies.service';

describe('CompaniesService (unit)', () => {
  let service: CompaniesService;
  const mockModel: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    service = new CompaniesService(mockModel);
    jest.clearAllMocks();
  });

  it('rejects duplicate code on create', async () => {
    mockModel.findOne.mockResolvedValueOnce({ id: 1, code: 'HY' });
    await expect(service.create({ name: 'UzAirways', code: 'HY' } as any)).rejects.toThrow('Company code already exists');
  });

  it('creates company when unique', async () => {
    mockModel.findOne.mockResolvedValueOnce(null);
    mockModel.findOne.mockResolvedValueOnce(null);
    mockModel.create.mockResolvedValueOnce({ id: 1, name: 'X', code: 'XX' });
    const res = await service.create({ name: 'X', code: 'XX' } as any);
    expect(res).toEqual({ id: 1, name: 'X', code: 'XX' });
  });
});
