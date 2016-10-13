(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.cytoscapeCompoundResize = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var compoundResizeUtilities = function (cy) {
  var scratchUtilities = _dereq_("./scratchUtilities")();

  var self = {
    setPaddings: function (nodes, paddings) {
      cy.startBatch();

      nodes.each(function (i, ele) {
        var minPaddings = self.getMinimumPaddings(ele);
        var maxPaddings = self.getMaximumPaddings(ele);

        if (paddings.left >= minPaddings.left && paddings.left <= maxPaddings.left) {
          ele.css('padding-left', paddings.left);
        }

        if (paddings.right >= minPaddings.right && paddings.right <= maxPaddings.right) {
          ele.css('padding-right', paddings.right);
        }

        if (paddings.top >= minPaddings.top && paddings.top <= maxPaddings.top) {
          ele.css('padding-top', paddings.top);
        }

        if (paddings.bottom >= minPaddings.bottom && paddings.bottom <= maxPaddings.bottom) {
          ele.css('padding-bottom', paddings.bottom);
        }
      });
      
      cy.endBatch();
    },
    setExtremePaddings: function (nodes, paddings, minOrMax) {
      cy.startBatch();

      nodes.each(function (i, ele) {
        var paddingLeft = parseInt(ele.css('padding-left'));
        var paddingRight = parseInt(ele.css('padding-right'));
        var paddingTop = parseInt(ele.css('padding-top'));
        var paddingBottom = parseInt(ele.css('padding-bottom'));

        // Get the minimum paddings to set them
        var extremePaddings = minOrMax === 'min' ? self.getMinimumPaddings(ele) : self.getMaximumPaddings(ele);

        var sign = minOrMax === 'min' ? 1 : -1;

        if (paddings.left) {
          if (paddingLeft * sign < paddings.left * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-left', paddings.left);
          }

          extremePaddings.left = parseInt(paddings.left);
        }

        if (paddings.right) {
          if (paddingRight * sign < paddings.right * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-right', paddings.right);
          }

          extremePaddings.right = parseInt(paddings.right);
        }

        if (paddings.top) {
          if (paddingTop * sign < paddings.top * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-top', paddings.top);
          }

          extremePaddings.top = parseInt(paddings.top);
        }

        if (paddings.bottom) {
          if (paddingBottom * sign < paddings.bottom * sign) {
            // Paddings cannot be smaller then min paddings and cannot be bigger then max paddings
            ele.css('padding-bottom', paddings.bottom);
          }

          extremePaddings.bottom = parseInt(paddings.bottom);
        }
      });

      cy.endBatch();
    },
    getMinimumPaddings: function (node) {
      var paddings = scratchUtilities.getScratch(node).minPaddings;
      if (!paddings) {
        paddings = scratchUtilities.getScratch(node).minPaddings = {};
      }
      return paddings;
    },
    getMaximumPaddings: function (node) {
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

  // registers the extension on a cytoscape lib ref
  var register = function (cytoscape) {

    if (!cytoscape) {
      return;
    } // can't register if cytoscape unspecified

    var bindEvents = function (cy) {
      var ancestorsCornerPositions;
      var effectedNodes;
      var ancestorMap;
      
      // Fill the data of elements which will be affected by the respositioning 
      var fillEffectedData = function(fillAncestorsMap) {
        ancestorsCornerPositions = [];
        
        if(fillAncestorsMap) {
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
      var updatePaddings = function() {
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
      };
      
      cy.on('tapstart', 'node', function () {
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

      cy.on('drag', 'node', function () {
        var node = this;

        updatePaddings();
        
        fillEffectedData(false);
      });
    };

    cytoscape('collection', 'compoundResize', function () {
      var eles = this;
      var cy = this.cy();
      
      compoundResizeUtilities = _dereq_('./compoundResizeUtilities')(cy);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG91bmRSZXNpemVVdGlsaXRpZXMuanMiLCJzcmMvZWxlbWVudFV0aWxpdGllcy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zY3JhdGNoVXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY29tcG91bmRSZXNpemVVdGlsaXRpZXMgPSBmdW5jdGlvbiAoY3kpIHtcbiAgdmFyIHNjcmF0Y2hVdGlsaXRpZXMgPSByZXF1aXJlKFwiLi9zY3JhdGNoVXRpbGl0aWVzXCIpKCk7XG5cbiAgdmFyIHNlbGYgPSB7XG4gICAgc2V0UGFkZGluZ3M6IGZ1bmN0aW9uIChub2RlcywgcGFkZGluZ3MpIHtcbiAgICAgIGN5LnN0YXJ0QmF0Y2goKTtcblxuICAgICAgbm9kZXMuZWFjaChmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIHZhciBtaW5QYWRkaW5ncyA9IHNlbGYuZ2V0TWluaW11bVBhZGRpbmdzKGVsZSk7XG4gICAgICAgIHZhciBtYXhQYWRkaW5ncyA9IHNlbGYuZ2V0TWF4aW11bVBhZGRpbmdzKGVsZSk7XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLmxlZnQgPj0gbWluUGFkZGluZ3MubGVmdCAmJiBwYWRkaW5ncy5sZWZ0IDw9IG1heFBhZGRpbmdzLmxlZnQpIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnLCBwYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy5yaWdodCA+PSBtaW5QYWRkaW5ncy5yaWdodCAmJiBwYWRkaW5ncy5yaWdodCA8PSBtYXhQYWRkaW5ncy5yaWdodCkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctcmlnaHQnLCBwYWRkaW5ncy5yaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MudG9wID49IG1pblBhZGRpbmdzLnRvcCAmJiBwYWRkaW5ncy50b3AgPD0gbWF4UGFkZGluZ3MudG9wKSB7XG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy10b3AnLCBwYWRkaW5ncy50b3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLmJvdHRvbSA+PSBtaW5QYWRkaW5ncy5ib3R0b20gJiYgcGFkZGluZ3MuYm90dG9tIDw9IG1heFBhZGRpbmdzLmJvdHRvbSkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctYm90dG9tJywgcGFkZGluZ3MuYm90dG9tKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGN5LmVuZEJhdGNoKCk7XG4gICAgfSxcbiAgICBzZXRFeHRyZW1lUGFkZGluZ3M6IGZ1bmN0aW9uIChub2RlcywgcGFkZGluZ3MsIG1pbk9yTWF4KSB7XG4gICAgICBjeS5zdGFydEJhdGNoKCk7XG5cbiAgICAgIG5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICB2YXIgcGFkZGluZ0xlZnQgPSBwYXJzZUludChlbGUuY3NzKCdwYWRkaW5nLWxlZnQnKSk7XG4gICAgICAgIHZhciBwYWRkaW5nUmlnaHQgPSBwYXJzZUludChlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JykpO1xuICAgICAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlSW50KGVsZS5jc3MoJ3BhZGRpbmctdG9wJykpO1xuICAgICAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGVsZS5jc3MoJ3BhZGRpbmctYm90dG9tJykpO1xuXG4gICAgICAgIC8vIEdldCB0aGUgbWluaW11bSBwYWRkaW5ncyB0byBzZXQgdGhlbVxuICAgICAgICB2YXIgZXh0cmVtZVBhZGRpbmdzID0gbWluT3JNYXggPT09ICdtaW4nID8gc2VsZi5nZXRNaW5pbXVtUGFkZGluZ3MoZWxlKSA6IHNlbGYuZ2V0TWF4aW11bVBhZGRpbmdzKGVsZSk7XG5cbiAgICAgICAgdmFyIHNpZ24gPSBtaW5Pck1heCA9PT0gJ21pbicgPyAxIDogLTE7XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLmxlZnQpIHtcbiAgICAgICAgICBpZiAocGFkZGluZ0xlZnQgKiBzaWduIDwgcGFkZGluZ3MubGVmdCAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnLCBwYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MubGVmdCA9IHBhcnNlSW50KHBhZGRpbmdzLmxlZnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLnJpZ2h0KSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdSaWdodCAqIHNpZ24gPCBwYWRkaW5ncy5yaWdodCAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JywgcGFkZGluZ3MucmlnaHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV4dHJlbWVQYWRkaW5ncy5yaWdodCA9IHBhcnNlSW50KHBhZGRpbmdzLnJpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy50b3ApIHtcbiAgICAgICAgICBpZiAocGFkZGluZ1RvcCAqIHNpZ24gPCBwYWRkaW5ncy50b3AgKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy10b3AnLCBwYWRkaW5ncy50b3ApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV4dHJlbWVQYWRkaW5ncy50b3AgPSBwYXJzZUludChwYWRkaW5ncy50b3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLmJvdHRvbSkge1xuICAgICAgICAgIGlmIChwYWRkaW5nQm90dG9tICogc2lnbiA8IHBhZGRpbmdzLmJvdHRvbSAqIHNpZ24pIHtcbiAgICAgICAgICAgIC8vIFBhZGRpbmdzIGNhbm5vdCBiZSBzbWFsbGVyIHRoZW4gbWluIHBhZGRpbmdzIGFuZCBjYW5ub3QgYmUgYmlnZ2VyIHRoZW4gbWF4IHBhZGRpbmdzXG4gICAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScsIHBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLmJvdHRvbSA9IHBhcnNlSW50KHBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjeS5lbmRCYXRjaCgpO1xuICAgIH0sXG4gICAgZ2V0TWluaW11bVBhZGRpbmdzOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgdmFyIHBhZGRpbmdzID0gc2NyYXRjaFV0aWxpdGllcy5nZXRTY3JhdGNoKG5vZGUpLm1pblBhZGRpbmdzO1xuICAgICAgaWYgKCFwYWRkaW5ncykge1xuICAgICAgICBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5taW5QYWRkaW5ncyA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhZGRpbmdzO1xuICAgIH0sXG4gICAgZ2V0TWF4aW11bVBhZGRpbmdzOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgdmFyIHBhZGRpbmdzID0gc2NyYXRjaFV0aWxpdGllcy5nZXRTY3JhdGNoKG5vZGUpLm1heFBhZGRpbmdzO1xuICAgICAgaWYgKCFwYWRkaW5ncykge1xuICAgICAgICBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5tYXhQYWRkaW5ncyA9IHt9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhZGRpbmdzO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gc2VsZjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY29tcG91bmRSZXNpemVVdGlsaXRpZXM7IiwidmFyIGVsZW1lbnRVdGlsaXRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgLy90aGlzIG1ldGhvZCByZXR1cm5zIHRoZSBub2RlcyBub24gb2Ygd2hvc2UgYW5jZXN0b3JzIGlzIG5vdCBpbiBnaXZlbiBub2Rlc1xuICAgIGdldFRvcE1vc3ROb2RlczogZnVuY3Rpb24gKG5vZGVzKSB7XG4gICAgICB2YXIgbm9kZXNNYXAgPSB7fTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm9kZXNNYXBbbm9kZXNbaV0uaWQoKV0gPSB0cnVlO1xuICAgICAgfVxuICAgICAgdmFyIHJvb3RzID0gbm9kZXMuZmlsdGVyKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZS5wYXJlbnQoKVswXTtcbiAgICAgICAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKG5vZGVzTWFwW3BhcmVudC5pZCgpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50KClbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJvb3RzO1xuICAgIH0sXG4gICAgLy8gR2V0IHRoZSBjb3JuZXIgcG9zaXRpb25zIG9mIHRoZSBub2RlXG4gICAgZ2V0Q29ybmVyUG9zaXRpb25zOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgcG9zWCA9IG5vZGUucG9zaXRpb24oJ3gnKTtcbiAgICAgIHZhciBwb3NZID0gbm9kZS5wb3NpdGlvbigneScpO1xuICAgICAgdmFyIGhhbGZXaWR0aCA9IG5vZGUud2lkdGgoKSAvIDI7XG4gICAgICB2YXIgaGFsZkhlaWdodCA9IG5vZGUuaGVpZ2h0KCkgLyAyO1xuICAgICAgXG4gICAgICByZXR1cm4ge1xuICAgICAgICAndG9wJzogcG9zWSAtIGhhbGZIZWlnaHQsXG4gICAgICAgICdib3R0b20nOiBwb3NZICsgaGFsZkhlaWdodCxcbiAgICAgICAgJ2xlZnQnOiBwb3NYIC0gaGFsZldpZHRoLFxuICAgICAgICAncmlnaHQnOiBwb3NYICsgaGFsZldpZHRoXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZWxlbWVudFV0aWxpdGllczsiLCI7XG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciBlbGVtZW50VXRpbGl0aWVzID0gcmVxdWlyZShcIi4vZWxlbWVudFV0aWxpdGllc1wiKSgpO1xuICB2YXIgY29tcG91bmRSZXNpemVVdGlsaXRpZXM7XG5cbiAgLy8gcmVnaXN0ZXJzIHRoZSBleHRlbnNpb24gb24gYSBjeXRvc2NhcGUgbGliIHJlZlxuICB2YXIgcmVnaXN0ZXIgPSBmdW5jdGlvbiAoY3l0b3NjYXBlKSB7XG5cbiAgICBpZiAoIWN5dG9zY2FwZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gY2FuJ3QgcmVnaXN0ZXIgaWYgY3l0b3NjYXBlIHVuc3BlY2lmaWVkXG5cbiAgICB2YXIgYmluZEV2ZW50cyA9IGZ1bmN0aW9uIChjeSkge1xuICAgICAgdmFyIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucztcbiAgICAgIHZhciBlZmZlY3RlZE5vZGVzO1xuICAgICAgdmFyIGFuY2VzdG9yTWFwO1xuICAgICAgXG4gICAgICAvLyBGaWxsIHRoZSBkYXRhIG9mIGVsZW1lbnRzIHdoaWNoIHdpbGwgYmUgYWZmZWN0ZWQgYnkgdGhlIHJlc3Bvc2l0aW9uaW5nIFxuICAgICAgdmFyIGZpbGxFZmZlY3RlZERhdGEgPSBmdW5jdGlvbihmaWxsQW5jZXN0b3JzTWFwKSB7XG4gICAgICAgIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucyA9IFtdO1xuICAgICAgICBcbiAgICAgICAgaWYoZmlsbEFuY2VzdG9yc01hcCkge1xuICAgICAgICAgIGFuY2VzdG9yTWFwID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBlZmZlY3RlZE5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgIHZhciBjb3JuZXJzID0gW107IC8vIEl0IHdpbGwgYmUgdXNlZCBsaWtlIGEgcXVldWVcbiAgICAgICAgICB2YXIgY3VycmVudEFuY2VzdG9yID0gZWxlLnBhcmVudCgpWzBdO1xuXG4gICAgICAgICAgd2hpbGUgKGN1cnJlbnRBbmNlc3Rvcikge1xuICAgICAgICAgICAgdmFyIGlkID0gY3VycmVudEFuY2VzdG9yLmlkKCk7XG5cbiAgICAgICAgICAgIHZhciBjb3JuZXIgPSBlbGVtZW50VXRpbGl0aWVzLmdldENvcm5lclBvc2l0aW9ucyhjdXJyZW50QW5jZXN0b3IpO1xuICAgICAgICAgICAgY29ybmVyLmlkID0gaWQ7XG5cbiAgICAgICAgICAgIGNvcm5lcnMucHVzaChjb3JuZXIpO1xuXG4gICAgICAgICAgICBpZiAoZmlsbEFuY2VzdG9yc01hcCAmJiAhYW5jZXN0b3JNYXBbaWRdKSB7XG4gICAgICAgICAgICAgIGFuY2VzdG9yTWFwW2lkXSA9IGN1cnJlbnRBbmNlc3RvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY3VycmVudEFuY2VzdG9yID0gY3VycmVudEFuY2VzdG9yLnBhcmVudCgpWzBdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucy5wdXNoKGNvcm5lcnMpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIC8vIFVwZGF0ZSB0aGUgcGFkZGluZ3MgYWNjb3JkaW5nIHRvIHRoZSBtb3ZlbWVudFxuICAgICAgdmFyIHVwZGF0ZVBhZGRpbmdzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIEtlZXBzIHRoZSBhbHJlYWR5IHByb2Nlc3NlZCBhbmNlc3RvcnNcbiAgICAgICAgdmFyIHByb2Nlc3NlZEFuY2VzdG9ycyA9IHt9O1xuXG4gICAgICAgIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50LCBpbmRleCwgYXJyYXkpIHtcbiAgICAgICAgICB2YXIgY29ybmVyc1F1ZXVlID0gZWxlbWVudDtcbiAgICAgICAgICB3aGlsZSAoY29ybmVyc1F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBvbGRDb3JuZXJzID0gY29ybmVyc1F1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzZWRBbmNlc3RvcnNbY29ybmVyc1F1ZXVlLmlkXSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvY2Vzc2VkQW5jZXN0b3JzW29sZENvcm5lcnMuaWRdID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBhbmNlc3RvciA9IGFuY2VzdG9yTWFwW29sZENvcm5lcnMuaWRdO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb3JuZXJzID0gZWxlbWVudFV0aWxpdGllcy5nZXRDb3JuZXJQb3NpdGlvbnMoYW5jZXN0b3IpO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudENvcm5lcnMudG9wID09PSBvbGRDb3JuZXJzLnRvcCAmJiBjdXJyZW50Q29ybmVycy5ib3R0b20gPT09IG9sZENvcm5lcnMuYm90dG9tXG4gICAgICAgICAgICAgICAgICAgICYmIGN1cnJlbnRDb3JuZXJzLmxlZnQgPT09IG9sZENvcm5lcnMubGVmdCAmJiBjdXJyZW50Q29ybmVycy5yaWdodCA9PT0gb2xkQ29ybmVycy5yaWdodCkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBhZGRpbmdUb3AsIHBhZGRpbmdCb3R0b20sIHBhZGRpbmdMZWZ0LCBwYWRkaW5nUmlnaHQ7XG5cbiAgICAgICAgICAgIHZhciB0b3BEaWZmID0gY3VycmVudENvcm5lcnMudG9wIC0gb2xkQ29ybmVycy50b3A7XG5cbiAgICAgICAgICAgIGlmICh0b3BEaWZmICE9IDApIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWRkaW5nID0gcGFyc2VJbnQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLXRvcCcpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ1RvcCA9IGN1cnJlbnRQYWRkaW5nICsgdG9wRGlmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJvdHRvbURpZmYgPSBjdXJyZW50Q29ybmVycy5ib3R0b20gLSBvbGRDb3JuZXJzLmJvdHRvbTtcblxuICAgICAgICAgICAgaWYgKGJvdHRvbURpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUludChhbmNlc3Rvci5jc3MoJ3BhZGRpbmctYm90dG9tJykpO1xuICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tID0gY3VycmVudFBhZGRpbmcgLSBib3R0b21EaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbGVmdERpZmYgPSBjdXJyZW50Q29ybmVycy5sZWZ0IC0gb2xkQ29ybmVycy5sZWZ0O1xuXG4gICAgICAgICAgICBpZiAobGVmdERpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUludChhbmNlc3Rvci5jc3MoJ3BhZGRpbmctbGVmdCcpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSBjdXJyZW50UGFkZGluZyArIGxlZnREaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcmlnaHREaWZmID0gY3VycmVudENvcm5lcnMucmlnaHQgLSBvbGRDb3JuZXJzLnJpZ2h0O1xuXG4gICAgICAgICAgICBpZiAocmlnaHREaWZmICE9IDApIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWRkaW5nID0gcGFyc2VJbnQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLXJpZ2h0JykpO1xuICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQgPSBjdXJyZW50UGFkZGluZyAtIHJpZ2h0RGlmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIXBhZGRpbmdUb3AgJiYgIXBhZGRpbmdCb3R0b20gJiYgIXBhZGRpbmdMZWZ0ICYmICFwYWRkaW5nUmlnaHQpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWRkaW5ncyA9IHt9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihwYWRkaW5nVG9wKSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLnRvcCA9IHBhZGRpbmdUb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHBhZGRpbmdCb3R0b20pIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MuYm90dG9tID0gcGFkZGluZ0JvdHRvbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYocGFkZGluZ0xlZnQpIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MubGVmdCA9IHBhZGRpbmdMZWZ0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihwYWRkaW5nUmlnaHQpIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MucmlnaHQgPSBwYWRkaW5nUmlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzLnNldFBhZGRpbmdzKGFuY2VzdG9yLCBwYWRkaW5ncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGN5Lm9uKCd0YXBzdGFydCcsICdub2RlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKG5vZGUuc2VsZWN0ZWQoKSkge1xuICAgICAgICAgIGVmZmVjdGVkTm9kZXMgPSBjeS5jb2xsZWN0aW9uKCkuYWRkKG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGVmZmVjdGVkTm9kZXMgPSBjeS5ub2RlcygnOnNlbGVjdGVkJykuZGlmZmVyZW5jZShub2RlLmFuY2VzdG9ycygpKS51bmlvbihub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIGNhcmUgYWJvdXQgdGhlIG1vdmVtZW50IG9mIHRvcCBtb3N0IG5vZGVzXG4gICAgICAgIGVmZmVjdGVkTm9kZXMgPSBlbGVtZW50VXRpbGl0aWVzLmdldFRvcE1vc3ROb2RlcyhlZmZlY3RlZE5vZGVzKTtcblxuICAgICAgICBmaWxsRWZmZWN0ZWREYXRhKHRydWUpO1xuICAgICAgfSk7XG5cbiAgICAgIGN5Lm9uKCdkcmFnJywgJ25vZGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcztcblxuICAgICAgICB1cGRhdGVQYWRkaW5ncygpO1xuICAgICAgICBcbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YShmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY3l0b3NjYXBlKCdjb2xsZWN0aW9uJywgJ2NvbXBvdW5kUmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGVsZXMgPSB0aGlzO1xuICAgICAgdmFyIGN5ID0gdGhpcy5jeSgpO1xuICAgICAgXG4gICAgICBjb21wb3VuZFJlc2l6ZVV0aWxpdGllcyA9IHJlcXVpcmUoJy4vY29tcG91bmRSZXNpemVVdGlsaXRpZXMnKShjeSk7XG4gICAgICBiaW5kRXZlbnRzKGN5KTtcbiAgICAgIFxuICAgICAgdmFyIGNvbXBvdW5kcyA9IGN5Lm5vZGVzKCckbm9kZSA+IG5vZGUnKTtcbiAgICAgIFxuICAgICAgY29tcG91bmRzLmVhY2goZnVuY3Rpb24oaSwgZWxlKXtcbiAgICAgICAgdmFyIHBhZGRpbmdzID0ge1xuICAgICAgICAgICd0b3AnOiBlbGUuY3NzKCdwYWRkaW5nLXRvcCcpLFxuICAgICAgICAgICdib3R0b20nOiBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScpLFxuICAgICAgICAgICdsZWZ0JzogZWxlLmNzcygncGFkZGluZy1sZWZ0JyksXG4gICAgICAgICAgJ3JpZ2h0JzogZWxlLmNzcygncGFkZGluZy1yaWdodCcpXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBjb21wb3VuZFJlc2l6ZVV0aWxpdGllcy5zZXRFeHRyZW1lUGFkZGluZ3MoZWxlLCBwYWRkaW5ncywgJ21pbicpO1xuICAgICAgICBjb21wb3VuZFJlc2l6ZVV0aWxpdGllcy5zZXRFeHRyZW1lUGFkZGluZ3MoZWxlLCBwYWRkaW5ncywgJ21heCcpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjb21wb3VuZFJlc2l6ZVV0aWxpdGllczsgLy8gUHJvdmlkZSBBUElcbiAgICB9KTtcblxuICB9O1xuXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykgeyAvLyBleHBvc2UgYXMgYSBjb21tb25qcyBtb2R1bGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHJlZ2lzdGVyO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnICYmIGRlZmluZS5hbWQpIHsgLy8gZXhwb3NlIGFzIGFuIGFtZC9yZXF1aXJlanMgbW9kdWxlXG4gICAgZGVmaW5lKCdjeXRvc2NhcGUtY29tcG91bmQtcmVzaXplJywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHJlZ2lzdGVyO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBjeXRvc2NhcGUgIT09ICd1bmRlZmluZWQnKSB7IC8vIGV4cG9zZSB0byBnbG9iYWwgY3l0b3NjYXBlIChpLmUuIHdpbmRvdy5jeXRvc2NhcGUpXG4gICAgcmVnaXN0ZXIoY3l0b3NjYXBlKTtcbiAgfVxuXG59KSgpO1xuIiwidmFyIHNjcmF0Y2hVdGlsaXRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0U2NyYXRjaDogZnVuY3Rpb24gKGN5T3JFbGUpIHtcbiAgICAgIGlmICghY3lPckVsZS5zY3JhdGNoKCdfY29tcG91bmRSZXNpemUnKSkge1xuICAgICAgICBjeU9yRWxlLnNjcmF0Y2goJ19jb21wb3VuZFJlc2l6ZScsIHt9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjeU9yRWxlLnNjcmF0Y2goJ19jb21wb3VuZFJlc2l6ZScpO1xuICAgIH1cbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2NyYXRjaFV0aWxpdGllczsiXX0=
