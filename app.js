document.addEventListener("DOMContentLoaded", () => {
    
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

    //fetching weather data from the API.
    const fetchWeather = async ({lat, lon, city}) => {
        showLoading();
        if(clearInterval) clearInterval
        (clockInterval);
        //for handling API errors.
        try {
            if(!wapik) throw new Error ("API key is missing");
            let latitude = lat;
            let longitude = lon;
            if(city){
                const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${wapik}`;
                const getResponse = await fetch(geoUrl);
                if(!getResponse) throw new Error("Could not fetch data.");
                const geoData = await getResponse.json();
                if(geoData.length === 0) throw new Error ("No data available.");
                latitude = geoData[0].lat;
                longitude = geoData[0].lon;
            }

            //fetching data for weather, 5-day forecast & air quality.  
            const forecastUrl = `api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${wapik}`;
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${wapik}`;
            const aqiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${wapik}`;

            const [weatherResponse, forecastResponse, aqiResponse] = await Promise.all([
                fetch(forecastUrl),
                fetch(weatherUrl),
                fetch(aqiUrl)
            ]);

            if([weatherResponse, forecastResponse, aqiResponse].some(res => !res.ok)){
                throw new Error("Failed to fetch the data.");
            }

            const forecastData = await forecastResponse.json();
            const weatherData = await weatherResponse.json();
            const aqiData = await aqiResponse.json();


        } catch (error) {
            console.error("Error while fetching the data: ", error);
            showError(error.message);
        } finally{
            hideLoading();
        }
    };

    const updateUI = (weatherContent,forecastContainer,aqi) => {
        let weatherConditionForBg = weather.weather[0].main;
        if(weatherConditionForBg === "Clouds" && weather.Clouds.all<20){
            weatherConditionForBg = "Clear";
        }

    };

    //for displaying the current time.
    const updateClock = (timezoneOffset) => {
        const now = new Data();
        const utc = now.getTime() + (now.getTimeOffset() * 60000);
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

    //for dispalying the error message.
    const showError = (message) => {
        errorMessageEl.textContent = message;
        errorModal.classList.remove("hidden");
    };
});