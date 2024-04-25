const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

const connStr = "mongodb+srv://emiliajnathan:dbuser123@democluster.gughvhx.mongodb.net/?retryWrites=true&w=majority&appName=democluster";

function insertIntoDatabase(db, company) {
    const collection = db.collection('companies');
    collection.insertOne(company, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("Inserted:", company);
        }
    });
}

const file_name = 'companies.csv';
MongoClient.connect(connStr, function(err, mydatabase) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to MongoDB successfully!");
        const db = mydatabase.db("Stock"); 
        const collection = db.collection('PublicCompanies');
        fs.readFile(file_name, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            const rows = data.split('\n').slice(1); 
            rows.forEach(row => {
                const [company_name, ticker, price] = row.split(',');
                const company = {
                    name: company_name.trim(),
                    ticker: ticker.trim(),
                    price: parseFloat(price.trim())
                };
                insertIntoDatabase(db, company);
            });
            client.close();
        });
    }
});
