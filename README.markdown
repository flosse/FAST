# FAST - Free All Scrambled Thoughts

FAST is a little ToDo web application that acts as a demo for
[scaleApp](https://github.com/flosse/scaleApp).

# Use it

Play around with the [demo](http://scaleapp.org/demo/fast/) and have fun!

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
