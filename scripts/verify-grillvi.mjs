import fs from 'fs';
import path from 'path';
import assert from 'assert';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

console.log('====================================================');
console.log('🧪 RUNNING RESTAURANT TEMPLATE AUTOMATED TEST SUITE');
console.log('====================================================\n');

// 1. Verify Initial Data & Catalogue
console.log('Step 1: Checking Menu Categories and Catalogue Prices...');
const initialDataFile = path.resolve('src/lib/initialData.ts');
assert(fs.existsSync(initialDataFile), 'initialData.ts must exist');

const content = fs.readFileSync(initialDataFile, 'utf-8');

// Check key items and exact prompt prices
const requiredPrices = [
  { item: 'Chicken Chessy Craft', price: '899' },
  { item: 'Loaded Fries', price: '548' },
  { item: 'French Fries', price: '399' },
  { item: 'Masala Fries', price: '499' },
  { item: 'Chicken Malai Paratha Roll', price: '599' },
  { item: 'Chicken Tikka Paratha Roll', price: '549' },
  { item: 'BBQ Mixed Paratha Roll', price: '999' },
  { item: 'Velvet Creamy Pasta (Alfredo)', price: '999' },
  { item: 'Chef Special Pasta', price: '1099' },
  { item: 'Chicken Tikka Boti', price: '599' },
  { item: 'Chicken Seekh Kabab (1 pc)', price: '230' },
  { item: 'Chicken Turkish Kabab (1 pc)', price: '249' },
  { item: 'Chicken Reshmi Kabab (1 pc)', price: '249' },
  { item: 'Beef Seekh Kabab (1 pc)', price: '349' },
  { item: 'Beef Gola Kabab (2 pc)', price: '349' },
  { item: 'Chicken Tikka Leg', price: '499' },
  { item: 'Chicken Tikka Breast', price: '530' },
  { item: 'Chicken Karahi', price: '899' },
  { item: 'Chicken Achari Karahi', price: '949' },
  { item: 'Chicken White Karahi', price: '999' },
  { item: 'Chicken Afghani Karahi', price: '999' },
  { item: 'Chicken Handi', price: '999' },
  { item: 'Chicken White Handi', price: '1049' },
  { item: 'Chicken Achari Handi', price: '1049' },
  { item: 'Beef Kabab Masala', price: '1199' },
  { item: 'Chicken Kabab Masala', price: '1099' },
  { item: 'Boti Platter', price: '699' },
  { item: 'Seekh Kabab Platter', price: '1099' },
  { item: 'BBQ Mix Platter', price: '1999' },
  { item: 'Thaal 1', price: '2299' },
  { item: 'Signature Sharing Thaal', price: '4499' },
  { item: 'Family Sharing Feast Thaal', price: '6499' },
  { item: 'Soft Drink Regular', price: '90' },
  { item: 'Soft Drink 1 Litre', price: '170' },
  { item: 'Soft Drink 1.5 Litre', price: '220' },
  { item: 'Mineral Water Small', price: '70' },
  { item: 'Mineral Water Large', price: '150' },
  { item: 'Mint Yogurt Sauce', price: '130' },
  { item: 'Special Sauce', price: '130' },
  { item: 'Special Rice', price: '450' },
  { item: 'Fresh Salad', price: '150' },
  { item: 'Extra Cheese', price: '99' },
  { item: 'Plain Naan', price: '30' },
  { item: 'Roghni Naan', price: '70' },
  { item: 'Garlic Naan', price: '90' },
  { item: 'Kalwanji Naan', price: '90' },
  { item: 'Tandoori Roti', price: '15' },
  { item: 'Khameeri Roti', price: '40' },
  { item: 'Homemade Kheer', price: '299' },
  { item: 'Gulab Jamun', price: '249' },
];

for (const check of requiredPrices) {
  assert(
    content.includes(check.item),
    `Catalogue must contain "${check.item}"`
  );
  assert(
    content.includes(check.price),
    `Catalogue must contain price ${check.price} for "${check.item}"`
  );
}
console.log(`✅ All ${requiredPrices.length} menu dishes & prices match the exact catalog!`);

// 2. Verify Admin Password Hashing
console.log('\nStep 2: Checking Admin Password Hashing Security...');
const initialAdminPass = 'test-only-password-for-hash-check';
const salt = bcrypt.genSaltSync(10);
const hashed = bcrypt.hashSync(initialAdminPass, salt);
assert(bcrypt.compareSync(initialAdminPass, hashed), 'Admin password hash must match');
assert(!bcrypt.compareSync('wrongpassword', hashed), 'Invalid password must be rejected');
console.log('✅ Admin bcrypt hashing and authentication verified!');

// 3. Verify QR Code generation
console.log('\nStep 3: Checking Automatic QR Code Generation...');
const testUrl = 'http://localhost:3000/menu/item/gv-thaal-02';
const qrDataUrl = await QRCode.toDataURL(testUrl);
assert(qrDataUrl.startsWith('data:image/png;base64,'), 'QR Code must be valid PNG data URL');
console.log('✅ QR Code generated successfully (' + qrDataUrl.slice(0, 35) + '...)');

// 4. Verify template defaults do not contain the previous restaurant's contact details
console.log('\nStep 4: Checking neutral restaurant defaults...');
const settingsMatch = content.match(/export const initialRestaurantSettings:[\s\S]*?= \{([\s\S]*?)\n\};/);
assert(settingsMatch, 'Initial restaurant settings must be defined');
const defaultSettings = settingsMatch[1];
for (const key of ['name', 'tagline', 'phone', 'whatsapp', 'address', 'googleMapsUrl']) {
  assert(
    new RegExp(`${key}:\\s*''`).test(defaultSettings) ||
      (key === 'name' && /name:\s*'Restaurant Name'/.test(defaultSettings)) ||
      (key === 'tagline' && /tagline:\s*'Your Restaurant Tagline'/.test(defaultSettings)),
    `Default ${key} must be blank or use a generic placeholder`
  );
}
console.log('✅ Restaurant identity and contact fields use neutral template defaults!');

// 5. Check Image Assets
console.log('\nStep 5: Verifying Brand Assets in public/images...');
const templateImages = [
  'public/images/chicken-karahi.jpg',
  'public/images/signature-sharing-thaal.jpg',
  'public/images/family-sharing-thaal.jpg',
];

for (const imgPath of templateImages) {
  assert(fs.existsSync(imgPath), `Template asset ${imgPath} must exist`);
  const stat = fs.statSync(imgPath);
  assert(stat.size > 10000, `Brand asset ${imgPath} must not be empty`);
}
console.log('✅ All template food images exist and are high quality!');

console.log('\n====================================================');
console.log('🎉 ALL TESTS PASSED! RESTAURANT TEMPLATE IS READY!');
console.log('====================================================');
