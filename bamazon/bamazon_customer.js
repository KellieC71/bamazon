var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon_DB"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
  });

function start() {
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        var productArray = [];

        for (var i = 0; i < results.length; i++) {
                  productArray.push(results[i].item_id);
                  productArray.push(results[i].product_name);
                  productArray.push(results[i].price); 
          }
       console.table(results);
       askItem(results);
      });
    }

function askItem(inventory) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "item",
        message: "What is the ID of the item you want to buy?",
      }
    ])
    .then(function(val) {
      var itemId = parseInt(val.item);
      var product = checkInventory(itemId, inventory);

      if (product) {
        howMany(product);
      }
      else {
        console.log("\nThat item is not in the inventory.");
        start();
      }
    });
}

function howMany(product) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "quantity",
        message: "How many would you like?",
      }
    ])
    .then(function(val) {
    
      var quantity = parseInt(val.quantity);

      if (quantity > product.stock_quantity) {
        console.log("\nSorry, there is an insufficient quantity.");
        start();
      }
      else {
        purchase(product, quantity);
      }
    });
}

function purchase(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, product.item_id],
    function() {
      console.log("\nSuccessfully purchased " + quantity + " " + product.product_name + "'s!");
      start();
    }
  );
}

function checkInventory(itemId, inventory) {
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].item_id === itemId) {
      return inventory[i];
    }
  }
  return null;
}
