import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ClubSettings from '../models/ClubSettings.js';
import connectDB from '../config/db.js';

// Load environment variables
dotenv.config();

/**
 * Seed initial club settings into the database
 * Run this script once to initialize club configuration
 */
const seedClubSettings = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if settings already exist
    const existingSettings = await ClubSettings.findOne({ isActive: true });

    if (existingSettings) {
      console.log('⚠️  Club settings already exist:');
      console.log(`   Aurora Code: ${existingSettings.auroraCode}`);
      console.log(`   Academic Year: ${existingSettings.academicYear}`);
      console.log(`   Monthly Fund: ₹${existingSettings.monthlyFundAmount}`);
      console.log(`   Payment Deadline: ${existingSettings.paymentDeadline}th of each month`);
      console.log('\n💡 To update settings, use the treasurer dashboard or MongoDB directly.');
      process.exit(0);
    }

    // Create default club settings
    const clubSettings = await ClubSettings.create({
      auroraCode: 'AURORA2024', // Default aurora code - CHANGE THIS!
      academicYear: '2024-2025',
      monthlyFundAmount: 100, // ₹100 per month
      paymentDeadline: 10, // 10th of each month
      clubName: 'Aurora Theatrical Club',
      clubDescription: 'A vibrant theatrical club promoting performing arts and creativity',
      isActive: true,
    });

    console.log('✅ Club settings created successfully!\n');
    console.log('📋 Club Configuration:');
    console.log(`   Aurora Code: ${clubSettings.auroraCode}`);
    console.log(`   Academic Year: ${clubSettings.academicYear}`);
    console.log(`   Monthly Fund Amount: ₹${clubSettings.monthlyFundAmount}`);
    console.log(`   Payment Deadline: ${clubSettings.paymentDeadline}th of each month`);
    console.log(`   Club Name: ${clubSettings.clubName}`);
    console.log('\n⚠️  IMPORTANT: Change the Aurora Code before going to production!');
    console.log('   Users will need this code to login.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding club settings:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedClubSettings();
