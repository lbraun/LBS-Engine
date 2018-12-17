# Free stuff website
_Mission: encourage reuse of discarded items_

### Initial thoughts

- Find free food or furniture near your current location
  - Or on your route
- Rate the freecyclers (trustworthy, high quality stuff?)
- Two languages?
- Scrape existing sites?
- Suggestions based on usual routes
- Cost of getting there (gas, time)
- Different travel modes
- Potluck event

### Sugestions from Kray

- Opportunistic management/sharing
- What's the morality?
- How to decide who get's it?
- Talk to Ana Maria Bustamante Duarte (researches refugees) and Mehrnaz Ataei (privacy morality)

- Must be present to give (has to be a live status?)
- Collocation as a requirement

### Notes

- index.html
  - One div that everything goes into: root
- index.js
  - app object required here (main component)
  - on document ready, render into the root div
- bundle.js
  - contains all the code that you right for the app
- app.js
  - main component of the app
  - add class with extent
    - classes have constructors
    - this constructor sets this.state
  - render() function
    - renders the app
  - render_tabs() render all the sub-components (map, picture view, settings)
    - another file for each of these
- settings.js
  - responsible for settings view
  - Ons = Onsenui framework

#### Levels:

 - map and settings are on the same level
   - cannot pass data between them
   - must pass data via the parental class
