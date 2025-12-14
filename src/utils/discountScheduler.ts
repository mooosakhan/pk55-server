import cron from 'node-cron';
import Banner from '../models/Banner';

// Function to check Pakistan time and update discount
export const updateDiscountBasedOnTime = async () => {
  try {
    // Get current time in Pakistan (PKT is UTC+5)
    const now = new Date();
    const pakistanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
    const hour = pakistanTime.getHours();

    // Get the most recent banner
    const banner = await Banner.findOne().sort({ createdAt: -1 });
    
    if (!banner) {
      console.log('No banner found to update discount');
      return;
    }

    // Day: 6 AM to 6 PM (50% discount)
    // Night: 6 PM to 6 AM (70% discount)
    let newDiscount: number;
    
    if (hour >= 6 && hour < 18) {
      // Day time (6 AM to 6 PM)
      newDiscount = 50;
    } else {
      // Night time (6 PM to 6 AM)
      newDiscount = 70;
    }

    // Only update if discount has changed
    if (banner.discountPercentage !== newDiscount) {
      banner.discountPercentage = newDiscount;
      await banner.save();
      console.log(`✓ Discount updated to ${newDiscount}% at ${pakistanTime.toLocaleString()}`);
    } else {
      console.log(`Discount already set to ${newDiscount}% (no change needed)`);
    }
  } catch (error) {
    console.error('✗ Error updating discount:', error);
  }
};

// Initialize discount on server start
export const initializeDiscount = async () => {
  console.log('⚙️  Initializing discount based on Pakistan time...');
  await updateDiscountBasedOnTime();
};

// Schedule discount updates every hour
export const scheduleDiscountUpdates = () => {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Running scheduled discount update...');
    updateDiscountBasedOnTime();
  });

  console.log('📅 Discount scheduler started - will update every hour based on Pakistan time');
};
