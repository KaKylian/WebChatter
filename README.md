# [pre-alpha] WebChatter
Webchatter est un widget qui donne des outils pour pouvoir créer et afficher un média en plein écran sur une page web.

## Utilisation
Une fois la bibliothèque installée, on pourrait faire un truc comme ça:  
* html:
    ```html
    <web-chatter></web-chatter>
    ```
* script module:
    ```js
    import './webchatter.js';
    const chatter = document.querySelector('web-chatter');

    chatter.config.texte = "Titre";
    chatter.config.video = "video.mp4";
    chatter.start();
    // résultat: vidéo affiché en plein écran avec un titre incrusté sur la vidéo
    ```

Toutes les options dans `chatter.config`:
|nom|type de valeur accepté|rôle|valeur par défaut|
|---|---|---|---|
|`texte`|texte / html|le texte|`""`|
|`imageSrc`|url|la src image|`""`|
|`video.src`|url|la src vidéo|`""`|
|`video.time`|nbre >= 0|timestamp de départ (secondes)|`0`|
|`video.volume`|nbre [0; 1]|son volume|`1`|
|`video.vitesse`|nbre [0.1; 16]|sa vitesse de lecture|`1`|
|`video.isAudio`|booléen|cache la vidéo|`false`|
|`duree`|nbre > 0 / `"inf"`\* / `"auto"`\*\*|la durée de l'affichage (secondes)|`"auto"`|

> \*`"inf"`: l'affichage ne s'arrête pas: si ya une vidéo elle boucle à l'infini  
> \*\*`"auto"`: arrête l'affichage à la fin de la lecture vidéo ou au bout de 7s

> [!TIP]
> Pour forcer l'arrêt d'un média en cours on peut utiliser `chatter.stop()`

## Todo
- [ ] texte barré/souligné moche (`text-decoration` incompatible avec `text-stroke`)
- [ ] support vidéo + audio (ajouter une balise `<audio>` séparée)
- [ ] options de formatage de texte (position ? police ? taille ?)
- [ ] documenter toutes les méthodes de `web-chatter`
