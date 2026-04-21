# Flash Media

Outil pour flash un média en plein écran sur une page web. On peut configurer:
* un titre
* une image
* une video
>⚠️ On ne peut pas afficher l'image et la vidéo en même temps: la vidéo sera considérée comme audio.

## Installation
- Télécharger le dossier (sur github: bouton vert en haut à droite)
- Ajouter le dossier non compressé dans le dossier contenant la page
- Importer les fichiers dans la page:
  - dans `<head>`:
    ```html
    <link rel="stylesheet" href="flash-media/srcs/style.css">
    <script src="flash-media/srcs/script.js" defer></script>
    ```
  - dans `<body>`, selon si on utilise html ou php:
    - html:
    ```html
    <div id="flashMedia">
        <div class="mediaWrapper">
            <video id="flashVideo"></video>
            <img id="flashImg" src="flash-media/srcs/blank.png" alt="">
            <h1 id="flashTitre"></h1>
        </div>
    </div>
    ```
    - php:
    ```php
    <?php include 'flash-media/srcs/struct.php'; ?>
    ```

### Prérequis
* Une page web en html ou php

## Utilisation

Toute la programmation de flash média se fait en javascript:
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
// vidéo en audio => lecture flash invisible
```
```js
flashConfig.texte = "6 7";
flashConfig.imageSrc = "images/burger.jpg";
flashConfig.video.src = "videos/cinema.mp4"; // video.isAudio = true (sous-entendu car ya l'image)
flashconfig.video.vitesse = 0.5; // lecture au ralenti
flashConfig.video.time = 16.7; // début clip vidéo à 16.7s
flashConfig.duree = 30; // durée flash à 30s 
flashStart();
// flash de 30s: texte + image + clip audio en x0.5
```

On remarque que la configuration du contenu du flash se fait dans les propriétés `flashConfig.(prop) = …`:
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

### Pour résumer
Il y a 3 instructions clés à retenir:
* **`flashConfig`** pour définir le contenu du flash
* **`flashStart()`** pour démarrer le flash
* **`flashStop()`** pour forcer l'arrêt du flash en cours

## Todo
- [ ] Nouvelle balise `<audio>`
- [ ] Support formatage texte