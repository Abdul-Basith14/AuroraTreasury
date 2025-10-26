import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import GroupFund from '../models/GroupFund.js';
import User from '../models/User.js';

const checkFailedPayments = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users
    const users = await User.find();
    console.log(`📊 Total Users: ${users.length}`);
    
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Find all payments
    const allPayments = await GroupFund.find();
    console.log(`\n📊 Total Payments: ${allPayments.length}`);

    // Find failed payments
    const failedPayments = await GroupFund.find({ status: 'Failed' }).populate('userId', 'name email');
    
    console.log(`\n❌ Failed Payments: ${failedPayments.length}`);
    
    if (failedPayments.length === 0) {
      console.log('\n⚠️  NO FAILED PAYMENTS FOUND!');
      console.log('\n💡 Solution: Run this command to create test data:');
      console.log('   npm run test:failed-payment\n');
    } else {
      console.log('\n📋 Failed Payment Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      failedPayments.forEach((payment, index) => {
        console.log(`\n${index + 1}. Payment ID: ${payment._id}`);
        console.log(`   User: ${payment.userId?.name || 'Unknown'} (${payment.userId?.email || 'Unknown'})`);
        console.log(`   Month: ${payment.month}`);
        console.log(`   Amount: ₹${payment.amount}`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Deadline: ${payment.deadline.toLocaleDateString('en-IN')}`);
        
        if (payment.failedPaymentSubmission?.resubmittedPhoto) {
          console.log(`   ⏱️  Resubmission: PENDING (submitted on ${payment.failedPaymentSubmission.resubmittedDate.toLocaleDateString('en-IN')})`);
        } else {
          console.log(`   📝 Resubmission: None (ready to resubmit)`);
        }
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('✅ To test, login with one of these emails and check the dashboard\n');
    }

    // Check payment status distribution
    const statusCounts = await GroupFund.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('📊 Payment Status Distribution:');
    statusCounts.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
};

checkFailedPayments();
