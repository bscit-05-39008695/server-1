const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5015;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Set up PostgreSQL connection pool
const pool = new Pool({
    'user': 'postgres.nzqybfjrmlsbrskzbyil',
    'host': 'aws-0-ap-south-1.pooler.supabase.com',
    'database': 'postgres',
    'password': 'WMBqWdQO4TYIx8MM',
    'port': 5432
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
// Store credentials endpoint - Store user with null verification_token
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
        // Hash the password before storing it (optional, uncomment if needed)
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the user without the verification token
        const query = 'INSERT INTO users(email, password) VALUES($1, $2) RETURNING *';
        console.log('📝 Executing query with email:', email);
        
        const result = await pool.query(query, [email, password]);
        console.log('✅ User stored successfully:', result.rows[0]);
        
        // Send back response
        res.status(200).json({
            success: true,
            message: 'User stored successfully',
            user: result.rows[0],
            shouldNavigate: true,
            navigateTo: '/verification' // User will go to the verification step
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
