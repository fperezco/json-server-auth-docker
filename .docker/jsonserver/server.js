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

//aux methods
function updateDatabase() {
  const dbContent = fs.readFileSync('databases/current_database.json', 'utf8');
  const jsonData = JSON.parse(dbContent);
  router.db.setState(jsonData);
}

//Custom routes
//Custom route to reset database
server.get('/resetdatabase', (req, res) => {

  try {
    res.json({ message: 'Database reset and reloaded successfully' });
    const initialDbContent = fs.readFileSync('databases/initial_database.json', 'utf8');

    try {
      const initialJsonData = JSON.parse(initialDbContent);
      fs.writeFileSync('databases/current_database.json', JSON.stringify(initialJsonData, null, 2));

      //update database content in server
      updateDatabase();

    } catch (error) {
      console.error('Error resetting initial database:', error);
    }


  } catch (error) {
    res.status(500).json({ message: 'Error resetting and reloading database' });
  }
});


// Custom route to load fixtures
server.post('/loadfixtures', (req, res) => {

  try{
    const fixtures = req.body;

    if (!fixtures || Object.keys(fixtures).length === 0) {
      return res.status(400).json({ message: 'Fixtures data is missing or empty :(' });
    }
  

    fs.writeFileSync('databases/current_database.json', JSON.stringify(fixtures, null, 2));
    res.json({ message: 'Fixtures loaded successfully' });

     //update database content in server
     updateDatabase();

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