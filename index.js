var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");
var express = require("express");

// Sample restaurant data to work with. Each restaurant has an id, name, description, and a list of dishes.
var restaurants = [
  {
    id: 1,
    name: "WoodsHill",
    description: "American cuisine, farm to table, with fresh produce every day",
    dishes: [
      {
        name: "Swordfish grill",
        price: 27,
      },
      {
        name: "Roasted Broccoli",
        price: 11,
      },
    ],
  },
  {
    id: 2,
    name: "Fiorellas",
    description: "Italian-American home cooked food with fresh pasta and sauces",
    dishes: [
      {
        name: "Flatbread",
        price: 14,
      },
      {
        name: "Carbonara",
        price: 18,
      },
      {
        name: "Spaghetti",
        price: 19,
      },
    ],
  },
  {
    id: 3,
    name: "Karma",
    description: "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
    dishes: [
      {
        name: "Dragon Roll",
        price: 12,
      },
      {
        name: "Pancake roll",
        price: 11,
      },
      {
        name: "Cod cakes",
        price: 13,
      },
    ],
  },
];

// Define the GraphQL schema. The schema defines types (restaurant, Dish, Query, Mutation) and how they relate to one another.
// The input types for mutations (e.g., restaurantInput) are also defined here.
var schema = buildSchema(`
  type Query {
    # Fetch a single restaurant by its id
    restaurant(id: Int): restaurant
    
    # Fetch all restaurants
    restaurants: [restaurant]
  }
  
  # Restaurant type defines the structure of a restaurant object
  type restaurant {
    id: Int
    name: String
    description: String
    dishes: [Dish]
  }
  
  # Dish type defines the structure of a dish object
  type Dish {
    name: String
    price: Int
  }
  
  # Input type for creating a new restaurant
  input restaurantInput {
    name: String
    description: String
  }
  
  # Response type for deletion mutation, indicates whether deletion was successful
  type DeleteResponse {
    ok: Boolean!
  }
  
  # Mutation type defines actions that can modify the data (create, edit, delete)
  type Mutation {
    # Add a new restaurant
    setrestaurant(input: restaurantInput): restaurant
    
    # Delete a restaurant by its id
    deleterestaurant(id: Int!): DeleteResponse
    
    # Edit an existing restaurant's name and description
    editrestaurant(id: Int!, name: String, description: String): restaurant
  }
`);

// The root object provides resolver functions for each API endpoint (query and mutation).
// These resolvers define how to fetch, add, edit, and delete data.
var root = {
  // Fetch a single restaurant by its id. Uses the `find` method to get the correct restaurant.
  restaurant: ({ id }) => restaurants.find(restaurant => restaurant.id === id),

  // Fetch all restaurants. Simply returns the entire `restaurants` array.
  restaurants: () => restaurants,
  
  // Add a new restaurant. Accepts input (name, description) and creates a new restaurant object.
  // The new restaurant gets a unique id (length of the array + 1) and is added to the list.
  setrestaurant: ({ input }) => {
    const id = restaurants.length + 1;  // Generate a new unique id
    const newRestaurant = { id, ...input, dishes: [] };  // Create a new restaurant object
    restaurants.push(newRestaurant);  // Add the new restaurant to the list
    return newRestaurant;  // Return the newly created restaurant
  },
  
  // Delete a restaurant by its id. Finds the restaurant by id, removes it, and returns a success flag.
  deleterestaurant: ({ id }) => {
    const index = restaurants.findIndex(restaurant => restaurant.id === id);  // Find the restaurant by id
    const ok = index !== -1;  // Check if the restaurant exists
    if (ok) {
      restaurants.splice(index, 1);  // Remove the restaurant from the list
    }
    return { ok };  // Return a boolean indicating whether the deletion was successful
  },
  
  // Edit a restaurant's name and/or description by its id. Finds the restaurant and updates the fields.
  editrestaurant: ({ id, name, description }) => {
    const restaurant = restaurants.find(r => r.id === id);  // Find the restaurant by id
    if (!restaurant) {
      throw new Error("Restaurant doesn't exist");  // Throw an error if the restaurant is not found
    }
    restaurant.name = name || restaurant.name;  // Update the name if provided
    restaurant.description = description || restaurant.description;  // Update the description if provided
    return restaurant;  // Return the updated restaurant object
  },
};

// Create an Express server and a GraphQL endpoint. The endpoint will respond to GraphQL queries and mutations.
var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,  // The schema defined earlier
    rootValue: root,  // The resolvers defined in `root`
    graphiql: true,  // Enable the GraphiQL interface (a tool for running queries in the browser)
  })
);

// Start the server on port 5500 and log that it's running
var port = 5500;
app.listen(port, () => console.log(`Running GraphQL on Port: ${port}`));

module.exports = root;  // Export the root object for testing or additional use
