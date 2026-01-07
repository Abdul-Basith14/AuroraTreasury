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
      auroraCode: 'AURORA2025', // Default aurora code - CHANGE THIS!
      academicYear: '2025-2026',
      monthlyFundAmount: 100, // ₹100 per month (fallback)
      paymentDeadline: 5, // 5th of each month (legacy field)
      paymentDeadlineDay: 5, // 5th of each month (new field)
      clubName: 'Aurora Theatrical Club',
      clubDescription: 'A vibrant theatrical club promoting performing arts and creativity',
      // Group Fund Payment Configuration
      fundAmountByYear: {
        firstYear: 50,
        secondYear: 100,
        thirdYear: 150,
        fourthYear: 200,
      },
      paymentInstructions: 'Please pay the monthly group fund by the 5th of every month. Upload payment proof after making the payment via UPI.',
      treasurerQRCode: null, // Upload treasurer's QR code URL here later
      isActive: true,
    });

    console.log('✅ Club settings created successfully!\n');
    console.log('📋 Club Configuration:');
    console.log(`   Aurora Code: ${clubSettings.auroraCode}`);
    console.log(`   Academic Year: ${clubSettings.academicYear}`);
    console.log(`   Payment Deadline: ${clubSettings.paymentDeadlineDay}th of each month`);
    console.log(`   Club Name: ${clubSettings.clubName}`);
    console.log('\n💰 Group Fund Amounts by Year:');
    console.log(`   1st Year: ₹${clubSettings.fundAmountByYear.firstYear}`);
    console.log(`   2nd Year: ₹${clubSettings.fundAmountByYear.secondYear}`);
    console.log(`   3rd Year: ₹${clubSettings.fundAmountByYear.thirdYear}`);
    console.log(`   4th Year: ₹${clubSettings.fundAmountByYear.fourthYear}`);
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Change the Aurora Code before going to production!');
    console.log('   2. Upload treasurer QR code to Cloudinary and update treasurerQRCode field');
    console.log('   3. Update payment instructions as needed\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding club settings:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedClubSettings();
