;
(function () {
  'use strict';
  var elementUtilities = require("./elementUtilities")();
  var compoundResizeUtilities;
  var mode;
  
  // Event functions
  var tapStartFcn, dragFcn, resizeStartFcn, resizeDragFcn;

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape) {

    if (!cytoscape) {
      return;
    } // can't register if cytoscape unspecified

    var unbindEvents = function (cy) {
      cy.off('node', tapStartFcn);
      cy.off(dragFcn);
      cy.off(resizeStartFcn);
      cy.off(resizeDragFcn);
    };

    var bindEvents = function (cy) {
      var ancestorsCornerPositions;
      var effectedNodes;
      var ancestorMap;

      // Fill the data of elements which will be affected by the respositioning 
      var fillEffectedData = function (fillAncestorsMap) {
        ancestorsCornerPositions = [];

        if (fillAncestorsMap) {
          ancestorMap = {};
        }

        effectedNodes.each(function (i, ele) {
          var corners = []; // It will be used like a queue
          var currentAncestor = ele.parent()[0];

          while (currentAncestor) {
            var id = currentAncestor.id();

            var corner = elementUtilities.getOuterCornerPositions(currentAncestor);
            corner.id = id;

            corners.push(corner);

            if (fillAncestorsMap && !ancestorMap[id]) {
              ancestorMap[id] = currentAncestor;
            }

            currentAncestor = currentAncestor.parent()[0];
          }

          ancestorsCornerPositions.push(corners);
        });
      };

      // Update the paddings according to the movement
      var updatePaddings = function () {
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
            var currentCorners = elementUtilities.getOuterCornerPositions(ancestor);

            if (currentCorners.top === oldCorners.top && currentCorners.bottom === oldCorners.bottom
                    && currentCorners.left === oldCorners.left && currentCorners.right === oldCorners.right) {
              break;
            }

            var paddingTop, paddingBottom, paddingLeft, paddingRight;

            var topDiff = currentCorners.top - oldCorners.top;

            if (topDiff != 0) {
              var currentPadding = parseFloat(ancestor.css('padding-top'));
              paddingTop = currentPadding + topDiff;
            }

            var bottomDiff = currentCorners.bottom - oldCorners.bottom;

            if (bottomDiff != 0) {
              var currentPadding = parseFloat(ancestor.css('padding-bottom'));
              paddingBottom = currentPadding - bottomDiff;
            }

            var leftDiff = currentCorners.left - oldCorners.left;

            if (leftDiff != 0) {
              var currentPadding = parseFloat(ancestor.css('padding-left'));
              paddingLeft = currentPadding + leftDiff;
            }

            var rightDiff = currentCorners.right - oldCorners.right;

            if (rightDiff != 0) {
              var currentPadding = parseFloat(ancestor.css('padding-right'));
              paddingRight = currentPadding - rightDiff;
            }

            if (!paddingTop && !paddingBottom && !paddingLeft && !paddingRight) {
              continue;
            }

            var paddings = {};

            if (paddingTop) {
              paddings.top = paddingTop;
            }

            if (paddingBottom) {
              paddings.bottom = paddingBottom;
            }

            if (paddingLeft) {
              paddings.left = paddingLeft;
            }

            if (paddingRight) {
              paddings.right = paddingRight;
            }

            compoundResizeUtilities.setPaddings(ancestor, paddings);
          }
        });
      };

      cy.on('tapstart', 'node', tapStartFcn = function () {
        if( mode !== 'min' ) {
          return;
        }
        
        var node = this;

        if (node.selected()) {
          effectedNodes = cy.collection().add(node);
        }
        else {
          effectedNodes = cy.nodes(':selected').difference(node.ancestors()).union(node);
        }

        // We care about the movement of top most nodes
        effectedNodes = elementUtilities.getTopMostNodes(effectedNodes);

        fillEffectedData(true);
      });

      cy.on('drag', 'node', dragFcn = function () {
        if( mode !== 'min' ) {
          return;
        }
        
        updatePaddings();
        fillEffectedData(false);
      });

      cy.on('resizestart', resizeStartFcn = function (e, type, nodes) {
        if( mode !== 'min' ) {
          return;
        }
        
        effectedNodes = nodes;
        fillEffectedData(true);
      });

      cy.on('resizedrag', resizeDragFcn = function (e, type, nodes) {
        if( mode !== 'min' ) {
          return;
        }
        
        updatePaddings();
        fillEffectedData(false);
      });
    };

    cytoscape('core', 'compoundResize', function (_mode) {
      var cy = this;
      
      if (_mode === 'destroy') {
        unbindEvents(cy);
        return;
      }
      
      if( _mode != 'get' ) {
        compoundResizeUtilities = require('./compoundResizeUtilities')(cy);
        mode = _mode;
        compoundResizeUtilities.setMode(mode);
        bindEvents(cy);
      }

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
