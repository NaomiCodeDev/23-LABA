// Booking System Animation
document.addEventListener('DOMContentLoaded', function() {
    const bookingsInput = document.getElementById('bookings');
    const progressCircle = document.querySelector('.progress-bar');
    const bookingPercentage = document.querySelector('.booking-percentage');
    const discountElement = document.querySelector('.discount');
    const flightStatus = document.querySelector('.flight-status span');
    const priceInfo = document.querySelector('.price-info span');
    
    const circumference = 2 * Math.PI * 54; // r=54 from SVG
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    function updateProgress(percentage) {
        const offset = circumference - (percentage / 100 * circumference);
        progressCircle.style.strokeDashoffset = offset;
        bookingPercentage.textContent = `${percentage}%`;
        
        // Calculate discount
        let discount = 0;
        if (percentage >= 100) discount = 40;
        else if (percentage >= 85) discount = 30;
        else if (percentage >= 75) discount = 20;
        else if (percentage >= 65) discount = 10;
        
        discountElement.textContent = `-${discount}%`;
        priceInfo.textContent = `${100 - discount}%`;
        
        // Update flight status
        if (percentage >= 50) {
            flightStatus.textContent = 'Рейс состоится';
            flightStatus.style.color = '#27ae60';
        } else {
            flightStatus.textContent = 'Ожидает бронирований';
            flightStatus.style.color = '#e74c3c';
        }
        
        // Update circle color based on percentage
        if (percentage >= 85) {
            progressCircle.style.stroke = '#27ae60';
        } else if (percentage >= 50) {
            progressCircle.style.stroke = '#f1c40f';
        } else {
            progressCircle.style.stroke = '#e74c3c';
        }
    }
    
    bookingsInput.addEventListener('input', function() {
        const percentage = Math.min(Math.max(this.value, 0), 100);
        updateProgress(percentage);
    });
    
    // Initial update
    updateProgress(45);
});

// Promotions Slider
const promotions = [
    {
        image: 'images/promo1.png',
        title: 'Позднее бронирование',
        description: 'Забронируйте билеты за 1 час до регистрации и получите дополнительную скидку.',
    },
    {
        image: 'images/promo2.png',
        title: 'Групповые перелеты',
        description: 'Специальные условия для групп от 5 человек',
    },
    {
        image: 'images/promo3.png',
        title: 'Летний сезон',
        description: 'Пониженные скидки на популярные направления',
    },
    {
        image: 'images/promo4.png',
        title: 'Программа лояльности',
        description: 'Накапливайте мили и мы может быть не будем швырать ваш багаж.',
    }
];

let currentSlide = 0;

function createPromotionCard(promotion) {
    return `
        <div class="promotion-card">
            <img src="${promotion.image}" alt="${promotion.title}">
            <h3>${promotion.title}</h3>
            <p>${promotion.description}</p>
            <button class="details-button">Подробнее</button>
        </div>
    `;
}

function updateSlider() {
    const slider = document.querySelector('.promotion-cards');
    slider.style.transform = `translateX(-${currentSlide * 33.333}%)`;
}

document.querySelector('.next-slide').addEventListener('click', () => {
    if (currentSlide < promotions.length - 3) {
        currentSlide++;
        updateSlider();
    }
});

document.querySelector('.prev-slide').addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlider();
    }
});

// Initialize promotions
const promotionsContainer = document.querySelector('.promotion-cards');
promotionsContainer.innerHTML = promotions.map(createPromotionCard).join('');

// Handle the search form submission
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-form');
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Gather form data
        const searchData = {
            departure: document.getElementById('departure').value,
            arrival: document.getElementById('arrival').value,
            departDate: document.getElementById('depart-date').value,
            returnDate: document.getElementById('return-date').value,
            passengers: document.getElementById('passengers').value
        };
        
        // Validate form data
        if (!validateForm(searchData)) {
            return;
        }
        
        // Store the search data in localStorage
        localStorage.setItem('flightSearchData', JSON.stringify(searchData));
        
        // Redirect to results page
        window.location.href = 'result/results.html';
    });
    
    // Form validation function
    function validateForm(data) {
        if (!data.departure) {
            alert('Пожалуйста, укажите город отправления');
            return false;
        }
        if (!data.arrival) {
            alert('Пожалуйста, укажите город прибытия');
            return false;
        }
        if (!data.departDate) {
            alert('Пожалуйста, укажите дату вылета');
            return false;
        }
        if (data.passengers < 1 || data.passengers > 8) {
            alert('Количество пассажиров должно быть от 1 до 8');
            return false;
        }
        
        // Validate that departure date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const departDate = new Date(data.departDate);
        
        if (departDate < today) {
            alert('Дата вылета не может быть в прошлом');
            return false;
        }
        
        // If return date is specified, validate it's after departure date
        if (data.returnDate) {
            const returnDate = new Date(data.returnDate);
            if (returnDate < departDate) {
                alert('Дата возвращения должна быть после даты вылета');
                return false;
            }
        }
        
        return true;
    }
});

// Newsletter Form
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    if (!email) {
        alert('Пожалуйста, введите email');
        return;
    }
    
    // Here you would typically send the email to a server
    alert('Спасибо за подписку!');
    this.reset();
});

// Animations on Scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.trust-card, .promotion-card');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('animate-in');
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
animateOnScroll(); // Initial check