# PPCEntourage.com

To be added later...

## Versions

- node - v4.5.0>=
- mysql - 5.6>=

## Installing

### Pull from the git repository

### Download recent mysql dump file and import it into your mysql sever.

Create new database

```bash
> create database `ppc_local`;
```
Import mysql dump file

```bash
mysql -u root -p ppc_local < mysql_dump.sql
```
### Config backend

```bash
cp backend/config/local.js.example local.js
```

```bash
nano backend/config/local.js
```

Edit following values in `backend/config/local.js` with appropriate values for your server

- `ssl` - important when you are going to deploy on the live server
- `connections.mysql`
- `port`

### Config frontend

```bash
cp frontend/config/config.example.json frontend/config/config.json
```

Edit following values in `frontend/config/config.json` with appropriate values for your server

- `backendUrl`
- `frontend.ports`
- `frontend.hostname`
- `frontend.https`

### install npm and bower

```bash
cd backend
npm install
```

install sails cli

```bash
npm install -g sails
```

```bash
cd frontend
npm install
bower install
```
### Run the server

To run on the live server
```bash
npm start
```

To run on the development or local server
```bash
npm run dev
```

## Development

### Branch

You need to creat a branch for your new feature or bug fix from the master branch to start working.

```bash
git checkout master
git pull origin master
git branch -b bugfix/campaign-start-page-error
```

Name convention
- For new features: `feature/[new feature description in short]`
- For bug fixes: `bugfix/[bug description in short]`

`master`, `staging` and `production` branches are managed by the permitted developer.

After push to your feature/bugfix branch, create a pull request to master branch to review.

After your branch is merged into `master` branch, please check the dev site.

### Web servers

- Dev site: http://dev.ppcentourage.com
- Staging site: http://staging.ppcentourage.com:81


### Migration

We use `sails-migrations` to keep the database synced across all servers.

- Installing cli

```bash
npm install sails-migrations -g
```

- Create new migration script

```bash
sails-migrations generate add_new_table_or_update_existing_table
```

Add migration script to the newly generate file under `/db/migrations`.

For migration syntex, please refer http://knexjs.org/#Schema-Building.

- Run migration

```bash
sails-migrations migrate
```


If you have already made a commit for the migration script, DO NOT modify it but create new migration script for that, because modifying the already-commited migration script WILL LEAD TO MIGRATION CONFLICT.

## Deployment

### Deployment to dev site

After merge new pull request from feature or bugfix branch, it will be automatically updated.

Please be noted, it will take few mins until the server restarts completely.

### Deployment to staging site

- First, You need to confirm that certain commits are working without any issue on the dev site.

- For those commits, Create a new pull request from `master` branch to `staging` branch. Make sure you select those confirmed commits only.

- Dump mysql database from the live site and replace the staging database on the staging server.

Staging database name : `ppc_staging`

- Merge newly created pull request above into `staging` branch.

- New commits will be automatically updated to the staging website.

### Deployment to live site

- First, You need to confirm that certain commits are working without any issue on the staging site.

- Merge `staging` branch into `production` branch.

- On the live server, pull down from the production branch and restart the server.

- When you restart the server on the live, please make sure you run `npm install` on both backend and frontend directory and `bower install` on the frontend directory. Also please run `sails-migrations migrate` to run new migration scripts.# ppc-srv
