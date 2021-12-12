const buttonContainer = document.querySelector(".button-container");
const countiesContainer = document.querySelector(".counties-container");
const countryStatsContainer = document.querySelector(".country-stats");
const loading = document.querySelector(".lds-ripple");
const graph = document.getElementById("myChart").getContext("2d");
let covidChart = new Chart(graph, {});
let loadingStat = "state";

let confirmedCovid = [];
let totalDeathCovid = [];
let recoveredCovid = [];
let criticalCovid = [];

const newWorldObject = {
  asia: [],
  europe: [],
  africa: [],
  americas: [],
};

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
    isLoading(true);
    const result = await fetch(
      `https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1/region/${region}`
    );
    const data = await result.json();
    //getting each cca2 => will use in COVID fetch
    data.forEach((country) => {
      let countryName = country.name.common;
      let countryCode = country.cca2;
      fillCountriesArr(countryName, region);
      createCountriesDiv(worldArrays[region], region);
      world[region][countryName] = {};
      getCovidData(countryCode, region, countryName);
      covidChart.destroy();
      drawChart(confirmedCovid, worldArrays[region]);
    });
    regionBtn.disabled = false;
    isLoading(false);
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

      newWorldObject[region].push(data);
      confirmedCovid.push(confirmed);
      totalDeathCovid.push(deaths);
      recoveredCovid.push(recovered);
      criticalCovid.push(critical);
    }
    covidChart.destroy();
    drawChart(confirmedCovid, worldArrays[region]);
  } catch (error) {
    console.log(error);
  }
};

//loading funciton =>
const isLoading = (state) => {
  if (state) {
    loading.style.display = "block";
  } else {
    loading.style.display = "none";
  }
};

//create confirmed
const createConfirm = (region) => {
  confirmedCovid = region.map((e) => e.data.latest_data.confirmed);
  totalDeathCovid = region.map((e) => e.data.latest_data.deaths);
  recoveredCovid = region.map((e) => e.data.latest_data.recovered);
  criticalCovid = region.map((e) => e.data.latest_data.critical);
};

//function that fills the worldArray with countries
const fillCountriesArr = (country, region) => {
  worldArrays[region].push(country);
};

//fuction that creates Countries DIV in the container
const createCountriesDiv = (arr, region) => {
  countiesContainer.innerHTML = "";
  arr.forEach((countryName) => {
    let countryDiv = document.createElement("div");
    countryDiv.className = "country-btn";
    countryDiv.setAttribute("data-region", region);
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
    totalCases.innerHTML = `Total Cases: ${world[btnRegion][countryName].totalCases}`;
    const newCases = document.createElement("div");
    newCases.innerHTML = `New Cases: ${world[btnRegion][countryName].newCases}`;
    const totalDeaths = document.createElement("div");
    totalDeaths.innerHTML = `Total Deaths: ${world[btnRegion][countryName].totalDeaths}`;
    const newDeath = document.createElement("div");
    newDeath.innerHTML = `New Death: ${world[btnRegion][countryName].newDeaths}`;
    const totalRecovered = document.createElement("div");
    totalRecovered.innerHTML = `Total Recovered: ${world[btnRegion][countryName].totalRecovered}`;
    const critical = document.createElement("div");
    critical.innerHTML = `Critical: ${world[btnRegion][countryName].inCritical}`;
    countryStatsContainer.appendChild(totalCases);
    countryStatsContainer.appendChild(newCases);
    countryStatsContainer.appendChild(totalDeaths);
    countryStatsContainer.appendChild(newDeath);
    countryStatsContainer.appendChild(totalRecovered);
    countryStatsContainer.appendChild(critical);
  }
});

//reset array
const resetArr = (arr) => (arr = []);

//event listeners for region change =>
buttonContainer.addEventListener("click", (e) => {
  countryStatsContainer.innerHTML = "";
  if (e.target.className !== "button-container") {
    let region = e.target.className;
    createConfirm(newWorldObject[region]);
    createCountriesDiv(worldArrays[region], region);
    covidChart.destroy();
    drawChart(confirmedCovid, worldArrays[region]);
    if (e.target.type === "button") {
      if (Object.keys(world[region]).length === 0) {
        getCountriesByRegion(region);
      } else {
        console.log("Already Exist");
      }
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
  // confirmedCovid.push(totalCases);
  // totalDeathCovid.push(totalDeaths);
}

const drawChart = (covidData, countyLables) => {
  covidChart = new Chart(graph, {
    type: "line",
    data: {
      labels: countyLables,
      datasets: [
        {
          label: "Covid Data",
          data: covidData,
          borderColor: "rgb(255, 187, 187)",
        },
      ],
    },

    options: {
      maintainAspectRatio: false,
    },
  });
};
