ng-pictureGallery
=================

AngularJs Picture Gallery Module
Showing angular powers

 

__install guide :__

1. make sure angular-bootstrap is included in your project.
2. add the picture-gallery.js and css files to the project.
3. drop the image files in ../images.
4. add 'ng-pictureGallery' to your app dependencies

congrats you now have ng-pictureGallery in your project


__usage :__

in your view.html file add the following tag

    <my-gallery collection="" url="" pagesizes="" defaultsize=""/>   


the directive accepts 4 attributes :

1. collection  : creates an isolated scope and bind to a collection in your controller
2. url         : the url for your images ('http://route/to/my/images.json
3. pagesizes   : sets pages sizes for paging accepts array (default is [5,10,15,20])
4. defaultsize : sets default page size (default is 10)


the directive can be used in 2 ways :

1. just specify a url and let the magic happen.

2. consume the gallerySrv service in your controller 
and invoke the getImages() method (returns promise),
in the markup specify the collection on your controller 
you wish to bind to (collection="myCollection").

__example controller :__
```ruby
angular.module('galleryApp').controller('MainCtrl', function($scope, $mygallery) {
        $scope.images = [];
        $scope.url = 'path/to/images';
        $mygallery.getImages(url).then(function(data) {
            $scope.images = data;
        });
});
```
 `<my-gallery collection="images"/>`

<code>
