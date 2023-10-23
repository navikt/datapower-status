require('dotenv').config({ path: '.env.local.test' });

/* module.exports = {
  config: {
    path:'.env.local.test'
  }
} */
/* jest.mock('@google-cloud/storage', () => {
    const mockFile = {
        download: jest.fn().mockImplementation(async () => 'Mocked content'), 
        exists: jest.fn().mockResolvedValue([true]),
        save: jest.fn()
      };

    const mockBucket = {
      file: jest.fn(() => mockFile)
    };

    const mockStorage = {
      bucket: jest.fn(() => mockBucket),
    };
  
    return { Storage: jest.fn(() => mockStorage) };
  }); */