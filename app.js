document.addEventListener("DOMContentLoaded", () => {
    
    // API Key from OpenWeatherMap.com.
    const wapik = "a632b1ff36f968d65d1485823b62c3da";

    // DOM Elements
    const loadingOverlay = document.getElementById("loading-overlay");
    const weatherContent = document.getElementById("weather-content");
    const errorModal = document.getElementById("error-modal");
    const errorMessageEl = document.getElementById("error-message");
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const searchError = document.getElementById('search-error');
    const geolocationBtn = document.getElementById('geolocation-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const animationContainer = document.getElementById('animation-container');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const recentSearchesBox = document.getElementById('recent-searches-box');
    const suggestionsBox = document.getElementById('suggestions-box');
    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const currentTimeEl = document.getElementById('current-time');
    const currentTempEl = document.getElementById('current-temp');
    const tempUnitC = document.getElementById('temp-unit-c');
    const tempUnitF = document.getElementById('temp-unit-f');
    const currentWeatherDescEl = document.getElementById('current-weather-desc');
    const currentWeatherIconEl = document.getElementById('current-weather-icon');
    const forecastContainer = document.getElementById('forecast-container');
    const sunriseTimeEl = document.getElementById('sunrise-time');
    const sunsetTimeEl = document.getElementById('sunset-time');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const feelsLikeEl = document.getElementById('feels-like');
    const pressureEl = document.getElementById('pressure');
    const visibilityEl = document.getElementById('visibility');
    const airQualityEl = document.getElementById('air-quality');
    const healthRecommendationEl = document.getElementById('health-recommendation');
    const weatherAlert = document.getElementById('weather-alert');
    let clockInterval = null;
    let currentWeatherData = null;
    let currentTempUnit = 'C';

    const backgroundDay = {
        Clear: "",
        Clouds: "",
        Rain: "",
        Drizzle: "",
        Thunderstorm: "",
        Snow: "",
        Mist: "",
        Default: "",
    };

    const backgroundNight = {
        Clear: "",
        Clouds: "",
        Rain: "",
        Drizzle: "",
        Thunderstorm: "",
        Snow: "",
        Mist: "",
        Default: "",
    };

    // Main weather fetching function that takes location via coordinates or city name.
    const fetchWeather = async ({ lat, lon, city }) => {
        showLoading();
        clearInterval(clockInterval);
        
        try {
            if (!wapik) throw new Error("API key is missing");
            let latitude = lat;
            let longitude = lon;
            let cityName = city;

            if (city) {
                const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${wapik}`;
                const getResponse = await fetch(geoUrl);
                if (!getResponse.ok) throw new Error("Could not fetch geolocation data.");
                const geoData = await getResponse.json();
                if (geoData.length === 0) throw new Error("City not found.");
                latitude = geoData[0].lat;
                longitude = geoData[0].lon;
                cityName = `${geoData[0].name}, ${geoData[0].country}`; // Use formatted name
            }

            //Preparing API URLs for simultaneous fetch.
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${wapik}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${wapik}&units=metric`;
            const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${wapik}`;

            const [weatherResponse, forecastResponse, aqiResponse] = await Promise.all([
                fetch(weatherUrl), fetch(forecastUrl), fetch(aqiUrl)
            ]);

            if ([weatherResponse, forecastResponse, aqiResponse].some(res => !res.ok)) {
                throw new Error("Failed to fetch one or more weather data sources.");
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();
            const aqiData = await aqiResponse.json();

            updateUI(weatherData, forecastData, aqiData);
            // Use the original city query for recent search to keep it clean
            if (city) 
                addRecentSearch(city); 

        } catch (error) {
            console.error("Error while fetching the data: ", error);
            showError(error.message);
        } finally {
            hideLoading();
        }
    };

    // This function handles all DOM manipulations based on fetched data.
    const updateUI = (weather, forecast, aqi) => {
        currentWeatherData = weather; // Store weather data for temp conversion

        const weatherCondition = weather.weather[0].main;
        const isNight = (weather.dt < weather.sys.sunrise || weather.dt > weather.sys.sunset);
        const backgroundSet = isNight ? backgroundNight : backgroundDay;
        const imageUrl = backgroundSet[weatherCondition] || backgroundSet.Default;
        document.body.style.backgroundImage = `url('${imageUrl}')`;
        updateWeatherAnimation(isNight, weatherCondition);

        
        updateClock(weather.timezone);
        clockInterval = setInterval(() => updateClock(weather.timezone), 1000);

        
        cityNameEl.textContent = `${weather.name}, ${weather.sys.country}`;
        const localDate = new Date((weather.dt + weather.timezone) * 1000);
        currentDateEl.textContent = localDate.toLocaleDateString("en-us", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
        currentWeatherDescEl.textContent = weather.weather[0].description;
        currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
        
        updateTemperatureDisplay(); 
        checkExtremeTemperatures(weather.main.temp); 

        // Update weather details
        const formatTime = (timestamp) => new Date((timestamp + weather.timezone) * 1000).toLocaleTimeString("en-us", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" });
        sunriseTimeEl.textContent = formatTime(weather.sys.sunrise);
        sunsetTimeEl.textContent = formatTime(weather.sys.sunset);
        humidityEl.textContent = `${weather.main.humidity} %`;
        windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)} km/hr`;
        pressureEl.textContent = `${weather.main.pressure} hPa`;
        visibilityEl.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;

        // Update AQI
        const aqiValue = aqi.list[0].main.aqi;
        const aqiInfo = getAqiInfo(aqiValue);
        airQualityEl.textContent = aqiInfo.text;
        airQualityEl.className = `font-bold px-3 py-1 rounded-full text-sm ${aqiInfo.color}`;
        healthRecommendationEl.innerHTML = `<p class="text-gray-200 text-sm">${aqiInfo.recommendation}</p>`;

        // Update 5-Day forecast.
        const dailyForecasts = processForecast(forecast.list);
        forecastContainer.innerHTML = "";
        dailyForecasts.forEach(day => {
            const card = document.createElement("div");
            card.className = `p-4 rounded-2xl text-center card backdrop-blur-xl flex flex-col justify-between`;
            card.innerHTML = `
                <div>
                    <p class="font-bold text-lg">${new Date(day.dt_txt).toLocaleDateString("en-us", { weekday: "short" })}</p>
                    <p class="text-xs text-gray-300 mb-2">${new Date(day.dt_txt).toLocaleDateString("en-us", { month: "short", day: "numeric" })}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="w-16 h-16 mx-auto">
                </div>
                <div>
                    <p class="font-semibold mt-2">${Math.round(day.main.temp_max)}°/${Math.round(day.main.temp_min)}°</p>
                    <div class="flex items-center justify-center mt-1 text-sm text-gray-200 opacity-80">
                        <i class="fas fa-tint w-4 text-blue-300"></i>
                        <span>${day.main.humidity}%</span>
                    </div>
                </div>
            `;
            forecastContainer.appendChild(card);
        });
    };

    // These handles all the temperatures.
    const celsiusToFahrenheit = (celsius) => (celsius * 9 / 5) + 32;

    const updateTemperatureDisplay = () => {
        if (!currentWeatherData) return;
        const tempC = currentWeatherData.main.temp;
        const feelsLikeC = currentWeatherData.main.feels_like;

        if (currentTempUnit === 'C') {
            currentTempEl.textContent = `${Math.round(tempC)}°`;
            feelsLikeEl.textContent = `${Math.round(feelsLikeC)}°`;
            tempUnitC.classList.add('text-white', 'font-bold');
            tempUnitC.classList.remove('text-gray-400');
            tempUnitF.classList.add('text-gray-400');
            tempUnitF.classList.remove('text-white', 'font-bold');
        } else {
            currentTempEl.textContent = `${Math.round(celsiusToFahrenheit(tempC))}°`;
            feelsLikeEl.textContent = `${Math.round(celsiusToFahrenheit(feelsLikeC))}°`;
            tempUnitF.classList.add('text-white', 'font-bold');
            tempUnitF.classList.remove('text-gray-400');
            tempUnitC.classList.add('text-gray-400');
            tempUnitC.classList.remove('text-white', 'font-bold');
        }
    };

    // Displays an alert banner for extreme temperatures.
    const checkExtremeTemperatures = (temp) => {
        weatherAlert.classList.add('hidden');
        weatherAlert.textContent = '';
        if (temp > 40) {
            weatherAlert.textContent = '🔥 Extreme Heat Alert: Stay hydrated and avoid prolonged sun exposure.';
            weatherAlert.className = 'w-full max-w-6xl mx-auto mb-4 p-4 rounded-2xl text-center font-bold bg-red-800/80 text-white';
        } else if (temp < 5) {
            weatherAlert.textContent = '❄️ Extreme Cold Alert: Bundle up and limit time outdoors.';
            weatherAlert.className = 'w-full max-w-6xl mx-auto mb-4 p-4 rounded-2xl text-center font-bold bg-blue-800/80 text-white';
        }
    };
    
    const processForecast = (forecastList) => {
        const dailyData = {};
        forecastList.forEach(entry => {
            const date = entry.dt_txt.split(' ')[0];
            if (!dailyData[date]) {
                dailyData[date] = { temp_max: [], temp_min: [], humidity: [], icons: {}, entry: null };
            }
            dailyData[date].temp_max.push(entry.main.temp_max);
            dailyData[date].temp_min.push(entry.main.temp_min);
            dailyData[date].humidity.push(entry.main.humidity);
            const icon = entry.weather[0].icon;
            dailyData[date].icons[icon] = (dailyData[date].icons[icon] || 0) + 1;
            if (!dailyData[date].entry || entry.dt_txt.includes("12:00:00")) {
                dailyData[date].entry = entry;
            }
        });

        return Object.values(dailyData).map(day => {
            day.entry.main.temp_max = Math.max(...day.temp_max);
            day.entry.main.temp_min = Math.min(...day.temp_min);
            day.entry.main.humidity = Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length);
            day.entry.weather[0].icon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
            return day.entry;
        }).slice(0, 5);
    };

    //For Air Quality.
    const getAqiInfo = (aqi) => {
        const levels = [
            { text: "Good", color: "bg-green-500 text-white", recommendation: "Air quality is great. Enjoy the outdoors!" },
            { text: "Fair", color: "bg-yellow-500 text-black", recommendation: "Air quality is acceptable. Only very sensitive people should consider limiting outdoor exertion." },
            { text: "Moderate", color: "bg-orange-500 text-white", recommendation: "Sensitive groups may experience health effects. The general public is not likely to be affected." },
            { text: "Poor", color: "bg-red-500 text-white", recommendation: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects." },
            { text: "Very Poor", color: "bg-purple-700 text-white", recommendation: "Health alert: everyone may experience more serious health effects." }
        ];
        return levels[aqi - 1] || { text: "Unknown", color: "bg-gray-500 text-white", recommendation: "Air quality data is unavailable." };
    };

    //function to limit the rate of function calls.
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        }
    };

    //Handles user input in the city search field, fetching suggestions via Geocoding API.
    const handleCityInput = async (event) => {
        const query = event.target.value.trim();
        suggestionsBox.innerHTML = '';
        if (query.length < 3) {
            suggestionsBox.classList.add("hidden");
            return;
        }

        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${wapik}`;
            const response = await fetch(geoUrl);
            if (!response.ok) return;
            const cities = await response.json();

            if (cities.length > 0) {
                suggestionsBox.classList.remove("hidden");
                cities.forEach(city => {
                    const div = document.createElement("div");
                    div.className = "p-3 hover:bg-white/10 cursor-pointer";
                    div.textContent = `${city.name}, ${city.state ? city.state + "," : ""} ${city.country}`;
                    div.onclick = () => {
                        cityInput.value = "";
                        suggestionsContainer.classList.add("hidden");
                        fetchWeather({ lat: city.lat, lon: city.lon, city: `${city.name}, ${city.country}` });
                    };
                    suggestionsBox.appendChild(div);
                });
            }
        } catch (error) {
            console.error("Error fetching city suggestions:", error);
        }
    };

    //Function handling the recent search history.
    const getRecentSearches = () => JSON.parse(sessionStorage.getItem('recentSearches')) || [];
    
    const addRecentSearch = (city) => {
        let searches = getRecentSearches();
        const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        searches = searches.filter(s => s.toLowerCase() !== formattedCity.toLowerCase());
        searches.unshift(formattedCity);
        sessionStorage.setItem('recentSearches', JSON.stringify(searches.slice(0, 5)));
    };
    
    const renderRecentSearches = () => {
        recentSearchesBox.innerHTML = '';
        const searches = getRecentSearches();
        if (searches.length > 0) {
            let html = '<h3 class="text-gray-400 px-3 pt-2 pb-1 text-sm font-semibold">Recent Searches</h3>';
            searches.forEach(city => {
                html += `<div class="p-3 hover:bg-white/10 cursor-pointer recent-city">${city}</div>`;
            });
            recentSearchesBox.innerHTML = html;
            document.querySelectorAll('.recent-city').forEach(item => {
                item.addEventListener('click', () => {
                    fetchWeather({ city: item.textContent });
                    suggestionsContainer.classList.add('hidden');
                    cityInput.value = "";
                });
            });
        }
    };
    
    // UI State Functions
    const showLoading = () => loadingOverlay.classList.replace("hidden", "flex");
    const hideLoading = () => {
        loadingOverlay.classList.replace("flex", "hidden");
        weatherContent.classList.remove("opacity-0");
    };
    const showError = (message) => {
        errorMessageEl.textContent = message;
        errorModal.classList.remove("hidden");
    };
    const updateClock = (timezoneOffset) => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localTime = new Date(utc + (timezoneOffset * 1000));
        currentTimeEl.textContent = localTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    };

    const updateWeatherAnimation = (isNight, condition) => {
        animationContainer.innerHTML = "";
        const createElements = (count, className, setup) => {
            for (let i = 0; i < count; i++) {
                const el = document.createElement("div");
                el.className = className;
                setup(el);
                animationContainer.appendChild(el);
            }
        };        
    };

    // Event Listeners
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather({ city });
            cityInput.value = "";
            suggestionsContainer.classList.add("hidden");
        } else {
            searchError.textContent = "Please enter a city name.";
            searchError.classList.remove('hidden');
        }
    });

    cityInput.addEventListener("input", () => {
        searchError.classList.add('hidden');
        debounce(handleCityInput, 300)({ target: cityInput });
    });

    cityInput.addEventListener('focus', () => {
        renderRecentSearches();
        suggestionsContainer.classList.remove('hidden');
    });

    document.addEventListener("click", (e) => {
        if (!searchForm.contains(e.target)) {
            suggestionsContainer.classList.add("hidden");
        }
    });

    geolocationBtn.addEventListener('click', () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                position => fetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude }),
                () => showError("Unable to retrieve your location. Please grant permission or search for a city manually.")
            );
        } else {
            showError("Geolocation is not supported by your browser.");
        }
    });

    closeModalBtn.addEventListener('click', () => errorModal.classList.add("hidden"));

    // Temperature unit switch handlers.
    tempUnitC.addEventListener('click', () => {
        if (currentTempUnit !== 'C') {
            currentTempUnit = 'C';
            updateTemperatureDisplay();
        }
    });

    tempUnitF.addEventListener('click', () => {
        if (currentTempUnit !== 'F') {
            currentTempUnit = 'F';
            updateTemperatureDisplay();
        }
    });

    // Initial Load: default city.
    fetchWeather({ city: "Jamshedpur" });
});