// música de fundo
const bgMusic    = document.getElementById('bg-music');
const musicBtn   = document.getElementById('music-toggle');
const soundWaves = musicBtn?.querySelector('.sound-waves');
const muteLines  = musicBtn?.querySelectorAll('.mute-line');
let musicPlaying = false;
let autoplayPending = false;

if (bgMusic && musicBtn) {
    bgMusic.volume = 0.35;

    function setMusicState(playing) {
        musicPlaying = playing;
        if (playing) {
            musicBtn.classList.remove('mudo');
            soundWaves.style.display = '';
            muteLines.forEach(l => l.style.display = 'none');
        } else {
            musicBtn.classList.add('mudo');
            soundWaves.style.display = 'none';
            muteLines.forEach(l => l.style.display = '');
        }
    }

    // garante o loop mesmo que o atributo HTML falhe
    bgMusic.addEventListener('ended', () => {
        bgMusic.currentTime = 0;
        bgMusic.play();
    });

    function tryPlay() {
        return bgMusic.play().then(() => {
            autoplayPending = false;
            setMusicState(true);
        });
    }

    tryPlay().catch(() => {
        // browser bloqueou autoplay — espera a primeira interação do usuário
        autoplayPending = true;
        setMusicState(false);

        const onFirstInteraction = () => {
            if (!autoplayPending) return;
            tryPlay().catch(() => {});
            document.removeEventListener('click',      onFirstInteraction);
            document.removeEventListener('keydown',    onFirstInteraction);
            document.removeEventListener('scroll',     onFirstInteraction, true);
            document.removeEventListener('touchstart', onFirstInteraction);
        };

        document.addEventListener('click',      onFirstInteraction);
        document.addEventListener('keydown',    onFirstInteraction);
        document.addEventListener('scroll',     onFirstInteraction, { passive: true, capture: true });
        document.addEventListener('touchstart', onFirstInteraction, { passive: true });
    });

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // evita disparar onFirstInteraction junto
        if (musicPlaying) {
            bgMusic.pause();
            autoplayPending = false;
            setMusicState(false);
        } else {
            bgMusic.play().then(() => {
                autoplayPending = false;
                setMusicState(true);
            }).catch(() => {});
        }
    });
}


// cursor teia de aranha
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
});

const hoverElements = document.querySelectorAll('a, button, .btn, .btn-enviar, .nav-link, .title-glitch, .projeto-card');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

document.addEventListener('mousedown', () => cursor.classList.add('click'));
document.addEventListener('mouseup',   () => cursor.classList.remove('click'));

document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
document.addEventListener('mouseenter', () => cursor.style.opacity = '1');


// link ativo no nav conforme o scroll
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
        const top    = section.offsetTop;
        const height = section.offsetHeight;
        const id     = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);


// scroll suave nos links internos
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offset = 84; // altura fixa da navbar
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        }
    });
});


// glitch aleatório nos títulos a cada 5–8 segundos
function randomGlitch() {
    document.querySelectorAll('.title-glitch').forEach(titulo => {
        const base = titulo.querySelector('.title-img-base');
        if (!base) return;
        const red  = titulo.querySelector('.title-img-red');
        const blue = titulo.querySelector('.title-img-blue');

        base.style.animation = 'glitch-shake 0.3s';
        if (!titulo.matches(':hover')) {
            if (red)  red.style.opacity  = '0.7';
            if (blue) blue.style.opacity = '0.7';
        }

        setTimeout(() => {
            base.style.animation = '';
            if (red)  red.style.opacity  = '';
            if (blue) blue.style.opacity = '';
        }, 300);
    });

    setTimeout(randomGlitch, 5000 + Math.random() * 3000);
}

setTimeout(randomGlitch, 4000);


// barras de habilidade animam ao entrar na viewport
function animateBars() {
    document.querySelectorAll('.skill-fill').forEach(fill => {
        const pct = fill.getAttribute('data-pct');
        if (pct) fill.style.width = pct + '%';
    });
}

const habSection = document.getElementById('habilidades-lista');
if (habSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateBars();
                observer.disconnect();
            }
        });
    }, { threshold: 0.2 });
    observer.observe(habSection);
}


// slider de projetos
const projetosGrid = document.querySelector('.projetos-grid');
const prevArrow    = document.querySelector('.slider-arrow--prev');
const nextArrow    = document.querySelector('.slider-arrow--next');

if (projetosGrid && prevArrow && nextArrow) {
    const cardStep = () => {
        const card = projetosGrid.querySelector('.projeto-card');
        return card ? card.offsetWidth + 28 : 348;
    };

    const atualizarSetas = () => {
        const scrolled = projetosGrid.scrollLeft;
        const maxScroll = projetosGrid.scrollWidth - projetosGrid.clientWidth;
        prevArrow.classList.toggle('visivel', scrolled > 4);
        nextArrow.classList.toggle('visivel', scrolled < maxScroll - 4);
    };

    prevArrow.addEventListener('click', () => {
        projetosGrid.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });

    nextArrow.addEventListener('click', () => {
        projetosGrid.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });

    projetosGrid.addEventListener('scroll', atualizarSetas);
    atualizarSetas();
}


// overlay dos projetos sem repositório
document.querySelectorAll('.btn-overlay-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const overlay = trigger.closest('.projeto-card').querySelector('.projeto-confidencial');
        overlay.classList.toggle('ativo');
    });
});

document.querySelectorAll('.btn-overlay-contato').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.projeto-confidencial').classList.remove('ativo');
    });
});


// formulário de contato
const formContato = document.querySelector('.form-card');

if (formContato) {
    formContato.addEventListener('submit', (e) => {
        e.preventDefault();

        formContato.closest('.card-paper').innerHTML = `
            <div class="form-sucesso">
                <svg class="sucesso-icone" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="32" cy="32" r="30" stroke="#DD006F" stroke-width="3"/>
                    <path d="M18 33l10 10 18-20" stroke="#DD006F" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p class="sucesso-titulo">Mensagem enviada!</p>
                <p class="sucesso-texto">Obrigada pelo contato. Aguarde o meu retorno em breve&nbsp;✨</p>
            </div>
        `;
    });
}
