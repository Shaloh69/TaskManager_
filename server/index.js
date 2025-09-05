/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
require('dotenv').config();
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MongoDB URI is not defined in environment variables');
  process.exit(1);
}

console.log('Connection string format check:');
console.log('- Starts with mongodb+srv://?', uri.startsWith('mongodb+srv://'));
console.log('- Contains cluster hostname?', uri.includes('.mongodb.net'));
console.log('- URI length:', uri.length);

// Create a MongoClient with enhanced error handling
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add connection timeout settings
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
});

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URI pattern:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    // Connect with timeout
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Ping successful!");
    
    // List databases to verify connection
    const databasesList = await client.db().admin().listDatabases();
    console.log("✅ Available databases:", databasesList.databases.map(db => db.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code || 'No code');
    
    // Specific error handling
    if (error.code === 'ENODATA' || error.message.includes('querySrv ENODATA')) {
      console.error('\n🔍 DNS Resolution Failed - Troubleshooting steps:');
      console.error('1. Verify your cluster hostname in MongoDB Atlas');
      console.error('2. Check if your cluster is running (not paused)');
      console.error('3. Ensure your connection string uses mongodb+srv://');
      console.error('4. Try using a standard mongodb:// connection string instead');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🔍 Host not found - Check your internet connection and cluster URL');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n🔍 Authentication failed - Check username/password and URL encoding');
    } else if (error.message.includes('not authorized')) {
      console.error('\n🔍 Authorization failed - Check database user permissions');
    } else if (error.message.includes('IP not in whitelist')) {
      console.error('\n🔍 IP not whitelisted - Add your IP to Network Access in Atlas');
    }
    
  } finally {
    // Ensure connection is closed
    try {
      await client.close();
      console.log('Connection closed.');
    } catch (closeError) {
      console.error('Error closing connection:', closeError.message);
    }
  }
}

// Alternative connection method using standard mongodb:// if SRV fails
async function tryStandardConnection() {
  console.log('\n🔄 Trying standard mongodb:// connection...');
  
  // Convert SRV to standard format (you'll need to get the actual hosts from Atlas)
  const standardUri = uri.replace('mongodb+srv://', 'mongodb://')
                         .replace('@cluster0.fdtpayg.mongodb.net', '@cluster0-shard-00-00.fdtpayg.mongodb.net:27017,cluster0-shard-00-01.fdtpayg.mongodb.net:27017,cluster0-shard-00-02.fdtpayg.mongodb.net:27017');
  
  const standardClient = new MongoClient(standardUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  try {
    await standardClient.connect();
    console.log('✅ Standard connection successful!');
    await standardClient.close();
  } catch (error) {
    console.error('❌ Standard connection also failed:', error.message);
  }
}

// Run the tests
testConnection()
  .then(() => {
    // If SRV connection fails, you might want to try standard connection
    // Uncomment the next line to test standard mongodb:// format
    // return tryStandardConnection();
  })
  .catch(console.error);