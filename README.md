# Webflasher
Webflasher est un widget qui permet d'afficher un média avec un titre en plein écran sur une page web.

## Propriétés
* **Composition:** un flash ne peut pas être vide, il a au moins un texte et/ou un média
* **Unique:** on ne peut pas avoir plusieurs flashs lancés en même temps
* **Invisible:** tout est caché jusqu'à ce qu'on lance un flash, une fois terminé c'est caché à nouveau
* **Médias:** on peut mettre une image et/ou une vidéo/audio
>Si on met une image et une vidéo, la vidéo devient un audio: on ne peut pas afficher plusieurs médias en même temps.

## Installation
Toute la structure webflash est à insérer directement dans la page web:
- Télécharger le dossier (sur github bouton vert en haut à droite)
- Ajouter le dossier décompressé dans le dossier contenant la page
- Lier les fichiers avec la page
    - dans `<head>` on importe le css et le js
        ```html
        <link rel="stylesheet" href="Webflasher/srcs/style.css">
        <script src="Webflasher/srcs/script.js" defer></script>
        ```
    - dans `<body>` selon si on utilise html ou php
        - html: on copie toute la structure
            ```html
            <div id="webflash">
                <div class="mediaWrapper">
                    <video id="flashVideo"></video>
                    <img id="flashImg" src="Webflasher/srcs/blank.png" alt="">
                    <h1 id="flashTitre"></h1>
                </div>
            </div>
            ```
        - php: on l'importe directement
            ```php
            <?php include 'Webflasher/srcs/struct.php'; ?>
            ```

### Prérequis
* Une page web en html ou php

## Utilisation
Toute la programmation du flash se fait en javascript:
```js
flashConfig.imageSrc = "images/image.jpg";
flashConfig.texte = "ici du texte";
flashStart();
// flash image + texte centré en bas de l'image
```
```js
flashConfig.video.src = "videos/poulet.mp4";
flashConfig.video.isAudio = true;
flashStart();
// vidéo en audio => webflash invisible
```
```js
flashConfig.texte = "6 7";
flashConfig.imageSrc = "images/burger.jpg";
flashConfig.video.src = "videos/cinema.mp4"; // video.isAudio = true (sous-entendu car ya l'image)
flashconfig.video.vitesse = 0.5; // lecture au ralenti
flashConfig.video.time = 16.7; // début clip vidéo à 16.7s
flashConfig.duree = 30; // durée flash à 30s 
flashStart();
// flash de 30s avec texte + image + clip audio en x0.5
```

On remarque que la configuration des médias du flash se fait dans les propriétés `flashConfig.(prop) = …`:
| Propriété | Type | Valeur par défaut | Valeurs acceptées | Rôle |
|---|---|---|---|---|
| `texte` | `string` | `""` | Texte / HTML | Contenu du titre affiché |
| `imageSrc` | `string` | `""` | URL / blob URL | Source de l'image |
| `video.src` | `string` | `""` | URL / blob URL | Source de la vidéo ou de l'audio |
| `video.time` | `number` | `0` | `≥ 0` | Timestamp de départ (en secondes) |
| `video.volume` | `number` | `1` | `0` → `1` | Volume de lecture |
| `video.vitesse` | `number` | `1` | `0.1` → `16` | Vitesse de lecture |
| `video.isAudio` | `boolean` | `false` | `true` / `false` | Masque la vidéo, diffuse l'audio seulement |
| `duree` | `string \| number` | `"auto"` | `"auto"` / `"inf"` / `number > 0` | Durée d'affichage — `auto` = fin de vidéo ou 7s, `inf` = boucle infinie, `number` = secondes fixes |
> Quand `flashConfig.duree = "inf"` on peut forcer l'arrêt avec `flashStop()`, sinon le flash s'arrête tout seul après la durée spécifiée.

### Pour résumer
C'est du js pur, il faut juste savoir manipuler les propriétés de `flashConfig` et 2 fonctions:
* **`flashConfig`** -> configurer le contenu du webflash
* **`flashStart()`** -> lancer un webflash 
* **`flashStop()`** -> forcer l'arrêt d'un webflash 

## Todo
- [ ] Simplifier l'installation (injection script ? balise html custom ?)
- [ ] Options de formatage texte (marche à moitié)
- [ ] Nouvelle balise `<audio>` séparé