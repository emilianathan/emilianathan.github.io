const { MongoClient } = require('mongodb');
const http = require('http');
const url = require('url');

const mongoUrl = "mongodb+srv://emiliajnathan:dbuser123@democluster.gughvhx.mongodb.net/?retryWrites=true&w=majority&appName=democluster";
client = new MongoClient(mongoUrl);

async function findStock(userInput, userTypePref) {
  try {
    await client.connect();
    const dbo = client.db("Stock");
    const coll = dbo.collection('PublicCompanies');

    const userSearch = {};
    if (userTypePref === 'ticker') {
      userSearch.ticker = userInput.toUpperCase(); 
    } else if (userTypePref === 'company') {
      userSearch.name = { $regex: userInput }; 
    }
    
    const options = {
      projection: { _id: 0, companyName: 1, ticker: 1, price: 1 },
    };
    
    const curs = coll.find(userSearch, options);
    
    // Print a message if no documents were found
    if ((await curs.count()) === 0) {
      console.log("No documents found!");
    }
    
    const results = [];
    await curs.forEach(function(item){
      console.log(`Name: ${item.companyName}, Ticker: ${item.ticker}, Price: ${item.price}`);
      results.push(item);
    });
    
    if (results.length === 0) {
      console.log("Stock not found.");
    }

    return results;
  } 
  catch(err) {
    console.log("Database error: " + err);
    throw err;
  }
  finally {
    client.close();
  }
} 

http.createServer(async function (req, res) {
  const queryObject = url.parse(req.url,true).query;
  const userInput = queryObject.userInput;
  const userTypePref = queryObject.userTypePref;

  try {
    const results = await findStock(userInput, userTypePref);
    console.log(results); 
    res.writeHead(200, {'Content-Type': 'application/json'});
  } catch (err) {
    console.error("Error:", err);
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Internal Server Error');
  }
}).listen(3000);

console.log('Server running at http://localhost:3000/');
