document.addEventListener("DOMContentLoaded", () => {
    
    /*API fetched from OpenWeatherMap.com.*/ 
    const wapik = "a632b1ff36f968d65d1485823b62c3da";

    let clockInterval = null;
    const loadingOverlay = document.getElementById("loading-overlay");
    const weatherContent = document.getElementById("weather-content");
    const errorModal = document.getElementById("error-modal");
    const errorMessageEl = document.getElementById("error-message");
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const geolocationBtn = document.getElementById('geolocation-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const animationContainer = document.getElementById('animation-container');
    const suggestionsBox = document.getElementById('suggestions-box');
    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const currentTimeEl = document.getElementById('current-time');
    const currentTempEl = document.getElementById('current-temp');
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


    //all kinds of weather images for daytime.
    const backgroundDay = {
        Clear:"https://plus.unsplash.com/premium_photo-1727730047398-49766e915c1d?q=80&w=1512&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        Clouds:"https://plus.unsplash.com/premium_photo-1667143324668-064f130f731d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fGNsb3VkeSUyMHdlYXRoZXJ8ZW58MHx8MHx8fDA%3D",
        Rain:"https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHJhaW55JTIwd2VhdGhlcnxlbnwwfHwwfHx8MA%3D%3D",
        Drizzle:"https://plus.unsplash.com/premium_photo-1683133653067-7d343aa585f3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fGRyaXp6bGUlMjB3ZWF0aGVyfGVufDB8fDB8fHww", 
        Thunderstorm:"https://plus.unsplash.com/premium_photo-1727513101945-ac248a791597?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHRodW5kZXJzdG9ybSUyMHdlYXRoZXJ8ZW58MHx8MHx8fDA%3D",
        Snow:"https://plus.unsplash.com/premium_photo-1676747433701-ebe10f095b77?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c25vd3klMjB3ZWF0aGVyfGVufDB8fDB8fHww",
        Mist:"https://images.unsplash.com/photo-1582076198523-57cea81a1baa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1pc3QlMjB3ZWF0aGVyfGVufDB8fDB8fHww",
        Default:"https://images.unsplash.com/photo-1601134467661-3d775b999c8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2VhdGhlcnxlbnwwfHwwfHx8MA%3D%3D", 
    };

    //all kinds of weather images for night time.
    const backgroundNight = {
        Clear:"https://plus.unsplash.com/premium_photo-1680981142034-2ef8d334b76b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjV8fGNsZWFyJTIwbmlnaHQlMjB3ZWF0aGVyfGVufDB8fDB8fHww",
        Clouds:"https://images.unsplash.com/photo-1624477582148-35d5e4bae761?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2xvdWR5JTIwbmlnaHQlMjB3ZWF0aGVyfGVufDB8fDB8fHww",
        Rain:"https://media.istockphoto.com/id/1378052140/photo/rain.webp?a=1&b=1&s=612x612&w=0&k=20&c=TiCk_vx8GQDxDD45YorWwaOu_NPs27uE4-kjQhjUH1U=",
        Drizzle:"https://images.unsplash.com/photo-1702893750231-d0788506cf4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZHJpenpsZSUyMG5pZ2h0JTIwd2VhdGhlcnxlbnwwfHwwfHx8MA%3D%3D",
        Thunderstorm:"https://media.istockphoto.com/id/1413876271/photo/lightning-strike-in-a-thunderstorm.webp?a=1&b=1&s=612x612&w=0&k=20&c=Lxq6Vc2ULpz0x2OdIiuHULJDrH9rJFencbHUUI_GpXM=",
        Snow:"https://images.unsplash.com/photo-1738065821639-ffda488041cb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTF8fHNub3d5JTIwbmlnaHQlMjB3ZWF0aGVyfGVufDB8fDB8fHww",
        Mist:"https://images.unsplash.com/photo-1744979769202-3b6ac489aba2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWlzdHklMjBuaWdodCUyMHdlYXRoZXJ8ZW58MHx8MHx8fDA%3D",
        Default:"https://images.unsplash.com/photo-1630959049903-f1742bcd27d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fG5pZ2h0JTIwd2VhdGhlcnxlbnwwfHwwfHx8MA%3D%3D",
    };

    // Asynchronous function to retrieve all necessary weather data (Current, Forecast, and Air Quality).
    const fetchWeather = async ({lat, lon, city}) => {
        showLoading();
        clearInterval(clockInterval);
        
        try {
            if(!wapik) throw new Error ("API key is missing");
            let latitude = lat;
            let longitude = lon;
            if(city){
                const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${wapik}`;
                const getResponse = await fetch(geoUrl);
                if(!getResponse.ok) throw new Error("Could not fetch geolocation data.");
                const geoData = await getResponse.json();
                if(geoData.length === 0) throw new Error ("City not found.");
                latitude = geoData[0].lat;
                longitude = geoData[0].lon;
            }

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${wapik}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${wapik}&units=metric`;
            const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${wapik}`;

            const [weatherResponse, forecastResponse, aqiResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl),
                fetch(aqiUrl)
            ]);

            if([weatherResponse, forecastResponse, aqiResponse].some(res => !res.ok)){
                throw new Error("Failed to fetch one or more weather data sources.");
            }

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();
            const aqiData = await aqiResponse.json();

            updateUI(weatherData, forecastData, aqiData);

        } catch (error) {
            console.error("Error while fetching the data: ", error);
            showError(error.message);
        } finally{
            hideLoading();
        }
    };

    //Takes the raw API data and manipulates the DOM elements to display it.
    const updateUI = (weather, forecast, aqi) => {
        let weatherConditionForBg = weather.weather[0].main;
        if(weatherConditionForBg === "Clouds" && weather.clouds.all < 20){
            weatherConditionForBg = "Clear";
        }
        updateClock(weather.timezone);
        clockInterval = setInterval(() => updateClock(weather.timezone), 1000);

        //Sunrise/Sunset Time Formatting.
        const currentTimeUTC = weather.dt;
        const sunriseUTC = weather.sys.sunrise;
        const sunsetUTC = weather.sys.sunset;
        const isNight = (currentTimeUTC < sunriseUTC || currentTimeUTC > sunsetUTC);
        const backgroundSet = isNight ? backgroundNight : backgroundDay;
        document.body.style.backgroundImage = `url('${backgroundSet[weatherConditionForBg] || backgroundSet.Default}')`;

        currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`; 
        cityNameEl.textContent = `${weather.name}, ${weather.sys.country}`;
        const localDate = new Date((weather.dt + weather.timezone) * 1000);
        currentDateEl.textContent = localDate.toLocaleDateString("en-us", {weekday:"long", month:"long", day:"numeric", timeZone:"UTC"});
        currentTempEl.textContent = `${Math.round(weather.main.temp)}°`;
        currentWeatherDescEl.textContent = weather.weather[0].description;

        const formatTime = (timestamp) => new Date((timestamp + weather.timezone) * 1000).toLocaleTimeString("en-us", {hour:"2-digit", minute:"2-digit", hour12:true, timeZone:"UTC"});
        sunriseTimeEl.textContent = formatTime(weather.sys.sunrise);
        sunsetTimeEl.textContent = formatTime(weather.sys.sunset);

        humidityEl.textContent = `${weather.main.humidity} %`;
        windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)} km/hr`;
        feelsLikeEl.textContent = `${Math.round(weather.main.feels_like)}°`;
        pressureEl.textContent = `${weather.main.pressure} hPa`;
        visibilityEl.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;

        // air quality update and styling.
        const aqiValue = aqi.list[0].main.aqi;
        const aqiInfo = getAqiInfo(aqiValue);
        airQualityEl.textContent = aqiInfo.text;
        airQualityEl.className = `font-bold px-3 py-1 rounded-full text-sm ${aqiInfo.color}`;
        healthRecommendationEl.innerHTML = `<p class="text-gray-200 text-sm">${aqiInfo.recommendation}</p>`;

        // 5-Day forecast rendering.
        const dailyForcasts = processForeCast(forecast.list);
        forecastContainer.innerHTML = "";
        dailyForcasts.forEach(day => {
            const card = document.createElement("div");
            card.className = `p-4 rounded-2xl text-center card backdrop-blur-xl`;
            card.innerHTML = `
              <p class="font-bold text-lg">${new Date(day.dt_txt).toLocaleDateString("en-us", {weekday:"short"})}</p>
              <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="w-16 h-16 mx-auto">
              <p class="font-semibold">${Math.round(day.main.temp_max)}°/${Math.round(day.main.temp_min)}°</p>
            `;
            forecastContainer.appendChild(card);
        });
        updateNightAnimation(isNight, weatherConditionForBg);
    };

    //For the animation of night-time.
    const updateNightAnimation = (isNight, condition) => {
        animationContainer.innerHTML = "";
        if(!isNight) 
            return;

        if(condition === "Clear"){
            for(let i = 0; i<20; i++){
                const star = document.createElement("div");
                star.className = "star";
                star.style.top = `${Math.random() * 100}%`;
                star.style.left = `${Math.random() * 100}%`;
                star.style.width = `${Math.random() * 2 + 1}px`;
                star.style.height = star.style.width;
                star.style.animationDelay = `${Math.random() * 5}s`;
                star.style.animationDuration = `${Math.random() * 3 + 2}s`;
                animationContainer.appendChild(star);
            }
        }
        else if(condition === "Rain" || condition === "Drizzle"){
            for(let i = 0; i<50; i++){
                const drop = document.createElement("div");
                drop.className = "rain-drop";
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.animationDelay = `${Math.random() * 2}s`;
                drop.style.animationDuration = `${Math.random() * .5 + .5}s`;
                animationContainer.appendChild(drop);
            }
        }
        else if(condition === "Snow"){
            for(let i = 0; i<50; i++){
                const flake = document.createElement("div");
                flake.className = "snowFlake";
                flake.style.left = `${Math.random() * 100}%`;
                flake.style.animationDelay = `${Math.random() * 10}s`;
                flake.style.animationDuration = `${Math.random() * 5 + 5}s`;
                flake.style.opacity = `${Math.random() * .5 + .3}`;
                animationContainer.appendChild(flake);
            }
        }
    };

    //for the information regarding air quality.
    const getAqiInfo = (aqi) => {
        switch(aqi){
            case 1: return{
                text:"Good",
                color:"bg-green-500 text-white",
                recommendation:"Air Quality is great."
            };
            case 2: return{
                text:"Fair",
                color:"bg-yellow-500 text-black",
                recommendation:"Air Quality is acceptable."
            };
            case 3: return{
                text:"Moderate",
                color:"bg-orange-500 text-white",
                recommendation:"Sensitive groups may experience health issues."
            };
            case 4: return{
                text:"Poor",
                color:"bg-red-500 text-white",
                recommendation:"Everyone may experience health issues."
            };
            case 5: return{
                text:"Very Poor",
                color:"bg-purple-700 text-white",
                recommendation:"Health alert: air quality can lead serious health issues."
            };
            default: return{
                text:"Unknown",
                color:"bg-gray-500 text-white",
                recommendation:"Air Quality data is unavailable."
            };
        }
    };

    //functionality for 5-day forecast
    const processForeCast = (forecastList) => {
        const dailyData = {};
        forecastList.forEach(entry => {
            const date = entry.dt_txt.split(' ')[0];
            if(!dailyData[date]){
                dailyData[date] = { temp_max: [], temp_min: [], icons: {}, entry: null};
            }
            dailyData[date].temp_max.push(entry.main.temp_max);
            dailyData[date].temp_min.push(entry.main.temp_min);
            const icon = entry.weather[0].icon;
            dailyData[date].icons[icon] = (dailyData[date].icons[icon] || 0) + 1;
            if(!dailyData[date].entry || entry.dt_txt.includes("12:00:00")){
                dailyData[date].entry = entry;
            }
        });

        const processed = [];
        for(const date in dailyData){
            const day = dailyData[date];
            const mostCommonIcon = Object.keys(day.icons).reduce((a, b) => day.icons[a] > day.icons[b] ? a : b);
            day.entry.weather[0].icon = mostCommonIcon;
            day.entry.main.temp_max = Math.max(...day.temp_max);
            day.entry.main.temp_min = Math.min(...day.temp_min);
            processed.push(day.entry);
        }
        return processed.slice(0, 5);
    };

    //debouncing for search input
    const debounce = (func, delay) => {
        let timeout;
        return(...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay); 
        }
    };

    const handleCityInput = async (event) => {
        const query = event.target.value;
        if(query.length < 3){
            suggestionsBox.classList.add("hidden");
            return;
        }

        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${wapik}`;
            const response = await fetch(geoUrl);
            if(!response.ok) return;
            const cities = await response.json();

            suggestionsBox.innerHTML = "";
            if(cities.length > 0){
                suggestionsBox.classList.remove("hidden");
                cities.forEach(city => {
                    const div = document.createElement("div");
                    div.className = "p-3 hover:bg-white/10 cursor-pointer";
                    div.textContent = `${city.name}, ${city.state ? city.state + "," : ""} ${city.country}`;
                    div.onclick = () => {
                        cityInput.value = city.name;
                        suggestionsBox.classList.add("hidden");
                        fetchWeather({lat:city.lat, lon:city.lon});
                    };
                    suggestionsBox.appendChild(div);
                });
            }
            else {
                suggestionsBox.classList.add("hidden");
            }
        } catch (error) {
            console.error("error in fetching city suggestions:", error);
        }
    };

    //for displaying the current time.
    const updateClock = (timezoneOffset) => {
        const now = new Date(); 
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localTime = new Date(utc + (timezoneOffset * 1000)); 
        // Corrected: Removed the timeZone: "UTC" option
        currentTimeEl.textContent = localTime.toLocaleTimeString("en-US", {hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:true});
    };


    //for displaying loading state.
    const showLoading = () => {
        loadingOverlay.classList.remove("hidden");
        loadingOverlay.classList.add("flex");
    };

    //for hiding the loading state.
    const hideLoading = () => {
        loadingOverlay.classList.remove("flex");
        loadingOverlay.classList.add("hidden");
        weatherContent.classList.remove("opacity-0");
    };

    //for displaying the error message.
    const showError = (message) => {
        errorMessageEl.textContent = message;
        errorModal.classList.remove("hidden");
    };

    //functionality for search.
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if(city)
            fetchWeather({city});
        suggestionsBox.classList.add("hidden");
        cityInput.value = "";
    });

    const debouncedHandleCityInput = debounce(handleCityInput, 300);
    cityInput.addEventListener("input", debouncedHandleCityInput);

    document.addEventListener("click", (e) => {
        if(!searchForm.contains(e.target)){
            suggestionsBox.classList.add("hidden");
        }
    });

    geolocationBtn.addEventListener("click", () => {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                (position) => fetchWeather({lat:position.coords.latitude, lon:position.coords.longitude}), 
                () => {
                    console.log("Geolocation permission denied or unavailable. Fetching default city.");
                    fetchWeather({city: "New Delhi"});
                },
                {enableHighAccuracy:true, timeout:10000, maximumAge:0}
            );
        }
        else{
            console.log("Geolocation is not supported by this browser.");
            fetchWeather({city: "New Delhi"});
        }
    });

    closeModalBtn.addEventListener("click", () => errorModal.classList.add("hidden"));
    
    // Initial fetch on page load
    geolocationBtn.click();
});