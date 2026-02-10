const dns = require('dns');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://rishwank:rishwan@pharmasense.mjuahs7.mongodb.net/pharmasense';
console.log('Testing connection to:', uri);

// Extract hostname from URI
const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^\/]+)/);
const hostname = match ? match[1] : null;

if (!hostname) {
    console.error("Could not parse hostname from URI");
    process.exit(1);
}

console.log('Hostname:', hostname);
console.log('1. Testing DNS Resolution (SRV)...');

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
    if (err) {
        console.error('❌ SRV Lookup Failed:', err.code, err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log('   -> This usually means your DNS server is blocking the request or unreachable.');
        }
        // Proceed to try mongoose anyway to see full error
    } else {
        console.log('✅ SRV Lookup Successful:', addresses);
    }

    console.log('\n2. Testing Mongoose Connection...');
    mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 })
        .then(() => {
            console.log('✅ MongoDB Connected Successfully!');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Mongoose Connection Failed:');
            console.error(err.name);
            console.error(err.message);
            process.exit(1);
        });
});
