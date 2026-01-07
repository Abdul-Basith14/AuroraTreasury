import cron from 'node-cron';
import GroupFund from '../models/GroupFund.js';

/**
 * Cron job to mark overdue payments as Failed
 * Runs every day at midnight (00:00)
 * 
 * Cron format: * * * * * *
 * Fields: second minute hour day month dayOfWeek
 */
export const startCronJobs = () => {
  // Run immediately on startup to catch any missed updates while server was down
  console.log('🔄 Running initial check for overdue payments...');
  GroupFund.markOverdueAsFailed()
    .then(result => {
      if (result.modifiedCount > 0) {
        console.log(`✅ Initial check: Marked ${result.modifiedCount} overdue payment(s) as Failed`);
      } else {
        console.log('✅ Initial check: No overdue payments found');
      }
    })
    .catch(err => console.error('❌ Error in initial overdue check:', err));

  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🕒 Running cron job: Marking overdue payments as Failed');

      const result = await GroupFund.markOverdueAsFailed();

      if (result.modifiedCount > 0) {
        console.log(`✅ Marked ${result.modifiedCount} overdue payment(s) as Failed`);
      } else {
        console.log('✅ No overdue payments found');
      }
    } catch (error) {
      console.error('❌ Error in cron job (mark overdue payments):', error);
    }
  });

  console.log('✅ Cron jobs started successfully');
};

/**
 * Alternative: Run cron job every hour (for testing or more frequent checks)
 * Uncomment to use
 */
export const startHourlyCronJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🕒 Running hourly cron job: Marking overdue payments');
      const result = await GroupFund.markOverdueAsFailed();
      console.log(`✅ Checked overdue payments: ${result.modifiedCount} marked as Failed`);
    } catch (error) {
      console.error('❌ Error in hourly cron job:', error);
    }
  });

  console.log('✅ Hourly cron job started');
};

export default { startCronJobs, startHourlyCronJob };
