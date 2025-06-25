import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan.js';

dotenv.config();

const removePlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sellthis');
    console.log('Connected to MongoDB');

    // Count plans before deletion
    const planCount = await Plan.countDocuments();
    console.log(`Found ${planCount} plans in database`);

    if (planCount === 0) {
      console.log('No plans to delete');
      await mongoose.disconnect();
      return;
    }

    // Delete all plans
    const result = await Plan.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} plans from database`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error removing plans:', error);
    process.exit(1);
  }
};

removePlans();
