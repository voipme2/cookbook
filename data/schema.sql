CREATE TABLE Recipes(
	id INTEGER PRIMARY KEY, 
	name TEXT NOT NULL, 
	imageUrl TEXT, 
	prepTime INTEGER CHECK(prepTime>0), 
	cookTime INTEGER CHECK(cookTime>0)
);

CREATE TABLE Ingredients(
	id INTEGER PRIMARY KEY, 
	name TEXT
);

CREATE TABLE CookingSteps(
	id INTEGER PRIMARY KEY, 
	recipe_id INTEGER, 
	content TEXT, 
	idx INTEGER, 
	FOREIGN KEY(recipe_id) REFERENCES Recipes(id)
);

CREATE TABLE Recipes_Ingredients(
	id INTEGER PRIMARY KEY, 
	recipe_id INTEGER, 
	ingredient_id INTEGER, 
	measure TEXT, 
	value REAL,
	FOREIGN KEY(recipe_id) REFERENCES Recipes(id),
	FOREIGN KEY(ingredient_id) REFERENCES Ingredients(id)
);