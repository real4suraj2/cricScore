# cricScore
api to provide live cricket scores scraped from espncricinfo.com

## API Endpoints
- `GET` `/get-matches` Get enpoint uri of all matches available
- `POST` `/live-score` Get live scores as text for the provided uri `{uri : <ENDPOINT URI>}`
- `POST` `/score-card` Get live scores as pdf  for the provided uri `{uri : <ENDPOINT URI>}`
