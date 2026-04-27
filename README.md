# Mediaflasher 
mediaflasher.js ajoute un custom element `<media-flasher>` qui a ses propres propriétés et méthodes pour configurer et lire un flash.
Le flash peut contenir un média (image, vidéo ou image + audio d'une vidéo) avec un titre en incrusté sur le média

## Utilisation
Exemple simple:
1. html `<body>`:
```html
<media-flasher></media-flasher>
```
2. js:
```js
const mf = document.querySelector('media-flasher');

mf.config.video.src = "video.mp4";
mf.video.volume = 0.5;
mf.config.texte = "boo";
mf.start(); // le flash se ferme tt seul à la fin de la lecture vidéo
```

## Todo
- [ ] Issue: texte barré/souligné moche (`text-decoration` incompatible avec `text-stroke`)
- [ ] Ajout: fonctionnalité flash audio + vidéo (ajouter une balise `<audio>` séparée)
- [ ] Ajout: options de styles intégrés
- [ ] Ajout: documentation des méthodes `media-flasher`
