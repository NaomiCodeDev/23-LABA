// Booking Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get stored data
    const searchData = JSON.parse(localStorage.getItem('flightSearchData'));
    const selectedFlights = JSON.parse(localStorage.getItem('selectedFlights'));
    
    if (!searchData || !selectedFlights || !selectedFlights.outbound) {
        showErrorToast('Не найдены данные о выбранных рейсах');
        setTimeout(() => {
            window.location.href = '../main-page.html';
        }, 2000);
        return;
    }
    
    // Initialize page data
    initBookingPage(searchData, selectedFlights);
    setupEventListeners();
});

// Global variables to track passenger data
let passengers = [];
let maxPassengers = 0;

function initBookingPage(searchData, selectedFlights) {
    // Display flight details
    displayFlightDetails('outbound-flight-details', selectedFlights.outbound, 
        searchData.departure, searchData.arrival, searchData.departDate);
    
    if (selectedFlights.return) {
        displayFlightDetails('return-flight-details', selectedFlights.return, 
            searchData.arrival, searchData.departure, searchData.returnDate);
    } else {
        document.getElementById('return-flight-container').style.display = 'none';
    }
    
    // Set maximum number of passengers
    maxPassengers = parseInt(searchData.passengers) || 1;
    document.getElementById('max-passengers').textContent = maxPassengers;
    
    // Calculate and display total price
    calculateTotalPrice(selectedFlights);
}

function displayFlightDetails(containerId, flight, departure, arrival, dateString) {
    const container = document.getElementById(containerId);
    const date = new Date(dateString);
    const formattedDate = formatDate(date);
    
    container.innerHTML = `
        <div class="flight-detail">
            <span class="detail-label">Рейс:</span>
            <span class="detail-value">${flight.flightNumber}</span>
        </div>
        <div class="flight-detail">
            <span class="detail-label">Маршрут:</span>
            <span class="detail-value">${departure} → ${arrival}</span>
        </div>
        <div class="flight-detail">
            <span class="detail-label">Дата:</span>
            <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="flight-detail">
            <span class="detail-label">Время:</span>
            <span class="detail-value">${flight.departureTime} - ${flight.arrivalTime}</span>
        </div>
        <div class="flight-detail">
            <span class="detail-label">Длительность:</span>
            <span class="detail-value">${flight.duration}</span>
        </div>
        <div class="flight-detail">
            <span class="detail-label">Класс:</span>
            <span class="detail-value">${flight.class}</span>
        </div>
    `;
}

function calculateTotalPrice(selectedFlights) {
    let totalPrice = 0;
    
    // Extract numeric value from price string
    const outboundPrice = extractPriceValue(selectedFlights.outbound.price);
    totalPrice += outboundPrice;
    
    if (selectedFlights.return) {
        const returnPrice = extractPriceValue(selectedFlights.return.price);
        totalPrice += returnPrice;
    }
    
    document.getElementById('total-price').textContent = formatPrice(totalPrice);
    
    // Store total price for later use
    localStorage.setItem('totalPrice', totalPrice);
}

function extractPriceValue(priceString) {
    // Remove currency and non-numeric characters, then parse as float
    return parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.'));
}

function setupEventListeners() {
    // Add passenger button
    document.getElementById('add-passenger-btn').addEventListener('click', openPassengerForm);
    
    // Modal close button
    document.querySelector('.close-modal').addEventListener('click', closePassengerModal);
    
    // Cancel button in modal
    document.getElementById('cancel-passenger').addEventListener('click', closePassengerModal);
    
    // Toggle between passport and other document
    const documentTypeRadios = document.querySelectorAll('input[name="documentType"]');
    documentTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleDocumentFields);
    });
    
    // Passenger form submission
    document.getElementById('passenger-form').addEventListener('submit', handlePassengerFormSubmit);
    
    // Clear all data button
    document.getElementById('clear-all-btn').addEventListener('click', clearAllPassengerData);
    
    // Confirm booking button
    document.getElementById('confirm-booking-btn').addEventListener('click', confirmBooking);
}

function openPassengerForm(event, passengerIndex = -1) {
    // Check if we can add more passengers
    if (passengerIndex === -1 && passengers.length >= maxPassengers) {
        showErrorToast(`Достигнуто максимальное количество пассажиров (${maxPassengers})`);
        return;
    }
    
    const modal = document.getElementById('passenger-modal');
    const form = document.getElementById('passenger-form');
    const title = document.getElementById('passenger-form-title');
    
    // Reset form
    form.reset();
    document.getElementById('birthdate-error').textContent = '';
    document.getElementById('passport-error').textContent = '';
    
    // Set index for editing or -1 for new passenger
    document.getElementById('passenger-index').value = passengerIndex;
    
    // Update title based on whether we're adding or editing
    title.textContent = passengerIndex === -1 ? 'Добавить пассажира' : 'Редактировать пассажира';
    
    // If editing, fill form with passenger data
    if (passengerIndex !== -1) {
        const passenger = passengers[passengerIndex];
        
        document.getElementById('first-name').value = passenger.firstName;
        document.getElementById('last-name').value = passenger.lastName;
        document.getElementById('birthdate').value = passenger.birthdate;
        
        // Set document type and related fields
        const documentTypeRadios = document.querySelectorAll('input[name="documentType"]');
        documentTypeRadios.forEach(radio => {
            radio.checked = radio.value === passenger.documentType;
        });
        
        if (passenger.documentType === 'passport') {
            document.getElementById('passport-number').value = passenger.passportNumber;
            document.getElementById('passport-group').style.display = 'block';
            document.getElementById('other-document-group').style.display = 'none';
        } else {
            document.getElementById('document-type').value = passenger.otherDocumentType;
            document.getElementById('document-number').value = passenger.otherDocumentNumber;
            document.getElementById('passport-group').style.display = 'none';
            document.getElementById('other-document-group').style.display = 'block';
        }
    }
    
    // Display modal
    modal.style.display = 'block';
}

function closePassengerModal() {
    document.getElementById('passenger-modal').style.display = 'none';
}

function toggleDocumentFields() {
    const documentType = document.querySelector('input[name="documentType"]:checked').value;
    
    if (documentType === 'passport') {
        document.getElementById('passport-group').style.display = 'block';
        document.getElementById('other-document-group').style.display = 'none';
    } else {
        document.getElementById('passport-group').style.display = 'none';
        document.getElementById('other-document-group').style.display = 'block';
    }
}

function handlePassengerFormSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const form = event.target;
    const passengerIndex = parseInt(document.getElementById('passenger-index').value);
    const documentType = document.querySelector('input[name="documentType"]:checked').value;
    
    // Validate birthdate (must be at least 18 years old)
    const birthdate = document.getElementById('birthdate').value;
    const birthdateError = document.getElementById('birthdate-error');
    
    if (!isAdult(birthdate)) {
        birthdateError.textContent = 'Пассажир должен быть совершеннолетним для самостоятельного бронирования';
        return;
    } else {
        birthdateError.textContent = '';
    }
    
    // Validate passport format if selected
    if (documentType === 'passport') {
        const passportNumber = document.getElementById('passport-number').value;
        const passportError = document.getElementById('passport-error');
        
        if (!validatePassport(passportNumber)) {
            passportError.textContent = 'Неверный формат номера паспорта. Используйте формат: AB1234567';
            return;
        } else {
            passportError.textContent = '';
        }
    }
    
    // Create passenger object
    const passenger = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        birthdate: birthdate,
        documentType: documentType,
        seat: 'Не выбрано'
    };
    
    if (documentType === 'passport') {
        passenger.passportNumber = document.getElementById('passport-number').value.toUpperCase();
    } else {
        passenger.otherDocumentType = document.getElementById('document-type').value;
        passenger.otherDocumentNumber = document.getElementById('document-number').value;
    }
    
    // Add or update passenger
    if (passengerIndex === -1) {
        passengers.push(passenger);
    } else {
        passengers[passengerIndex] = passenger;
    }
    
    // Update UI
    renderPassengerList();
    closePassengerModal();
    updateConfirmButton();
}

function isAdult(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age >= 18;
}

function validatePassport(passportNumber) {
    const passportRegex = /^[A-Z]{2}[0-9]{7}$/;
    return passportRegex.test(passportNumber);
}

function renderPassengerList() {
    const passengerList = document.getElementById('passenger-list');
    const passengerCount = document.getElementById('passenger-count');
    
    // Update passenger count
    passengerCount.textContent = `${passengers.length} из ${maxPassengers} пассажиров`;
    
    // Clear list and rebuild
    passengerList.innerHTML = '';
    
    passengers.forEach((passenger, index) => {
        const passengerCard = document.createElement('div');
        passengerCard.className = 'passenger-card';
        
        // Create document info text
        let documentInfo = '';
        if (passenger.documentType === 'passport') {
            documentInfo = `Паспорт: ${passenger.passportNumber}`;
        } else {
            documentInfo = `${passenger.otherDocumentType}: ${passenger.otherDocumentNumber}`;
        }
        
        passengerCard.innerHTML = `
            <div class="passenger-info">
                <div class="passenger-name">${passenger.firstName} ${passenger.lastName}</div>
                <div class="passenger-details">
                    <div>Дата рождения: ${formatDateShort(passenger.birthdate)}</div>
                    <div>${documentInfo}</div>
                </div>
            </div>
            <div class="passenger-actions">
                <button class="edit-passenger" data-index="${index}">Редактировать</button>
                <button class="remove-passenger" data-index="${index}">Удалить</button>
            </div>
        `;
        
        passengerList.appendChild(passengerCard);
    });
    
    // Add event listeners to new buttons
    const editButtons = document.querySelectorAll('.edit-passenger');
    const removeButtons = document.querySelectorAll('.remove-passenger');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            openPassengerForm(null, index);
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            removePassenger(index);
        });
    });
    
    // Show/hide add passenger button based on whether we've reached the limit
    const addButton = document.getElementById('add-passenger-btn');
    addButton.disabled = passengers.length >= maxPassengers;
}

function removePassenger(index) {
    if (confirm('Вы уверены, что хотите удалить этого пассажира?')) {
        passengers.splice(index, 1);
        renderPassengerList();
        updateConfirmButton();
    }
}

function clearAllPassengerData() {
    if (passengers.length === 0) return;
    
    if (confirm('Вы уверены, что хотите удалить всех пассажиров?')) {
        passengers = [];
        renderPassengerList();
        updateConfirmButton();
    }
}

function updateConfirmButton() {
    const confirmButton = document.getElementById('confirm-booking-btn');
    confirmButton.disabled = passengers.length === 0;
}

function confirmBooking() {
    if (passengers.length === 0) {
        showErrorToast('Добавьте хотя бы одного пассажира');
        return;
    }
    
    // Store passenger data
    localStorage.setItem('passengers', JSON.stringify(passengers));
    
    // Redirect to booking management page
    window.location.href = 'booking-management.html';
}

// Utility Functions
function formatDate(date) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-BY', {
        style: 'currency',
        currency: 'BYN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
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
