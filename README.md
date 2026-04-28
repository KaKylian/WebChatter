# [pre-alpha] WebChatter
Inspiré par "LiveChat" de la Cacabox, WebChatter reprend tout le concept dans un widget permettant à un dev de créer et de programmer l'affichage d'un Livechat Cacabox sur son site web, tout ça via une nouvelle balise html `<web-chatter>`.

> [!NOTE]
> évidemment ya rien d'officiel ici: webchatter est pour moi juste un moyen d'apprendre à coder en javascript.

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
    // résultat: livechat vidéo affiché en plein écran avec son titre incrusté sur la vidéo
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
|`duree`|nbre > 0 / `"inf"`\* / `"auto"`\*\*|la durée du livechat (secondes)|`"auto"`|

> \*`"inf"`: le livechat ne s'arrête pas: si ya une vidéo elle boucle à l'infini  
> \*\*`"auto"`: ferme le livechat à la fin de la lecture vidéo ou au bout de 7s

> [!TIP]
> Pour forcer l'arrêt d'un livechat en cours on peut utiliser `chatter.stop()`

## Todo
- [ ] texte barré/souligné moche (`text-decoration` incompatible avec `text-stroke`)
- [ ] support livechat vidéo + audio (ajouter une balise `<audio>` séparée)
- [ ] options de formatage de texte (position ? police ? taille ?)
- [ ] documenter toutes les méthodes de `web-chatter`
