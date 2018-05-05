var inquirer = require("inquirer");
var figlet = require("figlet");
var mysql = require("mysql");
require("dot-env");
var Table = require('cli-table');
var colors = require('colors');

var customerCart = [];

function greeting(){
    figlet.text( 'BAMazon!', {
        font: 'jazmine',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }, function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data.white);  
        runBamazon(); 
    });
}

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
    greeting();   
 });
 
//main method
function runBamazon(){
    getProducts();
}

function getProducts(){
    customerCart = [];
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['ID'.cyan, 'PRODUCT'.green, 'DEPT'.green, 'PRICE'.green, 'IN STOCK'.green]
          , colWidths: [10, 30,20, 15, 15]
        });
        for (var i = 0; i < res.length; i++) {
            table.push(
                [
                    res[i].item_id.toString().yellow, res[i].product_name, res[i].department_name, '$' + res[i].price.toFixed(2), res[i].stock_quantity
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
                    head: ['ID'.cyan, 'PRODUCT'.green, 'DEPT'.green, 'PRICE'.green, 'IN STOCK'.green]
                  , colWidths: [10, 20,20, 15, 15]
                });
                table.push(
                    [
                        res[0].item_id, res[0].product_name, res[0].department_name, '$' + res[0].price.toFixed(2), res[0].stock_quantity
                    ]
                )
                productQuantity = res[0].stock_quantity;
                productId = res[0].item_id;
                productName = res[0].product_name;
                productPrice = res[0].price;

                console.log(table.toString());
                
                getUserQuantity(productId, productQuantity, productName, productPrice );   
                 
            }
            else{
                console.log("That ID doesn't exist, please enter an id from the table".red  );
                getUserProduct();
            }
        })
    })    
}

function getUserQuantity(id, stockQuant, prodName, prodPrice){    
    inquirer.prompt([
        {
            type: "input",
            name: "number",
            message: "Please enter the quantity of the product you would like to add to your cart!"
        }
    ]).then(function(answer){
        if(answer.number <= stockQuant){
            console.log("Coming right up!".cyan);
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
              var item = {
                  itemId : id,
                  itemQuantity : parseInt(answer.number),
                  itemName: prodName,
                  itemPrice: prodPrice
              }
              customerCart.push(item);
                console.log("Item(s) added!".cyan);   
                requestNewItemOrder();             
            })
            
        }
        else{
            console.log("Insufficient stock".red);
            getUserQuantity();
        }
    })
}

function requestNewItemOrder(){
    confirm("Would you like to add another item to your order?", getUserProduct, checkOut);
}
function requestNewOrder(){
    confirm("Would you like to add another item to your order?", getUserProduct, checkOut);
}

function checkOut(){
    var total = 0;

    console.log("Here's your itemized receipt!".cyan);
    var summaryTable = new Table({
        head: ['ID'.cyan, 'PRODUCT'.green, 'PRICE'.green, 'QUANTITY'.green, 'TOTAL'.green]
      , colWidths: [10, 20, 15, 15, 15]
    });
    
    for(var i =0; i <customerCart.length; i++){
        var itemID = customerCart[i].itemId;
        var itemName =  customerCart[i].itemName;
        var itemPrice = customerCart[i].itemPrice;
        var quantity = customerCart[i].itemQuantity;
        var totalItemCost = quantity * itemPrice;
        total += totalItemCost;
        summaryTable.push(
            [
                itemID, itemName, '$' + itemPrice.toFixed(2), quantity, '$' + totalItemCost.toFixed(2)
            ]
        );
    }
    summaryTable.push([
        "","","", "Total".green, '$' + total.toFixed(2)
    ]
    );
    console.log(summaryTable.toString());
    confirm("Would you like to make another order", getProducts, closeOut);
}
function confirm(question, callbackYes, callbackNo){
    inquirer.prompt([
        {
            name: "response",
            type: "confirm",
            message: question
        }
    ]).then(function(answer){
        if(answer.response){
            callbackYes()
        } else {
            callbackNo()
        }
    })
}
function closeOut(){
    console.log("Thank you! Come again!");
    connection.end();
}
