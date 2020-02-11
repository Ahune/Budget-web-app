var controller, UIcontroller, budgetController;

// Budget kontrollen
budgetController = (function() {
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
         var sum = 0;
         data.allItems[type].forEach(function(cur) {
            sum += cur.value;
         });
         data.totals[type] = sum;
    }

    var data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1 
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Skapar ny ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0;
            }

            // Ny Item baserad på typ income/expense
            if(type === 'expense'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'income') {
                newItem = new Income(ID, des, val);
            }
            // Pushas in till data strukturen
            data.allItems[type].push(newItem);
            // returnerar nya Item
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            })

            index = ids.indexOf(id)

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            } 

        },

        calculateBudget: function() {

            // Räkna total inkomst och utgifter
            calculateTotal('income');
            calculateTotal('expense');

            // Räkna budget inkomst - utgift
            data.budget = data.totals.income - data.totals.expense;

            // Beräkna % av inkomst som spenderats || utgift / total inkomst * 100
            if(data.totals.income > 0){
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            } 
        },

        calculatePrecentage: function() {

            data.allItems.expense.forEach(function(current) {
                current.calcPercentage(data.totals.income);
            });
        },

        getPercentage: function() {
            var allPerc = data.allItems.expense.map(function(current){
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.income,
                totalExp: data.totals.expense,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    }   
})();


//UI kontrollen
UIcontroller = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        conatiner: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, format) {
        
        /*
        regler
        + eller - efter nummer
        två decimaltal
        comma som skiljer tusen
        */

        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput : function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            //Skapa html sträng med placeholder

            if(type === 'income'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div>'+
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn">'+
                '<i class="ion-ios-close-outline"></i></button></div></div></div>'; 
            } else if(type === 'expense'){
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div>'+
                '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>'+
                '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
                '</div></div></div>';
            }
        
            // Byt placeholders med data från obj
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Lägg till HTML till DOM (insertAdjacentHTML)
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // fields är en lista och ska göras till array med slice()
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'income' : 'expense';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'expense');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentage: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            }); 
        },

        displayMonth : function() {
            var now, year, month, months;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year ;
        },

        changedType : function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' + 
                DOMstrings.inputDescription + ', ' + 
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            }); 
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();


// globala App kontrollen
controller = (function (budgetCtrl, UIctrl){

    var setupEventListeners = function() {
        var DOM = UIctrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {       
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem(); 
            }
        });
        document.querySelector(DOM.conatiner).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType)
    };


    var updateBudget = function() {
        var budget;
        // 1. Räkna ut budget
        budgetCtrl.calculateBudget();

        // 2. Returnera budget
        budget = budgetCtrl.getBudget();

        // 3. Visa i UI
        UIctrl.displayBudget(budget);
    }

    var updatePercentage = function() {
        var percentage;
        // 1. Beräkna procent
        budgetCtrl.calculatePrecentage();

        // 2. hämta procent från budget ctrl
        percentage = budgetCtrl.getPercentage();

        // 3. Uppdatera UI med nya beräkning
        UIctrl.displayPercentage(percentage);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Hämta input data
        input = UIctrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. lägga till item till budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Lägg till item i UI
            UIctrl.addListItem(newItem, input.type);

            // 4. Rensa textboxes
            UIctrl.clearFields();

            // 5. Updatera budget och räkna ut budget
            updateBudget();

            // 6. uppdatera procenter 
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        // traversing
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. ta bort item från datamodellen
            budgetCtrl.deleteItem(type, ID);

            // 2. ta bort item från UI
            UIctrl.deleteListItem(itemID);

            // 3. update och visa nya budget
            updateBudget();

            // 4. uppdatera procenter 
            updatePercentage();
        }
    };

    return{
        init : function() {
            console.log('Application has started.');
            UIctrl.displayMonth();
            UIctrl.displayBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                });
            setupEventListeners();
        }
    };

})(budgetController, UIcontroller);

controller.init();