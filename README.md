# Webflasher
Webflasher (ou webflasher.js) permet d'afficher un média accompagné d'un titre en plein écran sur une page web.

### Comment ça marche
Le script insère la structure html stylisé `webflash` à une page web. Il contient aussi une bibliothèque de fonctions pour controller l'affichage de `webflash`.

## Propriétés
* **Contenu:** un flash ne peut pas être vide, il a au moins un texte et/ou un média
* **Unique:** on ne peut pas avoir plusieurs flashs à la fois
* **Invisible:** tout est caché jusqu'à ce qu'on lance un flash, une fois terminé c'est caché à nouveau
* **Médias:** on peut mettre une image et/ou une vidéo/audio
>Si on met une image et une vidéo dans un flash, la vidéo devient l'audio de l'image: on ne peut pas afficher plusieurs médias en même temps.

## Installation
- Télécharger le dépôt
- Décompresser le dossier téléchargé
- L'ajouter dans dans le dossier parent de la page web
- Lier Webflasher avec la page
  ```html
  <script src="Webflasher/webflasher.js" defer></script>
  ```
  >`defer` est important ici, sans lui on risque de faire crash tout le script.

### Prérequis
* Une page web html ou php

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
// audio seul => pas de flash visuel
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
>On peut forcer l'arrêt d'un flash en cours à n'importe quel moment avec `flashStop()` (pratique si `flashConfig.duree = "inf"`).

### Pour résumer
C'est du js pur, il faut juste savoir manipuler les propriétés de `flashConfig` et 2 fonctions:
* **`flashConfig`** -> configurer le contenu du flash
* **`flashStart()`** -> lancer un flash 
* **`flashStop()`** -> forcer l'arrêt d'un flash 
>⚠️ Si `webflash` a des problèmes d'affichage vérifie les styles de la page: c'est sûrement qu'ils entrent en conflit avec ceux de `webflash`.

## Todo
- [ ] Options de formatage texte (marche qu'à moitié)
- [ ] Nouvelle balise `<audio>` séparé (`isAudio` devient obsolète)
