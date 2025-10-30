class FoxGame {
    constructor() {
        this.tg = null;
        this.userData = null;
        this.isOpening = false;
        this.nftCollection = [];
        this.currentCase = null;
        this.animationId = null;
        this.currentSpeed = 0;
        this.currentPosition = 0;
        this.adminIds = ['7927169998', '1241573286'];
        this.allUsersData = this.loadAllUsersData();
        this.currentManagedUser = null;
        this.init();
    }

    // Инициализация Telegram Web App
    async init() {
        console.log('🎮 Инициализация FoxGame');
        
        try {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            
            await this.initTelegramUser();
            await this.loadNFTCollection();
            this.showLoadingScreen();
            
        } catch (error) {
            console.error('Ошибка инициализации Telegram:', error);
            await this.initTestUser();
            await this.loadNFTCollection();
            this.showLoadingScreen();
        }
    }

    // Инициализация пользователя из Telegram
    async initTelegramUser() {
        const initDataUnsafe = this.tg.initDataUnsafe || {};
        const user = initDataUnsafe.user || {};
        
        console.log('Telegram User:', user);
        
        if (user && user.id) {
            const userId = user.id.toString();
            this.userData = this.loadUserData(userId, user);
            
            // Сохраняем в общую базу
            this.allUsersData[userId] = this.userData;
            this.saveAllUsersData();
            
        } else {
            throw new Error('Пользователь Telegram не найден');
        }
    }

    // Резервная инициализация для тестирования
    async initTestUser() {
        const testUserId = 'test_user_' + Math.random().toString(36).substr(2, 9);
        const testUser = {
            id: testUserId,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser'
        };
        
        this.userData = this.loadUserData(testUserId, testUser);
        this.allUsersData[testUserId] = this.userData;
        this.saveAllUsersData();
        
        console.log('⚠️ Тестовый режим. Запуск вне Telegram');
    }

    // Загрузка данных пользователя
    loadUserData(userId, telegramUser) {
        // Проверяем, есть ли пользователь в общей базе
        if (this.allUsersData[userId]) {
            console.log('✅ Пользователь найден в базе:', this.allUsersData[userId]);
            return this.allUsersData[userId];
        }
        
        // Создаем нового пользователя
        console.log('🆕 Создаем нового пользователя:', userId);
        return {
            id: userId,
            username: telegramUser.username || 
                     [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || 
                     'Игрок' + Math.floor(Math.random() * 1000),
            firstName: telegramUser.first_name || '',
            lastName: telegramUser.last_name || '',
            telegramUsername: telegramUser.username || '',
            balance: 25,
            registrationDate: new Date().toISOString(),
            stats: {
                totalOpened: 0,
                totalNFTWon: 0,
                mostExpensiveNFT: 0
            },
            inventory: [],
            isBanned: false,
            isTelegramUser: !!telegramUser.id
        };
    }

    // Загрузка данных всех пользователей из localStorage
    loadAllUsersData() {
        try {
            const data = localStorage.getItem('foxgame_all_users');
            if (data) {
                const parsed = JSON.parse(data);
                console.log('📊 Загружена база пользователей:', Object.keys(parsed).length, 'пользователей');
                return parsed;
            }
        } catch (e) {
            console.error('Ошибка загрузки базы пользователей:', e);
        }
        
        console.log('🆕 Создана новая база пользователей');
        return {};
    }

    // Сохранение данных пользователя
    saveUserData() {
        if (this.userData && this.userData.id) {
            this.allUsersData[this.userData.id] = this.userData;
            this.saveAllUsersData();
        }
    }

    // Сохранение данных всех пользователей в localStorage
    saveAllUsersData() {
        try {
            localStorage.setItem('foxgame_all_users', JSON.stringify(this.allUsersData));
            console.log('💾 База пользователей сохранена:', Object.keys(this.allUsersData).length, 'пользователей');
        } catch (e) {
            console.error('Ошибка сохранения базы пользователей:', e);
        }
    }

    // Проверка прав администратора
    isAdmin() {
        return this.userData && this.adminIds.includes(this.userData.id);
    }

    // Загрузка NFT коллекции для кейсов
    async loadNFTCollection() {
        console.log('🚀 Загрузка NFT коллекции для кейсов...');
        
        const basePath = 'NFT/';
        
        this.nftCollection = [
            { id: 1, name: 'Медведь', image: `${basePath}bear/bear.gif`, value: 15, rarity: 'common', weight: 80, fallback: '🧸' },
            { id: 2, name: 'Сердце', image: `${basePath}heart/heart.gif`, value: 15, rarity: 'common', weight: 80, fallback: '❤️' },
            { id: 3, name: 'Роза', image: `${basePath}rose/rose.gif`, value: 25, rarity: 'uncommon', weight: 10, fallback: '🌹' },
            { id: 4, name: 'Подарок', image: `${basePath}gift/gift.gif`, value: 25, rarity: 'uncommon', weight: 10, fallback: '🎁' },
            { id: 5, name: 'Торт', image: `${basePath}cake/cake.gif`, value: 50, rarity: 'rare', weight: 7, fallback: '🎂' },
            { id: 6, name: 'Ракета', image: `${basePath}rocket/rocket.gif`, value: 50, rarity: 'rare', weight: 7, fallback: '🚀' },
            { id: 7, name: 'Цветы', image: `${basePath}flowers/flowers.gif`, value: 50, rarity: 'rare', weight: 7, fallback: '💐' },
            { id: 8, name: 'Кубок', image: `${basePath}cup/cup.gif`, value: 100, rarity: 'epic', weight: 3, fallback: '🏆' },
            { id: 9, name: 'Кольцо', image: `${basePath}ring/ring.gif`, value: 100, rarity: 'epic', weight: 3, fallback: '💍' },
            { id: 10, name: 'Алмаз', image: `${basePath}diamond/diamond.gif`, value: 100, rarity: 'epic', weight: 3, fallback: '💎' },
        ];

        console.log('✅ NFT коллекция загружена');
        return Promise.resolve();
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
        
        // Показываем кнопку админ-панели если пользователь админ
        if (this.isAdmin()) {
            document.getElementById('admin-btn').style.display = 'block';
            this.showNotification('👑 Админ', 'Доступ к админ-панели разрешен', 'win');
            console.log('🔓 Админ-панель активирована для пользователя:', this.userData.id);
        }
    }

    // Настройка обработчиков
    setupEventListeners() {
        console.log('⚙️ Настройка обработчиков событий');
        
        // Основные кнопки навигации
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

        // Админ-панель
        document.getElementById('admin-btn').addEventListener('click', () => {
            this.showSection('admin-section');
            this.updateAdminPanel();
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

        document.getElementById('back-btn-admin').addEventListener('click', () => {
            this.showSection('main-menu');
        });

        // Админ-панель: поиск пользователя
        document.getElementById('search-user').addEventListener('click', () => {
            this.searchUser();
        });

        // Админ-панель: управление балансом
        document.getElementById('add-balance').addEventListener('click', () => {
            this.modifyUserBalance(true);
        });

        document.getElementById('remove-balance').addEventListener('click', () => {
            this.modifyUserBalance(false);
        });

        // Админ-панель: бан/разбан
        document.getElementById('ban-user').addEventListener('click', () => {
            this.banUser(true);
        });

        document.getElementById('unban-user').addEventListener('click', () => {
            this.banUser(false);
        });

        // Админ-панель: сброс прогресса
        document.getElementById('reset-user').addEventListener('click', () => {
            this.resetUserProgress();
        });

        // Поиск по Enter
        document.getElementById('user-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchUser();
            }
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
                <img src="${nft.image}" alt="${nft.name}" class="nft-image" onerror="this.style.display='none'; this.parentNode.innerHTML += '<div class=\"nft-fallback\">${nft.fallback}</div>'">
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
        
        if (this.userData.isBanned) {
            this.showNotification('Ошибка', 'Ваш аккаунт заблокирован!', 'error');
            return;
        }
        
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
            iconContent = `<img src="${image}" alt="${title}" class="notification-icon" onerror="this.style.display='none'; this.parentNode.innerHTML = '<div class=\"notification-icon\">${fallback || '🎁'}</div>' + this.parentNode.innerHTML;">`;
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

    // Админ-панель: поиск пользователя
    searchUser() {
        const searchTerm = document.getElementById('user-search').value.trim();
        if (!searchTerm) {
            this.showNotification('❌ Ошибка', 'Введите ID или имя пользователя', 'error');
            return;
        }

        let foundUser = null;
        
        // Ищем по ID
        if (this.allUsersData[searchTerm]) {
            foundUser = this.allUsersData[searchTerm];
        } else {
            // Ищем по имени
            for (const userId in this.allUsersData) {
                if (this.allUsersData[userId].username.toLowerCase().includes(searchTerm.toLowerCase())) {
                    foundUser = this.allUsersData[userId];
                    break;
                }
            }
        }

        if (foundUser) {
            this.currentManagedUser = foundUser;
            this.updateUserManagementInfo();
            this.showNotification('✅ Найдено', `Пользователь: ${foundUser.username} (ID: ${foundUser.id})`, 'win');
        } else {
            this.showNotification('❌ Ошибка', 'Пользователь не найден', 'error');
        }
    }

    // Админ-панель: обновление информации о пользователе
    updateUserManagementInfo() {
        if (!this.currentManagedUser) {
            document.getElementById('admin-user-id').textContent = '-';
            document.getElementById('admin-username').textContent = '-';
            document.getElementById('admin-balance').textContent = '-';
            document.getElementById('admin-status').textContent = '-';
            document.getElementById('admin-status').className = 'status-active';
            return;
        }

        document.getElementById('admin-user-id').textContent = this.currentManagedUser.id;
        document.getElementById('admin-username').textContent = this.currentManagedUser.username;
        document.getElementById('admin-balance').textContent = this.currentManagedUser.balance + ' ⭐';
        
        const statusElement = document.getElementById('admin-status');
        if (this.currentManagedUser.isBanned) {
            statusElement.textContent = 'Забанен';
            statusElement.className = 'status-banned';
        } else {
            statusElement.textContent = 'Активен';
            statusElement.className = 'status-active';
        }
    }

    // Админ-панель: изменение баланса
    modifyUserBalance(isAdd) {
        if (!this.currentManagedUser) {
            this.showNotification('❌ Ошибка', 'Сначала выберите пользователя', 'error');
            return;
        }

        const amountInput = document.getElementById('balance-amount');
        const amount = parseInt(amountInput.value);
        
        if (isNaN(amount) || amount <= 0) {
            this.showNotification('❌ Ошибка', 'Введите корректную сумму', 'error');
            return;
        }

        if (isAdd) {
            this.currentManagedUser.balance += amount;
            this.showNotification('✅ Успех', `Баланс пользователя ${this.currentManagedUser.username} увеличен на ${amount} ⭐`, 'win');
        } else {
            if (this.currentManagedUser.balance < amount) {
                this.currentManagedUser.balance = 0;
                this.showNotification('⚠️ Внимание', `Баланс пользователя ${this.currentManagedUser.username} обнулен`, 'warning');
            } else {
                this.currentManagedUser.balance -= amount;
                this.showNotification('✅ Успех', `Баланс пользователя ${this.currentManagedUser.username} уменьшен на ${amount} ⭐`, 'win');
            }
        }

        // Сохраняем изменения
        this.allUsersData[this.currentManagedUser.id] = this.currentManagedUser;
        this.saveAllUsersData();
        
        // Обновляем UI
        this.updateUserManagementInfo();
        this.updateUsersList();

        // Обновляем UI если редактируем текущего пользователя
        if (this.currentManagedUser.id === this.userData.id) {
            this.userData = this.currentManagedUser;
            this.updateUI();
        }
    }

    // Админ-панель: бан/разбан пользователя
    banUser(isBan) {
        if (!this.currentManagedUser) {
            this.showNotification('❌ Ошибка', 'Сначала выберите пользователя', 'error');
            return;
        }

        this.currentManagedUser.isBanned = isBan;
        this.allUsersData[this.currentManagedUser.id] = this.currentManagedUser;
        this.saveAllUsersData();

        if (isBan) {
            this.showNotification('✅ Успех', `Пользователь ${this.currentManagedUser.username} забанен`, 'warning');
        } else {
            this.showNotification('✅ Успех', `Пользователь ${this.currentManagedUser.username} разбанен`, 'win');
        }

        this.updateUserManagementInfo();
        this.updateUsersList();
    }

    // Админ-панель: сброс прогресса
    resetUserProgress() {
        if (!this.currentManagedUser) {
            this.showNotification('❌ Ошибка', 'Сначала выберите пользователя', 'error');
            return;
        }

        if (confirm(`Вы уверены, что хотите сбросить прогресс пользователя ${this.currentManagedUser.username}?`)) {
            this.currentManagedUser.balance = 25;
            this.currentManagedUser.inventory = [];
            this.currentManagedUser.stats = {
                totalOpened: 0,
                totalNFTWon: 0,
                mostExpensiveNFT: 0
            };
            this.currentManagedUser.isBanned = false;

            this.allUsersData[this.currentManagedUser.id] = this.currentManagedUser;
            this.saveAllUsersData();

            this.showNotification('✅ Успех', `Прогресс пользователя ${this.currentManagedUser.username} сброшен`, 'win');
            this.updateUserManagementInfo();
            this.updateUsersList();

            // Обновляем UI если сбрасываем текущего пользователя
            if (this.currentManagedUser.id === this.userData.id) {
                this.userData = this.currentManagedUser;
                this.updateUI();
            }
        }
    }

    // Админ-панель: обновление списка пользователей
    updateUsersList() {
        const usersGrid = document.getElementById('users-grid');
        const totalUsers = document.getElementById('total-users');
        
        usersGrid.innerHTML = '';
        totalUsers.textContent = Object.keys(this.allUsersData).length;

        // Сортируем пользователей по дате регистрации (новые сверху)
        const sortedUsers = Object.values(this.allUsersData).sort((a, b) => 
            new Date(b.registrationDate) - new Date(a.registrationDate)
        );

        sortedUsers.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            if (user.isBanned) {
                userCard.classList.add('banned');
            }
            if (user.id === this.userData.id) {
                userCard.classList.add('current-user');
            }
            
            userCard.innerHTML = `
                <div class="user-card-id">ID: ${user.id}</div>
                <div class="user-card-name">${user.username}</div>
                <div class="user-card-balance">${user.balance} ⭐</div>
                <div class="user-card-stats">
                    <small>Кейсы: ${user.stats.totalOpened}</small>
                    <small>NFT: ${user.stats.totalNFTWon}</small>
                </div>
                <div class="user-card-status ${user.isBanned ? 'status-banned' : 'status-active'}">
                    ${user.isBanned ? '🔴 Забанен' : '🟢 Активен'}
                    ${user.id === this.userData.id ? ' (Вы)' : ''}
                </div>
            `;
            
            userCard.addEventListener('click', () => {
                this.currentManagedUser = user;
                this.updateUserManagementInfo();
            });
            
            usersGrid.appendChild(userCard);
        });

        if (sortedUsers.length === 0) {
            usersGrid.innerHTML = '<div class="no-users">Нет зарегистрированных пользователей</div>';
        }
    }

    // Админ-панель: обновление всей панели
    updateAdminPanel() {
        this.updateUsersList();
        this.currentManagedUser = null;
        document.getElementById('user-search').value = '';
        this.updateUserManagementInfo();
        
        console.log('📊 Админ-панель обновлена. Пользователей в базе:', Object.keys(this.allUsersData).length);
    }

    // Обновление профиля
    updateProfile() {
        document.getElementById('user-id').textContent = this.userData.id;
        document.getElementById('profile-username').textContent = this.userData.username;
        document.getElementById('profile-balance').textContent = this.userData.balance + ' ⭐';
        document.getElementById('registration-date').textContent = new Date(this.userData.registrationDate).toLocaleDateString('ru-RU');
        
        document.getElementById('total-opened').textContent = this.userData.stats.totalOpened;
        document.getElementById('total-nft-won').textContent = this.userData.stats.totalNFTWon;
        document.getElementById('most-expensive').textContent = this.userData.stats.mostExpensiveNFT + ' ⭐';
    }

    // Обновление UI
    updateUI() {
        document.getElementById('balance').textContent = this.userData.balance;
        document.getElementById('username').textContent = this.userData.username;
        
        const levelBadge = document.querySelector('.level-badge');
        if (this.userData.stats.totalOpened >= 50) {
            levelBadge.textContent = 'Эксперт';
            levelBadge.className = 'level-badge expert';
        } else if (this.userData.stats.totalOpened >= 20) {
            levelBadge.textContent = 'Опытный';
            levelBadge.className = 'level-badge experienced';
        } else {
            levelBadge.textContent = 'Новичок';
            levelBadge.className = 'level-badge';
        }
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    window.foxGame = new FoxGame();
});
