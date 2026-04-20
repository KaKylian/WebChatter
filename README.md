# Flash Media
Outil pour flash un média en plein écran sur une page web. On peut configurer:
* un titre
* une image
* une video

> On ne peut pas afficher à la fois l'image et la vidéo en même temps : seul image sera affichée avec le son de la vidéo.

## Installation
- Télécharger le dossier (sur github: bouton vert en haut à droite)
- Ajouter le dossier non compressé dans le dossier contenant la page
- Importer les fichiers dans la page :
  - dans `<head>` :
    ```html
    <link rel="stylesheet" href="flash-media/srcs/style.css">
    <script src="flash-media/srcs/script.js" defer></script>
    ```
  - dans `<body>`, selon si on utilise html ou php :
    - html :
    ```html
    <div id="flashMedia">
        <div class="mediaWrapper">
            <video id="flashVideo"></video>
            <img id="flashImg" src="flash-media/srcs/blank.png" alt="">
            <h1 id="flashTitre"></h1>
        </div>
    </div>
    ```
    - php :
    ```php
    <?php include 'flash-media/srcs/struct.php'; ?>
    ```

### Prérequis
* Une page web en html ou php

## Utilisation
Toute la programmation de flash média se fait en javascript :
```js
flashConfig.imageSrc = "images/image.jpg";
flashConfig.texte = "ici du texte";
flashStart();
// flash une image avec du texte en bas de l'image
```
```js
flashConfig.video.src = "videos/poulet.mp4";
flashConfig.video.isAudio = true;
flashStart();
// joue l'audio d'une vidéo => flash invisible
```
```js
flashConfig.texte = "67";
flashConfig.imageSrc = "images/burger.jpg";
flashConfig.video.src = "videos/cinema.mp4";
flashconfig.video.vitesse = 0.5;
flashConfig.video.time = 16.7; // skip à 16.7s
flashConfig.duree = 30; // durée du flash à 30s 
flashStart();
// flash pendant 30s : texte + image + audio en x0.5 au timestamp 16.7s
```

---

T'as sûrement remarqué que la configuration des src flash se fait dans les propriétés de **`flashConfig.(prop) = ...`** :

| Propriété | Type de valeur | Description | Valeur par défaut |
| --- | --- | --- | --- |
| texte         | string                    | texte affiché                        | ""     |
| imageSrc      | string                    | chemin vers l'image                  | ""     |
| video.src     | string                    | chemin vers la vidéo                 | ""     |
| video.time    | number >= 0               | timestamp vidéo (s)                  | 0      |
| video.vitesse | 0.1 <= number <= 16       | vitesse de lecture vidéo             | 1      |
| video.volume  | 0 <= number <= 1          | volume video                         | 1      |
| video.isAudio | boolean                   | définit si la vidéo est affichée     | false  |
| duree         | number > 0, "inf", "auto" | la durée de l'affichage du flash (s) | "auto" |

`flashConfig.duree` est particulier :
* number : force la durée du flash à cette valeur
* "inf" : le flash ne s'arrête jamais, pour forcer l'arrêt on appelle `flashStop()`
* "auto" : le flash se ferme à la fin de la vidéo, sinon se ferme au bout de 7s par défaut

### Pour résumer il y a 3 instructions clés à retenir
* `flashConfig` pour paramétrer le contenu du flash
* `flashStart()` pour afficher le flash
* `flashStop()` pour arrêter le flash

