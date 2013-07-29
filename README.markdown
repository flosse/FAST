# FAST - Free All Scrambled Thoughts

FAST is a little ToDo web application that acts as a demo for
[scaleApp](http://www.scaleapp.org).

# Use it

Play around and have fun!

## WARNING!

This demo is totally out of date!!
For up to date [scaleApp](http://www.scaleapp.org) examples go to
[scaleApp's GitHub Repository](https://github.com/flosse/scaleApp/tree/master/examples)


[http://flosse.github.com/FAST/](http://flosse.github.com/FAST/) reflects
this repository but there is a more up to date version on
[scaleapp.org/demo/fast/](http://scaleapp.org/demo/fast/).


If you're interestet in this application idea in any way, please let
[me](mailto:mail@markus-kohlhase.de) know (I'm going to create a complete
rewrite with a backend and XMPP support for real and serious usage).

## Additional informations

You can add a task with several meta informations by using `#` plus a keyword
followed by your additional informations.

		myTaskname #c myContext

creates an item with "myContext" as context.

		anotherTask #c context #p projectOne, projectTwo #f

creates a favorited item with the context "context"
and the projects "projectOne" and "projectTwo".

### Available keywords

- c: context(s)
- p: project(s)
- f: favorite

## Search

To search for an item just type `/` follwed by your search term.

## Supported Browsers

FAST was only tested with

- Firefox 4
- Chrome 10

# License
FAST is licensed under the [AGPLv3 License](http://www.gnu.org/licenses/agpl.html)
