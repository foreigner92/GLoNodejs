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


### Create Environment ###

    git clone -o upstream git@github.com:lucidmoon/gloliquid-frontend

### Install Dependencies ###
	
The GloLiquid Frontend relys on the [Bower](https://github.com/bower/bower) and [npm](https://npmjs.org/) package managers to handle client-side dependencies and development dependencies respectively.

    npm install
    bower install


## Development ##

GloLiquid developers are required to adopt the [GitFlow](http://jeffkreeftmeijer.com/2010/why-arent-you-using-git-flow/) branching model along with the [Github Pull Request](https://help.github.com/articles/using-pull-requests) mechanism in order to develop features, hotfixes and manage releases.  (see: [Hub-Flow](http://datasift.github.io/gitflow/)). 

### Launching the development environment ###

    grunt server

## Production ##

Building a production distribution:

	grunt build 
	
The distribution bundle can be found at `<APP_ROOT>/dist`.

	


