## appbase.io dashboard

sugar, spice and everything nice

### Setup

After cloning this repo, sync the (batteries) submodule via:

```
git submodule init
git submodule update --recursive --remote

# checkout to arc branch on batteries
cd src/batteries
git checkout fetch origin
git checkout arc

```

### Installation and development

```
yarn
yarn start
```

### Debugging
If your tests are failing, do make sure your `localhost:3333` is up and running.

Server will run on port `3333`.


### Testing for each PR
Once a feature/work is complete run `yarn cypress:run` to validate test cases. This will run the test and generate a report which will automatically update the PR with the results via a Cypress Bot. For local testing run `yarn cypress:open` and execute the relevant test suite from the GUI
