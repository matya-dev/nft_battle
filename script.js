class NFTCases {
    constructor() {
        this.userData = this.loadUserData();
        this.isOpening = false;
        this.nftCollection = [];
        this.currentCase = null;
        this.animationId = null;
        this.currentSpeed = 0;
        this.currentPosition = 0;
        this.init();
    }

    // Загрузка данных пользователя
    loadUserData() {
        const userCookie = this.getCookie('nft_cases_user');
        if (userCookie) {
            try {
                return JSON.parse(userCookie);
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }
        
        return {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            username: 'Игрок' + Math.floor(Math.random() * 1000),
            balance: 25,
            registrationDate: new Date().toISOString(),
            stats: {
                totalOpened: 0,
                totalNFTWon: 0,
                mostExpensiveNFT: 0
            },
            inventory: []
        };
    }

    // Сохранение данных
    saveUserData() {
        this.setCookie('nft_cases_user', JSON.stringify(this.userData), 365);
    }

    // Работа с куки
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
    }

    getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) return decodeURIComponent(value);
        }
        return null;
    }

    // Загрузка NFT коллекции для кейсов
    async loadNFTCollection() {
        console.log('🚀 Загрузка NFT коллекции для кейсов...');
        
        const basePath = 'NFT/';
        
        // Коллекция предметов с обновленными шансами выпадения
        this.nftCollection = [
            // 15 звезд (60% шанс)
            { id: 1, name: 'Медведь', image: `${basePath}bear/bear.gif`, value: 15, rarity: 'common', weight: 80, fallback: '🧸' },
            { id: 2, name: 'Сердце', image: `${basePath}heart/heart.gif`, value: 15, rarity: 'common', weight: 80, fallback: '❤️' },

            // 25 звезд (20% шанс)
            { id: 3, name: 'Роза', image: `${basePath}rose/rose.gif`, value: 25, rarity: 'uncommon', weight: 10, fallback: '🌹' },
            { id: 4, name: 'Подарок', image: `${basePath}gift/gift.gif`, value: 25, rarity: 'uncommon', weight: 10, fallback: '🎁' },

            // 50 звезд (15% шанс)
            { id: 5, name: 'Торт', image: `${basePath}cake/cake.gif`, value: 50, rarity: 'rare', weight: 7, fallback: '🎂' },
            { id: 6, name: 'Ракета', image: `${basePath}rocket/rocket.gif`, value: 50, rarity: 'rare', weight: 7, fallback: '🚀' },
            { id: 7, name: 'Цветы', image: `${basePath}flowers/flowers.gif`, value: 50, rarity: 'rare', weight: 7, fallback: '💐' },

            // 100 звезд (5% шанс)
            { id: 8, name: 'Кубок', image: `${basePath}cup/cup.gif`, value: 100, rarity: 'epic', weight: 3, fallback: '🏆' },
            { id: 9, name: 'Кольцо', image: `${basePath}ring/ring.gif`, value: 100, rarity: 'epic', weight: 3, fallback: '💍' },
            { id: 10, name: 'Алмаз', image: `${basePath}diamond/diamond.gif`, value: 100, rarity: 'epic', weight: 3, fallback: '💎' },
        ];

        console.log('✅ NFT коллекция загружена с обновленными шансами');
        return Promise.resolve();
    }

    // Инициализация
    async init() {
        console.log('🎮 Инициализация NFT Cases');
        
        await this.loadNFTCollection();
        this.showLoadingScreen();
    }

    // Экран загрузки
    showLoadingScreen() {
        console.log('📱 Показываем экран загрузки');
        const startTime = Date.now();
        const loadingTime = 1500;
        
        const updateTime = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            document.getElementById('loading-time').textContent = elapsed.toFixed(2) + 's';
            
            if (elapsed * 1000 < loadingTime) {
                requestAnimationFrame(updateTime);
            } else {
                this.completeLoading();
            }
        };
        
        updateTime();
    }

    // Завершение загрузки
    completeLoading() {
        console.log('✅ Загрузка завершена!');
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        this.setupEventListeners();
        this.updateUI();
    }

    // Настройка обработчиков
    setupEventListeners() {
        console.log('⚙️ Настройка обработчиков событий');
        
        document.getElementById('cases-btn').addEventListener('click', () => {
            this.showSection('cases-section');
        });
        
        document.getElementById('inventory-btn').addEventListener('click', () => {
            this.showSection('inventory-section');
            this.updateInventory();
        });
        
        document.getElementById('profile-btn').addEventListener('click', () => {
            this.showSection('profile-section');
            this.updateProfile();
        });

        // Выбор кейса
        document.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const caseType = e.currentTarget.dataset.case;
                this.selectCase(caseType);
            });
        });

        // Открытие кейса
        document.getElementById('open-case-btn').addEventListener('click', () => {
            this.openCase();
        });

        // Назад к выбору кейсов
        document.getElementById('back-to-cases').addEventListener('click', () => {
            this.showCaseSelection();
        });

        // Назад в главное меню из кейсов
        document.getElementById('back-cases-main').addEventListener('click', () => {
            this.showSection('main-menu');
        });

        // Кнопки назад
        document.getElementById('back-btn-inventory').addEventListener('click', () => {
            this.showSection('main-menu');
        });
        
        document.getElementById('back-btn-profile').addEventListener('click', () => {
            this.showSection('main-menu');
        });

        // Сохранение имени
        document.getElementById('save-username').addEventListener('click', () => {
            this.saveUsername();
        });

        // Админ-панель
        document.getElementById('add-stars-btn').addEventListener('click', () => {
            this.addStars();
        });

        document.getElementById('reset-progress').addEventListener('click', () => {
            this.resetProgress();
        });
    }

    // Показать раздел
    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    // Выбор кейса
    selectCase(caseType) {
        this.currentCase = caseType;
        document.querySelector('.cases-selection').style.display = 'none';
        document.getElementById('case-opening').style.display = 'block';
        this.setupRoulette();
    }

    // Показать выбор кейса
    showCaseSelection() {
        document.querySelector('.cases-selection').style.display = 'block';
        document.getElementById('case-opening').style.display = 'none';
        this.currentCase = null;
        this.stopRoulette();
    }

    // Настройка прокрута для кейса
    setupRoulette() {
        console.log('🎰 Настройка прокрута для кейса');
        const strip = document.getElementById('roulette-strip');
        strip.innerHTML = '';
        
        const totalItems = 100;
        for (let i = 0; i < totalItems; i++) {
            const nft = this.nftCollection[Math.floor(Math.random() * this.nftCollection.length)];
            const item = document.createElement('div');
            item.className = 'roulette-item';
            item.dataset.nftId = nft.id;
            
            item.innerHTML = `
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <div class="nft-name">${nft.name}</div>
            `;
            
            strip.appendChild(item);
        }
        
        this.currentPosition = 0;
        strip.style.transform = `translateX(${this.currentPosition}px)`;
        this.currentSpeed = 0;
        console.log('✅ Прокрут готов');
    }

    // Открытие кейса (прокрут)
    openCase() {
        if (this.isOpening) return;
        
        if (this.userData.balance < 25) {
            this.showNotification('Ошибка', 'Недостаточно звезд!', 'error');
            return;
        }

        this.userData.balance -= 25;
        this.userData.stats.totalOpened++;
        this.isOpening = true;
        
        const openBtn = document.getElementById('open-case-btn');
        openBtn.disabled = true;
        
        this.currentSpeed = 50;
        this.animateRoulette();
        
        setTimeout(() => {
            this.stopSpin();
        }, 3000 + Math.random() * 3000);
    }

    // Анимация прокрута
    animateRoulette() {
        const strip = document.getElementById('roulette-strip');
        
        this.currentPosition -= this.currentSpeed;
        strip.style.transform = `translateX(${this.currentPosition}px)`;
        
        if (Math.abs(this.currentPosition) > 12000) {
            this.currentPosition = 0;
        }
        
        if (this.isOpening) {
            this.animationId = requestAnimationFrame(() => this.animateRoulette());
        }
    }

    // Остановка прокрута
    stopSpin() {
        this.isOpening = false;
        
        const slowDown = () => {
            if (this.currentSpeed > 0) {
                this.currentSpeed -= 1.5;
                if (this.currentSpeed < 0) this.currentSpeed = 0;
                
                this.animateRoulette();
                
                if (this.currentSpeed > 0) {
                    setTimeout(slowDown, 50);
                } else {
                    this.determineWinner();
                    const openBtn = document.getElementById('open-case-btn');
                    openBtn.disabled = false;
                }
            }
        };
        
        slowDown();
    }

    // Остановка прокрута (при выходе)
    stopRoulette() {
        this.isOpening = false;
        this.currentSpeed = 0;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    // Определение победителя
    determineWinner() {
        const strip = document.getElementById('roulette-strip');
        const items = strip.getElementsByClassName('roulette-item');
        const centerX = window.innerWidth / 2;
        
        let closestItem = null;
        let minDistance = Infinity;
        
        for (let item of items) {
            const itemRect = item.getBoundingClientRect();
            const itemCenterX = itemRect.left + itemRect.width / 2;
            const distance = Math.abs(itemCenterX - centerX);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestItem = item;
            }
        }
        
        if (!closestItem) return;
        
        const nftId = parseInt(closestItem.dataset.nftId);
        const wonNFTData = this.nftCollection.find(nft => nft.id === nftId);
        
        if (!wonNFTData) return;
        
        // Простая анимация выигрыша
        this.simpleWinAnimation(closestItem, wonNFTData);
        
        const wonNFT = {
            id: Date.now(),
            name: wonNFTData.name,
            image: wonNFTData.image,
            value: wonNFTData.value,
            rarity: wonNFTData.rarity,
            fallback: wonNFTData.fallback,
            dateWon: new Date().toISOString()
        };
        
        this.userData.inventory.push(wonNFT);
        this.userData.stats.totalNFTWon++;
        
        if (wonNFT.value > this.userData.stats.mostExpensiveNFT) {
            this.userData.stats.mostExpensiveNFT = wonNFT.value;
        }
        
        this.saveUserData();
        this.updateUI();
        this.showWinNotification(wonNFT);
    }

    // Простая анимация выигрыша
    simpleWinAnimation(item, nft) {
        item.classList.add('winning');
        
        this.createSimpleParticles(item);
        this.showWinText(item, nft);
        
        setTimeout(() => {
            item.classList.remove('winning');
        }, 1500);
    }

    // Создаем простые частицы
    createSimpleParticles(item) {
        const itemRect = item.getBoundingClientRect();
        const centerX = itemRect.left + itemRect.width / 2;
        const centerY = itemRect.top + itemRect.height / 2;
        
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'win-particle';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.setProperty('--x', x + 'px');
            particle.style.setProperty('--y', y + 'px');
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }
    }

    // Показываем текст выигрыша
    showWinText(item, nft) {
        const itemRect = item.getBoundingClientRect();
        const winText = document.createElement('div');
        winText.className = 'win-text';
        winText.textContent = `+${nft.value}⭐ ${nft.name}`;
        winText.style.left = itemRect.left + itemRect.width / 2 + 'px';
        winText.style.top = itemRect.top + 'px';
        
        document.body.appendChild(winText);
        
        setTimeout(() => {
            if (winText.parentNode) {
                winText.parentNode.removeChild(winText);
            }
        }, 1500);
    }

    // Уведомление о выигрыше
    showWinNotification(nft) {
        let type = 'win';
        let title = '🎉 Поздравляем!';
        let description = `Вы выиграли ${nft.name.toUpperCase()}!`;
        
        if (nft.value >= 100) {
            type = 'epic';
            title = '💎 ЭПИЧЕСКИЙ ВЫИГРЫШ!';
            description = `${nft.name.toUpperCase()} - ${nft.value} ⭐`;
        } else if (nft.value >= 50) {
            type = 'win';
            title = '⭐ ОТЛИЧНЫЙ ВЫИГРЫШ!';
            description = `${nft.name.toUpperCase()} - ${nft.value} ⭐`;
        } else {
            description = `${nft.name.toUpperCase()} - ${nft.value} ⭐`;
        }
        
        this.showNotification(title, description, type, nft.image, nft.fallback);
    }

    // Система уведомлений
    showNotification(title, description, type = 'win', image = null, fallback = null) {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        notification.className = `notification ${type} show`;
        
        let iconContent = '';
        if (image) {
            iconContent = `<img src="${image}" alt="${title}" class="notification-icon">`;
        } else if (fallback) {
            iconContent = `<div class="notification-icon">${fallback}</div>`;
        } else {
            iconContent = `<div class="notification-icon">🎁</div>`;
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                ${iconContent}
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-desc">${description}</div>
                </div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        notifications.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                this.removeNotification(notification);
            }
        }, 4000);
    }

    removeNotification(notification) {
        notification.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }

    // Обновление инвентаря
    updateInventory() {
        const grid = document.getElementById('inventory-grid');
        const totalNFT = document.getElementById('total-nft');
        
        grid.innerHTML = '';
        totalNFT.textContent = this.userData.inventory.length;
        
        const sortedInventory = [...this.userData.inventory].sort((a, b) => b.value - a.value);
        
        sortedInventory.forEach((nft, index) => {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot has-nft';
            
            slot.innerHTML = `
                <div class="nft-image">${nft.fallback}</div>
                <div class="nft-name">${nft.name}</div>
                <div class="nft-value">${nft.value} ⭐</div>
                <button class="sell-btn" data-index="${this.userData.inventory.indexOf(nft)}">Продать</button>
            `;
            
            grid.appendChild(slot);
        });
        
        document.querySelectorAll('.sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.sellNFT(index);
            });
        });
        
        const emptySlots = Math.max(6, 12 - this.userData.inventory.length);
        for (let i = 0; i < emptySlots; i++) {
            const empty = document.createElement('div');
            empty.className = 'inventory-slot empty';
            empty.innerHTML = '⚫<br><small>Пусто</small>';
            grid.appendChild(empty);
        }
    }

    // Продажа NFT
    sellNFT(index) {
        const nft = this.userData.inventory[index];
        if (confirm(`Продать ${nft.name} за ${nft.value} ⭐?`)) {
            this.userData.balance += nft.value;
            this.userData.inventory.splice(index, 1);
            
            if (this.userData.inventory.length === 0) {
                this.userData.stats.mostExpensiveNFT = 0;
            } else if (nft.value === this.userData.stats.mostExpensiveNFT) {
                this.userData.stats.mostExpensiveNFT = Math.max(...this.userData.inventory.map(n => n.value));
            }
            
            this.saveUserData();
            this.updateUI();
            this.updateInventory();
            this.showNotification('💰 Продажа', `${nft.name} продан за ${nft.value} ⭐!`, 'win');
        }
    }

    // Сохранение имени
    saveUsername() {
        const newUsername = document.getElementById('profile-username').value.trim();
        if (newUsername && newUsername.length >= 3) {
            this.userData.username = newUsername;
            this.saveUserData();
            this.updateUI();
            this.showNotification('✅ Успех', 'Имя пользователя сохранено!', 'win');
        } else {
            this.showNotification('❌ Ошибка', 'Имя должно содержать минимум 3 символа', 'error');
        }
    }

    // Админ-панель: Добавить звезды
    addStars() {
        const starsInput = document.getElementById('add-stars');
        const stars = parseInt(starsInput.value);
        
        if (stars > 0 && stars <= 10000) {
            this.userData.balance += stars;
            this.saveUserData();
            this.updateUI();
            this.showNotification('⭐ Админ', `Добавлено ${stars} звезд!`, 'win');
        } else {
            this.showNotification('❌ Ошибка', 'Введите корректное количество звезд (1-10000)', 'error');
        }
    }

    // Админ-панель: Сбросить прогресс
    resetProgress() {
        if (confirm('Вы уверены что хотите сбросить весь прогресс?')) {
            this.userData = {
                id: this.userData.id,
                username: this.userData.username,
                balance: 25,
                registrationDate: this.userData.registrationDate,
                stats: {
                    totalOpened: 0,
                    totalNFTWon: 0,
                    mostExpensiveNFT: 0
                },
                inventory: []
            };
            
            this.saveUserData();
            this.updateUI();
            this.updateInventory();
            this.showNotification('🔄 Сброс', 'Прогресс сброшен!', 'win');
        }
    }

    // Обновление профиля
    updateProfile() {
        document.getElementById('profile-username').value = this.userData.username;
        document.getElementById('profile-balance').textContent = this.userData.balance + ' ⭐';
        document.getElementById('registration-date').textContent = 
            new Date(this.userData.registrationDate).toLocaleDateString('ru-RU');
        document.getElementById('total-opened').textContent = this.userData.stats.totalOpened;
        document.getElementById('total-nft-won').textContent = this.userData.stats.totalNFTWon;
        document.getElementById('most-expensive').textContent = this.userData.stats.mostExpensiveNFT + ' ⭐';
    }

    // Обновление интерфейса
    updateUI() {
        document.getElementById('balance').textContent = this.userData.balance;
        document.getElementById('username').textContent = this.userData.username;
        this.updateProfile();
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== NFT CASES ЗАПУЩЕН ===');
    new NFTCases();
});