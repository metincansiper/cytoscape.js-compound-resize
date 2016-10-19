(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cytoscapeCompoundResize = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var compoundResizeUtilities = function (cy, mode) {
  var scratchUtilities = _dereq_("./scratchUtilities")();

  var self = {
    setMode: function(newmode) {
      if(newmode == mode) {
        return;
      }
      
      var compounds = cy.nodes('$node > node');
      
      // If the new mode is 'free' set the paddings to the minimums before setting the mode
      if (newmode === 'free') {
        compounds.each(function (i, ele) {
          var minPaddings = self.getMinimumPaddings(ele);

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
    getCornerPositions: function(node) {
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

            var corner = elementUtilities.getCornerPositions(currentAncestor);
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
            var currentCorners = elementUtilities.getCornerPositions(ancestor);

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG91bmRSZXNpemVVdGlsaXRpZXMuanMiLCJzcmMvZWxlbWVudFV0aWxpdGllcy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zY3JhdGNoVXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBjb21wb3VuZFJlc2l6ZVV0aWxpdGllcyA9IGZ1bmN0aW9uIChjeSwgbW9kZSkge1xuICB2YXIgc2NyYXRjaFV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3NjcmF0Y2hVdGlsaXRpZXNcIikoKTtcblxuICB2YXIgc2VsZiA9IHtcbiAgICBzZXRNb2RlOiBmdW5jdGlvbihuZXdtb2RlKSB7XG4gICAgICBpZihuZXdtb2RlID09IG1vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgY29tcG91bmRzID0gY3kubm9kZXMoJyRub2RlID4gbm9kZScpO1xuICAgICAgXG4gICAgICAvLyBJZiB0aGUgbmV3IG1vZGUgaXMgJ2ZyZWUnIHNldCB0aGUgcGFkZGluZ3MgdG8gdGhlIG1pbmltdW1zIGJlZm9yZSBzZXR0aW5nIHRoZSBtb2RlXG4gICAgICBpZiAobmV3bW9kZSA9PT0gJ2ZyZWUnKSB7XG4gICAgICAgIGNvbXBvdW5kcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgICB2YXIgbWluUGFkZGluZ3MgPSBzZWxmLmdldE1pbmltdW1QYWRkaW5ncyhlbGUpO1xuXG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy10b3AnLCBtaW5QYWRkaW5ncy50b3ApO1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctYm90dG9tJywgbWluUGFkZGluZ3MuYm90dG9tKTtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnLCBtaW5QYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JywgbWluUGFkZGluZ3MucmlnaHQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgbW9kZSA9IG5ld21vZGU7IC8vIFNldCB0aGUgbmV3IG1vZGVcbiAgICAgIFxuICAgICAgLy8gSWYgdGhlIG5ldyBtb2RlIGlzICdtaW4nIHNldCB0aGUgbWluaW11bSBhbmQgbWF4aW11bSBwYWRkaW5ncyBhZnRlciBzZXR0aW5nIHRoZSBuZXcgbW9kZVxuICAgICAgaWYgKG5ld21vZGUgPT09ICdtaW4nKSB7XG4gICAgICAgIGNvbXBvdW5kcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgICB2YXIgcGFkZGluZ3MgPSB7XG4gICAgICAgICAgICAndG9wJzogZWxlLmNzcygncGFkZGluZy10b3AnKSxcbiAgICAgICAgICAgICdib3R0b20nOiBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScpLFxuICAgICAgICAgICAgJ2xlZnQnOiBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnKSxcbiAgICAgICAgICAgICdyaWdodCc6IGVsZS5jc3MoJ3BhZGRpbmctcmlnaHQnKVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBzZWxmLnNldEV4dHJlbWVQYWRkaW5ncyhlbGUsIHBhZGRpbmdzLCAnbWluJywgdHJ1ZSk7XG4gICAgICAgICAgc2VsZi5zZXRFeHRyZW1lUGFkZGluZ3MoZWxlLCBwYWRkaW5ncywgJ21heCcsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGdldE1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG1vZGU7XG4gICAgfSxcbiAgICBzZXRQYWRkaW5nczogZnVuY3Rpb24gKG5vZGVzLCBwYWRkaW5ncykge1xuICAgICAgXG4gICAgICBpZiAobW9kZSAhPT0gJ21pbicpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjeS5zdGFydEJhdGNoKCk7XG5cbiAgICAgIG5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICB2YXIgbWluUGFkZGluZ3MgPSBzZWxmLmdldE1pbmltdW1QYWRkaW5ncyhlbGUpO1xuICAgICAgICB2YXIgbWF4UGFkZGluZ3MgPSBzZWxmLmdldE1heGltdW1QYWRkaW5ncyhlbGUpO1xuXG4gICAgICAgIGlmICggcGFkZGluZ3MubGVmdCA+PSBtaW5QYWRkaW5ncy5sZWZ0ICYmIHBhZGRpbmdzLmxlZnQgPD0gbWF4UGFkZGluZ3MubGVmdCApIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnLCBwYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcGFkZGluZ3MucmlnaHQgPj0gbWluUGFkZGluZ3MucmlnaHQgJiYgcGFkZGluZ3MucmlnaHQgPD0gbWF4UGFkZGluZ3MucmlnaHQgKSB7XG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy1yaWdodCcsIHBhZGRpbmdzLnJpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcGFkZGluZ3MudG9wID49IG1pblBhZGRpbmdzLnRvcCAmJiBwYWRkaW5ncy50b3AgPD0gbWF4UGFkZGluZ3MudG9wICkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgcGFkZGluZ3MudG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcGFkZGluZ3MuYm90dG9tID49IG1pblBhZGRpbmdzLmJvdHRvbSAmJiBwYWRkaW5ncy5ib3R0b20gPD0gbWF4UGFkZGluZ3MuYm90dG9tICkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctYm90dG9tJywgcGFkZGluZ3MuYm90dG9tKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGN5LmVuZEJhdGNoKCk7XG4gICAgfSxcbiAgICAvLyBTZXQgZXh0cmVtZSBwYWRkaW5ncyBvZiB0aGUgbm9kZXMgdXNlIGZvcmNlIHBhcmFtZXRlciBpZiB5b3UgZG8gbm90IG5lZWQgdG8gc2F0aXNmeSAnbWluUGFkZGluZ3MgPD0gbWF4UGFkZGluZ3MnIHJ1bGVcbiAgICBzZXRFeHRyZW1lUGFkZGluZ3M6IGZ1bmN0aW9uIChub2RlcywgX3BhZGRpbmdzLCBtaW5Pck1heCwgZm9yY2UpIHtcbiAgICAgIGlmIChtb2RlICE9PSAnbWluJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIGN5LnN0YXJ0QmF0Y2goKTtcblxuICAgICAgbm9kZXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlRmxvYXQoZWxlLmNzcygncGFkZGluZy1sZWZ0JykpO1xuICAgICAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VGbG9hdChlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JykpO1xuICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlRmxvYXQoZWxlLmNzcygncGFkZGluZy10b3AnKSk7XG4gICAgICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VGbG9hdChlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScpKTtcblxuICAgICAgICB2YXIgbWluUGFkZGluZ3MgPSBzZWxmLmdldE1pbmltdW1QYWRkaW5ncyhlbGUpO1xuICAgICAgICB2YXIgbWF4UGFkZGluZ3MgPSBzZWxmLmdldE1heGltdW1QYWRkaW5ncyhlbGUpO1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0IHRoZSBleHRyZW1lIHBhZGRpbmdzIHRvIHNldCB0aGVtXG4gICAgICAgIHZhciBleHRyZW1lUGFkZGluZ3MgPSBtaW5Pck1heCA9PT0gJ21pbicgPyBtaW5QYWRkaW5ncyA6IG1heFBhZGRpbmdzO1xuXG4gICAgICAgIHZhciBzaWduID0gbWluT3JNYXggPT09ICdtaW4nID8gMSA6IC0xO1xuICAgICAgICBcbiAgICAgICAgLy8gQ2xvbmUgX3BhZGRpbmdzIGludG8gcGFkZGluZ3Mgb2JqZWN0XG4gICAgICAgIHZhciBwYWRkaW5ncyA9IHtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZpbHRlciBwYWRkaW5ncyBmcm9tIF9wYWRkaW5ncyBub3RlIHRoYXQgdGhlIHJ1bGUgb2YgJ21heFBhZGRpbmdzID49IG1pblBhZGRpbmdzJyBzaG91bGQgYmUgc2F0aXNmaWVkXG4gICAgICAgIGlmIChtaW5Pck1heCA9PT0gJ21pbicpIHtcbiAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIF9wYWRkaW5ncykge1xuICAgICAgICAgICAgaWYgKGZvcmNlIHx8IF9wYWRkaW5nc1twcm9wXSA8PSBtYXhQYWRkaW5nc1twcm9wXSkge1xuICAgICAgICAgICAgICBwYWRkaW5nc1twcm9wXSA9IF9wYWRkaW5nc1twcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobWluT3JNYXggPT09ICdtYXgnKSB7XG4gICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBfcGFkZGluZ3MpIHtcbiAgICAgICAgICAgIGlmIChmb3JjZSB8fCBfcGFkZGluZ3NbcHJvcF0gPj0gbWluUGFkZGluZ3NbcHJvcF0pIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3NbcHJvcF0gPSBfcGFkZGluZ3NbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSBleHRyZW1lIHBhZGRpbmdzIHdoZXJlIGFwcGxpY2FibGVcbiAgICAgICAgaWYgKHBhZGRpbmdzLmxlZnQpIHtcbiAgICAgICAgICBpZiAocGFkZGluZ0xlZnQgKiBzaWduIDwgcGFkZGluZ3MubGVmdCAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnLCBwYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MubGVmdCA9IHBhcnNlRmxvYXQocGFkZGluZ3MubGVmdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MucmlnaHQpIHtcbiAgICAgICAgICBpZiAocGFkZGluZ1JpZ2h0ICogc2lnbiA8IHBhZGRpbmdzLnJpZ2h0ICogc2lnbikge1xuICAgICAgICAgICAgLy8gUGFkZGluZ3MgY2Fubm90IGJlIHNtYWxsZXIgdGhlbiBtaW4gcGFkZGluZ3MgYW5kIGNhbm5vdCBiZSBiaWdnZXIgdGhlbiBtYXggcGFkZGluZ3NcbiAgICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctcmlnaHQnLCBwYWRkaW5ncy5yaWdodCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLnJpZ2h0ID0gcGFyc2VGbG9hdChwYWRkaW5ncy5yaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MudG9wKSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdUb3AgKiBzaWduIDwgcGFkZGluZ3MudG9wICogc2lnbikge1xuICAgICAgICAgICAgLy8gUGFkZGluZ3MgY2Fubm90IGJlIHNtYWxsZXIgdGhlbiBtaW4gcGFkZGluZ3MgYW5kIGNhbm5vdCBiZSBiaWdnZXIgdGhlbiBtYXggcGFkZGluZ3NcbiAgICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgcGFkZGluZ3MudG9wKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MudG9wID0gcGFyc2VGbG9hdChwYWRkaW5ncy50b3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLmJvdHRvbSkge1xuICAgICAgICAgIGlmIChwYWRkaW5nQm90dG9tICogc2lnbiA8IHBhZGRpbmdzLmJvdHRvbSAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScsIHBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLmJvdHRvbSA9IHBhcnNlRmxvYXQocGFkZGluZ3MuYm90dG9tKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGN5LmVuZEJhdGNoKCk7XG4gICAgfSxcbiAgICBnZXRNaW5pbXVtUGFkZGluZ3M6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICBpZiAobW9kZSAhPT0gJ21pbicpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5taW5QYWRkaW5ncztcbiAgICAgIGlmICghcGFkZGluZ3MpIHtcbiAgICAgICAgcGFkZGluZ3MgPSBzY3JhdGNoVXRpbGl0aWVzLmdldFNjcmF0Y2gobm9kZSkubWluUGFkZGluZ3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWRkaW5ncztcbiAgICB9LFxuICAgIGdldE1heGltdW1QYWRkaW5nczogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGlmIChtb2RlICE9PSAnbWluJykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdmFyIHBhZGRpbmdzID0gc2NyYXRjaFV0aWxpdGllcy5nZXRTY3JhdGNoKG5vZGUpLm1heFBhZGRpbmdzO1xuICAgICAgaWYgKCFwYWRkaW5ncykge1xuICAgICAgICBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5tYXhQYWRkaW5ncyA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhZGRpbmdzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gc2VsZjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY29tcG91bmRSZXNpemVVdGlsaXRpZXM7IiwidmFyIGVsZW1lbnRVdGlsaXRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgLy90aGlzIG1ldGhvZCByZXR1cm5zIHRoZSBub2RlcyBub24gb2Ygd2hvc2UgYW5jZXN0b3JzIGlzIG5vdCBpbiBnaXZlbiBub2Rlc1xuICAgIGdldFRvcE1vc3ROb2RlczogZnVuY3Rpb24gKG5vZGVzKSB7XG4gICAgICB2YXIgbm9kZXNNYXAgPSB7fTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm9kZXNNYXBbbm9kZXNbaV0uaWQoKV0gPSB0cnVlO1xuICAgICAgfVxuICAgICAgdmFyIHJvb3RzID0gbm9kZXMuZmlsdGVyKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZS5wYXJlbnQoKVswXTtcbiAgICAgICAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKG5vZGVzTWFwW3BhcmVudC5pZCgpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50KClbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJvb3RzO1xuICAgIH0sXG4gICAgLy8gR2V0IHRoZSBjb3JuZXIgcG9zaXRpb25zIG9mIHRoZSBub2RlXG4gICAgZ2V0Q29ybmVyUG9zaXRpb25zOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgcG9zWCA9IG5vZGUucG9zaXRpb24oJ3gnKTtcbiAgICAgIHZhciBwb3NZID0gbm9kZS5wb3NpdGlvbigneScpO1xuICAgICAgdmFyIGhhbGZXaWR0aCA9IG5vZGUud2lkdGgoKSAvIDI7XG4gICAgICB2YXIgaGFsZkhlaWdodCA9IG5vZGUuaGVpZ2h0KCkgLyAyO1xuICAgICAgXG4gICAgICByZXR1cm4ge1xuICAgICAgICAndG9wJzogcG9zWSAtIGhhbGZIZWlnaHQsXG4gICAgICAgICdib3R0b20nOiBwb3NZICsgaGFsZkhlaWdodCxcbiAgICAgICAgJ2xlZnQnOiBwb3NYIC0gaGFsZldpZHRoLFxuICAgICAgICAncmlnaHQnOiBwb3NYICsgaGFsZldpZHRoXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZWxlbWVudFV0aWxpdGllczsiLCI7XG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBlbGVtZW50VXRpbGl0aWVzID0gcmVxdWlyZShcIi4vZWxlbWVudFV0aWxpdGllc1wiKSgpO1xuICB2YXIgY29tcG91bmRSZXNpemVVdGlsaXRpZXM7XG4gIHZhciBtb2RlO1xuICBcbiAgLy8gRXZlbnQgZnVuY3Rpb25zXG4gIHZhciB0YXBTdGFydEZjbiwgZHJhZ0ZjbiwgcmVzaXplU3RhcnRGY24sIHJlc2l6ZURyYWdGY247XG5cbiAgLy8gcmVnaXN0ZXJzIHRoZSBleHRlbnNpb24gb24gYSBjeXRvc2NhcGUgbGliIHJlZlxuICB2YXIgcmVnaXN0ZXIgPSBmdW5jdGlvbiAoY3l0b3NjYXBlKSB7XG5cbiAgICBpZiAoIWN5dG9zY2FwZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gY2FuJ3QgcmVnaXN0ZXIgaWYgY3l0b3NjYXBlIHVuc3BlY2lmaWVkXG5cbiAgICB2YXIgdW5iaW5kRXZlbnRzID0gZnVuY3Rpb24gKGN5KSB7XG4gICAgICBjeS5vZmYoJ25vZGUnLCB0YXBTdGFydEZjbik7XG4gICAgICBjeS5vZmYoZHJhZ0Zjbik7XG4gICAgICBjeS5vZmYocmVzaXplU3RhcnRGY24pO1xuICAgICAgY3kub2ZmKHJlc2l6ZURyYWdGY24pO1xuICAgIH07XG5cbiAgICB2YXIgYmluZEV2ZW50cyA9IGZ1bmN0aW9uIChjeSkge1xuICAgICAgdmFyIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucztcbiAgICAgIHZhciBlZmZlY3RlZE5vZGVzO1xuICAgICAgdmFyIGFuY2VzdG9yTWFwO1xuXG4gICAgICAvLyBGaWxsIHRoZSBkYXRhIG9mIGVsZW1lbnRzIHdoaWNoIHdpbGwgYmUgYWZmZWN0ZWQgYnkgdGhlIHJlc3Bvc2l0aW9uaW5nIFxuICAgICAgdmFyIGZpbGxFZmZlY3RlZERhdGEgPSBmdW5jdGlvbiAoZmlsbEFuY2VzdG9yc01hcCkge1xuICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMgPSBbXTtcblxuICAgICAgICBpZiAoZmlsbEFuY2VzdG9yc01hcCkge1xuICAgICAgICAgIGFuY2VzdG9yTWFwID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBlZmZlY3RlZE5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgIHZhciBjb3JuZXJzID0gW107IC8vIEl0IHdpbGwgYmUgdXNlZCBsaWtlIGEgcXVldWVcbiAgICAgICAgICB2YXIgY3VycmVudEFuY2VzdG9yID0gZWxlLnBhcmVudCgpWzBdO1xuXG4gICAgICAgICAgd2hpbGUgKGN1cnJlbnRBbmNlc3Rvcikge1xuICAgICAgICAgICAgdmFyIGlkID0gY3VycmVudEFuY2VzdG9yLmlkKCk7XG5cbiAgICAgICAgICAgIHZhciBjb3JuZXIgPSBlbGVtZW50VXRpbGl0aWVzLmdldENvcm5lclBvc2l0aW9ucyhjdXJyZW50QW5jZXN0b3IpO1xuICAgICAgICAgICAgY29ybmVyLmlkID0gaWQ7XG5cbiAgICAgICAgICAgIGNvcm5lcnMucHVzaChjb3JuZXIpO1xuXG4gICAgICAgICAgICBpZiAoZmlsbEFuY2VzdG9yc01hcCAmJiAhYW5jZXN0b3JNYXBbaWRdKSB7XG4gICAgICAgICAgICAgIGFuY2VzdG9yTWFwW2lkXSA9IGN1cnJlbnRBbmNlc3RvcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY3VycmVudEFuY2VzdG9yID0gY3VycmVudEFuY2VzdG9yLnBhcmVudCgpWzBdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucy5wdXNoKGNvcm5lcnMpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgcGFkZGluZ3MgYWNjb3JkaW5nIHRvIHRoZSBtb3ZlbWVudFxuICAgICAgdmFyIHVwZGF0ZVBhZGRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBLZWVwcyB0aGUgYWxyZWFkeSBwcm9jZXNzZWQgYW5jZXN0b3JzXG4gICAgICAgIHZhciBwcm9jZXNzZWRBbmNlc3RvcnMgPSB7fTtcblxuICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCwgaW5kZXgsIGFycmF5KSB7XG4gICAgICAgICAgdmFyIGNvcm5lcnNRdWV1ZSA9IGVsZW1lbnQ7XG4gICAgICAgICAgd2hpbGUgKGNvcm5lcnNRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ29ybmVycyA9IGNvcm5lcnNRdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgICAgICBpZiAocHJvY2Vzc2VkQW5jZXN0b3JzW2Nvcm5lcnNRdWV1ZS5pZF0pIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb2Nlc3NlZEFuY2VzdG9yc1tvbGRDb3JuZXJzLmlkXSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgYW5jZXN0b3IgPSBhbmNlc3Rvck1hcFtvbGRDb3JuZXJzLmlkXTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29ybmVycyA9IGVsZW1lbnRVdGlsaXRpZXMuZ2V0Q29ybmVyUG9zaXRpb25zKGFuY2VzdG9yKTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRDb3JuZXJzLnRvcCA9PT0gb2xkQ29ybmVycy50b3AgJiYgY3VycmVudENvcm5lcnMuYm90dG9tID09PSBvbGRDb3JuZXJzLmJvdHRvbVxuICAgICAgICAgICAgICAgICAgICAmJiBjdXJyZW50Q29ybmVycy5sZWZ0ID09PSBvbGRDb3JuZXJzLmxlZnQgJiYgY3VycmVudENvcm5lcnMucmlnaHQgPT09IG9sZENvcm5lcnMucmlnaHQpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wLCBwYWRkaW5nQm90dG9tLCBwYWRkaW5nTGVmdCwgcGFkZGluZ1JpZ2h0O1xuXG4gICAgICAgICAgICB2YXIgdG9wRGlmZiA9IGN1cnJlbnRDb3JuZXJzLnRvcCAtIG9sZENvcm5lcnMudG9wO1xuXG4gICAgICAgICAgICBpZiAodG9wRGlmZiAhPSAwKSB7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50UGFkZGluZyA9IHBhcnNlRmxvYXQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLXRvcCcpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ1RvcCA9IGN1cnJlbnRQYWRkaW5nICsgdG9wRGlmZjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGJvdHRvbURpZmYgPSBjdXJyZW50Q29ybmVycy5ib3R0b20gLSBvbGRDb3JuZXJzLmJvdHRvbTtcblxuICAgICAgICAgICAgaWYgKGJvdHRvbURpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUZsb2F0KGFuY2VzdG9yLmNzcygncGFkZGluZy1ib3R0b20nKSk7XG4gICAgICAgICAgICAgIHBhZGRpbmdCb3R0b20gPSBjdXJyZW50UGFkZGluZyAtIGJvdHRvbURpZmY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBsZWZ0RGlmZiA9IGN1cnJlbnRDb3JuZXJzLmxlZnQgLSBvbGRDb3JuZXJzLmxlZnQ7XG5cbiAgICAgICAgICAgIGlmIChsZWZ0RGlmZiAhPSAwKSB7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50UGFkZGluZyA9IHBhcnNlRmxvYXQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLWxlZnQnKSk7XG4gICAgICAgICAgICAgIHBhZGRpbmdMZWZ0ID0gY3VycmVudFBhZGRpbmcgKyBsZWZ0RGlmZjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJpZ2h0RGlmZiA9IGN1cnJlbnRDb3JuZXJzLnJpZ2h0IC0gb2xkQ29ybmVycy5yaWdodDtcblxuICAgICAgICAgICAgaWYgKHJpZ2h0RGlmZiAhPSAwKSB7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50UGFkZGluZyA9IHBhcnNlRmxvYXQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLXJpZ2h0JykpO1xuICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQgPSBjdXJyZW50UGFkZGluZyAtIHJpZ2h0RGlmZjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFwYWRkaW5nVG9wICYmICFwYWRkaW5nQm90dG9tICYmICFwYWRkaW5nTGVmdCAmJiAhcGFkZGluZ1JpZ2h0KSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcGFkZGluZ3MgPSB7fTtcblxuICAgICAgICAgICAgaWYgKHBhZGRpbmdUb3ApIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MudG9wID0gcGFkZGluZ1RvcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBhZGRpbmdCb3R0b20pIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MuYm90dG9tID0gcGFkZGluZ0JvdHRvbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBhZGRpbmdMZWZ0KSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLmxlZnQgPSBwYWRkaW5nTGVmdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBhZGRpbmdSaWdodCkge1xuICAgICAgICAgICAgICBwYWRkaW5ncy5yaWdodCA9IHBhZGRpbmdSaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29tcG91bmRSZXNpemVVdGlsaXRpZXMuc2V0UGFkZGluZ3MoYW5jZXN0b3IsIHBhZGRpbmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgY3kub24oJ3RhcHN0YXJ0JywgJ25vZGUnLCB0YXBTdGFydEZjbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYoIG1vZGUgIT09ICdtaW4nICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzO1xuXG4gICAgICAgIGlmIChub2RlLnNlbGVjdGVkKCkpIHtcbiAgICAgICAgICBlZmZlY3RlZE5vZGVzID0gY3kuY29sbGVjdGlvbigpLmFkZChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBlZmZlY3RlZE5vZGVzID0gY3kubm9kZXMoJzpzZWxlY3RlZCcpLmRpZmZlcmVuY2Uobm9kZS5hbmNlc3RvcnMoKSkudW5pb24obm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBjYXJlIGFib3V0IHRoZSBtb3ZlbWVudCBvZiB0b3AgbW9zdCBub2Rlc1xuICAgICAgICBlZmZlY3RlZE5vZGVzID0gZWxlbWVudFV0aWxpdGllcy5nZXRUb3BNb3N0Tm9kZXMoZWZmZWN0ZWROb2Rlcyk7XG5cbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBjeS5vbignZHJhZycsICdub2RlJywgZHJhZ0ZjbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYoIG1vZGUgIT09ICdtaW4nICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdXBkYXRlUGFkZGluZ3MoKTtcbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YShmYWxzZSk7XG4gICAgICB9KTtcblxuICAgICAgY3kub24oJ3Jlc2l6ZXN0YXJ0JywgcmVzaXplU3RhcnRGY24gPSBmdW5jdGlvbiAoZSwgdHlwZSwgbm9kZXMpIHtcbiAgICAgICAgaWYoIG1vZGUgIT09ICdtaW4nICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZWZmZWN0ZWROb2RlcyA9IG5vZGVzO1xuICAgICAgICBmaWxsRWZmZWN0ZWREYXRhKHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIGN5Lm9uKCdyZXNpemVkcmFnJywgcmVzaXplRHJhZ0ZjbiA9IGZ1bmN0aW9uIChlLCB0eXBlLCBub2Rlcykge1xuICAgICAgICBpZiggbW9kZSAhPT0gJ21pbicgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB1cGRhdGVQYWRkaW5ncygpO1xuICAgICAgICBmaWxsRWZmZWN0ZWREYXRhKGZhbHNlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjeXRvc2NhcGUoJ2NvcmUnLCAnY29tcG91bmRSZXNpemUnLCBmdW5jdGlvbiAoX21vZGUpIHtcbiAgICAgIHZhciBjeSA9IHRoaXM7XG4gICAgICBcbiAgICAgIGlmIChfbW9kZSA9PT0gJ2Rlc3Ryb3knKSB7XG4gICAgICAgIHVuYmluZEV2ZW50cyhjeSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYoIF9tb2RlICE9ICdnZXQnICkge1xuICAgICAgICBjb21wb3VuZFJlc2l6ZVV0aWxpdGllcyA9IHJlcXVpcmUoJy4vY29tcG91bmRSZXNpemVVdGlsaXRpZXMnKShjeSk7XG4gICAgICAgIG1vZGUgPSBfbW9kZTtcbiAgICAgICAgY29tcG91bmRSZXNpemVVdGlsaXRpZXMuc2V0TW9kZShtb2RlKTtcbiAgICAgICAgYmluZEV2ZW50cyhjeSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb21wb3VuZFJlc2l6ZVV0aWxpdGllczsgLy8gUHJvdmlkZSBBUElcbiAgICB9KTtcblxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgeyAvLyBleHBvc2UgYXMgYSBjb21tb25qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHJlZ2lzdGVyO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnICYmIGRlZmluZS5hbWQpIHsgLy8gZXhwb3NlIGFzIGFuIGFtZC9yZXF1aXJlanMgbW9kdWxlXG4gICAgZGVmaW5lKCdjeXRvc2NhcGUtY29tcG91bmQtcmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHJlZ2lzdGVyO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBjeXRvc2NhcGUgIT09ICd1bmRlZmluZWQnKSB7IC8vIGV4cG9zZSB0byBnbG9iYWwgY3l0b3NjYXBlIChpLmUuIHdpbmRvdy5jeXRvc2NhcGUpXG4gICAgcmVnaXN0ZXIoY3l0b3NjYXBlKTtcbiAgfVxuXG59KSgpO1xuIiwidmFyIHNjcmF0Y2hVdGlsaXRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0U2NyYXRjaDogZnVuY3Rpb24gKGN5T3JFbGUpIHtcbiAgICAgIGlmICghY3lPckVsZS5zY3JhdGNoKCdfY29tcG91bmRSZXNpemUnKSkge1xuICAgICAgICBjeU9yRWxlLnNjcmF0Y2goJ19jb21wb3VuZFJlc2l6ZScsIHt9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjeU9yRWxlLnNjcmF0Y2goJ19jb21wb3VuZFJlc2l6ZScpO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2NyYXRjaFV0aWxpdGllczsiXX0=
