require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const { ensureCoreAdminContent } = require('../utils/contentBootstrap');

const MONGO_URI = process.env.MONGODB_URI;

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await Admin.findOne({ username: 'saranhs' });

        if (!existingAdmin) {
            await Admin.create({ username: 'saranhs', password: 'saranhs' });
            console.log('Admin created: saranhs / saranhs');
        } else {
            console.log('Admin already exists');
        }

        await ensureCoreAdminContent();

        console.log('Default admin content is ready');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
}

seed();
