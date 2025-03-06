document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const departure = urlParams.get('departure') || 'Москва';
    const arrival = urlParams.get('arrival') || 'Санкт-Петербург';
    const departDate = urlParams.get('depart-date') || '2025-03-12';
    const returnDate = urlParams.get('return-date') || '';
    const passengers = parseInt(urlParams.get('passengers') || '1');
    
    // Update route headers
    document.getElementById('route-header').textContent = `Результаты поиска: ${departure} — ${arrival}`;
    document.getElementById('outbound-route').textContent = `${departure} → ${arrival}`;
    document.getElementById('outbound-date').textContent = formatDate(departDate);
    
    // Handle return flight section visibility
    const returnFlightsSection = document.getElementById('return-flights-section');
    if (returnDate) {
        document.getElementById('return-route').textContent = `${arrival} → ${departure}`;
        document.getElementById('return-date').textContent = formatDate(returnDate);
    } else {
        returnFlightsSection.style.display = 'none';
        document.getElementById('selected-return').style.display = 'none';
    }
    
    // Sample flight data (in a real app, this would come from an API)
    const outboundFlights = generateFlights(departure, arrival, departDate, 8);
    
    // Generate return flights if return date is specified
    let returnFlights = [];
    if (returnDate) {
        returnFlights = generateFlights(arrival, departure, returnDate, 6);
    }
    
    // Display flights
    displayFlights('outbound-flights', outboundFlights, passengers);
    if (returnDate) {
        displayFlights('return-flights', returnFlights, passengers);
    }
    
    // Add event listeners for filters and sorting
    document.getElementById('apply-time-filter').addEventListener('click', function() {
        applyTimeFilter('outbound-flights', outboundFlights, passengers);
        if (returnDate) {
            applyTimeFilter('return-flights', returnFlights, passengers);
        }
    });
    
    document.getElementById('sort-by').addEventListener('change', function() {
        const sortValue = this.value;
        sortFlights('outbound-flights', outboundFlights, sortValue, passengers);
        if (returnDate) {
            sortFlights('return-flights', returnFlights, sortValue, passengers);
        }
    });
    
    // Handle continue button state
    updateContinueButtonState();
});

// Format date to a more readable format
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Generate sample flights
function generateFlights(from, to, date, count) {
    const flights = [];
    const baseTime = new Date(date);
    baseTime.setHours(6, 0, 0, 0);
    
    for (let i = 0; i < count; i++) {
        const departureTime = new Date(baseTime);
        departureTime.setHours(departureTime.getHours() + i * 2);
        
        const capacityPercent = Math.floor(Math.random() * 101);
        const isFull = capacityPercent >= 100;
        const isCloseToTakeoff = Math.random() < 0.2; // 20% chance flight is close to takeoff
        
        const durationHours = Math.floor(Math.random() * 3) + 1;
        const durationMinutes = Math.floor(Math.random() * 60);
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + durationHours);
        arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);
        
        // Calculate discount based on capacity
        let discount = 0;
        if (capacityPercent >= 100) discount = 40;
        else if (capacityPercent >= 85) discount = 30;
        else if (capacityPercent >= 75) discount = 20;
        else if (capacityPercent >= 65) discount = 10;
        
        // Calculate price with a base of 100
        const basePrice = 5000 + Math.floor(Math.random() * 3000);
        const discountedPrice = basePrice * (1 - discount / 100);
        
        // Generate flight code
        const airlines = ['ЖМХ', 'SKY', 'AIR'];
        const flightNumber = airlines[Math.floor(Math.random() * airlines.length)] + Math.floor(Math.random() * 900 + 100);
        
        // Generate plane number
        const planeModels = ['Boeing 737', 'Airbus A320', 'Sukhoi SuperJet'];
        const planeNumber = planeModels[Math.floor(Math.random() * planeModels.length)] + '-' + Math.floor(Math.random() * 900 + 100);
        
        flights.push({
            id: 'flight-' + i,
            flightNumber: flightNumber,
            planeNumber: planeNumber,
            from: from,
            to: to,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            duration: { hours: durationHours, minutes: durationMinutes },
            basePrice: basePrice,
            discount: discount,
            finalPrice: discountedPrice,
            capacityPercent: capacityPercent,
            isFull: isFull,
            isCloseToTakeoff: isCloseToTakeoff,
            isUnavailable: isFull || isCloseToTakeoff
        });
    }
    
    return flights;
}

// Display flights in the specified container
function displayFlights(containerId, flights, passengers) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (flights.length === 0) {
        container.innerHTML = '<div class="no-flights-message">Нет доступных рейсов на указанную дату.</div>';
        return;
    }
    
    flights.forEach(flight => {
        // Calculate total price for all passengers
        const totalPrice = flight.finalPrice * passengers;
        
        // Create flight card element
        const flightCard = document.createElement('div');
        flightCard.className = `flight-card ${flight.isUnavailable ? 'unavailable' : ''}`;
        flightCard.dataset.flightId = flight.id;
        
        // Get capacity status class
        let capacityClass = '';
        if (flight.capacityPercent >= 100) {
            capacityClass = 'capacity-full';
        } else if (flight.capacityPercent < 50) {
            capacityClass = 'capacity-critical';
        }
        
        // Format flight times
        const departureTimeStr = formatTime(flight.departureTime);
        const arrivalTimeStr = formatTime(flight.arrivalTime);
        
        // Format duration
        const durationStr = `${flight.duration.hours}ч ${flight.duration.minutes}м`;
        
        flightCard.innerHTML = `
            <div class="flight-info">
                <div class="flight-number">${flight.flightNumber}</div>
                <div class="plane-number">${flight.planeNumber}</div>
                <div class="capacity-indicator">
                    <div class="capacity-bar ${capacityClass}">
                        <div class="capacity-fill" style="width: ${Math.min(flight.capacityPercent, 100)}%;"></div>
                    </div>
                    <span>${flight.capacityPercent}% заполнен</span>
                </div>
                ${flight.isFull ? '<div class="unavailable-reason">Рейс полностью заполнен</div>' : ''}
                ${flight.isCloseToTakeoff ? '<div class="unavailable-reason">Менее часа до вылета</div>' : ''}
            </div>
            <div class="flight-times">
                <div class="time-departure">${departureTimeStr}</div>
                <div class="date-info">${formatShortDate(flight.departureTime)}</div>
                <div class="time-arrival">${arrivalTimeStr}</div>
                <div class="date-info">${formatShortDate(flight.arrivalTime)}</div>
            </div>
            <div class="flight-duration">
                <div class="duration-time">${durationStr}</div>
                <div class="duration-info">В пути</div>
            </div>
            <div class="flight-price">
                <div class="price-value">${formatPrice(totalPrice)} ₽</div>
                ${flight.discount > 0 ? `<div class="price-discount">Скидка ${flight.discount}%</div>` : ''}
                <div class="price-per-person">${passengers > 1 ? `${formatPrice(flight.finalPrice)} ₽ / чел` : ''}</div>
            </div>
        `;
        
        // Add click event to select flight (if available)
        if (!flight.isUnavailable) {
            flightCard.addEventListener('click', function() {
                selectFlight(containerId, this, flight);
            });
        }
        
        container.appendChild(flightCard);
    });
}

// Format time as HH:MM
function formatTime(date) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

// Format date as DD.MM
function formatShortDate(date) {
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

// Format price with thousand separators
function formatPrice(price) {
    return Math.round(price).toLocaleString('ru-RU');
}

// Select a flight
function selectFlight(containerId, flightCard, flightData) {
    // Deselect all flights in the container
    const container = document.getElementById(containerId);
    const flightCards = container.querySelectorAll('.flight-card');
    flightCards.forEach(card => card.classList.remove('selected'));
    
    // Select the clicked flight
    flightCard.classList.add('selected');
    
    // Update selected flight information
    const selectedInfoId = containerId === 'outbound-flights' ? 'selected-outbound' : 'selected-return';
    const selectedInfo = document.getElementById(selectedInfoId);
    selectedInfo.querySelector('span').textContent = `${flightData.flightNumber} (${formatTime(flightData.departureTime)} - ${formatTime(flightData.arrivalTime)})`;
    
    // Store selected flight data
    if (containerId === 'outbound-flights') {
        window.selectedOutboundFlight = flightData;
    } else {
        window.selectedReturnFlight = flightData;
    }
    
    // Update continue button state
    updateContinueButtonState();
}

// Update continue button state based on selections
function updateContinueButtonState() {
    const continueButton = document.getElementById('continue-booking');
    const returnFlightsSection = document.getElementById('return-flights-section');
    
    if (returnFlightsSection.style.display === 'none') {
        // One-way trip: need only outbound flight
        continueButton.disabled = !window.selectedOutboundFlight;
    } else {
        // Round trip: need both outbound and return flights
        continueButton.disabled = !(window.selectedOutboundFlight && window.selectedReturnFlight);
    }
    
    // Add event listener for continue button
    continueButton.onclick = function() {
        if (!continueButton.disabled) {
            // In a real app, this would navigate to the booking page with the selected flights
            const outboundId = window.selectedOutboundFlight.id;
            const returnId = window.selectedReturnFlight ? window.selectedReturnFlight.id : '';
            
            window.location.href = `booking.html?outbound=${outboundId}&return=${returnId}`;
        }
    };
}

// Apply time filter
function applyTimeFilter(containerId, flights, passengers) {
    const fromTime = document.getElementById('time-from').value;
    const toTime = document.getElementById('time-to').value;
    
    if (!fromTime && !toTime) {
        // If no time range is specified, display all flights
        displayFlights(containerId, flights, passengers);
        return;
    }
    
    // Convert time strings to hours and minutes
    const fromHours = fromTime ? parseInt(fromTime.split(':')[0]) : 0;
    const fromMinutes = fromTime ? parseInt(fromTime.split(':')[1]) : 0;
    const toHours = toTime ? parseInt(toTime.split(':')[0]) : 23;
    const toMinutes = toTime ? parseInt(toTime.split(':')[1]) : 59;
    
    // Filter flights based on departure time
    const filteredFlights = flights.filter(flight => {
        const hours = flight.departureTime.getHours();
        const minutes = flight.departureTime.getMinutes();
        
        // Check if flight time is within the specified range
        if (fromHours < toHours) {
            return (hours > fromHours || (hours === fromHours && minutes >= fromMinutes)) && 
                  (hours < toHours || (hours === toHours && minutes <= toMinutes));
        } else if (fromHours > toHours) {
            // Handle case where range crosses midnight
            return (hours > fromHours || (hours === fromHours && minutes >= fromMinutes)) || 
                  (hours < toHours || (hours === toHours && minutes <= toMinutes));
        } else {
            // Same hour, check minutes
            return hours === fromHours && minutes >= fromMinutes && minutes <= toMinutes;
        }
    });
    
    // Display filtered flights
    displayFlights(containerId, filteredFlights, passengers);
}

// Sort flights
function sortFlights(containerId, flights, sortBy, passengers) {
    const sortedFlights = [...flights];
    
    switch (sortBy) {
        case 'duration':
            // Sort by flight duration (shortest first)
            sortedFlights.sort((a, b) => {
                const durationA = a.duration.hours * 60 + a.duration.minutes;
                const durationB = b.duration.hours * 60 + b.duration.minutes;
                return durationA - durationB;
            });
            break;
        case 'price':
            // Sort by final price (cheapest first)
            sortedFlights.sort((a, b) => a.finalPrice - b.finalPrice);
            break;
        default:
            // Default sort by departure time
            sortedFlights.sort((a, b) => a.departureTime - b.departureTime);
            break;
    }
    
    // Display sorted flights
    displayFlights(containerId, sortedFlights, passengers);
}