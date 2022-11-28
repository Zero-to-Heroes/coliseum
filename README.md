Coliseum is an online replay viewer for Hearthstone. It uses an [HSReplay](https://github.com/HearthSim/HSReplay) log file as a source (se below).

# Demo

See https://replays.firestoneapp.com. You can also access it from any review on https://www.zerotoheroes.com and clicking on the "New replay viewer" link at the top.

# Screenshots

See the [imgur album](https://imgur.com/a/2K3asZ9)

![mulligan](https://i.imgur.com/fPsi8gR.jpg)
![spell](https://i.imgur.com/yfOek19.png)
![victory screen](https://i.imgur.com/ZIcStEY.png)

# How to get a replay file for local use?

-   Get one from zerotoheroes.com (go to any review, then open your inspector, go to Network tab, then copy/paste the resulting XML into the replay.xml file)
-   You can also download one from hsreplay.net
-   Or you can build one from your Power.log file, using for instance the [C# converter](https://github.com/Zero-to-Heroes/hs-game-converter-csharp-port) (open the project in Visual Studio, then run the test)

# Contacts & support

Join us on [Discord](https://discord.gg/H4Hj7bC)

# Contributing

```
$ git clone ...
$ npm install  # You need to have node installed
$ npm run dev # For development
$ npm run build # For release

aws s3 cp ./dist s3://replays.firestoneapp.com --acl public-read --recursive
aws s3 cp ./dist/coliseum.js s3://replays.firestoneapp.com --acl public-read
```

# Local dev (just for me)

```
cp dist/coliseum.js ../firestone/core/dependencies/
cp dist/coliseum.js ../firestone-new/firestone/dependencies/
cp dist/coliseum.js ../firestone-new/firestone/dist/apps/legacy/Files/
```
