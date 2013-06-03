# GloLiquid Frontend #

## Installation ##
### Prerequisites ###

* Some kind of shell (bash, [zsh](https://github.com/robbyrussell/oh-my-zsh), etc)
* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (~0.8.14)
* [Compass](http://compass-style.org/) (~0.12.2)
* [Grunt](http://gruntjs.com/)
* [Bower](https://github.com/bower/bower)
* [Yo/Yeoman](http://yeoman.io) (optional)


### Install Dependencies ###
	
The GloLiquid Frontend relys on the [Bower](https://github.com/bower/bower) and [npm](https://npmjs.org/) package managers to handle client-side dependencies and development dependencies respectively.

    npm install
    bower install


## Development ##

GloLiquid developers are required to adopt the [GitFlow](http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/) branching model along with the [Github Pull Request](https://help.github.com/articles/using-pull-requests) mechanism in order to develop features, hotfixes and manage releases. [Hub-Flow](http://datasift.github.io/gitflow/) is highly recommended in order to streamline the command line process. 

### Example (Hub-flow) ###
#### Process Overview: ####
1. Fork the master repo, work on your own fork.
2. Work in the `develop` branch.  Develop specific features in a seperate branches (using The Hub-flow model.  i.e. features/amazing_new_feature)
3. Push branch to your fork
4. Make a pull request from your branch/fork to `develop` on the MASTER repo (****NOT**** the `master` branch!)
5. QA (Code Review)
6. Upon passing QA close PR and merge feature branch into `develop` on the master repo.
7. Pull from the upstream to update your fork with the latest changes.

##### Clone your fork & add 'upstream' remote

	git clone git@github.com:<USERNAME>/gloliquid-frontend.git
	git remote add upstream git@github.com/lucidmoon/gloliquid-frontend.git
	
#### Keeping up-to-date ####

	git checkout develop
	git pull --rebase upstream develop

#### Working on a new feature ####

	git hf feature start <NAME_OF_NEW_FEATURE>

	# Do some work and then stage some changes 

	git add <WHATEVER>

	# commit your changes
	git commit -m "whatever"

	# push changes to github
	git hf push
	
Now make a pull request from your feature branch on your fork to the `develop` branch on the master repo.  Once the PR has been closed and the changes have been merged with `develop` then repeat 'Keeping up-to-date' and 'finish' the feature branch with the following commands:

	git checkout developer
	git pull --rebase upstream develop
	git hf feature finish <NAME_OF_NEW_FEATURE>


### Launching the development server ###

    grunt server
    
This will launch a new HTTP server, open your default web browser, watch your changes (including Compass/SASS) and auto-refresh with LiveReload. _n.b ensure you don't have any other instances of LiveReload running otherwise you will run into trouble_

## Production ##

Building a production distribution:

	grunt build 
	
The distribution bundle can be found at `<APP_ROOT>/dist`.

	


