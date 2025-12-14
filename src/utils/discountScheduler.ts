import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const bannerPath = path.join(__dirname, '../data/banner.json');

// Function to check Pakistan time and update discount
export const updateDiscountBasedOnTime = () => {
  try {
    // Get current time in Pakistan (PKT is UTC+5)
    const now = new Date();
    const pakistanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
    const hour = pakistanTime.getHours();

    // Read current banner data
    const bannerData = JSON.parse(fs.readFileSync(bannerPath, 'utf-8'));

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
    if (bannerData.discountPercentage !== newDiscount) {
      bannerData.discountPercentage = newDiscount;
      fs.writeFileSync(bannerPath, JSON.stringify(bannerData, null, 2));
      console.log(`Discount updated to ${newDiscount}% at ${pakistanTime.toLocaleString()}`);
    }
  } catch (error) {
    console.error('Error updating discount:', error);
  }
};

// Initialize discount on server start
export const initializeDiscount = () => {
  console.log('Initializing discount based on Pakistan time...');
  updateDiscountBasedOnTime();
};

// Schedule discount updates every hour
export const scheduleDiscountUpdates = () => {
  // Run every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running scheduled discount update...');
    updateDiscountBasedOnTime();
  });

  console.log('Discount scheduler started - will update every hour based on Pakistan time');
};
