const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const sequelize = require('./src/config/database');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Admin credentials
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@lms.com',
      password: 'admin123', // Change this to a secure password
      role: 'admin',
      isActive: true
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminData.email } });
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const admin = await User.create({
      ...adminData,
      password: hashedPassword
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
