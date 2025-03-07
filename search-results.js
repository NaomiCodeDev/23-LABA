// Constants
const carriers = [
    { name: 'Жмых Эирлайнс', code: 'ZH', basePrice: { min: 17, max: 800 } },
    { name: 'Небесные Линии', code: 'NL', basePrice: { min: 20, max: 904 } },
    { name: 'АэроЭкспресс', code: 'AE', basePrice: { min: 24, max: 1038 } },
    { name: 'СкайВингс', code: 'SW', basePrice: { min: 27, max: 1589 } }
];

const FLIGHT_DURATIONS = {
    DIRECT: {
        min: 120,    // 2 hours
        max: 240     // 4 hours
    },
    ONE_STOP: {
        min: 240,    // 4 hours
        max: 360     // 6 hours
    },
    TWO_STOPS: {
        min: 360,    // 6 hours
        max: 720     // 12 hours
    }
};

const flightClasses = {
    economy: { name: 'Эконом', multiplier: 1 },
    comfort: { name: 'Комфорт', multiplier: 1.5 },
    business: { name: 'Бизнес', multiplier: 2.5 }
};

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

function initializePage() {
    try {
        const searchData = JSON.parse(localStorage.getItem('flightSearchData'));
        
        if (!searchData) {
            showErrorToast('Данные поиска не найдены');
            setTimeout(() => {
                window.location.href = '../main-page.html';
            }, 2000);
            return;
        }

        validateSearchDates(searchData);
        updatePageHeaders(searchData);
        generateAndDisplayFlights(searchData);
        initializeFilters();

    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

function validateSearchDates(searchData) {
    const currentDate = new Date('2025-03-06'); // Using provided UTC date
    const departDate = new Date(searchData.departDate);
    
    if (departDate < currentDate) {
        showErrorToast('Дата вылета не может быть в прошлом');
        setTimeout(() => {
            window.location.href = '../main-page.html';
        }, 2000);
        return false;
    }

    if (searchData.returnDate) {
        const returnDate = new Date(searchData.returnDate);
        if (returnDate < departDate) {
            showErrorToast('Дата возврата должна быть после даты вылета');
            setTimeout(() => {
                window.location.href = '../main-page.html';
            }, 2000);
            return false;
        }
    }

    return true;
}

function updatePageHeaders(searchData) {
    document.getElementById('route-header').textContent = 
        `Результаты поиска: ${searchData.departure} — ${searchData.arrival}`;
    
    document.getElementById('outbound-route').textContent = 
        `${searchData.departure} → ${searchData.arrival}`;
    
    const departDate = new Date(searchData.departDate);
    document.getElementById('outbound-date').textContent = formatDate(departDate);
    
    const returnFlightsSection = document.getElementById('return-flights-section');
    if (searchData.returnDate) {
        document.getElementById('return-route').textContent = 
            `${searchData.arrival} → ${searchData.departure}`;
        
        const returnDate = new Date(searchData.returnDate);
        document.getElementById('return-date').textContent = formatDate(returnDate);
        returnFlightsSection.style.display = 'block';
    } else {
        returnFlightsSection.style.display = 'none';
    }
}

function generateAndDisplayFlights(searchData) {
    const outboundFlights = generateFlightOptions(searchData.departDate, searchData.passengers);
    displayFlights('outbound-flights', outboundFlights);
    
    if (searchData.returnDate) {
        const returnFlights = generateFlightOptions(searchData.returnDate, searchData.passengers);
        displayFlights('return-flights', returnFlights);
    }
}

function generateFlightOptions(date, passengers) {
    const flights = [];
    const flightDate = new Date(date);
    const baseFlightTimes = ['07:00', '09:30', '12:00', '14:30', '17:00', '19:30'];
    
    baseFlightTimes.forEach(time => {
        const { duration, stops } = generateFlightDuration();
        const carrier = carriers[Math.floor(Math.random() * carriers.length)];
        const flightNumber = generateFlightNumber(carrier.code);
        const basePrice = generateBasePrice(carrier, stops);
        
        const flight = {
            departureTime: time,
            arrivalTime: calculateArrivalTime(time, duration),
            duration: formatDuration(duration),
            stops: stops,
            carrier: carrier.name,
            flightNumber: flightNumber,
            prices: calculatePrices(basePrice, passengers),
            passengers: passengers
        };
        
        flights.push(flight);
    });
    
    return flights;
}

function generateFlightNumber(carrierCode) {
    const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    return `${carrierCode}${number}`;
}

function generateFlightDuration() {
    const random = Math.random();
    let duration, stops;
    
    if (random < 0.7) { // 70% direct flights
        duration = Math.floor(
            Math.random() * (FLIGHT_DURATIONS.DIRECT.max - FLIGHT_DURATIONS.DIRECT.min) + 
            FLIGHT_DURATIONS.DIRECT.min
        );
        stops = 0;
    } else if (random < 0.9) { // 20% one stop
        duration = Math.floor(
            Math.random() * (FLIGHT_DURATIONS.ONE_STOP.max - FLIGHT_DURATIONS.ONE_STOP.min) + 
            FLIGHT_DURATIONS.ONE_STOP.min
        );
        stops = 1;
    } else { // 10% two stops
        duration = Math.floor(
            Math.random() * (FLIGHT_DURATIONS.TWO_STOPS.max - FLIGHT_DURATIONS.TWO_STOPS.min) + 
            FLIGHT_DURATIONS.TWO_STOPS.min
        );
        stops = 2;
    }
    
    return { duration, stops };
}

function generateBasePrice(carrier, stops) {
    const basePrice = Math.floor(
        Math.random() * (carrier.basePrice.max - carrier.basePrice.min) + 
        carrier.basePrice.min
    );
    
    // Price modifiers based on stops
    const stopMultipliers = [1, 0.85, 0.7]; // Direct flights are most expensive
    return Math.round(basePrice * stopMultipliers[stops]);
}

function calculatePrices(basePrice, passengers) {
    return {
        economy: Math.round(basePrice * flightClasses.economy.multiplier * passengers),
        comfort: Math.round(basePrice * flightClasses.comfort.multiplier * passengers),
        business: Math.round(basePrice * flightClasses.business.multiplier * passengers)
    };
}

function displayFlights(containerId, flights) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    flights.forEach((flight, index) => {
        const flightCard = createFlightCard(flight, index);
        container.appendChild(flightCard);
    });
}

function createFlightCard(flight, index) {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.dataset.flightIndex = index;
    
    const stopsText = getStopsText(flight.stops);
    const stopsClass = getStopsClass(flight.stops);
    
    card.innerHTML = `
        <div class="flight-info">
            <div class="carrier-info">
                <span class="carrier-name">${flight.carrier}</span>
                <span class="flight-number">Рейс ${flight.flightNumber}</span>
            </div>
            <div class="flight-time">
                <div class="time-group">
                    <span class="departure-time">${flight.departureTime}</span>
                    <span class="time-label">Вылет</span>
                </div>
                <div class="duration">
                    <span class="duration-line">────────</span>
                    <span class="duration-time">${flight.duration}</span>
                    <span class="stops ${stopsClass}">${stopsText}</span>
                </div>
                <div class="time-group">
                    <span class="arrival-time">${flight.arrivalTime}</span>
                    <span class="time-label">Прилет</span>
                </div>
            </div>
            <div class="price-options">
                ${Object.entries(flightClasses).map(([className, classInfo]) => `
                    <div class="price-option" data-class="${className}">
                        <span class="class-name">${classInfo.name}</span>
                        <span class="price">${formatPrice(flight.prices[className])}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    card.querySelectorAll('.price-option').forEach(option => {
        option.addEventListener('click', () => selectFlight(card, option.dataset.class));
    });
    
    return card;
}

function setupEventListeners() {
    // Time filter
    const applyTimeFilter = document.getElementById('apply-time-filter');
    if (applyTimeFilter) {
        applyTimeFilter.addEventListener('click', () => {
            const timeFrom = document.getElementById('time-from').value;
            const timeTo = document.getElementById('time-to').value;
            filterFlightsByTime(timeFrom, timeTo);
        });
    }
    
    // Sort flights
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => sortFlights(sortSelect.value));
    }
    
    // Continue booking button
    const continueButton = document.getElementById('continue-booking');
    if (continueButton) {
        continueButton.addEventListener('click', handleContinueBooking);
    }
}

function filterFlightsByTime(timeFrom, timeTo) {
    if (!timeFrom && !timeTo) {
        showErrorToast('Укажите время для фильтрации');
        return;
    }

    document.querySelectorAll('.flight-card').forEach(card => {
        const departureTime = card.querySelector('.departure-time').textContent;
        const show = (!timeFrom || departureTime >= timeFrom) && 
                    (!timeTo || departureTime <= timeTo);
        card.style.display = show ? 'block' : 'none';
    });
}

function sortFlights(sortBy) {
    ['outbound-flights', 'return-flights'].forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const cards = Array.from(container.getElementsByClassName('flight-card'));
        
        cards.sort((a, b) => {
            switch(sortBy) {
                case 'price':
                    return comparePrices(a, b);
                case 'duration':
                    return compareDurations(a, b);
                default:
                    return compareDepartureTimes(a, b);
            }
        });
        
        cards.forEach(card => container.appendChild(card));
    });
}

function comparePrices(cardA, cardB) {
    const priceA = parseInt(cardA.querySelector('.price-option[data-class="economy"] .price')
        .textContent.replace(/[^\d]/g, ''));
    const priceB = parseInt(cardB.querySelector('.price-option[data-class="economy"] .price')
        .textContent.replace(/[^\d]/g, ''));
    return priceA - priceB;
}

function compareDurations(cardA, cardB) {
    const durationA = parseDuration(cardA.querySelector('.duration-time').textContent);
    const durationB = parseDuration(cardB.querySelector('.duration-time').textContent);
    return durationA - durationB;
}

function compareDepartureTimes(cardA, cardB) {
    const timeA = cardA.querySelector('.departure-time').textContent;
    const timeB = cardB.querySelector('.departure-time').textContent;
    return timeA.localeCompare(timeB);
}

function selectFlight(card, flightClass) {
    const container = card.closest('.flights-container');
    const isOutbound = container.id === 'outbound-flights';
    
    // Remove previous selections in the same container
    container.querySelectorAll('.price-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked option
    card.querySelector(`.price-option[data-class="${flightClass}"]`).classList.add('selected');
    
    updateSelectedFlightSummary(card, flightClass, isOutbound);
    updateContinueButton();
}

function updateSelectedFlightSummary(card, flightClass, isOutbound) {
    const flightInfo = {
        carrier: card.querySelector('.carrier-name').textContent,
        flightNumber: card.querySelector('.flight-number').textContent,
        departureTime: card.querySelector('.departure-time').textContent,
        arrivalTime: card.querySelector('.arrival-time').textContent,
        duration: card.querySelector('.duration-time').textContent,
        stops: card.querySelector('.stops').textContent,
        price: card.querySelector(`.price-option[data-class="${flightClass}"] .price`).textContent,
        class: flightClasses[flightClass].name
    };
    
    const summaryId = isOutbound ? 'selected-outbound' : 'selected-return';
    const summaryElement = document.getElementById(summaryId);
    
    summaryElement.querySelector('span').innerHTML = `
        ${flightInfo.carrier} - ${flightInfo.flightNumber}<br>
        Вылет: ${flightInfo.departureTime} - Прилет: ${flightInfo.arrivalTime}<br>
        Длительность: ${flightInfo.duration} (${flightInfo.stops})<br>
        Класс: ${flightInfo.class}<br>
        Цена: ${flightInfo.price}
    `;
}

function updateContinueButton() {
    const continueButton = document.getElementById('continue-booking');
    const searchData = JSON.parse(localStorage.getItem('flightSearchData'));
    
    const outboundSelected = document.querySelector('#outbound-flights .price-option.selected');
    const returnFlightsSection = document.getElementById('return-flights-section');
    const returnSelected = returnFlightsSection.style.display === 'none' || 
                         document.querySelector('#return-flights .price-option.selected');
    
    continueButton.disabled = !(outboundSelected && returnSelected);
}

function handleContinueBooking() {
    const selectedFlights = {
        outbound: getSelectedFlightInfo('outbound-flights'),
        return: getSelectedFlightInfo('return-flights')
    };
    
    localStorage.setItem('selectedFlights', JSON.stringify(selectedFlights));
    showSuccessToast('Перенаправление на страницу бронирования...');
    
    // Simulate redirect to booking page
    setTimeout(() => {
        alert('Переход к оформлению бронирования...\n\nВыбранные рейсы:\n' + 
              formatSelectedFlightsForDisplay(selectedFlights));
    }, 1500);
}

function getSelectedFlightInfo(containerId) {
    const container = document.getElementById(containerId);
    const selectedOption = container.querySelector('.price-option.selected');
    
    if (!selectedOption) return null;
    
    const card = selectedOption.closest('.flight-card');
    return {
        carrier: card.querySelector('.carrier-name').textContent,
        flightNumber: card.querySelector('.flight-number').textContent,
        departureTime: card.querySelector('.departure-time').textContent,
        arrivalTime: card.querySelector('.arrival-time').textContent,
        duration: card.querySelector('.duration-time').textContent,
        stops: card.querySelector('.stops').textContent,
        class: flightClasses[selectedOption.dataset.class].name,
        price: selectedOption.querySelector('.price').textContent
    };
}

function formatSelectedFlightsForDisplay(selectedFlights) {
    let display = '\nРейс туда:\n';
    display += formatFlightInfo(selectedFlights.outbound);
    
    if (selectedFlights.return) {
        display += '\n\nРейс обратно:\n';
        display += formatFlightInfo(selectedFlights.return);
    }
    
    return display;
}

function formatFlightInfo(flight) {
    if (!flight) return 'Не выбран';
    return `${flight.carrier} - ${flight.flightNumber}
Вылет: ${flight.departureTime}
Прилет: ${flight.arrivalTime}
Длительность: ${flight.duration}
${flight.stops}
Класс: ${flight.class}
Цена: ${flight.price}`;
}

// Utility Functions
function calculateArrivalTime(departureTime, durationInMinutes) {
    const [hours, minutes] = departureTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + durationInMinutes;
    
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    
    return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${String(remainingMinutes).padStart(2, '0')}`;
}

function parseDuration(duration) {
    const [hours, minutes] = duration.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatDate(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-BY', {
        style: 'currency',
        currency: 'BYN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
}

function getStopsText(stops) {
    switch (stops) {
        case 0:
            return 'Прямой';
        case 1:
            return '1 пересадка';
        default:
            return `${stops} пересадки`;
    }
}

function getStopsClass(stops) {
    switch (stops) {
        case 0:
            return 'direct';
        case 1:
            return 'one-stop';
        default:
            return 'two-stops';
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

function showSuccessToast(message) {
    showToast(message, 'success');
}

function showErrorToast(message) {
    showToast(message, 'error');
}

// Add error handling for various scenarios
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showErrorToast('Произошла ошибка. Попробуйте перезагрузить страницу.');
});

// Handle network status
window.addEventListener('online', () => {
    showSuccessToast('Подключение к интернету восстановлено');
});

window.addEventListener('offline', () => {
    showErrorToast('Отсутствует подключение к интернету');
});

// Initial load indication
document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete') {
        document.body.classList.remove('loading');
    }
});