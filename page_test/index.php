<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>test flash media</title>
    <link rel="stylesheet" href="../srcs/style.css">
    <link rel="stylesheet" href="style.css">
    <script src="../srcs/script.js" defer></script>
    <script src="script.js" defer></script>
</head>
<body>
    <?php require '../srcs/struct.html';?>
    
    <div id="flashControl">
        <h2>Flash Control - Panneau de Régie</h2>
        
        <div class="ctrl-section">
            <label>Titre du Flash</label>
            <input type="text" id="ctrlTexte" placeholder="Saisissez le texte ici...">
        </div>

        <div class="ctrl-section">
            <label>Sources Médias</label>
            <input type="file" id="fileImg" accept="image/*" style="display:none">
            <input type="file" id="fileVid" accept="video/*" style="display:none">

            <div style="display: flex; gap: 10px; align-items: stretch; margin-bottom: 10px;">
                <div class="drop-zone" id="dropImage" onclick="document.getElementById('fileImg').click()" style="flex: 1; margin-bottom: 0;">
                    🖼️ Image : Glisser ou cliquer
                </div>
                <button onclick="clearMedia('image')" style="background:#eee; border:1px solid #ccc; cursor:pointer; padding:0 15px; border-radius:10px;">✕</button>
            </div>

            <div style="display: flex; gap: 10px; align-items: stretch;">
                <div class="drop-zone" id="dropVideo" onclick="document.getElementById('fileVid').click()" style="flex: 1; margin-bottom: 0;">
                    🎬 Vidéo : Glisser ou cliquer
                </div>
                <button onclick="clearMedia('video')" style="background:#eee; border:1px solid #ccc; cursor:pointer; padding:0 15px; border-radius:10px;">✕</button>
            </div>
        </div>

        <div class="ctrl-section settings-bg">
            <label>Configuration</label>
            <div class="config-vertical">
                <div class="field">
                    <span>⏱️ Démarrer à (sec) :</span>
                    <input type="number" id="ctrlTime" step="0.1" value="0" min="0">
                </div>
                <div class="field">
                    <span>⏳ Durée (auto, inf, ou secondes) :</span>
                    <input type="text" id="ctrlDuree" value="auto">
                </div>
                <div class="field">
                    <span>⏩ Vitesse : <b id="valVitesse">1.0</b>x</span>
                    <input type="range" id="ctrlVitesse" min="0.5" max="4" step="0.1" value="1" 
                        oninput="document.getElementById('valVitesse').innerText = parseFloat(this.value).toFixed(1)">
                </div>
                <div class="field">
                    <span>🔊 Volume : <b id="valVolume">1.0</b></span>
                    <input type="range" id="ctrlVolume" min="0" max="1" step="0.05" value="1" 
                        oninput="document.getElementById('valVolume').innerText = this.value">
                </div>
                <div class="field">
                    <span>🛡️ Mode Audio Seul (masquer le visuel) :</span>
                    <input type="checkbox" id="ctrlAudioSeul" style="margin:0; width: 20px; height: 20px; cursor:pointer;">
                </div>
            </div>
        </div>

        <div class="btn-group-vertical">
            <button onclick="lancerFlashDepuisControl()" class="btn-lancer">Lancer le Flash</button>
            <button onclick="resetUI()" class="btn-stop">Réinitialiser</button>
        </div>
    </div>

    <div class="ctrl-section settings-bg" id="playgroundSection">
        <label>🧪 Playground — Exécution JS directe</label>
        <small style="color:#4a6fa5; display:block; margin-bottom:12px;">
            Accès direct aux fonctions de la page : <code>flashStart()</code>, <code>flashConfig</code>, <code>countdown()</code>…
        </small>

        <textarea id="playgroundInput" placeholder="// Écris ton code JS ici
        flashConfig.texte = 'Hello';
        flashStart();" spellcheck="false"></textarea>

        <div class="playground-btns">
            <button class="btn-run" onclick="runPlayground()">▶ Run</button>
            <button class="btn-clear-playground" onclick="clearPlayground()">🗑 Clear</button>
        </div>

        <div id="playgroundOutput">
            <span style="color:#2e3347;">// Output…</span>
        </div>
    </div>
</body>
</html>