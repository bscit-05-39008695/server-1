const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
// require('dotenv').config();
//const bcrypt = require('bcryptjs'); // Import bcrypt for hashing passwords

const app = express();
const port = 5017;


// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Set up PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres.jrnizucwniiqtllvosid',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    database: 'postgres',
    password: 'asanteyesu9376',
    port: 5432,
});
// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Database connected successfully');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        pool.query(createTableQuery)
            .then(() => console.log('✅ Users table ready'))
            .catch(err => console.error('❌ Error creating table:', err));
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Store credentials endpoint
app.post('/store-credentials', async (req, res) => {
    console.log('📝 Received request body:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('❌ Missing email or password');
        return res.status(400).json({ 
            error: 'Email and password are required',
            shouldNavigate: false
        });
    }

    try {
        // Hash the password before storing it
        // const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users(email, password) VALUES($1, $2) RETURNING *';
        console.log('📝 Executing query with email:', email);
        
        const result = await pool.query(query, [email, password]);
        console.log('✅ User stored successfully:', result.rows[0]);
        
        // Send back navigation instruction
        res.status(200).json({
            success: true,
            message: 'User stored successfully',
            user: result.rows[0],
            shouldNavigate: true,
            navigateTo: '/verification' // or wherever you want to navigate
        });
    } catch (err) {
        console.error('❌ Database error:', err);
        res.status(500).json({
            success: false,
            error: 'Error saving credentials',
            details: err.message,
            shouldNavigate: false
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
