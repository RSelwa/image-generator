## TODO

<details>
<summary>Global</summary>

  - [X]  Change gameRef into gameId in spherical + maps
  - [X] Update schema to allow sphericals to have mapId and coordinates or not depending on types
  - [X] Implement 2D maps
  - [X] Change rights into a dedicated table
  - [X] Implement Icono roles
  - [X] update the listeners too
  - [X] implements tests in front
  - [X] Add storage tests for Flat images and thumbnails
  - [X] display correct answer on the map when showing result
  - [X] number of points by level is not correct for now
  - [x] timer on round
  - [x] lives in round answer doc
  - [x] fix dragging minimap
  - [x] when joining a game when not logged, should redirect to login/join and then get back
  - [x] everyone should be ready before next round
  - [x] Implements game creation
  - [x] Fix timer on special round, should start only when user has selected a game
  - [x] add a force next round for host
  - [x] clean special round select ⌛️
  - [x] Fix when reload when gameDisplay it should not re add other points to the score
  - [x] Pseudo, when signup redirect to a modal with just an input to update the player pseudo
  - [x] Persist auth when reloading
  - [x] fix game thumbnail image when fail
  - [x] Fix fall back
  - [x] Fix all colors for theming in future
  - [x] Seed maker
  - [x] Change google icon colored
  - [x] paste seed  -> call api to verify, the seed exists, if yes, increment the seedDoc.usedTimes and change lobbyDoc to use it + change the config number of rounds
  - [x] lock the number of rounds if seed already selected
  - [x] Allow seed application in a lobby
  - [x] Allow flats to have maps
  - [ ] the listen docs should changes games if they contains a ready or not, when they are changed, should call another cf (maybe on request) that will fetch all games spehrical/flat to check if they have ready
  - [x] Fix: if selected 6 rounds, in end screen, still have 18 displayed
  - [x] Allow creation of flats and sphericals from new or gameId
  - [x] Account settings
  - [x] can list the seeds
  - [x] Implement a demo seed
  - [x] when user hasn't selected a pin in the map, should not draw line, and always set points to 0
  - [x] Remove game input when in specials round selection
  - [x] Implement suggestion
  - [x] bug minimap when first hover
  - [x] when create lobby when anonymous should disable all config, and pick the seed
  - [x] When user start a lobby, remove his id from createdBy seedDoc, because he don't really create it
  - [x] Implements fonts for tailwinds
  - [x] In demo test, test to write variable game name
  - [x] Merge the button play/play demo in the first screen
  - [x] Analytics
  - [x] Remove sidebar from admin
  - [x] Fix DEFAULT map distance
  - [x] When solo in a lobby, Should have only one button that will set ready and start the game
  - [x] on the lobby waiting, put in background the glyph that is in the references, little white text
  - [x] Pour les avatar, reprendre le design des cartes du fan made marathon, c'est un gars du groupe twitter
  - [x] Utiliser driver js pour présenter le lobby 
  - [x] ajouter des bouttons back to lobby / new game, when in finished screen
  - [x] Fix starting screen when game is Loading
  - [x] end game screen⌛️
  - [ ] Add combobox for games suggestions
  - [ ] Fix, when users is closing the tab, it should remove them from the lobby
  - [ ] Add a modal for suggestions only, not particulary games
  - [ ] mettre un array players qui contient que les id à la racine du doc de lobby pour simplifier firestore query
  - [ ] Add a button How to play wich gonna open a modal wich gonna be carousel with examples
  - [ ] Ajouter des tests sur ces bouttons
  - [ ] Ajouter la selection d'avatar sur la popup pseudo after login
  - [ ] Utiliser driver js pour présenter les trucs des rounds spéciaux 
  - [ ] When playing close window and try to get back, verify that it's allowed
  - [ ] Ajouter une image pour le share seo
  - [ ] Ajouter les meta pour chaque page
  - [ ] Ajouter une belle page 404
  - [ ] Désactiver l'auto focus quand on est en mobile ?
  - [ ] En mobile, devoir appuyer sur un button pour faire apparaitre la map
  - [ ] reduce input size in mobile
  - [ ] Implémenter le buy me coffee
  - [ ] Scrap lostgamer for the images of the maps
  - [ ] Add sound
  - [ ] Implement modals system for pubing/infos
  - [ ] implement seeds that will be featured like flim discover
  - [ ] ajouter description pour le round special
  - [ ] Improve Auth by setup ssr firebase auth and cleaning the way auth is called and setup auth persistence
  - [ ] ADMIN -Improve the empty card whe no map/no games etc... with shadcn empty components
  - [ ] can copy the seedId in the maker
  - [ ] Change icons on minimap
  - [ ] Share seed at the end of a lobby
  - [ ] Seed maker, better tags, which games has sphericals and which has flats, wich means better handling listeners
  - [ ] Integrate ads
  - [ ] Add tests on api endpoints
  - [ ] Add firebase admin for front libs
  - [ ] Improve the security for the update for lobbies
  - [ ] friends invitations
  - [x] Buy domain name
  - [ ] Setup Reels Insta et tiktok
  - [ ] Implement a system to interact with twitch chat, maybe to vote for games
  - [ ] Fix: e2e test driver test localstorage
  - [ ] Implement a chat room inside
  - [ ] When problem of connexion, auto send a report to me
  - [x] Create a document with all games to lower read in firestore
  - [x] Create an e2e test with DEMO_SEED
  - [x] Adapter storybook et les comportements 
  - [ ] Fix tests storage suggestions update unauthenticated

</details>

<details>
<summary>Front</summary>
  - Clean footer
  - Find DA for the website
</details>

<details>
<summary>Ideas</summary>
  - [ ] Multiple cursor in lobby to see everyone
</details>
