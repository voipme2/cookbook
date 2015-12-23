
var Sequelize = require('sequelize');
var sequelize = new Sequelize(null, null, null, {
    dialect: 'sqlite',
    storage: 'data/cookbook.sqlite'
});

var Ingredient = sequelize.define('Ingredient', {
    amount: {
        type: Sequelize.FLOAT,
    },
    measure: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING
    }
});

var Step = sequelize.define('Step', {
    content: {
        type: Sequelize.TEXT
    }
});

// vegan, gluten-free, etc.  I think this will end up being controlled by the UI.
var RecipeFlags = sequelize.define('RecipeFlags', {
    flag: {
        type: Sequelize.ENUM,
        values: ['vegan', 'vegetarian', 'crock-pot', 'gluten-free', 'dairy-free']
    }
});

var Recipe = sequelize.define('Recipe', {
    name: {
        type: Sequelize.STRING,
        unique: true
    },
    description: {
        type: Sequelize.TEXT
    },
    author: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true
        }
    },
    category: {
        type: Sequelize.STRING
    },
    servings: {
        type: Sequelize.STRING
    },
    // time values are stored as minutes
    prepTime: {
        type: Sequelize.INTEGER
    },
    inactiveTime: {
        type: Sequelize.INTEGER
    },
    cookTime: {
        type: Sequelize.INTEGER
    }
});

Recipe.hasMany(Ingredient, { as: 'ingredients' });
Recipe.hasMany(Step, { as: 'steps'});
Recipe.hasMany(RecipeFlag, { as: 'flags' });

// creating:
/*
Recipe.create({
    name: 'My Recipe',
    description: 'Some description',
    author: 'Random',
    servings: '6 cups',
    category: 'soup',
    prepTime: 10,
    inactiveTime: 12,
    cookTime: 15
    ingredients: [
            
    ],
    steps: [

    ],
    flags: [

    ]
}, {
    include: [Ingredient, Step, RecipeFlag]
});
*/
