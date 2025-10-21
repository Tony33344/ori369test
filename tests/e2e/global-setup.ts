import { seedServices, seedAvailability } from './fixtures/supabase.fixture';

/**
 * Global setup runs once before all tests
 * Seeds the database with required test data
 */
async function globalSetup() {
  console.log('🌱 Seeding test database...');
  
  try {
    await seedServices();
    console.log('✅ Services seeded');
    
    await seedAvailability();
    console.log('✅ Availability slots seeded');
    
    console.log('✅ Global setup complete');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
