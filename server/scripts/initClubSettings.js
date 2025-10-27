import mongoose from 'mongoose';
import ClubSettings from '../models/ClubSettings.js';
import dotenv from 'dotenv';

dotenv.config();

const initializeClubSettings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aurora-treasury');
    console.log('✅ MongoDB Connected');

    // Check if settings already exist
    const existingSettings = await ClubSettings.findOne();
    
    if (existingSettings) {
      console.log('⚠️  Club settings already exist:');
      console.log('Aurora Code:', existingSettings.auroraCode);
      console.log('Is Active:', existingSettings.isActive);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Do you want to update? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
          const newCode = process.argv[2] || 'AURORA2024';
          existingSettings.auroraCode = newCode.toUpperCase();
          existingSettings.isActive = true;
          await existingSettings.save();
          console.log('✅ Club settings updated successfully!');
          console.log('New Aurora Code:', newCode.toUpperCase());
        } else {
          console.log('No changes made.');
        }
        readline.close();
        mongoose.connection.close();
      });
    } else {
      // Create new settings
      const auroraCode = process.argv[2] || 'AURORA2024';
      
      const settings = await ClubSettings.create({
        auroraCode: auroraCode.toUpperCase(),
        clubName: 'Aurora Treasury',
        isActive: true
      });

      console.log('✅ Club settings initialized successfully!');
      console.log('Aurora Code:', settings.auroraCode);
      console.log('Club Name:', settings.clubName);
      console.log('\n⚠️  IMPORTANT: Share this Aurora Code with club members for login.');
      
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

initializeClubSettings();
