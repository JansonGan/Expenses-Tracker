//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/expensesDB");

const expensesSchema = new mongoose.Schema({
    description: String,
    date: Date,
    amount: Number
});

const Expenses = mongoose.model("Expenses", expensesSchema);

Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000- 3 + (week1.getDay() + 6) % 7) / 7);
  };
    
app.get("/", function (req, res) {

    Expenses.find({}, function (err, itemFound) {

        let dailyExpenses = 0;
        let weeklyExpenses = 0;
        let monthlyExpenses= 0;
        let yearlyExpenses = 0;

        if(!err){
            itemFound.forEach(function(item){
                if(item.date.toLocaleDateString() === new Date().toLocaleDateString()){
                   dailyExpenses += item.amount;
                }
                if(item.date.getMonth() === new Date().getMonth()){
                    monthlyExpenses += item.amount;
    
                 }
                 if(item.date.getYear() === new Date().getYear()){
                    yearlyExpenses += item.amount;
                 }
                if(item.date.getWeek() === new Date().getWeek()){
                    weeklyExpenses += item.amount;
                }
            });

           
        }

        res.render("index", {
            description: itemFound,
            date: itemFound,
            amount: itemFound,
            dailySpend: dailyExpenses.toFixed(2),
            monthlySpend: monthlyExpenses.toFixed(2),
            yearlySpend: yearlyExpenses.toFixed(2),
            weeklySpend: weeklyExpenses.toFixed(2)
        });
    });
});

app.post("/", function (req, res) {
    const description = req.body.description;
    const dateSpend = req.body.dateSpend;
    const amount = req.body.amount;

    const newExpense = new Expenses({
        description: description,
        date: dateSpend,
        amount: amount
    });

    newExpense.save();
    res.redirect("/");
});

app.post("/delete", function (req, res) {
    Expenses.findByIdAndDelete({
        _id: req.body.checkbox
    }, function (err, itemDeleted) {

    });
    res.redirect("/");
});







app.listen(3000, function () {
    console.log("Server runing on port 3000.");
});