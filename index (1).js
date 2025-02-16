//SETUP
// Import axios for making HTTP requests
let axios = require("axios");
// NASA API key and base URL
let NASA_API_KEY = "xxx";
let BASE_URL = "https://api.nasa.gov/neo/rest/v1/neo/";

// Gravitational constant (in N m^2/kg^2)
let G = 6.6743e-11;




// Function for fetching asteroid data from Nasa API based on asteroid id
async function getAsteroidData(asteroidId) {
    try {
        let url = `${BASE_URL}${asteroidId}?api_key=${NASA_API_KEY}`; //use the base url to open then api_key to gain access into API and API_KEY contains the key to access the API

        let response = await axios.get(url); // pauses program to make html request and date is returned
        return response.data; //returns data

        //error
    } catch (error) {
        console.error("Error fetching asteroid data:", error);
        return null;
    }
}




// Function to estimate the value of mining an asteroid
function estimateAsteroidValue(mass, valuePerKg) {
    return mass * valuePerKg; // Value = mass * value per kg since exact amounts of specific materials is unknown. Avarage amount is around 30k/kg of asteroid
}




// Function to estimate mass given on size and density
function estimateMass(diameter, density) {
    let radius = diameter / 2;
    let volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // Volume of a sphere(not perfect since asteroid are not perfect spheres)
    return volume * density; // Mass = volume * density
}



// Function to calculate thrust needed to move an asteroid into low Earth orbit (LEO)
// Uses Newton's second law: F = ma
function calculateThrust(mass, targetDeltaV, burnTime) {
    return (mass * targetDeltaV) / burnTime; // Thrust = mass * deltaV / burn time
}




// Function to determine available resources in the asteroid
// Retrieves key data like distance, velocity, and hazard status
function getAsteroidResources(asteroid) {
    if (asteroid.close_approach_data && asteroid.close_approach_data[0]) {
        let approach = asteroid.close_approach_data[0];
        let resources = {
            name: asteroid.name,
            id: asteroid.id,
            diameterMin:
                asteroid.estimated_diameter.kilometers.estimated_diameter_min,
            diameterMax:
                asteroid.estimated_diameter.kilometers.estimated_diameter_max,
            missDistance: approach.miss_distance.kilometers, // Distance from Earth
            relativeVelocity: approach.relative_velocity.kilometers_per_second,
        };
        return resources;
    }
    return null;
}




// Main function to run the asteroid mining simulation, with real-time updates
async function runAsteroidMiningSimulation(
    asteroidId,
    targetDeltaV,
    burnTime,
    density,
    valuePerKg,
) {
    let asteroid = await getAsteroidData(asteroidId);

    if (!asteroid) {
        console.log("No asteroid data found.");
        return;
    }

    // Real-time updates every min
    setInterval(async () => {
        asteroid = await getAsteroidData(asteroidId); // Refetch updated data

        let resources = getAsteroidResources(asteroid); //gets the function that uses API and returns the data
        if (resources) {
            console.log("Real-time Asteroid Resources:", resources);

            // Calculate the average diameter and estimated mass
            let avgDiameter =
                (resources.diameterMin + resources.diameterMax) / 2;
            let estimatedMass = estimateMass(avgDiameter, density).toFixed(2);

            // Display asteroid details
            console.log(`Estimated mass of asteroid: ${estimatedMass} kg`);
            console.log(`Distance from Earth: ${resources.missDistance} km`);
            console.log(
                `Velocity towards to Earth: ${resources.relativeVelocity} km/s`,
            );

            // Calculate the thrust needed to move the asteroid
            let thrust = calculateThrust(
                estimatedMass,
                targetDeltaV,
                burnTime,
            ).toFixed(2);
            console.log(`Required thrust to move asteroid to LEO: ${thrust} N`);

            // Estimate the value of mining the asteroid
            let estimatedValue = estimateAsteroidValue(
                estimatedMass,
                valuePerKg,
            );
            let estimatedValueFormat = formatNumberWithCommas(estimatedValue);
            console.log(
                `Estimated value of asteroid materials: $${estimatedValueFormat}`,
            );

            // Income estimation (hypothetical value of materials)
            let cost = estimatedValue * 0.6; // Assuming 60% cost
            let costFormat = formatNumberWithCommas(cost);
            let profit = estimatedValue - cost;
            let profitFormat = formatNumberWithCommas(profit);
            console.log(`Cost: $${costFormat}`);
            console.log(`Profit: $${profitFormat}`);
            console.log("------------------------------------");
            console.log(" ");
        } else {
            console.log("No close approach data available.");
        }
    }, 5000); // Update every 5 seconds (5,000 ms) but NASA dosn't update that
}

// Function to format a number with commas
function formatNumberWithCommas(number) {
    return number.toLocaleString(); // Adds commas to the number based on locale
}

// Function to generate random number
function randomNumber(max) {
    return Math.floor(Math.random() * max);
}

// Example usage with necessary parameters
//let asteroidId = "3542519"; // Example asteroid ID from NASA API
const asteroidIds = ["3542519", "3542517", "3542520", "3542518"];
const random = randomNumber(3);
let asteroidId = asteroidIds[random];
console.log(`Random asteroidId : ${random}`); // Print random  asteroidId

let targetDeltaV = 3000; // Example deltaV to move asteroid (m/s)
let burnTime = 3600; // Example burn time for spacecraft (1 hour in seconds)
let density = 3500; // Estimated asteroid density in kg/m^3 (common for rocky asteroids)
let valuePerKg = 45000; // Example hypothetical value per kg of asteroid material

// Start the simulation with real-time updates
runAsteroidMiningSimulation(
    asteroidId,
    targetDeltaV,
    burnTime,
    density,
    valuePerKg,
);
//It runs the rest of the functions and prints the data
