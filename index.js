const buttonContainer = document.querySelector(".button-container");
const countiesContainer = document.querySelector(".counties-container");
const countryStatsContainer = document.querySelector(".country-stats");
// const countryBtn = document.querySelectorAll(".country-btn")
let loadingStat = "state";

const worldArrays = {
  asia: [],
  europe: [],
  africa: [],
  americas: [],
};
const world = {
  asia: {},
  europe: {},
  africa: {},
  americas: {},
};
//fetching all the countries by their region =>
const getCountriesByRegion = async (region) => {
  let regionBtn = document.querySelector(`.${region}`);
  try {
    regionBtn.disabled = true;
    loadingStat = true;
    const result = await fetch(
      `https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1/region/${region}`
    );
    const data = await result.json();
    //getting each cca2 => will use in COVID fetch
    data.forEach((country) => {
      let countryName = country.name.common;
      let countryCode = country.cca2;
      fillCountriesArr(countryName, region);
      createCountriesDiv(worldArrays[region],region);
      world[region][countryName] = {};
      getCovidData(countryCode, region, countryName);
    });
    regionBtn.disabled = false;
    loadingStat = false;
  } catch (error) {
    console.log(error);
  }
};

//fetching covid Data =>
const getCovidData = async (countryCode, region, countryName) => {
  try {
    if (countryCode !== "XK") {
      const result = await fetch(
        `https://intense-mesa-62220.herokuapp.com/http://corona-api.com/countries/${countryCode}`
      );
      const data = await result.json();
      const { confirmed, deaths, critical, recovered } = data.data.latest_data;
      const { confirmed: newCases, deaths: newDeaths } = data.data.today;
      buildWorldObj(
        region,
        countryName,
        confirmed,
        newCases,
        deaths,
        newDeaths,
        recovered,
        critical
      );
    }
  } catch (error) {
    console.log(error);
  }
};

//function that fills the worldArray with countries
const fillCountriesArr = (country, region) => {
  worldArrays[region].push(country);
};

const createCountriesDiv = (arr,region) => {
  countiesContainer.innerHTML = "";
  arr.forEach((countryName) => {
    let countryDiv = document.createElement("div");
    countryDiv.className = "country-btn";
    countryDiv.setAttribute("data-region",region);
    countryDiv.textContent = countryName;
    countiesContainer.appendChild(countryDiv);
  });
};

// function for countries covid data "each country" =>
countiesContainer.addEventListener("click", (e) => {
    let btnRegion = e.target.getAttribute("data-region");
    let countryName = e.target.textContent;
  if (e.target.className === "country-btn") {
    console.log("right");
    countryStatsContainer.innerHTML = "";
    const totalCases = document.createElement("div");
    totalCases.innerHTML = `Total Cases: ${world[btnRegion][countryName].totalCases}`
    const newCases = document.createElement("div");
    newCases.innerHTML = `New Cases: ${world[btnRegion][countryName].newCases}`
    const totalDeaths = document.createElement("div");
    totalDeaths.innerHTML =`Total Deaths: ${world[btnRegion][countryName].totalDeaths}`
    const newDeath = document.createElement("div");
    newDeath.innerHTML = `New Death: ${world[btnRegion][countryName].newDeaths}`
    const totalRecovered = document.createElement("div");
    totalRecovered.innerHTML = `Total Recovered: ${world[btnRegion][countryName].totalRecovered}`
    const critical = document.createElement("div");
    critical.innerHTML = `Critical: ${world[btnRegion][countryName].inCritical}`
    countryStatsContainer.appendChild(totalCases);
    countryStatsContainer.appendChild(newCases);
    countryStatsContainer.appendChild(totalDeaths);
    countryStatsContainer.appendChild(newDeath);
    countryStatsContainer.appendChild(totalRecovered);
    countryStatsContainer.appendChild(critical);
  }
});

//event listeners for region change =>
buttonContainer.addEventListener("click", (e) => {
  let region = e.target.className;
  createCountriesDiv(worldArrays[region]);
  if (e.target.type === "button") {
    if (Object.keys(world[region]).length === 0) {
      getCountriesByRegion(region);
    } else {
      console.log("Already Exist");
    }
  }
});

function buildWorldObj(
  region,
  country,
  totalCases = 0,
  newCases,
  totalDeaths,
  newDeaths,
  totalRecovered,
  inCritical
) {
  world[region][`${country}`]["totalCases"] = totalCases;
  world[region][country]["newCases"] = newCases;
  world[region][country]["totalDeaths"] = totalDeaths;
  world[region][country]["newDeaths"] = newDeaths;
  world[region][country]["totalRecovered"] = totalRecovered;
  world[region][country]["inCritical"] = inCritical;
}
