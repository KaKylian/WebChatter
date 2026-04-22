/* ==========================================================================
    SOMMAIRE WEBFLASH
    1. INIT DOM & OBSERVERS
    2. CONFIG & VALIDATION
    3. LECTURE
    4. ARRÊT
    5. MISE À L'ÉCHELLE
    6. UTILITAIRES
========================================================================== */


/* ==========================================================================
    1. INIT DOM & OBSERVERS
========================================================================== */

const flash        = document.getElementById('webflash');
const flashVideo   = document.getElementById('flashVideo');
const flashImage   = document.getElementById('flashImg');
const flashTitre   = document.getElementById('flashTitre');
const flashWrapper = document.querySelector('.mediaWrapper');

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!flash._sessionId) return;
        const chars = flash.classList.contains('noMedia') ? 60 : 40;
        flashAjusterTitre(chars); 
    }, 100);
});

const observerTitre = new MutationObserver(() => {
    if (!flash._sessionId) return;
    const chars = flash.classList.contains('noMedia') ? 60 : 40;
    flashAjusterTitre(chars);
    flashTitre.style.visibility = flashTitre.textContent.trim() ? "visible" : "hidden";
});

let mediaChangeTimeout;
let observerIgnore = false;
const observerMedia = new MutationObserver((mutations) => {
    if (!flash._sessionId || observerIgnore) return;

    const changed = new Set(mutations.map(m => m.target));

    clearTimeout(mediaChangeTimeout);
    mediaChangeTimeout = setTimeout(() => {
        changed.forEach(media => {
            if (media === flashVideo) flashConfig.video.src = flashVideo.getAttribute('src') ?? "";
            else flashConfig.imageSrc = flashImage.getAttribute('src') ?? "";
        });
        flashStart(true);
    }, 0);
});

observerTitre.observe(flashTitre, { childList: true, characterData: true, subtree: true });
observerMedia.observe(flashVideo, { attributes: true, attributeFilter: ['src'] });
observerMedia.observe(flashImage, { attributes: true, attributeFilter: ['src'] });


/* ==========================================================================
    2. CONFIG & VALIDATION
========================================================================== */

const flashConfig_default = {
    video: {
        src:     "",
        time:    0,
        volume:  1,
        vitesse: 1,
        isAudio: false
    },
    imageSrc: "",
    texte:    "",
    duree:    "auto"
};
let flashConfig = structuredClone(flashConfig_default);

function flashValide() {
    // Nettoyage & validation des sources
    flashConfig.video.src = encodeURI(String(flashConfig.video.src ?? "").trim());
    flashConfig.imageSrc  = encodeURI(String(flashConfig.imageSrc  ?? "").trim());
    flashConfig.texte     = String(flashConfig.texte ?? "").trim();

    if (!flashConfig.video.src && !flashConfig.imageSrc && !flashConfig.texte) return false;
    

    // Validation & ajustement des paramètres vidéo 
    if (flashConfig.video.src) {
        const cfg = flashConfig.video;
        const ext = cfg.src.split('.').pop().toLowerCase();
        const formatsAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];

        cfg.time    = Math.max(parseFloat(cfg.time), 0) || 0;
        cfg.volume  = Math.min(Math.max(parseFloat(cfg.volume)  || 0, 0), 1);
        cfg.vitesse = Math.min(Math.max(parseFloat(cfg.vitesse) || 0, 0.1), 16);
        cfg.isAudio = formatsAudio.includes(ext) || flashConfig.imageSrc ? true : cfg.isAudio === true;
    }

    // Validation durée 
    if (flashConfig.duree !== 'inf') {
        const dur = parseFloat(flashConfig.duree);
        flashConfig.duree = dur > 0 ? dur : 'auto';
    }

    console.log("Webflash préparé: ", flashConfig);
    return true;
}


/* ==========================================================================
    3. LECTURE DU FLASH
========================================================================== */

function whenImageLoad(image) {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
        image.onload  = resolve;
        image.onerror = reject;
    });
}

function whenVideoMeta(video) {
    if (video.readyState >= 1) return Promise.resolve();
    return new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror          = reject;
    });
}

let flashTimeout;

async function flashStart(isReload = false) {
    if (isReload && !flash._sessionId) throw new Error("Pas de session active à recharger");

    flashStop(isReload ? "010_" : "");
    if (!flashValide()) throw new Error("Aucune src média ou texte");
    const videoChanged = flashSyncDOM();

    if (!isReload) {
        flash._sessionId = Symbol();
        flash._settled   = false;
    }
    const sessionId = flash._sessionId; 
    const estActif  = () => flash._sessionId === sessionId;

    let hasVideo = flashVideo.getAttribute('src');
    let hasImage = flashImage.getAttribute('src');
    let hasTexte = flashTitre.textContent.trim();

    if (!hasImage && (flashConfig.video.isAudio || !hasVideo)) flash.classList.add('noMedia');
    else flash.classList.remove('noMedia');

    if (!hasVideo || flashConfig.video.isAudio) flashVideo.style.visibility = "hidden";
    if (!hasImage) flashImage.style.visibility = "hidden";
    if (!hasTexte) flashTitre.style.visibility = "hidden";
    if (!isReload) {
        flash.style.visibility = "hidden";
        flash.style.display    = "flex";
    }

    if (hasTexte) {
        flashTitre.style.visibility = "visible";
        if (flash.classList.contains('noMedia')) flashAjusterTitre(60);
    }

    // Chargement image + vidéo en parallèle
    const jobs = [];

    if (hasImage) {
        jobs.push(
            whenImageLoad(flashImage)
                .then(() => { 
                    if (estActif()) flashUpscale(flashImage); 
                    flashImage.style.visibility = "visible";
                })
                .catch(() => { 
                    if (hasVideo) {
                        console.warn("Erreur image, audio seul.");
                        flashImage.style.visibility = "hidden";
                        flashImage.removeAttribute('src');
                        hasImage = false;
                        flashAjusterTitre();
                    } else {
                        flashStop("1110"); 
                        throw new Error("Erreur chargement image"); 
                    }
                })
        );
    }

    if (hasVideo) {
        jobs.push(
            whenVideoMeta(flashVideo)
                .then(() => {
                    if (!estActif()) throw new Error("Session annulée");
                    if (!flashConfig.video.isAudio) {
                        flashUpscale(flashVideo);
                        flashVideo.style.visibility = "visible";
                    }
                    if (videoChanged) flashVideo.currentTime = flashConfig.video.time < flashVideo.duration 
                        ? flashConfig.video.time : 0;
                })
                .catch(() => { 
                    if (hasImage) {
                        console.warn("Erreur vidéo, image seule");
                        flashVideo.removeAttribute('src');
                        flashVideo.load();
                        hasVideo = false;
                    } else {
                        flashStop("1110"); 
                        throw new Error("Erreur chargement vidéo");
                    }
                })
        );
    }

    await Promise.allSettled(jobs);
    if (!estActif()) throw new Error("Session annulée");
    flash.style.visibility = "visible";

    // Lecture vidéo
    if (hasVideo) {
        try { await flashVideo.play(); }
        catch (err) {
            if (err.name === 'NotAllowedError' && !flashConfig.video.isAudio) {
                console.warn("Autoplay bloqué, passage en mute");
                flashVideo.muted = true;
                try { await flashVideo.play(); }
                catch {
                    flashStop("1110"); 
                    throw new Error("Erreur lecture vidéo bloquée");
                }
            } 
            else if (hasImage) console.warn("Erreur lecture vidéo, image seule");
            else {
                flashStop("1110"); 
                throw new Error("Erreur lecture vidéo.");
            }
        }
        if (!estActif()) { flashVideo.pause(); throw new Error("Session annulée."); }
    }

    // Gestion fermeture auto
    if (typeof flashConfig.duree === 'number') {
        flashTimeout = setTimeout(() => flashStop(1), flashConfig.duree * 1000);
    } else if (flashConfig.duree === 'auto') {
        if (hasVideo) flashVideo.onended = () => flashStop(1);
        else flashTimeout = setTimeout(() => flashStop(1), 7000);
    }
}


/* ==========================================================================
    4. ARRÊT
========================================================================== */

let _resolveDone;
let _rejectDone;
function flashDone() {
    if (_resolveDone) window.removeEventListener('flashSucces', _resolveDone);
    if (_rejectDone)  window.removeEventListener('flashEchec',  _rejectDone);

    return new Promise((resolve, reject) => {
        _resolveDone = resolve;
        _rejectDone  = reject;
        window.addEventListener('flashSucces', resolve, { once: true });
        window.addEventListener('flashEchec',  reject,  { once: true });
    });
}

function flashStop(code) {
    let ch = String(code).replace(/\s/g, "_").slice(0, 4);
    while (ch.length < 4) ch += ch.at(-1) ?? "_";

    if (ch[0] != 0) {
        flash._sessionId = null;
        flash.style.display = "none";
    }
    if (ch[1] != 0) {
        clearTimeout(flashTimeout);
        flashVideo.onended          = null;
        flashVideo.onloadedmetadata = null;
        flashVideo.onerror          = null;
        flashImage.onload           = null;
        flashImage.onerror          = null;
    }
    if (ch[2] != 0) {
        flashVideo.removeAttribute('src');
        flashImage.removeAttribute('src');
        flashVideo.load();
    }

    // notif si succès/échec (dans flashDone.then ou .catch)
    if (ch[3] > 0) {
        flash._settled = true;
        window.dispatchEvent(new CustomEvent('flashSucces'));
    } else if (ch[3] == 0 && !flash._settled) {
        flash._settled = true;
        window.dispatchEvent(new CustomEvent('flashEchec'));
    }
}


/* ==========================================================================
    5. MISE À L'ÉCHELLE
========================================================================== */

function flashUpscale(media) {
    if (!media || !flash._sessionId) return;

    const originalW = media.tagName === 'IMG' ? media.naturalWidth  : media.videoWidth;
    const originalH = media.tagName === 'IMG' ? media.naturalHeight : media.videoHeight;
    if (originalW === 0 || originalH === 0) return;

    flashWrapper.style.setProperty('--natW', originalW);
    flashWrapper.style.setProperty('--natH', originalH);

    flashAjusterTitre();
}

function flashAjusterTitre(charsPerLine = 40) {
    if (!flash._sessionId || !flashTitre.textContent.trim()) return;

    const w = flashWrapper.offsetWidth  || window.innerWidth;
    const h = flashWrapper.offsetHeight || window.innerHeight;
    if (w === 0 || h === 0) return;

    const largeurRef = Math.min(Math.max(w, h), window.innerWidth);
    const largeurFinale = largeurRef * 0.95;

    flashTitre.style.setProperty('--finalWidth', `${largeurFinale}px`);
    flashTitre.style.setProperty('--charsLine', charsPerLine);
    flashTitre.style.fontSize = "";

    requestAnimationFrame(() => {
        const hauteurMax = h * 0.8;

        if (flashTitre.offsetHeight > hauteurMax) {
            const tailleActuelle = parseFloat(getComputedStyle(flashTitre).fontSize);
            const ratio = hauteurMax / flashTitre.offsetHeight;
            flashTitre.style.fontSize = `${Math.max(tailleActuelle * ratio, 10)}px`;
        }
    });
}


/* ==========================================================================
    6. UTILITAIRES
========================================================================== */

function flashSyncDOM() {
    observerIgnore = true;
    let videoChange = false;

    if (flashVideo.getAttribute('src') !== flashConfig.video.src) {
        videoChange = true;
        if (flashConfig.video.src) flashVideo.src = flashConfig.video.src;
        else flashVideo.removeAttribute('src');
        flashVideo.load();
    }

    if (flashImage.getAttribute('src') !== flashConfig.imageSrc) {
        if (flashConfig.imageSrc) flashImage.src = flashConfig.imageSrc;
        else flashImage.removeAttribute('src');
    }

    flashTitre.innerHTML = flashConfig.texte || "";

    if (flashVideo.getAttribute('src')) {
        flashVideo.volume       = flashConfig.video.volume;
        flashVideo.playbackRate = flashConfig.video.vitesse;
        flashVideo.muted        = flashConfig.video.volume === 0;
        flashVideo.loop         = flashConfig.duree === 'inf' || typeof flashConfig.duree === 'number';
    }

    setTimeout(() => observerIgnore = false, 0);
    return videoChange;
}

function formatage(str) {
    str = String(str).trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
    
    const sym = {
        '*': 'b',
        '_': 'i',
        '-': 's'
    };
    const spChrs = Object.keys(sym).join("");
    const regex = new RegExp(`(?<=(?:([\\s${spChrs}])|>|^))([${spChrs}])(\\S(.*?\\S)?)\\2(?=(?:\\1|<|$))`, "g"); // un passage encadré par un des spChrs (ex: *mot*, -une phrase-)

    return str.replace(regex, (match, _, signe, contenu) => {
        let tag = sym[signe];
        const imbrique = formatage(contenu);
        return `<${tag}>${imbrique}</${tag}>`;
    });
}

function flashResetConfig() {
    flashConfig = structuredClone(flashConfig_default);
}

function flashResetStyles(styles = [], elements = []) {
    const cibles = elements.length > 0 ? elements : [flash, flashVideo, flashImage, flashTitre, flashWrapper];
    const ciblesValides = cibles.filter(el => el instanceof HTMLElement);

    ciblesValides.forEach(el => {
        if (styles.length > 0) {
            styles.forEach(prop => el.style.removeProperty(prop));
        } else {
            el.removeAttribute('style');
        }
    });
}

function flashResetAll() {
    flashStop();
    flashResetConfig();
    flashSyncDOM();
    flashResetStyles();
}