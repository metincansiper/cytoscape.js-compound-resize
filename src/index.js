;
(function () {
  'use strict';
  var elementUtilities = require("./elementUtilities")();
  var compoundResizeUtilities;

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape) {

    if (!cytoscape) {
      return;
    } // can't register if cytoscape unspecified

    var bindEvents = function (cy) {
      var ancestorsCornerPositions;
      var movedNodes;
      var ancestorMap;

      cy.on('tapstart', 'node', function () {
        var node = this;

        if (node.selected()) {
          movedNodes = cy.collection().add(node);
        }
        else {
          movedNodes = cy.nodes(':selected').union(node);
        }

        // We care about the movement of top most nodes
        movedNodes = elementUtilities.getTopMostNodes(movedNodes);

        ancestorsCornerPositions = [];
        ancestorMap = {};

        movedNodes.each(function (i, ele) {
          var corners = []; // It will be used like a queue
          var currentAncestor = ele.parent()[0];

          while (currentAncestor) {
            var id = currentAncestor.id();

            var corner = elementUtilities.getCornerPositions(currentAncestor);
            corner.id = id;

            corners.push(corner);

            if (!ancestorMap[id]) {
              ancestorMap[id] = currentAncestor;
            }
            
            currentAncestor = currentAncestor.parent()[0];
          }

          ancestorsCornerPositions.push(corners);
        });
      });

      cy.on('drag', 'node', function () {
        var node = this;

        // Keeps the already processed ancestors
        var processedAncestors = {};

        ancestorsCornerPositions.forEach(function (element, index, array) {
          var cornersQueue = element;
          while (cornersQueue.length > 0) {
            var oldCorners = cornersQueue.shift();

            if (processedAncestors[cornersQueue.id]) {
              continue;
            }

            processedAncestors[oldCorners.id] = true;
            var ancestor = ancestorMap[oldCorners.id];
            var currentCorners = elementUtilities.getCornerPositions(ancestor);

            if (currentCorners.top === oldCorners.top && currentCorners.bottom === oldCorners.bottom
                    && currentCorners.left === oldCorners.left && currentCorners.right === oldCorners.right) {
              break;
            }

            var paddingTop, paddingBottom, paddingLeft, paddingRight;

            var topDiff = currentCorners.top - oldCorners.top;

            if (topDiff != 0) {
              var currentPadding = parseInt(ancestor.css('padding-top'));
              paddingTop = currentPadding + topDiff;
            }
            
            var bottomDiff = currentCorners.bottom - oldCorners.bottom;

            if (bottomDiff != 0) {
              var currentPadding = parseInt(ancestor.css('padding-bottom'));
              paddingBottom = currentPadding - bottomDiff;
            }
            
            var leftDiff = currentCorners.left - oldCorners.left;

            if (leftDiff != 0) {
              var currentPadding = parseInt(ancestor.css('padding-left'));
              paddingLeft = currentPadding + leftDiff;
            }
            
            var rightDiff = currentCorners.right - oldCorners.right;

            if (rightDiff != 0) {
              var currentPadding = parseInt(ancestor.css('padding-right'));
              paddingRight = currentPadding - rightDiff;
            }
            
            if(!paddingTop && !paddingBottom && !paddingLeft && !paddingRight) {
              continue;
            }
            
            var paddings = {};
            
            if(paddingTop) {
              paddings.top = paddingTop;
            }
            
            if(paddingBottom) {
              paddings.bottom = paddingBottom;
            }
            
            if(paddingLeft) {
              paddings.left = paddingLeft;
            }
            
            if(paddingRight) {
              paddings.right = paddingRight;
            }
            
            compoundResizeUtilities.setPaddings(ancestor, paddings);
          }
        });

        ancestorsCornerPositions = [];

        movedNodes.each(function (i, ele) {
          var corners = []; // It will be used like a queue
          var currentAncestor = ele.parent()[0];

          while (currentAncestor) {
            var id = currentAncestor.id();

            var corner = elementUtilities.getCornerPositions(currentAncestor);
            corner.id = id;

            corners.push(corner);
            
            currentAncestor = currentAncestor.parent()[0];
          }

          ancestorsCornerPositions.push(corners);
        });
      });
    };

    cytoscape('collection', 'compoundResize', function () {
      var eles = this;
      var cy = this.cy();
      
      compoundResizeUtilities = require('./compoundResizeUtilities')(cy);
      bindEvents(cy);
      
      var compounds = cy.nodes('$node > node');
      
      compounds.each(function(i, ele){
        var paddings = {
          'top': ele.css('padding-top'),
          'bottom': ele.css('padding-bottom'),
          'left': ele.css('padding-left'),
          'right': ele.css('padding-right')
        };
        
        compoundResizeUtilities.setExtremePaddings(ele, paddings, 'min');
        compoundResizeUtilities.setExtremePaddings(ele, paddings, 'max');
      });

      return compoundResizeUtilities; // Provide API
    });

  };

  if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
    module.exports = register;
  }

  if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
    define('cytoscape-compound-resize', function () {
      return register;
    });
  }

  if (typeof cytoscape !== 'undefined') { // expose to global cytoscape (i.e. window.cytoscape)
    register(cytoscape);
  }

})();
