const WEATHER_API_KEY = '011cd4a12f31ea1e6f91c000720b260a';
const GEOAPI_KEY = '2dafe698b1ab4005a67ee6434983cd0b'; 
const fetchCities = async (query) => {
  // Запрос к GeoAPI для автозаполнения города
  const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=10&apiKey=${GEOAPI_KEY}`);

  // Отладка: проверка ответа от API
  const data = await response.json();
  console.log('GeoAPI Response:', data); // Выводим ответ в консоль

  // Если данные корректны, продолжаем обновлять datalist
  if (data && data.features) {
    const cities = data.features.map(city => city.properties.city);
    updateCityDatalist(cities);
  } else {
    console.error('Ошибка: Нет данных о городах');
  }
};

// Обновление списка городов для автозаполнения
const updateCityDatalist = (cities) => {
  const input = document.getElementById('weatherCity');
  input.setAttribute('list', 'cities');
  let datalist = document.getElementById('cities');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'cities';
    input.parentNode.appendChild(datalist);
  }
  datalist.innerHTML = '';
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    datalist.appendChild(option);
  });
};

// Автозаполнение при вводе текста
document.getElementById('weatherCity').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length >= 3) {
    fetchCities(query); // Запрос к GeoAPI
  }
});
