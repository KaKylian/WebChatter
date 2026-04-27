class Mediaflasher extends HTMLElement {
    /* ========== CHAMPS PRIVEES ========== */
    #flash        = null;
    #flashVideo   = null;
    #flashImage   = null;
    #flashTitre   = null;
    #flashWrapper = null;

    #resizeTimeout = null;
    #onResize = () => {
        clearTimeout(this.#resizeTimeout);
        this.#resizeTimeout = setTimeout(() => {
            if (!this.#sessionId) return;
            const chars = this.#flash.classList.contains('noMedia') ? 60 : 40;
            this.#flashAjusterTitre(chars);
        }, 100);
    };

    #observerTitre = new MutationObserver(() => {
        if (!this.#sessionId) return;
        const chars = this.#flash.classList.contains('noMedia') ? 60 : 40;
        this.#flashAjusterTitre(chars);
        this.#flashTitre.style.visibility = this.#flashTitre.textContent.trim() ? "visible" : "hidden";
    });

    #mediaChangeTimeout = null;
    #observerIgnore = false;
    #observerMedia = new MutationObserver((mutations) => {
        if (!this.#sessionId || this.#observerIgnore) return;
        const changed = new Set(mutations.map(m => m.target));
        clearTimeout(this.#mediaChangeTimeout);
        this.#mediaChangeTimeout = setTimeout(() => {
            changed.forEach(media => {
                if (media === this.#flashVideo) this.config.video.src = this.#flashVideo.getAttribute('src') ?? "";
                else this.config.imageSrc = this.#flashImage.getAttribute('src') ?? "";
            });
            this.#flashStart(true);
        }, 0);
    });

    #configDefault = {
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

    #sessionId = null;
    #settled   = false;
    #flashTimeout = null;
    #resolveDone  = null;
    #rejectDone   = null;

    /* ========== CHAMPS PUBLICS ========== */
    config = structuredClone(this.#configDefault);

    /* ========== CYCLE DE VIE ========== */
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {

        const style = document.createElement('style');
        style.textContent = `
            :host { all: initial !important; }

            #flash {
                overflow: hidden;
                width: 100vw;
                height: 100vh;
                border: none;
                padding: 0;
                margin: 0;
                justify-content: center;
                align-items: center;
                background-color: rgba(0, 0, 0, 0.6);
            }
            #flash:popover-open { display: flex; }

            #flash.noMedia {
                background-color: transparent;
            }

            .mediaWrapper {
                --w: var(--natW, 1);
                --h: var(--natH, 1);
                --scale: min(100vw / var(--w), 100vh / var(--h));

                width: calc(var(--w) * var(--scale));
                height: calc(var(--h) * var(--scale));

                position: relative;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                pointer-events: none;
                user-select: none;
                -webkit-user-select: none;
            }

            #flash.noMedia .mediaWrapper {
                width: 100%;
                height: 100%;
            }

            img, video {
                display: block;
                visibility: hidden;
                width: 100%;
                height: 100%;
                filter: drop-shadow(0 0 20px black);
                position: absolute;
                z-index: 1;
            }

            img {
                z-index: 2;
            }

            h1 {
                --finalWidth: 95vw;
                --charsLine: 40;
                --fontSize: calc(var(--finalWidth) / (var(--charsLine) * 0.58));
                --strokeSize: calc(var(--fontSize) / 10);

                width: var(--finalWidth);
                font-size: var(--fontSize);
                -webkit-text-stroke: var(--strokeSize) black;

                display: block;
                visibility: hidden;
                position: absolute;
                bottom: 10%;
                left: 50%;
                transform: translateX(-50%);
                word-wrap: break-word;
                overflow-wrap: break-word;
                white-space: normal;
                text-align: center;
                margin: 0;
                color: #f0f0f0;
                font-family: system-ui, sans-serif;
                font-weight: 700;
                paint-order: stroke fill;
                text-shadow: 0 0 10px black;
                line-height: 1.2;
                letter-spacing: 3px;
                z-index: 10;
            }

            #flash.noMedia h1 {
                bottom: 10px;
            }
        `;

        const struct = document.createElement('div');
        struct.setAttribute('popover', 'manual');
        struct.id = 'flash';
        struct.innerHTML = `
            <div class="mediaWrapper">
                <video id="flashVideo"></video>
                <img id="flashImg" alt="">
                <h1 id="flashTitre"></h1>
            </div>
        `;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(struct);

        this.#flash        = this.shadowRoot.getElementById('flash');
        this.#flashVideo   = this.shadowRoot.getElementById('flashVideo');
        this.#flashImage   = this.shadowRoot.getElementById('flashImg');
        this.#flashTitre   = this.shadowRoot.getElementById('flashTitre');
        this.#flashWrapper = this.shadowRoot.querySelector('.mediaWrapper');

        window.addEventListener('resize', this.#onResize);
        this.#observerTitre.observe(this.#flashTitre, { childList: true, characterData: true, subtree: true });
        this.#observerMedia.observe(this.#flashVideo, { attributes: true, attributeFilter: ['src'] });
        this.#observerMedia.observe(this.#flashImage, { attributes: true, attributeFilter: ['src'] });
    }

    // cleanup
    disconnectedCallback() {
        window.removeEventListener('resize', this.#onResize);
        this.#observerTitre.disconnect();
        this.#observerMedia.disconnect();
        if (this.#resolveDone) this.removeEventListener('flashSucces', this.#resolveDone);
        if (this.#rejectDone)  this.removeEventListener('flashEchec',  this.#rejectDone);
    }

    /* ========== METHODES PRIVEES ========== */
    #flashValide() {
        this.config.video.src = encodeURI(String(this.config.video.src ?? "").trim());
        this.config.imageSrc  = encodeURI(String(this.config.imageSrc  ?? "").trim());
        this.config.texte     = String(this.config.texte ?? "").trim();

        if (!this.config.video.src && !this.config.imageSrc && !this.config.texte) return false;

        if (this.config.video.src) {
            const cfg = this.config.video;
            const ext = cfg.src.split('.').pop().toLowerCase();
            const formatsAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];

            cfg.time    = Math.max(parseFloat(cfg.time), 0) || 0;
            cfg.volume  = Math.min(Math.max(parseFloat(cfg.volume)  || 0, 0), 1);
            cfg.vitesse = Math.min(Math.max(parseFloat(cfg.vitesse) || 0, 0.1), 16);
            cfg.isAudio = formatsAudio.includes(ext) || this.config.imageSrc ? true : cfg.isAudio === true;
        }
        else this.config.video = { ...this.#configDefault.video }

        if (this.config.duree !== 'inf') {
            const dur = parseFloat(this.config.duree);
            this.config.duree = dur > 0 ? dur : 'auto';
        }

        console.log("flash préparé: ", this.config);
        return true;
    }

    #flashSyncDOM() {
        this.#observerIgnore = true;
        let videoChange = false;

        if (this.#flashVideo.getAttribute('src') !== this.config.video.src) {
            videoChange = true;
            if (this.config.video.src) this.#flashVideo.src = this.config.video.src;
            else this.#flashVideo.removeAttribute('src');
            this.#flashVideo.load();
        }

        if (this.#flashImage.getAttribute('src') !== this.config.imageSrc) {
            if (this.config.imageSrc) this.#flashImage.src = this.config.imageSrc;
            else this.#flashImage.removeAttribute('src');
        }

        this.#flashTitre.innerHTML = this.config.texte || "";

        if (this.#flashVideo.getAttribute('src')) {
            this.#flashVideo.volume       = this.config.video.volume;
            this.#flashVideo.playbackRate = this.config.video.vitesse;
            this.#flashVideo.muted        = this.config.video.volume === 0;
            this.#flashVideo.loop         = this.config.duree === 'inf' || typeof this.config.duree === 'number';
        }

        setTimeout(() => this.#observerIgnore = false, 0);
        return videoChange;
    }

    #whenImageLoad(image) {
        if (image.complete && image.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve, reject) => {
            image.onload  = resolve;
            image.onerror = reject;
        });
    }

    #whenVideoMeta(video) {
        if (video.readyState >= 1) return Promise.resolve();
        return new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;
            video.onerror          = reject;
        });
    }

    async #flashStart(isReload = false) {
        if (isReload && !this.#sessionId) throw new Error("Pas de session active à recharger");

        this.#flashStop(isReload ? "010_" : "");
        if (!this.#flashValide()) throw new Error("Aucune src média ou texte");
        const videoChanged = this.#flashSyncDOM();

        if (!isReload) {
            this.#sessionId = Symbol();
            this.#settled   = false;
        }
        const sessionId = this.#sessionId; 
        const estActif  = () => this.#sessionId === sessionId;

        let hasVideo = this.#flashVideo.getAttribute('src');
        let hasImage = this.#flashImage.getAttribute('src');
        let hasTexte = this.#flashTitre.textContent.trim();

        if (!hasImage && (this.config.video.isAudio || !hasVideo)) this.#flash.classList.add('noMedia');
        else this.#flash.classList.remove('noMedia');

        if (!hasVideo || this.config.video.isAudio) this.#flashVideo.style.visibility = "hidden";
        if (!hasImage) this.#flashImage.style.visibility = "hidden";
        if (!hasTexte) this.#flashTitre.style.visibility = "hidden";
        if (!isReload) {
            this.#flash.style.visibility = "hidden";
            this.#flash.showPopover();
        }

        if (hasTexte) {
            this.#flashTitre.style.visibility = "visible";
            if (this.#flash.classList.contains('noMedia')) this.#flashAjusterTitre(60);
        }

        // Chargement image + vidéo en parallèle
        const jobs = [];

        if (hasImage) {
            jobs.push(
                this.#whenImageLoad(this.#flashImage)
                    .then(() => { 
                        if (estActif()) this.#flashScale(this.#flashImage); 
                        this.#flashImage.style.visibility = "visible";
                    })
                    .catch(() => { 
                        if (hasVideo) {
                            console.warn("Erreur image, audio seul");
                            this.#flashImage.style.visibility = "hidden";
                            this.#flashImage.removeAttribute('src');
                            hasImage = false;
                            this.#flashAjusterTitre();
                        } else {
                            this.#flashStop("1110"); 
                            throw new Error("Erreur chargement image"); 
                        }
                    })
            );
        }

        if (hasVideo) {
            jobs.push(
                this.#whenVideoMeta(this.#flashVideo)
                    .then(() => {
                        if (!estActif()) throw new Error("Session annulée");
                        if (!this.config.video.isAudio) {
                            this.#flashScale(this.#flashVideo);
                            this.#flashVideo.style.visibility = "visible";
                        }
                        if (videoChanged) this.#flashVideo.currentTime = this.config.video.time < this.#flashVideo.duration 
                            ? this.config.video.time : 0;
                    })
                    .catch(() => { 
                        if (hasImage) {
                            console.warn("Erreur vidéo, image seule");
                            this.#flashVideo.removeAttribute('src');
                            this.#flashVideo.load();
                            hasVideo = false;
                        } else {
                            this.#flashStop("1110"); 
                            throw new Error("Erreur chargement vidéo");
                        }
                    })
            );
        }

        await Promise.allSettled(jobs);
        if (!estActif()) throw new Error("Session annulée");
        this.#flash.style.visibility = "visible";

        // Lecture vidéo
        if (hasVideo) {
            try { await this.#flashVideo.play(); }
            catch (err) {
                if (err.name === 'NotAllowedError' && !this.config.video.isAudio) {
                    console.warn("Autoplay bloqué, passage en mute");
                    this.#flashVideo.muted = true;
                    try { await this.#flashVideo.play(); }
                    catch {
                        this.#flashStop("1110"); 
                        throw new Error("Erreur lecture vidéo bloquée");
                    }
                } 
                else if (hasImage) console.warn("Erreur lecture vidéo, image seule");
                else {
                    this.#flashStop("1110"); 
                    throw new Error("Erreur lecture vidéo");
                }
            }
            if (!estActif()) { this.#flashVideo.pause(); throw new Error("Session annulée"); }
        }

        // Gestion fermeture auto
        if (typeof this.config.duree === 'number') {
            this.#flashTimeout = setTimeout(() => this.#flashStop(1), this.config.duree * 1000);
        } else if (this.config.duree === 'auto') {
            if (hasVideo) this.#flashVideo.onended = () => this.#flashStop(1);
            else this.#flashTimeout = setTimeout(() => this.#flashStop(1), 7000);
        }
    }

    #flashStop(code) {
        let ch = String(code).replace(/\D/g, "_").slice(0, 4);
        while (ch.length < 4) ch += ch.at(-1) ?? "_";

        if (ch[0] != 0) {
            this.#sessionId = null;
            this.#flash.hidePopover();
        }
        if (ch[1] != 0) {
            clearTimeout(this.#flashTimeout);
            this.#flashVideo.onended          = null;
            this.#flashVideo.onloadedmetadata = null;
            this.#flashVideo.onerror          = null;
            this.#flashImage.onload           = null;
            this.#flashImage.onerror          = null;
        }
        if (ch[2] != 0) {
            this.#flashVideo.removeAttribute('src');
            this.#flashImage.removeAttribute('src');
            this.#flashVideo.load();
        }

        // notif si succès/échec (dans flashDone.then ou .catch)
        if (ch[3] > 0) {
            this.#settled = true;
            window.dispatchEvent(new CustomEvent('flashSucces'));
        } else if (ch[3] == 0 && !this.#settled) {
            this.#settled = true;
            window.dispatchEvent(new CustomEvent('flashEchec'));
        }
    }

    #flashScale(media) {
        if (!media || !this.#sessionId) return;

        const originalW = media.tagName === 'IMG' ? media.naturalWidth  : media.videoWidth;
        const originalH = media.tagName === 'IMG' ? media.naturalHeight : media.videoHeight;
        if (originalW === 0 || originalH === 0) return;

        this.#flashWrapper.style.setProperty('--natW', originalW);
        this.#flashWrapper.style.setProperty('--natH', originalH);

        this.#flashAjusterTitre();
    }

    #flashAjusterTitre(charsPerLine = 40) {
        if (!this.#sessionId || !this.#flashTitre.textContent) return;

        const w = this.#flashWrapper.offsetWidth  || window.innerWidth;
        const h = this.#flashWrapper.offsetHeight || window.innerHeight;
        if (w === 0 || h === 0) return;

        const largeurRef = Math.min(Math.max(w, h), window.innerWidth);
        const largeurFinale = largeurRef * 0.95;

        this.#flashTitre.style.setProperty('--finalWidth', `${largeurFinale}px`);
        this.#flashTitre.style.setProperty('--charsLine', charsPerLine);
        this.#flashTitre.style.fontSize = "";

        requestAnimationFrame(() => {
            const hauteurMax = h * 0.8;

            if (this.#flashTitre.offsetHeight > hauteurMax) {
                const tailleActuelle = parseFloat(getComputedStyle(this.#flashTitre).fontSize);
                const ratio = hauteurMax / this.#flashTitre.offsetHeight;
                this.#flashTitre.style.fontSize = `${Math.max(tailleActuelle * ratio, 10)}px`;
            }
        });
    }

    /* ========== API PUBLIQUE ========== */
    start() { return this.#flashStart(); }
    reload() { return this.#flashStart(true); }

    stop() { this.#flashStop(1); }
    whenFlashDone() {
        if (this.#resolveDone) this.removeEventListener('flashSucces', this.#resolveDone);
        if (this.#rejectDone)  this.removeEventListener('flashEchec',  this.#rejectDone);

        return new Promise((resolve, reject) => {
            this.#resolveDone = resolve;
            this.#rejectDone  = reject;
            this.addEventListener('flashSucces', resolve, { once: true });
            this.addEventListener('flashEchec',  reject,  { once: true });
        });
    }

    formater(str) {
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
        const regex = new RegExp(`(?<=(?:([\\s${spChrs}])|>|^))([${spChrs}])(\\S(.*?\\S)?)\\2(?=(?:\\1|<|$))`, "g");

        return str.replace(regex, (match, _, signe, contenu) => {
            let tag = sym[signe];
            const imbrique = this.formater(contenu);
            return `<${tag}>${imbrique}</${tag}>`;
        });
    }

    setStyle(cible, styles) {
        const cibles = {
            'flash': this.#flash,
            'titre': this.#flashTitre,
            'image': this.#flashImage,
            'video': this.#flashVideo
        };
        const el = cibles[cible];
        if (!el) throw new Error(`cible "${cible}" inconnue`);
        Object.assign(el.style, styles);
    }

    resetStyles() {
        [this.#flash, this.#flashTitre, this.#flashImage, this.#flashVideo, this.#flashWrapper].forEach(el => el.removeAttribute('style'));
    }

    resetConfig() {
        this.config = structuredClone(this.#configDefault);
    }

    resetAll() {
        this.#flashStop();
        this.resetConfig();
        this.#flashSyncDOM();
        this.resetStyles();
    }

}

customElements.define('media-flasher', Mediaflasher);