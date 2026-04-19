/* ==========================================================================
FLASH CONTROL - Panneau de régie
========================================================================== */

// Initialisation des zones de drag & drop au chargement
document.addEventListener("DOMContentLoaded", function() {
    // Gestion des zones de Drag & Drop
    setupDropZone('dropImage', 'image', 'fileImg');
    setupDropZone('dropVideo', 'video', 'fileVid');
});

function setupDropZone(zoneId, configKey, inputId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);

    // 1. Gestion du Drag & Drop
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0], zone, configKey);
    });

    // 2. Gestion du clic (via l'input caché)
    input.addEventListener('change', (e) => {
        handleFile(e.target.files[0], zone, configKey);
    });
}

let pendingImageURL = "";
let pendingVideoURL = "";

function handleFile(file, zone, configKey) {
    if (file) {
        // Crée l'URL locale et l'assigne à la config
        if (configKey === 'image') pendingImageURL = URL.createObjectURL(file);
        else                       pendingVideoURL = URL.createObjectURL(file);
        zone.innerText = "✓ " + file.name;
        zone.style.borderColor = "#2ecc71";
        zone.style.color = "#2ecc71";
        zone.style.background = "#0d1f14";
    }
}

function lancerFlashDepuisControl() {
    // Mise à jour de la config globale avant le start
    flashConfig.texte = document.getElementById('ctrlTexte').value;
    flashConfig.imageSrc = pendingImageURL;
    flashConfig.video.src = pendingVideoURL;

    const dureeVal = document.getElementById('ctrlDuree').value.trim().toLowerCase();
    flashConfig.duree = (dureeVal === 'auto' || dureeVal === 'inf') ? dureeVal : (parseFloat(dureeVal) || 'auto');

    flashConfig.video.time    = parseFloat(document.getElementById('ctrlTime').value) || 0;
    flashConfig.video.vitesse = parseFloat(document.getElementById('ctrlVitesse').value) || 1;
    flashConfig.video.volume  = parseFloat(document.getElementById('ctrlVolume').value);
    flashConfig.video.isAudio = document.getElementById('ctrlAudioSeul').checked;

    if (!flashConfig.video.src && !flashConfig.imageSrc && !flashConfig.texte) {
        if (!confirm("Simuler une erreur de config (aucune source media) ?")) return;
    }   
    flashStart()
        .then(() => console.log("chargement srcs flash fini, affichage..."))
        .catch((e) => console.warn(e));
    flashDone()
        .then(() => console.log("flash terminé après lecture complète"))
        .catch((e) => console.warn("flash fermé à cause d'une erreur", e));
}

// Fonction pour supprimer un média spécifique
function clearMedia(type) {
    if (type === 'image') {
        pendingImageURL = "";
        const zone = document.getElementById('dropImage');
        zone.innerText = "🖼️ Image : Glisser ou cliquer";
        zone.style.borderColor = "";
        zone.style.color = "";
        zone.style.background = ""; 
        document.getElementById('fileImg').value = "";
    } else {
        pendingVideoURL = "";
        const zone = document.getElementById('dropVideo');
        zone.innerText = "🎬 Vidéo : Glisser ou cliquer";
        zone.style.borderColor = "";
        zone.style.color = "";
        zone.style.background = "";
        document.getElementById('fileVid').value = "";
    }
}

function resetUI() {
    flashStop();
    flashResetConfig();
    flashSyncDOM();

    document.getElementById('ctrlTexte').value = "";
    document.getElementById('ctrlTime').value = 0;
    document.getElementById('ctrlDuree').value = "auto";
    document.getElementById('ctrlVitesse').value = "1";
    document.getElementById('valVitesse').innerText = "1.0";
    document.getElementById('ctrlVolume').value = "1";
    document.getElementById('valVolume').innerText = "1.0";
    document.getElementById('ctrlAudioSeul').checked = false;

    clearMedia('image');
    clearMedia('video');
}

/* ==========================================================================
PLAYGROUND — Exécution JS embarquée (détournement XSS contrôlé)
========================================================================== */

const _consoleLog   = console.log;
const _consoleWarn  = console.warn;
const _consoleError = console.error;

async function runPlayground() {
    const input  = document.getElementById('playgroundInput');
    const output = document.getElementById('playgroundOutput');
    const code   = input.value.trim();
    if (!code) return;

    const timestamp = new Date().toLocaleTimeString();
    output.innerHTML = `<div style="color:#2e3347; margin-bottom:6px; border-bottom:1px solid #1a1d27; padding-bottom:4px;">▶ Exécuté à ${timestamp}</div>`;

    function serialize(val, indent = 0) {
        const pad      = '  '.repeat(indent);
        const padInner = '  '.repeat(indent + 1);

        if (val === undefined)          return 'undefined';
        if (val === null)               return 'null';
        if (typeof val === 'string')    return `"${val}"`;
        if (typeof val === 'number')    return String(val);
        if (typeof val === 'boolean')   return String(val);
        if (typeof val === 'function')  return val.toString();
        if (val instanceof RegExp)      return val.toString();
        if (val instanceof Error)       return `${val.name}: ${val.message}`;
        if (val instanceof Element)     return val.outerHTML;

        if (Array.isArray(val)) {
            if (val.length === 0) return '[]';
            const items = val.map(v => `${padInner}${serialize(v, indent + 1)}`).join(',\n');
            return `[\n${items}\n${pad}]`;
        }

        if (typeof val === 'object') {
            const keys = Object.keys(val);
            if (keys.length === 0) return '{}';
            const items = keys.map(k => `${padInner}${k}: ${serialize(val[k], indent + 1)}`).join(',\n');
            return `{\n${items}\n${pad}}`;
        }

        return String(val);
    }

    function appendRaw(color, text) {
        const line = document.createElement('div');
        line.style.cssText = `color:${color}; margin:2px 0; white-space:pre-wrap;`;
        line.textContent = text;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function appendLog(color, ...args) {
        appendRaw(color, args.map(serialize).join(' '));
    }

    console.log   = (...args) => { appendLog('#a8d8a8', ...args); _consoleLog(...args);   };
    console.warn  = (...args) => { appendLog('#f0c040', ...args); _consoleWarn(...args);  };
    console.error = (...args) => { appendLog('#f07070', ...args); _consoleError(...args); };

    try {
        const fn = new Function(
            'return (async () => { "use strict";\n' + code + '\n})()'
        );
        const returnVal = await fn();

        appendRaw(
            returnVal === undefined ? '#4a5568' : '#7ab8f5',
            '↩ ' + serialize(returnVal)
        );
    } catch (err) {
        const msg = err instanceof Error 
            ? `${err.name}: ${err.message}` 
            : serialize(err);
        appendRaw('#f07070', msg);
    }
}

function clearPlayground() {
    document.getElementById('playgroundOutput').innerHTML = '<span style="color:#2e3347;">// Output…</span>';
    document.getElementById('playgroundInput').value = '';
}