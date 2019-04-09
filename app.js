// budget Controller
var BudgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentages = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round( (this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allitems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allitems:{
            exp: [],
            inc: []
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            //creating the new id of the new item based on the id of the last element in the data structure.
            if (data.allitems[type].length > 0){
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //creating new item based on 'inc' or 'exp' type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allitems[type].push(newItem);
            return newItem;

        },
        
        deleteItem: function(type,id){

            var ids = data.allitems[type].map(function(current){
                    return current.id;
                })

            index = ids.indexOf(id);

            if (index !== -1){
                data.allitems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget :income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allitems.exp.forEach(function (curr){
                curr.calcPercentages(data.totals.inc);
            });
        },

        getPercentage: function(){
            var allPerc = data.allitems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log (data);
        }
    }

})();


// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expenseLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        expensesPercLable: '.item__percentage',
        container: '.container',
        dateLable: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        /*
            plus before the income and minus before the expenses
            and decimal points
        */
       num = Math.abs(num);
       num = num.toFixed(2);

       numSplit = num.split('.');

       int = numSplit[0];
       if(int.length > 3){
           int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2500, 2,500
       }
       dec = numSplit[1];

       return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };


    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i],i);
        }
    }

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            //create HTML string with placeholder tags
            var html, newHtml, element;
            if (type == 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type ==='exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //replace the placeholder tags with the actual data
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //we insert the html into the dom.
                document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' +DOMstrings.inputValue)

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLable).textContent = formatNumber(obj.totalExp,'exp');
            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLable).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLable).textContent = '---' ;
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLable);
            //node list for each fields and functions

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else{
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            var now, year, month;
            var now = new Date();
            months = ['January', 'Feburary', 'March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLable).textContent = months[month] + ' - '+ year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },
        
        getDomstrings: function(){
            return DOMstrings;
        }
    };

})();

// Global App Controller
var Controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDomstrings();  

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();    
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function(){
        // 4 - calculate the budget
        budgetCtrl.calculateBudget();
        // 4.1 - return the budget!
        var budget = budgetCtrl.getBudget();
        // 5 - display the budget
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // 1 calculate the percentages.
        budgetCtrl.calculatePercentages();
        // 2 read them from the budget controller.
        var percentages = budgetCtrl.getPercentage();
        // 3 update the UI with the new percentages.
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem ;
        
        // 1 - get the field input data
        input = UIController.getInput();
        // console.log(input);
        
        if (input.description !== "" && input.value > 0 && !isNaN(input.value)){
        // 2 - add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3 - add the new item to the user interface.
        UICtrl.addListItem(newItem, input.type);

        // 3.1 - clear the fields and set focus to the des
        UICtrl.clearFields();

        // calculate and update budget
        updateBudget(); 

        // 4 - cal and update percentages
        updatePercentages();

        }
    };

    var ctrlDeleteItem = function(event){
        var itemID,splitID,type,ID;

        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if (itemID){
            //inc-id
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1 - delete the item from the data structure.
            budgetCtrl.deleteItem(type,ID);
            // 2 - delete the item from the user interface
            UIController.deleteListItem(itemID);
            // 3 - update and show the new budget.
            updateBudget();
            // 4 - cal and update percentages
            updatePercentages();
        }
    };

    return {
        init: function(){
            console.log('Application has Started!');
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
        }
    };

})(BudgetController, UIController);

Controller.init();