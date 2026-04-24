# Webflasher
Webflasher (ou webflasher.js) permet d'afficher un média accompagné d'un titre en plein écran sur une page web. C'est sous la forme d'un flash qui s'affiche d'un coup puis disparaît tout de suite une fois terminé.

### Comment ça marche
Le script insère une structure html `<div id="webflash">` stylisée. Il contient aussi une bibliothèque d'objets et fonctions pour contrôler l'affichage de la structure.

## Propriétés
* **Contenu:** un flash ne peut pas être vide, il a au moins un texte et/ou un média
* **Unique:** on ne peut pas avoir plusieurs flashs à la fois
* **Invisible:** tout est caché jusqu'à ce qu'on lance un flash, une fois terminé c'est caché à nouveau
* **Médias:** on peut mettre une image ou une vidéo
>Si on met une image et une vidéo dans un flash, la vidéo devient l'audio de l'image: on ne peut pas afficher plusieurs médias en même temps.

## Installation
1. Télécharger le dépôt github
2. Copier `webflasher.js` dans le dossier parent d'une page web
3. Le charger sur une page:
   ```html
   <script src="webflasher.js" defer></script>
   ```
   >`defer` est important ici, sans lui on risque de faire crash tout le script.

### Prérequis
* Un éditeur de code (VSCode, Sublime Text, …)
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
- [ ] Fix: isoler la struct html en remplaçant `<div id="webflash>` par un custom element `<webflash>` (isolation totale => plus de conflits css possible)
- [ ] Issue: texte barré/souligné moche (`text-decoration` incompatible avec `text-stroke`)
- [ ] Ajout: fonctionnalité flash audio + vidéo (ajouter une balise `<audio>` séparée)
