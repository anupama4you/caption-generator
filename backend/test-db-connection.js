/**
 * Database Connection Test Script
 * Run: node test-db-connection.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('\n🔍 Testing Database Connection...\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not found in .env file');
    console.log('   Make sure backend/.env exists with DATABASE_URL set\n');
    process.exit(1);
  }

  // Parse connection string (hide password)
  const dbUrl = process.env.DATABASE_URL;
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

  if (urlParts) {
    const [, user, password, host, port, database] = urlParts;
    console.log('📋 Connection Details:');
    console.log(`   User: ${user}`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${database.split('?')[0]}`);
    console.log(`   Password: ${'*'.repeat(password.length)} (hidden)\n`);

    // Check for common issues
    if (password.includes('[YOUR-PASSWORD]')) {
      console.error('❌ ERROR: Password placeholder not replaced!');
      console.log('   Replace [YOUR-PASSWORD] with your actual Supabase password\n');
      process.exit(1);
    }

    if (password.trim() !== password) {
      console.warn('⚠️  WARNING: Password has leading/trailing spaces\n');
    }
  }

  try {
    console.log('⏳ Attempting to connect...\n');

    // Try to connect
    await prisma.$connect();
    console.log('✅ SUCCESS: Database connection established!\n');

    // Try a simple query
    console.log('⏳ Testing query execution...\n');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ SUCCESS: Query executed!');
    console.log('   PostgreSQL Version:', result[0].pg_version.split(' ')[0]);
    console.log('   Server Time:', result[0].current_time.toISOString());
    console.log('\n🎉 Database is working perfectly!\n');

    // Check if tables exist
    console.log('⏳ Checking for tables...\n');
    const tables = await prisma.$queryRaw`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    if (tables.length > 0) {
      console.log('✅ Found tables:');
      tables.forEach(t => console.log(`   - ${t.tablename}`));
      console.log('');
    } else {
      console.log('⚠️  No tables found. Run migrations:');
      console.log('   npx prisma migrate dev\n');
    }

  } catch (error) {
    console.error('❌ CONNECTION FAILED!\n');
    console.error('Error:', error.message);
    console.log('\n🔧 Common Solutions:\n');

    if (error.message.includes('Can\'t reach database')) {
      console.log('1. Check if Supabase project is active (not paused)');
      console.log('   → https://supabase.com/dashboard\n');
      console.log('2. Verify DATABASE_URL has correct password');
      console.log('   → Replace [YOUR-PASSWORD] with actual password\n');
      console.log('3. Try Connection Pooler (port 6543 instead of 5432)');
      console.log('   → Get "Session Mode" connection string from Supabase\n');
      console.log('4. Check IPv4 connectivity:');
      console.log('   → ping db.yourproject.supabase.co\n');
      console.log('5. Check firewall/antivirus settings');
      console.log('   → Allow outbound connections on ports 5432 and 6543\n');
    } else if (error.message.includes('password authentication failed')) {
      console.log('1. Password is incorrect');
      console.log('   → Reset it in Supabase: Settings → Database → Reset password\n');
      console.log('2. Special characters in password need URL encoding');
      console.log('   → @ becomes %40, # becomes %23, etc.\n');
    } else if (error.message.includes('timeout')) {
      console.log('1. Network/firewall blocking connection');
      console.log('   → Try disabling VPN\n');
      console.log('2. Use Connection Pooler (more reliable)');
      console.log('   → Get Session Mode string from Supabase Dashboard\n');
    }

    console.log('📖 See TROUBLESHOOTING.md for detailed help\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
