# Geofreebie

### Welcome!

Geofreebie is a [freecycling](https://en.wikipedia.org/wiki/Freecycling) and skill-sharing app. It improves on existing freecycling platforms in Münster, Germany with its map interface and location-based recommendations. It makes freecycling more accessible and spontaneuous.


![Map screenshot](www/img/screenshots/map_wide.png "Map screenshot")
> _The app's map view: see where people are offering freebies in your city._

This app was initially developed as part of Christian Kray, Markus Konkol, and Mehrnaz Ataei's Location Based Services course at the [Institut for Geoinformatics](http://ifgi.de). The purpose was to explore privacy issues in location-based mobile apps and to produce something useful at the same time.

The Geofreebie app is meant to enhance existing freecycle networks by creating location-based listings and recommendations.

  * Anna is giving away cookies 500 meters from you!

  * Your search for couches within 5 kilometers returned 20 results.

  * There are 5 items being given away within 1 kilometer of your position.

These are just a few examples of notifications our app can deliver.


![List screenshot](www/img/screenshots/list_wide.png "List screenshot")
> _The app's list view: discover the freebies nearest to you, click to see them on the map._

### The plan

* You can find our original vision for the project in our [mockups folder](https://drive.google.com/drive/folders/13sRy6OwVp6YiGpK_L-YKbhwFvKUbRUbf) and our [brainstorm file](initial_ideas_brainstorm.md).

* See [Waffle.io](https://waffle.io/lbraun/geofreebie) for details on specific features.

* See our [Sprint Review Slides](https://docs.google.com/presentation/d/14e147f2FRqLchENUWvpLlp1JihMFEbdodkgj4bvrjWc/edit#slide=id.p) for sprint review progress reports.

## Technologies used

1. [node.js](https://nodejs.org/en/)
2. [Apache Cordova](https://cordova.apache.org/)
3. [React](https://reactjs.org/)
4. [Onsen UI](https://onsen.io/)
5. [react-leaflet](https://github.com/PaulLeCam/react-leaflet)/[Leaflet](http://leafletjs.com/)
6. [Cordova-promise-fs](https://github.com/markmarijnissen/cordova-promise-fs)
7. [leaflet-offline](https://github.com/robertomlsoares/leaflet-offline)

## Installation

_How to install the app and run it on your device._

#### Dependencies

Install these dependencies to run the project:

- Apache Cordova
- node.js (npm)
- [Browserify](http://browserify.org/)
- [Babelify](https://github.com/babel/babelify)

You will also need:

- Java JDK
- Android SDK (download Android Studio and it's included)
- Gradle (`brew install gradle` on Mac OS)

And you need to set up the following environment variables:

- JAVA_HOME (google how to find the location of your google installation)
- ANDROID_HOME (can be found from Android Studio settings. Search settings for "SDK")

#### Installation

- Clone this repository
- Add the cordova platform you want to use `cordova platform add <platformname>`
    - Platforms include `android`, `ios`, and `browser`

    - See [Cordova Getting started](https://cordova.apache.org/#getstarted) for details
- Run `npm run build`

#### Running the app

- From the console, run `cordova run <platformname>`

## Modifications of the existing app

#### Modify the app's defaults
- Go the the file `src/data_components/config.json` (contains all available settings)
- Set the settings in the `app` component in a way you want your default settings (`true/false` values)
- Adjust the map settings:
    - `center`: Center of the map as default (when GPS is off). Use latitude/longitude value pairs
    - `zoomable`: Set the default map able to zoom (use `true/false`)
    - `draggable`: Set the default map able to be dragged (use `true/false`)
    - `zoom`: Value between 0 and 18 (0 = mininmal zoom, 18 = maximum zoom)

#### Modify the displayed data
- Go to the file `src/data_components/layers.json` (containing sample data as an example)
- Edit the file with your layers
    - Each layer must be a `json` Object wrapped in `{}`
    - Each layer can be one of eigther `marker` or `route`
    - The name of the layer is also the name used for displaying it on the map
    - Each layer can contain multiple items in an array `[{item}, {item2}]`
    - Each item must have a unique `name`
    - Provide the coordinates of your layers in pairs of latitude/longitude
    - Routes are used as single layer, so to add multiple `route` objects, add multiple layers
    - Add a pop-up to a marker by adding the element `popup` to an item of a marker. This will be displayed. It can be be styled with html elements (example: `<b>Hello world!</b><br>I am a popup.`)

#### Adding pictures for streetview
Add the picture to the folder `www/img`.

## Extending the app

To add further plugins or extensions, create a new file in `src/business_components` with your logic and `export` your functions. Then in the component, that shall be extended (map, streetview), `require` the new file and just use your new functions like `module.method()`. To have the new modules as a part of the app, you need to run the build again `npm run build`.

## Add more Logs
The Logger delivered with the app provides two exported functions: `logEntry(data)` and `stopLoggingAndWriteFile`. The logs have the structure: `Date/Time, Latitude, Longitude, Mode, Action`. To add more logs create an array and call `logger.logEntry(myData)` with it. The logfile can be found on the devices' root directory and is called `lbs-engine-logger.csv`.

## Further development
The streetview component is a dummy mode at the moment. An interaction to change the displayed image and respond to location events needs to be implemented.

## Bugs
Due to an [error](https://github.com/OnsenUI/OnsenUI/issues/2307) in OnsenUI's last version, the tabs are a little hacked right now. Can be fixed with an update of OnsenUI.
