# Nur: Your Daily Islamic Companion

Prompt : Application mobile islamique "Nur"

Crée une application mobile (PWA responsive mobile-first, installable sur iPhone/Android via navigateur) sur le thème de l'Islam, nommée "Nur" avec le tagline "Votre compagnon islamique au quotidien".

Style visuel général

Arrière-plan général des pages : blanc ou bleu clair (pas orange)

Widgets/cartes : dégradé orange sombre → orange clair, cohérent sur TOUS les widgets (aucune carte avec une teinte différente)

Glassmorphism : cartes translucides arrondies, ombres douces

Dans Settings, deux réglages de couleur séparés et fonctionnels : couleur des widgets (orange, bleu, rouge, vert, marron, jaune, noir — chacun en dégradé foncé→clair) ET couleur de l'arrière-plan (blanc, noir, orange clair, bleu clair, rouge, vert)

Toutes les icônes (Halal/Haram, Tasbih, Noms d'Allah, Boussole, Coran, Scan Product) doivent être recréées visuellement pour matcher exactement les images de référence fournies (mêmes formes, mêmes couleurs, même style)

1. Écran de démarrage / Authentification

Splash screen avec le logo "Nur" (croissant de lune)

Écran de connexion avec 3 options : "Se connecter", "Créer un compte", "Continuer sans compte" (lien en bas) — PAS de bouton "X" en haut (à éviter, source de bug inutile)

Connexion via Google, Apple, ou email

Création de compte : Nom complet, Email, Mot de passe

Vérification par code à 6 chiffres envoyé par email (via un service réel type Resend si possible, sinon code affiché à l'écran en mode développement)

2. Écran d'accueil (Home)

En haut : bouton fonctionnel pour changer manuellement la ville/emplacement, cloche de notifications (2 options seulement : Activer/Désactiver), photo de profil cliquable → redirige vers Settings

Localisation réelle (géolocalisation navigateur) + heure de la prochaine prière, horaires calculés via une API réelle (type Aladhan API), pas de valeurs statiques

Image de mosquée pour le style

Les 5 horaires de prière (Fajr, Dhuhr, Asr, Maghrib, Isha) avec nom en arabe et icône adaptée (soleil levant/soleil/nuage/soleil couchant/lune)

Widgets cliquables, même style de dégradé partout : Halal/Haram, Tasbih, Noms d'Allah, Boussole (redirige directement vers la section Qibla de la page Prayers)

Bloc Coran (image exacte fournie) à côté du bloc Scan Product (image exacte fournie)

Widget "Suivi des Prières" avec une animation quand les 5 prières du jour sont validées

3. Navigation

Barre de navigation en bas, 5 icônes fonctionnelles : Home, Prayers (mosquée), Quran (livre), Halal Haram (رحلال/حرام), Settings (engrenage)

4. Page "Prayers"

Une seule page continue et visuellement cohésive (pas de blocs séparés), regroupant :

Horaires réels (ville, date hégirien+grégorien, heure actuelle, prochaine prière, 5 horaires, frise de position)

Boussole Qibla RÉELLEMENT fonctionnelle (géolocalisation + capteur DeviceOrientation)

Sélecteur d'Imam pour l'Azan : liste avec photo/nom/drapeau, glissement horizontal. Cliquer sur un imam joue SON Azan réel (utiliser l'API mp3quran.net pour des liens audio vérifiés, ou 6 azans génériques associés à chaque imam si les azans nommés ne sont pas trouvables). Premier imam par défaut, choix sauvegardé.

Système de rappel avant l'Azan avec choix du délai : 5 min / 15 min / 30 min avant, ou aucun rappel

Notifications push + Azan automatique à l'heure de prière (fonctionnalité à intégrer même si non testable en preview)

5. Page "Quran"

Image exacte du Coran fermé fournie, avec animation d'ouverture au clic sur "Start reading"

Lecture complète du Coran intégrée (texte arabe + traduction française), sourate par sourate, via l'API Al-Quran Cloud

Sous le Coran : widgets d'invocations glissables horizontalement, deux par deux

Sous les invocations : 3 catégories de sourates glissables, cliquables pour lancer l'audio de récitation :

Très émouvantes et apaisantes : Maryam (19), Ad-Duha (93), Ash-Sharh (94), Ar-Rahman (55), Al-Waqi'ah (56)

Très puissantes et impressionnantes : Al-Mulk (67), Al-Qiyamah (75), Al-Haqqah (69), Al-Ghashiyah (88), At-Takwir (81)

Pour se calmer et réfléchir : Al-Kahf (18), Yusuf (12), Taha (20), Al-Anbiya (21), Al-Inshiqaq (84)

6. Page "Halal Haram"

Barre de recherche produit/marque

Boutons fonctionnels : Scanner un code-barre (caméra, détection réelle), Saisie manuelle du code-barre (chiffres), Recherche par nom de produit, Photo depuis la galerie (scan de l'image importée), Produits sauvegardés

Verdict Halal/Haram/Douteux avec source affichée : croiser Open Food Facts avec des bases de certification halal reconnues (LPPOM MUI, JAKIM). Verdict à 3 niveaux, mention "outil d'aide, pas une fatwa", possibilité de signaler une erreur

Infographie "Comment savoir si un produit est halal ou haram" avec le texte exact fourni en référence (ne pas improviser le contenu)

7. Page "Settings"

Photo de profil modifiable en haut

Dark Mode fonctionnel, en français

Notifications avec effet réel

Sélecteur de langue fonctionnel qui bascule TOUTE l'app : anglais, français, pashto, arabe algérien/marocain/égyptien/tunisien, italien, russe, farsi/persan

Confidentialité : changer email ou mot de passe

Aide : FAQ + signaler un bug

Choix de l'imam pour l'Azan (raccourci)

Rappel avant Azan (5/15/30 min ou aucun)

Méthode de calcul des horaires (école juridique)

Couleur des widgets + couleur de l'arrière-plan (voir Style visuel général)

Stack technique recommandée

PWA responsive, géolocalisation navigateur, API Aladhan pour les horaires, DeviceOrientation pour la boussole, API Al-Quran Cloud pour le Coran, API mp3quran.net pour l'audio des récitateurs, service email réel type Resend pour les OTP si possible (sinon code affiché en dev), pas de backend lourd nécessaire pour un MVP

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/027d6f6e-040a-468b-8e51-279868582c45).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
