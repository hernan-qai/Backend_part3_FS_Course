const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
//app.use(morgan('tiny'));

// Custom token to log POST request data
morgan.token('post-data', (req, res) => {
    if (req.method === 'POST') {
        const { name, number } = req.body;
        return JSON.stringify({ name, number }); // Only log specific fields
    }
    return '-';
});

const customFormat = ':method :url :status :res[content-length] - :response-time ms :post-data';
app.use(morgan(customFormat));

// Initial list of persons
let listNames = [
    { "id": 1, "name": "Arto Hellas", "number": "040-123456"},
    { "id": 2, "name": "Ada Lovelace", "number": "39-44-5323523"},
    { "id": 3, "name": "Dan Abramov", "number": "12-43-234345"},
    { "id": 4, "name": "Mary Poppendieck", "number": "39-23-6423122"}
]

// GET all persons
app.get('/api/persons/', (request, response) => {
    response.json(listNames);
});

// GET info page
app.get('/info', (request, response) => {
    const numberOfEntries = listNames.length;
    const timestamp = new Date().toLocaleString();
    
    response.send(`
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h1>Phonebook Info</h1>
            <p>Phonebook has info for ${numberOfEntries} people</p>
            <p>Time of request: ${timestamp}</p>
        </div>
    `);
});

// Get a specific person by ID

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const person = listNames.find(person => person.id === id);

    if (person) {
        response.json(person);
    }
    else {
        response.status(404).json({ error: 'person not found' });
    }
});

// Delete a person by ID
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const initialLength = listNames.length;
    listNames = listNames.filter(person => person.id !== id);

    if (listNames.length < initialLength) {
        console.log(`Deleted person with id: ${id}`);
        response.status(204).end();
    } else {
        response.status(404).json({ error: 'person not found' });
    }
});

// Add a new person
// POST new person
app.post('/api/persons', (request, response) => {
    const body = request.body;
    
    // Validation: Check required fields
    if (!body.name || !body.number) {
        return response.status(400).json({ 
            error: 'Name and number are required' 
        });
    }
    
    // Check for duplicate name (case-insensitive)
    const nameExists = listNames.some(person => 
        person.name.toLowerCase() === body.name.toLowerCase()
    );
    
    if (nameExists) {
        return response.status(409).json({ 
            error: `Person "${body.name}" already exists` 
        });
    }
    
    // Generate new ID
    const newId = listNames.length > 0 
        ? Math.max(...listNames.map(person => person.id)) + 1 
        : 1;
    
    // Create new person object
    const newPerson = {
        id: newId,
        name: body.name.trim(),
        number: body.number.trim()
    };
    
    // Add to the list
    listNames = listNames.concat(newPerson);
    
    console.log('New person added:', newPerson);
    
    // Return 201 Created with the new person
    response.status(201).json(newPerson);
});

//Connecting to server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    //console.log(` API endponits: `);
});
