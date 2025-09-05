// Quick MongoDB Connection Test for New Atlas Cluster
// Run with: node test-connection.js

const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB Atlas connection...');
    
    // Your NEW connection string from Atlas
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';
    
    if (mongoURI.includes('<db_password>')) {
      console.error('❌ Please replace <db_password> with your actual password in .env file');
      process.exit(1);
    }
    
    console.log(`📍 Testing URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`);
    console.log('🎯 Cluster: cluster0.fdtpayg.mongodb.net');
    console.log('👤 User: saaraminniesubiza_db_user');
    
    const options = {
      serverSelectionTimeoutMS: 15000, // Increased timeout for Atlas
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB Atlas connection successful!');
    console.log(`📊 Connected to database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    console.log(`🏷️  Connection ID: ${mongoose.connection.id}`);
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({ 
      test: String,
      timestamp: { type: Date, default: Date.now }
    });
    const TestModel = mongoose.model('ConnectionTest', TestSchema);
    
    const testDoc = new TestModel({ test: 'Atlas connection successful!' });
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    console.log(`📝 Document ID: ${testDoc._id}`);
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document deleted successfully!');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully!');
    console.log('🎉 Your MongoDB Atlas setup is working perfectly!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Error Code:', error.code);
    
    if (error.code === 'ENODATA') {
      console.log('\n🔧 DNS Resolution Issue:');
      console.log('1. Check your internet connection');
      console.log('2. Try different DNS servers (8.8.8.8, 1.1.1.1)');
      console.log('3. Verify cluster hostname: cluster0.fdtpayg.mongodb.net');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication Issue:');
      console.log('1. Check username: saaraminniesubiza_db_user');
      console.log('2. Verify password is correct');
      console.log('3. Ensure user has database permissions');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n🔧 Hostname Not Found:');
      console.log('1. Verify cluster is active in MongoDB Atlas');
      console.log('2. Check cluster hostname spelling');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Go to MongoDB Atlas → Network Access → Add IP 0.0.0.0/0');
    console.log('2. Go to Database Access → Verify user permissions');
    console.log('3. Check cluster status in Atlas dashboard');
    
    process.exit(1);
  }
};

// Run the test
testConnection();