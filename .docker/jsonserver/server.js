const port = 8080;
const jsonServer = require('/usr/lib/node_modules/json-server');
const auth = require('/usr/lib/node_modules/json-server-auth');
const fs = require('fs');
const server = jsonServer.create();
const router = jsonServer.router('databases/current_database.json');
const middlewares = jsonServer.defaults();
server.use(jsonServer.bodyParser);

// Middleware para manejar errores JSON inválidos
server.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ message: 'Invalid JSON' });
  } else {
    next();
  }
});

//Custom routes
//Custom route to reset database
server.get('/resetdatabase', (req, res) => {
  console.log('Incoming reset database request');
  try {
    const initialDbContent = fs.readFileSync('databases/initial_database.json', 'utf8');

    try {
      const initialJsonData = JSON.parse(initialDbContent);
      fs.writeFileSync('databases/current_database.json', JSON.stringify(initialJsonData, null, 2));
      res.json({ message: 'Database reset and reloaded successfully' });
      console.log('Database has been reset');
      fs.writeFileSync('server.pid', Date.now());
      //nodemon will restart the server
    } catch (error) {
      console.error('Error resetting initial database:', error);
    }


  } catch (error) {
    res.status(500).json({ message: 'Error resetting and reloading database' });
  }
});


// Custom route to load fixtures
server.post('/loadfixtures', (req, res) => {
  console.log('Incoming load fixtures request');
  try {
    const fixtures = req.body;

    if (!fixtures || Object.keys(fixtures).length === 0) {
      return res.status(400).json({ message: 'Fixtures data is missing or empty :(' });
    }

    const currentDbContent = fs.readFileSync('databases/current_database.json', 'utf8');
    const currentData = JSON.parse(currentDbContent);

    for (const key in fixtures) {
      if (currentData.hasOwnProperty(key)) {
        currentData[key] = currentData[key].concat(fixtures[key]);
      } else {
        currentData[key] = fixtures[key];
      }
    }

    fs.writeFileSync('databases/current_database.json', JSON.stringify(currentData, null, 2));
    res.json({ message: 'Fixtures loaded successfully' });
    console.log('Fixtures loaded');
    fs.writeFileSync('server.pid', Date.now());

    //nodemon will restart the server

  } catch (error) {
    console.error('Error loading fixtures:', error);
    res.status(500).json({ message: 'Error loading fixtures' });
  }
});


server.db = router.db;
server.use(auth);
server.use(middlewares);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});