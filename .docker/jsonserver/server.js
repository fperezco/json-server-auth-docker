const port = 8080;
const jsonServer = require('/usr/lib/node_modules/json-server');
const auth = require('/usr/lib/node_modules/json-server-auth');
const fs = require('fs');
const server = jsonServer.create();
const router = jsonServer.router('databases/current_database.json');
const middlewares = jsonServer.defaults();

//Custom route to reset database
server.get('/resetdatabase', (req, res) => {
  const dbContent = fs.readFileSync('databases/initial_database.json', 'utf8');
  
  try {
    const jsonData = JSON.parse(dbContent);
    router.db.setState(jsonData);
    res.json({ message: 'Database reset and reloaded successfully' });

    const initialDbContent = fs.readFileSync('initial_database.json', 'utf8');
    try {
      const initialJsonData = JSON.parse(initialDbContent);
      fs.writeFileSync('current_database.json', JSON.stringify(initialJsonData, null, 2));
    } catch (error) {
      console.error('Error resetting initial database:', error);
    }


  } catch (error) {
    res.status(500).json({ message: 'Error resetting and reloading database' });
  }
});

server.db = router.db;
server.use(auth);
server.use(middlewares);
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});