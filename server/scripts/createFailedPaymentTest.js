import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import GroupFund from '../models/GroupFund.js';
import User from '../models/User.js';
import ClubSettings from '../models/ClubSettings.js';

/**
 * Test Script: Create Failed Payment for Testing
 * 
 * This script will:
 * 1. Find an existing user (member)
 * 2. Create or update a payment record with "Failed" status
 * 3. Display the payment details for testing
 */

const createFailedPaymentTest = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find a member user (not treasurer)
    const member = await User.findOne({ role: 'member' });

    if (!member) {
      console.error('❌ No member user found. Please create a member account first.');
      process.exit(1);
    }

    console.log(`\n👤 Found member: ${member.name} (${member.email})`);

    // Create a failed payment for testing
    const testMonth = 'November 2024';
    const testYear = 2024;
    const testMonthNumber = 11;

    // Check if payment already exists
    let payment = await GroupFund.findOne({
      userId: member._id,
      month: testMonth,
      year: testYear,
    });

    if (payment) {
      console.log('\n📝 Payment record already exists. Updating to Failed status...');
      
      // Get club settings to ensure correct amount
      const settings = await ClubSettings.findOne({ isActive: true });
      
      if (settings) {
        // Update amount based on member's current year
        let correctAmount = settings.monthlyFundAmount;
        switch (member.year) {
          case '1st':
            correctAmount = settings.fundAmountByYear.firstYear;
            break;
          case '2nd':
            correctAmount = settings.fundAmountByYear.secondYear;
            break;
          case '3rd':
            correctAmount = settings.fundAmountByYear.thirdYear;
            break;
          case '4th':
            correctAmount = settings.fundAmountByYear.fourthYear;
            break;
        }
        payment.amount = correctAmount;
        console.log(`   Updated amount to: ₹${correctAmount} (for ${member.year} year)`);
      }
      
      // Update to Failed status
      payment.status = 'Failed';
      payment.paymentProof = null;
      payment.paymentDate = null;
      payment.verifiedBy = null;
      payment.verifiedDate = null;
      payment.failedPaymentSubmission = {
        resubmittedPhoto: null,
        resubmittedDate: null,
        resubmissionNote: '',
      };
      
      // Add to status history
      payment.statusHistory.push({
        status: 'Failed',
        changedBy: member._id,
        changedDate: new Date(),
        reason: 'Test scenario: Marked as failed for testing resubmission feature',
      });

      await payment.save();
    } else {
      console.log('\n📝 Creating new failed payment record...');

      // Get club settings to determine correct payment amount
      const settings = await ClubSettings.findOne({ isActive: true });
      
      if (!settings) {
        console.error('❌ Club settings not found. Please configure club settings first.');
        process.exit(1);
      }

      // Get member's payment amount based on year from settings
      let amount = settings.monthlyFundAmount; // Default fallback
      switch (member.year) {
        case '1st':
          amount = settings.fundAmountByYear.firstYear; // ₹50
          break;
        case '2nd':
          amount = settings.fundAmountByYear.secondYear; // ₹100
          break;
        case '3rd':
          amount = settings.fundAmountByYear.thirdYear; // ₹150
          break;
        case '4th':
          amount = settings.fundAmountByYear.fourthYear; // ₹200
          break;
      }
      
      console.log(`   Member Year: ${member.year}`);
      console.log(`   Payment Amount: ₹${amount}`);

      // Create deadline (5th of the test month)
      const deadline = new Date(testYear, testMonthNumber - 1, 5);

      payment = await GroupFund.create({
        userId: member._id,
        academicYear: '2024-2025',
        month: testMonth,
        monthNumber: testMonthNumber,
        year: testYear,
        amount: amount,
        status: 'Failed',
        deadline: deadline,
        notes: 'Test payment for failed payment resubmission feature',
        statusHistory: [
          {
            status: 'Failed',
            changedBy: member._id,
            changedDate: new Date(),
            reason: 'Test scenario: Created as failed for testing resubmission feature',
          },
        ],
      });
    }

    console.log('\n✅ Failed payment created/updated successfully!');
    console.log('\n📋 Payment Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID:           ${payment._id}`);
    console.log(`Month:        ${payment.month}`);
    console.log(`Amount:       ₹${payment.amount}`);
    console.log(`Status:       ${payment.status}`);
    console.log(`Deadline:     ${payment.deadline.toLocaleDateString('en-IN')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🧪 TEST INSTRUCTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Login with these credentials:');
    console.log(`   Email:    ${member.email}`);
    console.log(`   Password: (your member password)`);
    console.log('\n2. Navigate to Member Dashboard');
    console.log('\n3. You should see:');
    console.log('   ⚠️  Failed Payments section at the top');
    console.log('   📊 "1 Failed Payment" in the section header');
    console.log('   💳 A red card showing November 2024 payment');
    console.log('\n4. Test the resubmission:');
    console.log('   • Click "Pay Now" button on the card');
    console.log('   • Modal opens with QR code and payment details');
    console.log('   • Upload a test payment screenshot');
    console.log('   • (Optional) Add a note');
    console.log('   • Click "Submit Payment"');
    console.log('\n5. Verify after submission:');
    console.log('   • Card shows "Pending Verification" badge');
    console.log('   • "Pay Now" button is disabled');
    console.log('   • Click "View History" to see status timeline');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n💡 TIP: To test multiple failed payments, run this script multiple times');
    console.log('        or modify the testMonth variable above.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
};

// Run the script
createFailedPaymentTest();
