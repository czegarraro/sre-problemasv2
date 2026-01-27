/**
 * MongoDB Connection Test Script
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');

const testConnection = async () => {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('📝 Connection String (masked):');
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
  console.log(maskedUri);
  console.log('');

  const options = {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 60000,
  };

  let client;
  
  try {
    console.log('🔄 Attempting to connect...');
    client = new MongoClient(uri, options);
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db(process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos');
    console.log(`📊 Database: ${db.databaseName}`);
    
    // Ping the database
    console.log('🏓 Pinging database...');
    await db.admin().ping();
    console.log('✅ Ping successful!');
    
    // List collections
    console.log('📁 Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Count documents in problems collection
    const collectionName = process.env.MONGODB_COLLECTION_NAME || 'problems';
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments();
    console.log(`\n📊 Total documents in '${collectionName}': ${count}`);
    
    console.log('\n✅ All tests passed! MongoDB connection is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('timed out')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify your IP is whitelisted in MongoDB Atlas');
      console.error('      - Go to: Network Access > Add IP Address');
      console.error('      - Add your current IP or use 0.0.0.0/0 for testing');
      console.error('   3. Check if your firewall is blocking MongoDB port (27017)');
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication failed:');
      console.error('   1. Verify username and password in MONGODB_URI');
      console.error('   2. Check database user permissions in MongoDB Atlas');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed.');
    }
  }
};

testConnection();
