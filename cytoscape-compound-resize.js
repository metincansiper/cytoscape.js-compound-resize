(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cytoscapeCompoundResize = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var compoundResizeUtilities = function (cy, mode) {
  var scratchUtilities = _dereq_("./scratchUtilities")();

  var self = {
    setMode: function(newmode) {
      if(newmode == mode) {
        return;
      }
      
      var compounds = cy.nodes('$node > node');
      
      // If the new mode is 'free' set the paddings to the minimums before setting the mode if minimum paddings exists
      if (newmode === 'free') {
        compounds.each(function (i, ele) {
          var minPaddings = self.getMinimumPaddings(ele);
          
          if (!minPaddings) {
            return;
          }

          ele.css('padding-top', minPaddings.top);
          ele.css('padding-bottom', minPaddings.bottom);
          ele.css('padding-left', minPaddings.left);
          ele.css('padding-right', minPaddings.right);
        });
      }
      
      mode = newmode; // Set the new mode
      
      // If the new mode is 'min' set the minimum and maximum paddings after setting the new mode
      if (newmode === 'min') {
        compounds.each(function (i, ele) {
          var paddings = {
            'top': ele.css('padding-top'),
            'bottom': ele.css('padding-bottom'),
            'left': ele.css('padding-left'),
            'right': ele.css('padding-right')
          };

          self.setExtremePaddings(ele, paddings, 'min', true);
          self.setExtremePaddings(ele, paddings, 'max', true);
        });
      }
    },
    getMode: function() {
      return mode;
    },
    setPaddings: function (nodes, paddings) {
      
      if (mode !== 'min') {
        return;
      }
      
      cy.startBatch();

      nodes.each(function (i, ele) {
        var minPaddings = self.getMinimumPaddings(ele);
        var maxPaddings = self.getMaximumPaddings(ele);

        if ( paddings.left >= minPaddings.left && paddings.left <= maxPaddings.left ) {
          ele.css('padding-left', paddings.left);
        }

        if ( paddings.right >= minPaddings.right && paddings.right <= maxPaddings.right ) {
          ele.css('padding-right', paddings.right);
        }

        if ( paddings.top >= minPaddings.top && paddings.top <= maxPaddings.top ) {
          ele.css('padding-top', paddings.top);
        }

        if ( paddings.bottom >= minPaddings.bottom && paddings.bottom <= maxPaddings.bottom ) {
          ele.css('padding-bottom', paddings.bottom);
        }
      });
      
      cy.endBatch();
    },
    // Set extreme paddings of the nodes use force parameter if you do not need to satisfy 'minPaddings <= maxPaddings' rule
    setExtremePaddings: function (nodes, _paddings, minOrMax, force) {
      if (mode !== 'min') {
        return;
      }
      
      cy.startBatch();

      nodes.each(function (i, ele) {
        var paddingLeft = parseFloat(ele.css('padding-left'));
        var paddingRight = parseFloat(ele.css('padding-right'));
        var paddingTop = parseFloat(ele.css('padding-top'));
        var paddingBottom = parseFloat(ele.css('padding-bottom'));

        var minPaddings = self.getMinimumPaddings(ele);
        var maxPaddings = self.getMaximumPaddings(ele);
        
        // Get the extreme paddings to set them
        var extremePaddings = minOrMax === 'min' ? minPaddings : maxPaddings;

        var sign = minOrMax === 'min' ? 1 : -1;
        
        // Clone _paddings into paddings object
        var paddings = {
        };
        
        // Filter paddings from _paddings note that the rule of 'maxPaddings >= minPaddings' should be satisfied
        if (minOrMax === 'min') {
          for (var prop in _paddings) {
            if (force || _paddings[prop] <= maxPaddings[prop]) {
              paddings[prop] = _paddings[prop];
            }
          }
        }
        else if (minOrMax === 'max') {
          for (var prop in _paddings) {
            if (force || _paddings[prop] >= minPaddings[prop]) {
              paddings[prop] = _paddings[prop];
            }
          }
        }

        // Set the extreme paddings where applicable
        if (paddings.left) {
          if (paddingLeft * sign < paddings.left * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-left', paddings.left);
          }

          extremePaddings.left = parseFloat(paddings.left);
        }

        if (paddings.right) {
          if (paddingRight * sign < paddings.right * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-right', paddings.right);
          }

          extremePaddings.right = parseFloat(paddings.right);
        }

        if (paddings.top) {
          if (paddingTop * sign < paddings.top * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-top', paddings.top);
          }

          extremePaddings.top = parseFloat(paddings.top);
        }

        if (paddings.bottom) {
          if (paddingBottom * sign < paddings.bottom * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-bottom', paddings.bottom);
          }

          extremePaddings.bottom = parseFloat(paddings.bottom);
        }
      });

      cy.endBatch();
    },
    getMinimumPaddings: function (node) {
      if (mode !== 'min') {
        return null;
      }
      
      var paddings = scratchUtilities.getScratch(node).minPaddings;
      if (!paddings) {
        paddings = scratchUtilities.getScratch(node).minPaddings = {};
      }
      return paddings;
    },
    getMaximumPaddings: function (node) {
      if (mode !== 'min') {
        return null;
      }
      
      var paddings = scratchUtilities.getScratch(node).maxPaddings;
      if (!paddings) {
        paddings = scratchUtilities.getScratch(node).maxPaddings = {};
      }
      return paddings;
    }
  };

  return self;
};

module.exports = compoundResizeUtilities;
},{"./scratchUtilities":4}],2:[function(_dereq_,module,exports){
var elementUtilities = function () {
  return {
    //this method returns the nodes non of whose ancestors is not in given nodes
    getTopMostNodes: function (nodes) {
      var nodesMap = {};
      for (var i = 0; i < nodes.length; i++) {
        nodesMap[nodes[i].id()] = true;
      }
      var roots = nodes.filter(function (i, ele) {
        var parent = ele.parent()[0];
        while (parent != null) {
          if (nodesMap[parent.id()]) {
            return false;
          }
          parent = parent.parent()[0];
        }
        return true;
      });

      return roots;
    },
    // Get the corner positions of the node
    getOuterCornerPositions: function(node) {
      var posX = node.position('x');
      var posY = node.position('y');
      var halfWidth = node.width() / 2;
      var halfHeight = node.height() / 2;
      
      return {
        'top': posY - halfHeight,
        'bottom': posY + halfHeight,
        'left': posX - halfWidth,
        'right': posX + halfWidth
      };
    }
  };
};

module.exports = elementUtilities;
},{}],3:[function(_dereq_,module,exports){
;
(function () {
  'use strict';
  var elementUtilities = _dereq_("./elementUtilities")();
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
          effectedNodes = cy.nodes(':selected').difference(node.ancestors());
        }
        else {
          effectedNodes = cy.collection().add(node);
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
        compoundResizeUtilities = _dereq_('./compoundResizeUtilities')(cy);
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

},{"./compoundResizeUtilities":1,"./elementUtilities":2}],4:[function(_dereq_,module,exports){
var scratchUtilities = function () {
  return {
    getScratch: function (cyOrEle) {
      if (!cyOrEle.scratch('_compoundResize')) {
        cyOrEle.scratch('_compoundResize', {});
      }
      return cyOrEle.scratch('_compoundResize');
    }
  };
};

module.exports = scratchUtilities;
},{}]},{},[3])(3)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG91bmRSZXNpemVVdGlsaXRpZXMuanMiLCJzcmMvZWxlbWVudFV0aWxpdGllcy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zY3JhdGNoVXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzID0gZnVuY3Rpb24gKGN5LCBtb2RlKSB7XG4gIHZhciBzY3JhdGNoVXRpbGl0aWVzID0gcmVxdWlyZShcIi4vc2NyYXRjaFV0aWxpdGllc1wiKSgpO1xuXG4gIHZhciBzZWxmID0ge1xuICAgIHNldE1vZGU6IGZ1bmN0aW9uKG5ld21vZGUpIHtcbiAgICAgIGlmKG5ld21vZGUgPT0gbW9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBjb21wb3VuZHMgPSBjeS5ub2RlcygnJG5vZGUgPiBub2RlJyk7XG4gICAgICBcbiAgICAgIC8vIElmIHRoZSBuZXcgbW9kZSBpcyAnZnJlZScgc2V0IHRoZSBwYWRkaW5ncyB0byB0aGUgbWluaW11bXMgYmVmb3JlIHNldHRpbmcgdGhlIG1vZGUgaWYgbWluaW11bSBwYWRkaW5ncyBleGlzdHNcbiAgICAgIGlmIChuZXdtb2RlID09PSAnZnJlZScpIHtcbiAgICAgICAgY29tcG91bmRzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgIHZhciBtaW5QYWRkaW5ncyA9IHNlbGYuZ2V0TWluaW11bVBhZGRpbmdzKGVsZSk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKCFtaW5QYWRkaW5ncykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgbWluUGFkZGluZ3MudG9wKTtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScsIG1pblBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy1sZWZ0JywgbWluUGFkZGluZ3MubGVmdCk7XG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy1yaWdodCcsIG1pblBhZGRpbmdzLnJpZ2h0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIG1vZGUgPSBuZXdtb2RlOyAvLyBTZXQgdGhlIG5ldyBtb2RlXG4gICAgICBcbiAgICAgIC8vIElmIHRoZSBuZXcgbW9kZSBpcyAnbWluJyBzZXQgdGhlIG1pbmltdW0gYW5kIG1heGltdW0gcGFkZGluZ3MgYWZ0ZXIgc2V0dGluZyB0aGUgbmV3IG1vZGVcbiAgICAgIGlmIChuZXdtb2RlID09PSAnbWluJykge1xuICAgICAgICBjb21wb3VuZHMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgICAgdmFyIHBhZGRpbmdzID0ge1xuICAgICAgICAgICAgJ3RvcCc6IGVsZS5jc3MoJ3BhZGRpbmctdG9wJyksXG4gICAgICAgICAgICAnYm90dG9tJzogZWxlLmNzcygncGFkZGluZy1ib3R0b20nKSxcbiAgICAgICAgICAgICdsZWZ0JzogZWxlLmNzcygncGFkZGluZy1sZWZ0JyksXG4gICAgICAgICAgICAncmlnaHQnOiBlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JylcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgc2VsZi5zZXRFeHRyZW1lUGFkZGluZ3MoZWxlLCBwYWRkaW5ncywgJ21pbicsIHRydWUpO1xuICAgICAgICAgIHNlbGYuc2V0RXh0cmVtZVBhZGRpbmdzKGVsZSwgcGFkZGluZ3MsICdtYXgnLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBnZXRNb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtb2RlO1xuICAgIH0sXG4gICAgc2V0UGFkZGluZ3M6IGZ1bmN0aW9uIChub2RlcywgcGFkZGluZ3MpIHtcbiAgICAgIFxuICAgICAgaWYgKG1vZGUgIT09ICdtaW4nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY3kuc3RhcnRCYXRjaCgpO1xuXG4gICAgICBub2Rlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgdmFyIG1pblBhZGRpbmdzID0gc2VsZi5nZXRNaW5pbXVtUGFkZGluZ3MoZWxlKTtcbiAgICAgICAgdmFyIG1heFBhZGRpbmdzID0gc2VsZi5nZXRNYXhpbXVtUGFkZGluZ3MoZWxlKTtcblxuICAgICAgICBpZiAoIHBhZGRpbmdzLmxlZnQgPj0gbWluUGFkZGluZ3MubGVmdCAmJiBwYWRkaW5ncy5sZWZ0IDw9IG1heFBhZGRpbmdzLmxlZnQgKSB7XG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy1sZWZ0JywgcGFkZGluZ3MubGVmdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHBhZGRpbmdzLnJpZ2h0ID49IG1pblBhZGRpbmdzLnJpZ2h0ICYmIHBhZGRpbmdzLnJpZ2h0IDw9IG1heFBhZGRpbmdzLnJpZ2h0ICkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctcmlnaHQnLCBwYWRkaW5ncy5yaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHBhZGRpbmdzLnRvcCA+PSBtaW5QYWRkaW5ncy50b3AgJiYgcGFkZGluZ3MudG9wIDw9IG1heFBhZGRpbmdzLnRvcCApIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLXRvcCcsIHBhZGRpbmdzLnRvcCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHBhZGRpbmdzLmJvdHRvbSA+PSBtaW5QYWRkaW5ncy5ib3R0b20gJiYgcGFkZGluZ3MuYm90dG9tIDw9IG1heFBhZGRpbmdzLmJvdHRvbSApIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScsIHBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBjeS5lbmRCYXRjaCgpO1xuICAgIH0sXG4gICAgLy8gU2V0IGV4dHJlbWUgcGFkZGluZ3Mgb2YgdGhlIG5vZGVzIHVzZSBmb3JjZSBwYXJhbWV0ZXIgaWYgeW91IGRvIG5vdCBuZWVkIHRvIHNhdGlzZnkgJ21pblBhZGRpbmdzIDw9IG1heFBhZGRpbmdzJyBydWxlXG4gICAgc2V0RXh0cmVtZVBhZGRpbmdzOiBmdW5jdGlvbiAobm9kZXMsIF9wYWRkaW5ncywgbWluT3JNYXgsIGZvcmNlKSB7XG4gICAgICBpZiAobW9kZSAhPT0gJ21pbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjeS5zdGFydEJhdGNoKCk7XG5cbiAgICAgIG5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSBwYXJzZUZsb2F0KGVsZS5jc3MoJ3BhZGRpbmctbGVmdCcpKTtcbiAgICAgICAgdmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlRmxvYXQoZWxlLmNzcygncGFkZGluZy1yaWdodCcpKTtcbiAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUZsb2F0KGVsZS5jc3MoJ3BhZGRpbmctdG9wJykpO1xuICAgICAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlRmxvYXQoZWxlLmNzcygncGFkZGluZy1ib3R0b20nKSk7XG5cbiAgICAgICAgdmFyIG1pblBhZGRpbmdzID0gc2VsZi5nZXRNaW5pbXVtUGFkZGluZ3MoZWxlKTtcbiAgICAgICAgdmFyIG1heFBhZGRpbmdzID0gc2VsZi5nZXRNYXhpbXVtUGFkZGluZ3MoZWxlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEdldCB0aGUgZXh0cmVtZSBwYWRkaW5ncyB0byBzZXQgdGhlbVxuICAgICAgICB2YXIgZXh0cmVtZVBhZGRpbmdzID0gbWluT3JNYXggPT09ICdtaW4nID8gbWluUGFkZGluZ3MgOiBtYXhQYWRkaW5ncztcblxuICAgICAgICB2YXIgc2lnbiA9IG1pbk9yTWF4ID09PSAnbWluJyA/IDEgOiAtMTtcbiAgICAgICAgXG4gICAgICAgIC8vIENsb25lIF9wYWRkaW5ncyBpbnRvIHBhZGRpbmdzIG9iamVjdFxuICAgICAgICB2YXIgcGFkZGluZ3MgPSB7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyBGaWx0ZXIgcGFkZGluZ3MgZnJvbSBfcGFkZGluZ3Mgbm90ZSB0aGF0IHRoZSBydWxlIG9mICdtYXhQYWRkaW5ncyA+PSBtaW5QYWRkaW5ncycgc2hvdWxkIGJlIHNhdGlzZmllZFxuICAgICAgICBpZiAobWluT3JNYXggPT09ICdtaW4nKSB7XG4gICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBfcGFkZGluZ3MpIHtcbiAgICAgICAgICAgIGlmIChmb3JjZSB8fCBfcGFkZGluZ3NbcHJvcF0gPD0gbWF4UGFkZGluZ3NbcHJvcF0pIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3NbcHJvcF0gPSBfcGFkZGluZ3NbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG1pbk9yTWF4ID09PSAnbWF4Jykge1xuICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gX3BhZGRpbmdzKSB7XG4gICAgICAgICAgICBpZiAoZm9yY2UgfHwgX3BhZGRpbmdzW3Byb3BdID49IG1pblBhZGRpbmdzW3Byb3BdKSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzW3Byb3BdID0gX3BhZGRpbmdzW3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgZXh0cmVtZSBwYWRkaW5ncyB3aGVyZSBhcHBsaWNhYmxlXG4gICAgICAgIGlmIChwYWRkaW5ncy5sZWZ0KSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdMZWZ0ICogc2lnbiA8IHBhZGRpbmdzLmxlZnQgKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy1sZWZ0JywgcGFkZGluZ3MubGVmdCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLmxlZnQgPSBwYXJzZUZsb2F0KHBhZGRpbmdzLmxlZnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLnJpZ2h0KSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdSaWdodCAqIHNpZ24gPCBwYWRkaW5ncy5yaWdodCAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JywgcGFkZGluZ3MucmlnaHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV4dHJlbWVQYWRkaW5ncy5yaWdodCA9IHBhcnNlRmxvYXQocGFkZGluZ3MucmlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLnRvcCkge1xuICAgICAgICAgIGlmIChwYWRkaW5nVG9wICogc2lnbiA8IHBhZGRpbmdzLnRvcCAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLXRvcCcsIHBhZGRpbmdzLnRvcCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLnRvcCA9IHBhcnNlRmxvYXQocGFkZGluZ3MudG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy5ib3R0b20pIHtcbiAgICAgICAgICBpZiAocGFkZGluZ0JvdHRvbSAqIHNpZ24gPCBwYWRkaW5ncy5ib3R0b20gKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy1ib3R0b20nLCBwYWRkaW5ncy5ib3R0b20pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV4dHJlbWVQYWRkaW5ncy5ib3R0b20gPSBwYXJzZUZsb2F0KHBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjeS5lbmRCYXRjaCgpO1xuICAgIH0sXG4gICAgZ2V0TWluaW11bVBhZGRpbmdzOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgaWYgKG1vZGUgIT09ICdtaW4nKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgcGFkZGluZ3MgPSBzY3JhdGNoVXRpbGl0aWVzLmdldFNjcmF0Y2gobm9kZSkubWluUGFkZGluZ3M7XG4gICAgICBpZiAoIXBhZGRpbmdzKSB7XG4gICAgICAgIHBhZGRpbmdzID0gc2NyYXRjaFV0aWxpdGllcy5nZXRTY3JhdGNoKG5vZGUpLm1pblBhZGRpbmdzID0ge307XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFkZGluZ3M7XG4gICAgfSxcbiAgICBnZXRNYXhpbXVtUGFkZGluZ3M6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICBpZiAobW9kZSAhPT0gJ21pbicpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5tYXhQYWRkaW5ncztcbiAgICAgIGlmICghcGFkZGluZ3MpIHtcbiAgICAgICAgcGFkZGluZ3MgPSBzY3JhdGNoVXRpbGl0aWVzLmdldFNjcmF0Y2gobm9kZSkubWF4UGFkZGluZ3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWRkaW5ncztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzOyIsInZhciBlbGVtZW50VXRpbGl0aWVzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIC8vdGhpcyBtZXRob2QgcmV0dXJucyB0aGUgbm9kZXMgbm9uIG9mIHdob3NlIGFuY2VzdG9ycyBpcyBub3QgaW4gZ2l2ZW4gbm9kZXNcbiAgICBnZXRUb3BNb3N0Tm9kZXM6IGZ1bmN0aW9uIChub2Rlcykge1xuICAgICAgdmFyIG5vZGVzTWFwID0ge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5vZGVzTWFwW25vZGVzW2ldLmlkKCldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhciByb290cyA9IG5vZGVzLmZpbHRlcihmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbGUucGFyZW50KClbMF07XG4gICAgICAgIHdoaWxlIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChub2Rlc01hcFtwYXJlbnQuaWQoKV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudCgpWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByb290cztcbiAgICB9LFxuICAgIC8vIEdldCB0aGUgY29ybmVyIHBvc2l0aW9ucyBvZiB0aGUgbm9kZVxuICAgIGdldE91dGVyQ29ybmVyUG9zaXRpb25zOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgcG9zWCA9IG5vZGUucG9zaXRpb24oJ3gnKTtcbiAgICAgIHZhciBwb3NZID0gbm9kZS5wb3NpdGlvbigneScpO1xuICAgICAgdmFyIGhhbGZXaWR0aCA9IG5vZGUud2lkdGgoKSAvIDI7XG4gICAgICB2YXIgaGFsZkhlaWdodCA9IG5vZGUuaGVpZ2h0KCkgLyAyO1xuICAgICAgXG4gICAgICByZXR1cm4ge1xuICAgICAgICAndG9wJzogcG9zWSAtIGhhbGZIZWlnaHQsXG4gICAgICAgICdib3R0b20nOiBwb3NZICsgaGFsZkhlaWdodCxcbiAgICAgICAgJ2xlZnQnOiBwb3NYIC0gaGFsZldpZHRoLFxuICAgICAgICAncmlnaHQnOiBwb3NYICsgaGFsZldpZHRoXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZWxlbWVudFV0aWxpdGllczsiLCI7XG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBlbGVtZW50VXRpbGl0aWVzID0gcmVxdWlyZShcIi4vZWxlbWVudFV0aWxpdGllc1wiKSgpO1xuICB2YXIgY29tcG91bmRSZXNpemVVdGlsaXRpZXM7XG4gIHZhciBtb2RlO1xuICBcbiAgLy8gRXZlbnQgZnVuY3Rpb25zXG4gIHZhciB0YXBTdGFydEZjbiwgZHJhZ0ZjbiwgcmVzaXplU3RhcnRGY24sIHJlc2l6ZURyYWdGY247XG5cbiAgLy8gcmVnaXN0ZXJzIHRoZSBleHRlbnNpb24gb24gYSBjeXRvc2NhcGUgbGliIHJlZlxuICB2YXIgcmVnaXN0ZXIgPSBmdW5jdGlvbiAoY3l0b3NjYXBlKSB7XG5cbiAgICBpZiAoIWN5dG9zY2FwZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gY2FuJ3QgcmVnaXN0ZXIgaWYgY3l0b3NjYXBlIHVuc3BlY2lmaWVkXG5cbiAgICB2YXIgdW5iaW5kRXZlbnRzID0gZnVuY3Rpb24gKGN5KSB7XG4gICAgICBjeS5vZmYoJ25vZGUnLCB0YXBTdGFydEZjbik7XG4gICAgICBjeS5vZmYoZHJhZ0Zjbik7XG4gICAgICBjeS5vZmYocmVzaXplU3RhcnRGY24pO1xuICAgICAgY3kub2ZmKHJlc2l6ZURyYWdGY24pO1xuICAgIH07XG5cbiAgICB2YXIgYmluZEV2ZW50cyA9IGZ1bmN0aW9uIChjeSkge1xuICAgICAgdmFyIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucztcbiAgICAgIHZhciBlZmZlY3RlZE5vZGVzO1xuICAgICAgdmFyIGFuY2VzdG9yTWFwO1xuXG4gICAgICAvLyBGaWxsIHRoZSBkYXRhIG9mIGVsZW1lbnRzIHdoaWNoIHdpbGwgYmUgYWZmZWN0ZWQgYnkgdGhlIHJlc3Bvc2l0aW9uaW5nIFxuICAgICAgdmFyIGZpbGxFZmZlY3RlZERhdGEgPSBmdW5jdGlvbiAoZmlsbEFuY2VzdG9yc01hcCkge1xuICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMgPSBbXTtcblxuICAgICAgICBpZiAoZmlsbEFuY2VzdG9yc01hcCkge1xuICAgICAgICAgIGFuY2VzdG9yTWFwID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBlZmZlY3RlZE5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgIHZhciBjb3JuZXJzID0gW107IC8vIEl0IHdpbGwgYmUgdXNlZCBsaWtlIGEgcXVldWVcbiAgICAgICAgICB2YXIgY3VycmVudEFuY2VzdG9yID0gZWxlLnBhcmVudCgpWzBdO1xuXG4gICAgICAgICAgd2hpbGUgKGN1cnJlbnRBbmNlc3Rvcikge1xuICAgICAgICAgICAgdmFyIGlkID0gY3VycmVudEFuY2VzdG9yLmlkKCk7XG5cbiAgICAgICAgICAgIHZhciBjb3JuZXIgPSBlbGVtZW50VXRpbGl0aWVzLmdldE91dGVyQ29ybmVyUG9zaXRpb25zKGN1cnJlbnRBbmNlc3Rvcik7XG4gICAgICAgICAgICBjb3JuZXIuaWQgPSBpZDtcblxuICAgICAgICAgICAgY29ybmVycy5wdXNoKGNvcm5lcik7XG5cbiAgICAgICAgICAgIGlmIChmaWxsQW5jZXN0b3JzTWFwICYmICFhbmNlc3Rvck1hcFtpZF0pIHtcbiAgICAgICAgICAgICAgYW5jZXN0b3JNYXBbaWRdID0gY3VycmVudEFuY2VzdG9yO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50QW5jZXN0b3IgPSBjdXJyZW50QW5jZXN0b3IucGFyZW50KClbMF07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYW5jZXN0b3JzQ29ybmVyUG9zaXRpb25zLnB1c2goY29ybmVycyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBwYWRkaW5ncyBhY2NvcmRpbmcgdG8gdGhlIG1vdmVtZW50XG4gICAgICB2YXIgdXBkYXRlUGFkZGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIEtlZXBzIHRoZSBhbHJlYWR5IHByb2Nlc3NlZCBhbmNlc3RvcnNcbiAgICAgICAgdmFyIHByb2Nlc3NlZEFuY2VzdG9ycyA9IHt9O1xuXG4gICAgICAgIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50LCBpbmRleCwgYXJyYXkpIHtcbiAgICAgICAgICB2YXIgY29ybmVyc1F1ZXVlID0gZWxlbWVudDtcbiAgICAgICAgICB3aGlsZSAoY29ybmVyc1F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBvbGRDb3JuZXJzID0gY29ybmVyc1F1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzZWRBbmNlc3RvcnNbY29ybmVyc1F1ZXVlLmlkXSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvY2Vzc2VkQW5jZXN0b3JzW29sZENvcm5lcnMuaWRdID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBhbmNlc3RvciA9IGFuY2VzdG9yTWFwW29sZENvcm5lcnMuaWRdO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb3JuZXJzID0gZWxlbWVudFV0aWxpdGllcy5nZXRPdXRlckNvcm5lclBvc2l0aW9ucyhhbmNlc3Rvcik7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50Q29ybmVycy50b3AgPT09IG9sZENvcm5lcnMudG9wICYmIGN1cnJlbnRDb3JuZXJzLmJvdHRvbSA9PT0gb2xkQ29ybmVycy5ib3R0b21cbiAgICAgICAgICAgICAgICAgICAgJiYgY3VycmVudENvcm5lcnMubGVmdCA9PT0gb2xkQ29ybmVycy5sZWZ0ICYmIGN1cnJlbnRDb3JuZXJzLnJpZ2h0ID09PSBvbGRDb3JuZXJzLnJpZ2h0KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcGFkZGluZ1RvcCwgcGFkZGluZ0JvdHRvbSwgcGFkZGluZ0xlZnQsIHBhZGRpbmdSaWdodDtcblxuICAgICAgICAgICAgdmFyIHRvcERpZmYgPSBjdXJyZW50Q29ybmVycy50b3AgLSBvbGRDb3JuZXJzLnRvcDtcblxuICAgICAgICAgICAgaWYgKHRvcERpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUZsb2F0KGFuY2VzdG9yLmNzcygncGFkZGluZy10b3AnKSk7XG4gICAgICAgICAgICAgIHBhZGRpbmdUb3AgPSBjdXJyZW50UGFkZGluZyArIHRvcERpZmY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBib3R0b21EaWZmID0gY3VycmVudENvcm5lcnMuYm90dG9tIC0gb2xkQ29ybmVycy5ib3R0b207XG5cbiAgICAgICAgICAgIGlmIChib3R0b21EaWZmICE9IDApIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWRkaW5nID0gcGFyc2VGbG9hdChhbmNlc3Rvci5jc3MoJ3BhZGRpbmctYm90dG9tJykpO1xuICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tID0gY3VycmVudFBhZGRpbmcgLSBib3R0b21EaWZmO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbGVmdERpZmYgPSBjdXJyZW50Q29ybmVycy5sZWZ0IC0gb2xkQ29ybmVycy5sZWZ0O1xuXG4gICAgICAgICAgICBpZiAobGVmdERpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUZsb2F0KGFuY2VzdG9yLmNzcygncGFkZGluZy1sZWZ0JykpO1xuICAgICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGN1cnJlbnRQYWRkaW5nICsgbGVmdERpZmY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByaWdodERpZmYgPSBjdXJyZW50Q29ybmVycy5yaWdodCAtIG9sZENvcm5lcnMucmlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChyaWdodERpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUZsb2F0KGFuY2VzdG9yLmNzcygncGFkZGluZy1yaWdodCcpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0ID0gY3VycmVudFBhZGRpbmcgLSByaWdodERpZmY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcGFkZGluZ1RvcCAmJiAhcGFkZGluZ0JvdHRvbSAmJiAhcGFkZGluZ0xlZnQgJiYgIXBhZGRpbmdSaWdodCkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBhZGRpbmdzID0ge307XG5cbiAgICAgICAgICAgIGlmIChwYWRkaW5nVG9wKSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLnRvcCA9IHBhZGRpbmdUb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYWRkaW5nQm90dG9tKSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLmJvdHRvbSA9IHBhZGRpbmdCb3R0b207XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYWRkaW5nTGVmdCkge1xuICAgICAgICAgICAgICBwYWRkaW5ncy5sZWZ0ID0gcGFkZGluZ0xlZnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYWRkaW5nUmlnaHQpIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MucmlnaHQgPSBwYWRkaW5nUmlnaHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzLnNldFBhZGRpbmdzKGFuY2VzdG9yLCBwYWRkaW5ncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGN5Lm9uKCd0YXBzdGFydCcsICdub2RlJywgdGFwU3RhcnRGY24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKCBtb2RlICE9PSAnbWluJyApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBub2RlID0gdGhpcztcblxuICAgICAgICBpZiAobm9kZS5zZWxlY3RlZCgpKSB7XG4gICAgICAgICAgZWZmZWN0ZWROb2RlcyA9IGN5LmNvbGxlY3Rpb24oKS5hZGQobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZWZmZWN0ZWROb2RlcyA9IGN5Lm5vZGVzKCc6c2VsZWN0ZWQnKS5kaWZmZXJlbmNlKG5vZGUuYW5jZXN0b3JzKCkpLnVuaW9uKG5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgY2FyZSBhYm91dCB0aGUgbW92ZW1lbnQgb2YgdG9wIG1vc3Qgbm9kZXNcbiAgICAgICAgZWZmZWN0ZWROb2RlcyA9IGVsZW1lbnRVdGlsaXRpZXMuZ2V0VG9wTW9zdE5vZGVzKGVmZmVjdGVkTm9kZXMpO1xuXG4gICAgICAgIGZpbGxFZmZlY3RlZERhdGEodHJ1ZSk7XG4gICAgICB9KTtcblxuICAgICAgY3kub24oJ2RyYWcnLCAnbm9kZScsIGRyYWdGY24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmKCBtb2RlICE9PSAnbWluJyApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHVwZGF0ZVBhZGRpbmdzKCk7XG4gICAgICAgIGZpbGxFZmZlY3RlZERhdGEoZmFsc2UpO1xuICAgICAgfSk7XG5cbiAgICAgIGN5Lm9uKCdyZXNpemVzdGFydCcsIHJlc2l6ZVN0YXJ0RmNuID0gZnVuY3Rpb24gKGUsIHR5cGUsIG5vZGVzKSB7XG4gICAgICAgIGlmKCBtb2RlICE9PSAnbWluJyApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGVmZmVjdGVkTm9kZXMgPSBub2RlcztcbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBjeS5vbigncmVzaXplZHJhZycsIHJlc2l6ZURyYWdGY24gPSBmdW5jdGlvbiAoZSwgdHlwZSwgbm9kZXMpIHtcbiAgICAgICAgaWYoIG1vZGUgIT09ICdtaW4nICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdXBkYXRlUGFkZGluZ3MoKTtcbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YShmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY3l0b3NjYXBlKCdjb3JlJywgJ2NvbXBvdW5kUmVzaXplJywgZnVuY3Rpb24gKF9tb2RlKSB7XG4gICAgICB2YXIgY3kgPSB0aGlzO1xuICAgICAgXG4gICAgICBpZiAoX21vZGUgPT09ICdkZXN0cm95Jykge1xuICAgICAgICB1bmJpbmRFdmVudHMoY3kpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCBfbW9kZSAhPSAnZ2V0JyApIHtcbiAgICAgICAgY29tcG91bmRSZXNpemVVdGlsaXRpZXMgPSByZXF1aXJlKCcuL2NvbXBvdW5kUmVzaXplVXRpbGl0aWVzJykoY3kpO1xuICAgICAgICBtb2RlID0gX21vZGU7XG4gICAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzLnNldE1vZGUobW9kZSk7XG4gICAgICAgIGJpbmRFdmVudHMoY3kpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29tcG91bmRSZXNpemVVdGlsaXRpZXM7IC8vIFByb3ZpZGUgQVBJXG4gICAgfSk7XG5cbiAgfTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHsgLy8gZXhwb3NlIGFzIGEgY29tbW9uanMgbW9kdWxlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSByZWdpc3RlcjtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJyAmJiBkZWZpbmUuYW1kKSB7IC8vIGV4cG9zZSBhcyBhbiBhbWQvcmVxdWlyZWpzIG1vZHVsZVxuICAgIGRlZmluZSgnY3l0b3NjYXBlLWNvbXBvdW5kLXJlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiByZWdpc3RlcjtcbiAgICB9KTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgY3l0b3NjYXBlICE9PSAndW5kZWZpbmVkJykgeyAvLyBleHBvc2UgdG8gZ2xvYmFsIGN5dG9zY2FwZSAoaS5lLiB3aW5kb3cuY3l0b3NjYXBlKVxuICAgIHJlZ2lzdGVyKGN5dG9zY2FwZSk7XG4gIH1cblxufSkoKTtcbiIsInZhciBzY3JhdGNoVXRpbGl0aWVzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIGdldFNjcmF0Y2g6IGZ1bmN0aW9uIChjeU9yRWxlKSB7XG4gICAgICBpZiAoIWN5T3JFbGUuc2NyYXRjaCgnX2NvbXBvdW5kUmVzaXplJykpIHtcbiAgICAgICAgY3lPckVsZS5zY3JhdGNoKCdfY29tcG91bmRSZXNpemUnLCB7fSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3lPckVsZS5zY3JhdGNoKCdfY29tcG91bmRSZXNpemUnKTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNjcmF0Y2hVdGlsaXRpZXM7Il19
