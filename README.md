# Mediaflasher 
mediaflasher.js ajoute un custom element `<media-flasher>` qui a ses propres propriétés et méthodes pour configurer et lire un flash.
Le flash peut contenir un média (image, vidéo ou image + audio d'une vidéo) avec un titre en incrusté sur le média

## Utilisation
Exemple simple:
1. `<body>` html:
```html
<media-flasher></media-flasher>
```
2. js:
```js
const mf = document.querySelector('media-flasher');

mf.config.video.src = "video.mp4"; // src vidéo
mf.config.video.volume = 0.5; // volume vidéo
mf.config.texte = "boo"; // texte incrusté
mf.start(); // le flash se ferme tt seul à la fin de la lecture vidéo
```
tableau des configs flash:
|nom|type de val acceptés|rôle|val par défaut|
|---|---|---|---|
|texte|texte / html|définit le texte|`""`|
|imagesrc|url|définit la src image|`""`|
|video.src|url|définit la src vidéo|`""`|
|video.time|nbre > 0|timestamp vidéo de départ (s)|`0`|
|video.volume|nbre [0; 1]|volume de la lecture|`1`|
|video.vitesse|nbre [0.1; 16]|vitesse de lecture|`1`|
|video.isAudio|booléen|définit l'affichage de la vidéo|`false`|
|duree|nbre > 0 / `"inf"`\* / `"auto"`\*\*|durée totale du flash (s)|`"auto"`|

\*`"inf"` = désactive la fermeture auto, \*\*`"auto"` = durée de la vidéo ou 7s

> [!TIP]
> on peut forcer l'arrêt d'un flash en cours à n'importe quel moment avec la méthode `stop()`

## Todo
- [ ] Issue: texte barré/souligné moche (`text-decoration` incompatible avec `text-stroke`)
- [ ] Ajout: fonctionnalité flash audio + vidéo (ajouter une balise `<audio>` séparée)
- [ ] Ajout: options de styles intégrés
- [ ] Ajout: documentation des méthodes `media-flasher`
