var inquirer = require("inquirer");
var figlet = require("figlet");
var mysql = require("mysql");
require("dot-env");
var Table = require('cli-table');
var colors = require('colors');

var customerCart;

figlet.text('BAMazon!', {
    font: 'Cursive',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}, function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log("Welcome to")
    console.log(data);
});
//F   O   N   T   S!
// figlet.fonts(function(err, fonts) {
//     if (err) {
//         console.log('something went wrong...');
//         console.dir(err);
//         return;
//     }
//     console.dir(fonts);
// });

//DATABASE INITIALIZATION
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: 'JAZ',
    database: "bamazon"
  });

connection.connect(function(err) {
    if (err) throw err;
    runBamazon();    
 });
 
//main method
function runBamazon(){
    getProducts();
}

function getProducts(){
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['ID'.cyan, 'PRODUCT'.green, 'DEPT'.green, 'PRICE'.green, 'QUANTITY'.green]
          , colWidths: [20, 20,20, 15, 15]
        });
        for (var i = 0; i < res.length; i++) {
            table.push(
                [
                    res[i].item_id.toString().yellow, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity
                ]
            )
          }         
         
        console.log(table.toString());
        getUserProduct();
      });  
      
}   

function getUserProduct(){
    
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "Please enter the ID of the product you would like to add to your cart!"
        }
    ]).then(function(answer){
        var product = "";

        connection.query("SELECT * from products WHERE ?", { item_id: answer.id }, function(err, res) {
            if (err) throw err;
            if(res.length > 0){
                var table = new Table({
                    head: ['ID'.cyan, 'PRODUCT'.green, 'DEPT'.green, 'PRICE'.green, 'QUANTITY'.green]
                  , colWidths: [20, 20,20, 15, 15]
                });
                table.push(
                    [
                        res[0].item_id, res[0].product_name, res[0].department_name, res[0].price, res[0].stock_quantity
                    ]
                )
                productQuantity = res[0].stock_quantity;
                productId = res[0].item_id;

                console.log(table.toString());
                
                getUserQuantity(productId, productQuantity);                
            }
            else{
                console.log("That ID doesn't exist, please enter an id from the table");
                getUserProduct();
            }
        })
    })    
}

function getUserQuantity(id, stockQuant){
    
    inquirer.prompt([
        {
            type: "input",
            name: "number",
            message: "Please enter the quantity of the product you would like to add to your cart!"
        }
    ]).then(function(answer){
        if(answer.number < stockQuant){
            console.log("we can do that");
            connection.query("UPDATE products SET ? WHERE ?",
            [
              {
                stock_quantity: stockQuant - answer.number
              } ,
              {
                item_id: id
              }
            ],
            function(error, res) {
              if (error) throw error;
              console.log("quantity updated");
            })
            getProducts();
        }
        else{
            console.log("Insufficient stock");
        }
    })
}

