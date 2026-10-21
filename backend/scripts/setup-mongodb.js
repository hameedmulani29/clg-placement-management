const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const { seedMongoData } = require('../src/config/mongoSeeder');
const MongoUser = require('../src/models/mongoose/User');
const MongoStudentProfile = require('../src/models/mongoose/StudentProfile');
const MongoCompany = require('../src/models/mongoose/Company');
const MongoRecruiterProfile = require('../src/models/mongoose/RecruiterProfile');
const MongoPlacementDrive = require('../src/models/mongoose/PlacementDrive');
const MongoApplication = require('../src/models/mongoose/Application');
const MongoInterviewSchedule = require('../src/models/mongoose/InterviewSchedule');
const MongoPlacementResult = require('../src/models/mongoose/PlacementResult');
const MongoNotification = require('../src/models/mongoose/Notification');
const MongoAuditLog = require('../src/models/mongoose/AuditLog');

const setupMongoDB = async () => {
  const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

  console.log('=================================================================');
  console.log('      PlaceCloud — MongoDB Atlas Database Initializer & Setup     ');
  console.log('=================================================================\n');

  if (!mongoURI) {
    console.error('❌ [Configuration Error] MONGODB_URI is not set in backend/.env!\n');
    console.log('👉 To set up MongoDB Atlas:');
    console.log('   1. Open backend/.env');
    console.log('   2. Add your MongoDB Atlas connection string:');
    console.log('      MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/placecloud?retryWrites=true&w=majority');
    console.log('   3. Run this script again: npm run setup:mongo\n');
    console.log('=================================================================');
    process.exit(1);
  }

  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    console.log(`   Cluster Target: ${mongoURI.split('@')[1]?.split('?')[0] || 'Remote MongoDB'}`);

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      dbName: 'placecloud',
    });

    console.log(`✅ Connected successfully to Database: "${mongoose.connection.name}" on host: ${mongoose.connection.host}\n`);

    console.log('🌱 Seeding initial Enterprise Collections, Profiles & Placement Drives...');
    await seedMongoData({ reset: true });

    console.log('\n=================================================================');
    console.log('🎉 MongoDB Atlas Setup & Database Seeding Completed Successfully!');
    console.log('=================================================================\n');

    console.log('📊 Initialized Collection Summary:');
    console.log(`   • Users:               ${await MongoUser.countDocuments()}`);
    console.log(`   • Student Profiles:    ${await MongoStudentProfile.countDocuments()}`);
    console.log(`   • Corporate Companies: ${await MongoCompany.countDocuments()}`);
    console.log(`   • Recruiter Profiles:  ${await MongoRecruiterProfile.countDocuments()}`);
    console.log(`   • Placement Drives:    ${await MongoPlacementDrive.countDocuments()}`);
    console.log(`   • Applications:        ${await MongoApplication.countDocuments()}`);
    console.log(`   • Interviews:          ${await MongoInterviewSchedule.countDocuments()}`);
    console.log(`   • Placement Results:   ${await MongoPlacementResult.countDocuments()}`);
    console.log(`   • Notifications:       ${await MongoNotification.countDocuments()}`);
    console.log(`   • Audit Logs:          ${await MongoAuditLog.countDocuments()}\n`);

    console.log('🔑 Credentials for Immediate Testing (Use on /login):');
    console.log('   ------------------------------------------------------------');
    console.log('   [Student Persona]   arjun.sharma@college.edu     / StudentPassword123!');
    console.log('   [Recruiter Persona] recruiter.google@google.com  / RecruiterPassword123!');
    console.log('   [TPO Admin Persona] admin@college.edu            / AdminPassword123!');
    console.log('   ------------------------------------------------------------\n');

    await mongoose.disconnect();
    console.log('🔒 Disconnected cleanly from MongoDB Atlas.');
    console.log('🚀 You can now start the application with a single command:');
    console.log('   npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ [Setup Failure] Error during MongoDB Atlas initialization:');
    console.error(`   ${error.message}\n`);
    if (error.stack) {
      console.error(error.stack);
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

setupMongoDB();
