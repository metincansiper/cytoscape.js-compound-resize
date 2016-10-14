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
      
      cy.on('resizestart', function(e, type, nodes) {
        effectedNodes = nodes;
        fillEffectedData(true);
      });
      
      cy.on('resizedrag', function(e, type, nodes) {
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG91bmRSZXNpemVVdGlsaXRpZXMuanMiLCJzcmMvZWxlbWVudFV0aWxpdGllcy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zY3JhdGNoVXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzID0gZnVuY3Rpb24gKGN5KSB7XG4gIHZhciBzY3JhdGNoVXRpbGl0aWVzID0gcmVxdWlyZShcIi4vc2NyYXRjaFV0aWxpdGllc1wiKSgpO1xuXG4gIHZhciBzZWxmID0ge1xuICAgIHNldFBhZGRpbmdzOiBmdW5jdGlvbiAobm9kZXMsIHBhZGRpbmdzKSB7XG4gICAgICBjeS5zdGFydEJhdGNoKCk7XG5cbiAgICAgIG5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICB2YXIgbWluUGFkZGluZ3MgPSBzZWxmLmdldE1pbmltdW1QYWRkaW5ncyhlbGUpO1xuICAgICAgICB2YXIgbWF4UGFkZGluZ3MgPSBzZWxmLmdldE1heGltdW1QYWRkaW5ncyhlbGUpO1xuXG4gICAgICAgIGlmIChwYWRkaW5ncy5sZWZ0ID49IG1pblBhZGRpbmdzLmxlZnQgJiYgcGFkZGluZ3MubGVmdCA8PSBtYXhQYWRkaW5ncy5sZWZ0KSB7XG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy1sZWZ0JywgcGFkZGluZ3MubGVmdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MucmlnaHQgPj0gbWluUGFkZGluZ3MucmlnaHQgJiYgcGFkZGluZ3MucmlnaHQgPD0gbWF4UGFkZGluZ3MucmlnaHQpIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JywgcGFkZGluZ3MucmlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLnRvcCA+PSBtaW5QYWRkaW5ncy50b3AgJiYgcGFkZGluZ3MudG9wIDw9IG1heFBhZGRpbmdzLnRvcCkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgcGFkZGluZ3MudG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy5ib3R0b20gPj0gbWluUGFkZGluZ3MuYm90dG9tICYmIHBhZGRpbmdzLmJvdHRvbSA8PSBtYXhQYWRkaW5ncy5ib3R0b20pIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScsIHBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBjeS5lbmRCYXRjaCgpO1xuICAgIH0sXG4gICAgc2V0RXh0cmVtZVBhZGRpbmdzOiBmdW5jdGlvbiAobm9kZXMsIHBhZGRpbmdzLCBtaW5Pck1heCkge1xuICAgICAgY3kuc3RhcnRCYXRjaCgpO1xuXG4gICAgICBub2Rlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoZWxlLmNzcygncGFkZGluZy1sZWZ0JykpO1xuICAgICAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoZWxlLmNzcygncGFkZGluZy1yaWdodCcpKTtcbiAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUludChlbGUuY3NzKCdwYWRkaW5nLXRvcCcpKTtcbiAgICAgICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUludChlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScpKTtcblxuICAgICAgICAvLyBHZXQgdGhlIG1pbmltdW0gcGFkZGluZ3MgdG8gc2V0IHRoZW1cbiAgICAgICAgdmFyIGV4dHJlbWVQYWRkaW5ncyA9IG1pbk9yTWF4ID09PSAnbWluJyA/IHNlbGYuZ2V0TWluaW11bVBhZGRpbmdzKGVsZSkgOiBzZWxmLmdldE1heGltdW1QYWRkaW5ncyhlbGUpO1xuXG4gICAgICAgIHZhciBzaWduID0gbWluT3JNYXggPT09ICdtaW4nID8gMSA6IC0xO1xuXG4gICAgICAgIGlmIChwYWRkaW5ncy5sZWZ0KSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdMZWZ0ICogc2lnbiA8IHBhZGRpbmdzLmxlZnQgKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy1sZWZ0JywgcGFkZGluZ3MubGVmdCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLmxlZnQgPSBwYXJzZUludChwYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy5yaWdodCkge1xuICAgICAgICAgIGlmIChwYWRkaW5nUmlnaHQgKiBzaWduIDwgcGFkZGluZ3MucmlnaHQgKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy1yaWdodCcsIHBhZGRpbmdzLnJpZ2h0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MucmlnaHQgPSBwYXJzZUludChwYWRkaW5ncy5yaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MudG9wKSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdUb3AgKiBzaWduIDwgcGFkZGluZ3MudG9wICogc2lnbikge1xuICAgICAgICAgICAgLy8gUGFkZGluZ3MgY2Fubm90IGJlIHNtYWxsZXIgdGhlbiBtaW4gcGFkZGluZ3MgYW5kIGNhbm5vdCBiZSBiaWdnZXIgdGhlbiBtYXggcGFkZGluZ3NcbiAgICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgcGFkZGluZ3MudG9wKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MudG9wID0gcGFyc2VJbnQocGFkZGluZ3MudG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy5ib3R0b20pIHtcbiAgICAgICAgICBpZiAocGFkZGluZ0JvdHRvbSAqIHNpZ24gPCBwYWRkaW5ncy5ib3R0b20gKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy1ib3R0b20nLCBwYWRkaW5ncy5ib3R0b20pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV4dHJlbWVQYWRkaW5ncy5ib3R0b20gPSBwYXJzZUludChwYWRkaW5ncy5ib3R0b20pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY3kuZW5kQmF0Y2goKTtcbiAgICB9LFxuICAgIGdldE1pbmltdW1QYWRkaW5nczogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIHZhciBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5taW5QYWRkaW5ncztcbiAgICAgIGlmICghcGFkZGluZ3MpIHtcbiAgICAgICAgcGFkZGluZ3MgPSBzY3JhdGNoVXRpbGl0aWVzLmdldFNjcmF0Y2gobm9kZSkubWluUGFkZGluZ3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWRkaW5ncztcbiAgICB9LFxuICAgIGdldE1heGltdW1QYWRkaW5nczogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIHZhciBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5tYXhQYWRkaW5ncztcbiAgICAgIGlmICghcGFkZGluZ3MpIHtcbiAgICAgICAgcGFkZGluZ3MgPSBzY3JhdGNoVXRpbGl0aWVzLmdldFNjcmF0Y2gobm9kZSkubWF4UGFkZGluZ3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWRkaW5ncztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzOyIsInZhciBlbGVtZW50VXRpbGl0aWVzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIC8vdGhpcyBtZXRob2QgcmV0dXJucyB0aGUgbm9kZXMgbm9uIG9mIHdob3NlIGFuY2VzdG9ycyBpcyBub3QgaW4gZ2l2ZW4gbm9kZXNcbiAgICBnZXRUb3BNb3N0Tm9kZXM6IGZ1bmN0aW9uIChub2Rlcykge1xuICAgICAgdmFyIG5vZGVzTWFwID0ge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5vZGVzTWFwW25vZGVzW2ldLmlkKCldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhciByb290cyA9IG5vZGVzLmZpbHRlcihmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbGUucGFyZW50KClbMF07XG4gICAgICAgIHdoaWxlIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChub2Rlc01hcFtwYXJlbnQuaWQoKV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudCgpWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByb290cztcbiAgICB9LFxuICAgIC8vIEdldCB0aGUgY29ybmVyIHBvc2l0aW9ucyBvZiB0aGUgbm9kZVxuICAgIGdldENvcm5lclBvc2l0aW9uczogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIHBvc1ggPSBub2RlLnBvc2l0aW9uKCd4Jyk7XG4gICAgICB2YXIgcG9zWSA9IG5vZGUucG9zaXRpb24oJ3knKTtcbiAgICAgIHZhciBoYWxmV2lkdGggPSBub2RlLndpZHRoKCkgLyAyO1xuICAgICAgdmFyIGhhbGZIZWlnaHQgPSBub2RlLmhlaWdodCgpIC8gMjtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3RvcCc6IHBvc1kgLSBoYWxmSGVpZ2h0LFxuICAgICAgICAnYm90dG9tJzogcG9zWSArIGhhbGZIZWlnaHQsXG4gICAgICAgICdsZWZ0JzogcG9zWCAtIGhhbGZXaWR0aCxcbiAgICAgICAgJ3JpZ2h0JzogcG9zWCArIGhhbGZXaWR0aFxuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVsZW1lbnRVdGlsaXRpZXM7IiwiO1xuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgZWxlbWVudFV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL2VsZW1lbnRVdGlsaXRpZXNcIikoKTtcbiAgdmFyIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzO1xuXG4gIC8vIHJlZ2lzdGVycyB0aGUgZXh0ZW5zaW9uIG9uIGEgY3l0b3NjYXBlIGxpYiByZWZcbiAgdmFyIHJlZ2lzdGVyID0gZnVuY3Rpb24gKGN5dG9zY2FwZSkge1xuXG4gICAgaWYgKCFjeXRvc2NhcGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIGNhbid0IHJlZ2lzdGVyIGlmIGN5dG9zY2FwZSB1bnNwZWNpZmllZFxuXG4gICAgdmFyIGJpbmRFdmVudHMgPSBmdW5jdGlvbiAoY3kpIHtcbiAgICAgIHZhciBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnM7XG4gICAgICB2YXIgZWZmZWN0ZWROb2RlcztcbiAgICAgIHZhciBhbmNlc3Rvck1hcDtcbiAgICAgIFxuICAgICAgLy8gRmlsbCB0aGUgZGF0YSBvZiBlbGVtZW50cyB3aGljaCB3aWxsIGJlIGFmZmVjdGVkIGJ5IHRoZSByZXNwb3NpdGlvbmluZyBcbiAgICAgIHZhciBmaWxsRWZmZWN0ZWREYXRhID0gZnVuY3Rpb24oZmlsbEFuY2VzdG9yc01hcCkge1xuICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGlmKGZpbGxBbmNlc3RvcnNNYXApIHtcbiAgICAgICAgICBhbmNlc3Rvck1hcCA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgZWZmZWN0ZWROb2Rlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgICB2YXIgY29ybmVycyA9IFtdOyAvLyBJdCB3aWxsIGJlIHVzZWQgbGlrZSBhIHF1ZXVlXG4gICAgICAgICAgdmFyIGN1cnJlbnRBbmNlc3RvciA9IGVsZS5wYXJlbnQoKVswXTtcblxuICAgICAgICAgIHdoaWxlIChjdXJyZW50QW5jZXN0b3IpIHtcbiAgICAgICAgICAgIHZhciBpZCA9IGN1cnJlbnRBbmNlc3Rvci5pZCgpO1xuXG4gICAgICAgICAgICB2YXIgY29ybmVyID0gZWxlbWVudFV0aWxpdGllcy5nZXRDb3JuZXJQb3NpdGlvbnMoY3VycmVudEFuY2VzdG9yKTtcbiAgICAgICAgICAgIGNvcm5lci5pZCA9IGlkO1xuXG4gICAgICAgICAgICBjb3JuZXJzLnB1c2goY29ybmVyKTtcblxuICAgICAgICAgICAgaWYgKGZpbGxBbmNlc3RvcnNNYXAgJiYgIWFuY2VzdG9yTWFwW2lkXSkge1xuICAgICAgICAgICAgICBhbmNlc3Rvck1hcFtpZF0gPSBjdXJyZW50QW5jZXN0b3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGN1cnJlbnRBbmNlc3RvciA9IGN1cnJlbnRBbmNlc3Rvci5wYXJlbnQoKVswXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMucHVzaChjb3JuZXJzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgXG4gICAgICAvLyBVcGRhdGUgdGhlIHBhZGRpbmdzIGFjY29yZGluZyB0byB0aGUgbW92ZW1lbnRcbiAgICAgIHZhciB1cGRhdGVQYWRkaW5ncyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBLZWVwcyB0aGUgYWxyZWFkeSBwcm9jZXNzZWQgYW5jZXN0b3JzXG4gICAgICAgIHZhciBwcm9jZXNzZWRBbmNlc3RvcnMgPSB7fTtcblxuICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCwgaW5kZXgsIGFycmF5KSB7XG4gICAgICAgICAgdmFyIGNvcm5lcnNRdWV1ZSA9IGVsZW1lbnQ7XG4gICAgICAgICAgd2hpbGUgKGNvcm5lcnNRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ29ybmVycyA9IGNvcm5lcnNRdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgICAgICBpZiAocHJvY2Vzc2VkQW5jZXN0b3JzW2Nvcm5lcnNRdWV1ZS5pZF0pIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb2Nlc3NlZEFuY2VzdG9yc1tvbGRDb3JuZXJzLmlkXSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgYW5jZXN0b3IgPSBhbmNlc3Rvck1hcFtvbGRDb3JuZXJzLmlkXTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50Q29ybmVycyA9IGVsZW1lbnRVdGlsaXRpZXMuZ2V0Q29ybmVyUG9zaXRpb25zKGFuY2VzdG9yKTtcblxuICAgICAgICAgICAgaWYgKGN1cnJlbnRDb3JuZXJzLnRvcCA9PT0gb2xkQ29ybmVycy50b3AgJiYgY3VycmVudENvcm5lcnMuYm90dG9tID09PSBvbGRDb3JuZXJzLmJvdHRvbVxuICAgICAgICAgICAgICAgICAgICAmJiBjdXJyZW50Q29ybmVycy5sZWZ0ID09PSBvbGRDb3JuZXJzLmxlZnQgJiYgY3VycmVudENvcm5lcnMucmlnaHQgPT09IG9sZENvcm5lcnMucmlnaHQpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwYWRkaW5nVG9wLCBwYWRkaW5nQm90dG9tLCBwYWRkaW5nTGVmdCwgcGFkZGluZ1JpZ2h0O1xuXG4gICAgICAgICAgICB2YXIgdG9wRGlmZiA9IGN1cnJlbnRDb3JuZXJzLnRvcCAtIG9sZENvcm5lcnMudG9wO1xuXG4gICAgICAgICAgICBpZiAodG9wRGlmZiAhPSAwKSB7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50UGFkZGluZyA9IHBhcnNlSW50KGFuY2VzdG9yLmNzcygncGFkZGluZy10b3AnKSk7XG4gICAgICAgICAgICAgIHBhZGRpbmdUb3AgPSBjdXJyZW50UGFkZGluZyArIHRvcERpZmY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBib3R0b21EaWZmID0gY3VycmVudENvcm5lcnMuYm90dG9tIC0gb2xkQ29ybmVycy5ib3R0b207XG5cbiAgICAgICAgICAgIGlmIChib3R0b21EaWZmICE9IDApIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWRkaW5nID0gcGFyc2VJbnQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLWJvdHRvbScpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ0JvdHRvbSA9IGN1cnJlbnRQYWRkaW5nIC0gYm90dG9tRGlmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGxlZnREaWZmID0gY3VycmVudENvcm5lcnMubGVmdCAtIG9sZENvcm5lcnMubGVmdDtcblxuICAgICAgICAgICAgaWYgKGxlZnREaWZmICE9IDApIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWRkaW5nID0gcGFyc2VJbnQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLWxlZnQnKSk7XG4gICAgICAgICAgICAgIHBhZGRpbmdMZWZ0ID0gY3VycmVudFBhZGRpbmcgKyBsZWZ0RGlmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHJpZ2h0RGlmZiA9IGN1cnJlbnRDb3JuZXJzLnJpZ2h0IC0gb2xkQ29ybmVycy5yaWdodDtcblxuICAgICAgICAgICAgaWYgKHJpZ2h0RGlmZiAhPSAwKSB7XG4gICAgICAgICAgICAgIHZhciBjdXJyZW50UGFkZGluZyA9IHBhcnNlSW50KGFuY2VzdG9yLmNzcygncGFkZGluZy1yaWdodCcpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0ID0gY3VycmVudFBhZGRpbmcgLSByaWdodERpZmY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCFwYWRkaW5nVG9wICYmICFwYWRkaW5nQm90dG9tICYmICFwYWRkaW5nTGVmdCAmJiAhcGFkZGluZ1JpZ2h0KSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcGFkZGluZ3MgPSB7fTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYocGFkZGluZ1RvcCkge1xuICAgICAgICAgICAgICBwYWRkaW5ncy50b3AgPSBwYWRkaW5nVG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihwYWRkaW5nQm90dG9tKSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLmJvdHRvbSA9IHBhZGRpbmdCb3R0b207XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHBhZGRpbmdMZWZ0KSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLmxlZnQgPSBwYWRkaW5nTGVmdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYocGFkZGluZ1JpZ2h0KSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLnJpZ2h0ID0gcGFkZGluZ1JpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb21wb3VuZFJlc2l6ZVV0aWxpdGllcy5zZXRQYWRkaW5ncyhhbmNlc3RvciwgcGFkZGluZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgXG4gICAgICBjeS5vbigndGFwc3RhcnQnLCAnbm9kZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzO1xuXG4gICAgICAgIGlmIChub2RlLnNlbGVjdGVkKCkpIHtcbiAgICAgICAgICBlZmZlY3RlZE5vZGVzID0gY3kuY29sbGVjdGlvbigpLmFkZChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBlZmZlY3RlZE5vZGVzID0gY3kubm9kZXMoJzpzZWxlY3RlZCcpLmRpZmZlcmVuY2Uobm9kZS5hbmNlc3RvcnMoKSkudW5pb24obm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBjYXJlIGFib3V0IHRoZSBtb3ZlbWVudCBvZiB0b3AgbW9zdCBub2Rlc1xuICAgICAgICBlZmZlY3RlZE5vZGVzID0gZWxlbWVudFV0aWxpdGllcy5nZXRUb3BNb3N0Tm9kZXMoZWZmZWN0ZWROb2Rlcyk7XG5cbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YSh0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgICBjeS5vbignZHJhZycsICdub2RlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXM7XG5cbiAgICAgICAgdXBkYXRlUGFkZGluZ3MoKTtcbiAgICAgICAgXG4gICAgICAgIGZpbGxFZmZlY3RlZERhdGEoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgICBcbiAgICAgIGN5Lm9uKCdyZXNpemVzdGFydCcsIGZ1bmN0aW9uKGUsIHR5cGUsIG5vZGVzKSB7XG4gICAgICAgIGVmZmVjdGVkTm9kZXMgPSBub2RlcztcbiAgICAgICAgZmlsbEVmZmVjdGVkRGF0YSh0cnVlKTtcbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBjeS5vbigncmVzaXplZHJhZycsIGZ1bmN0aW9uKGUsIHR5cGUsIG5vZGVzKSB7XG4gICAgICAgIHVwZGF0ZVBhZGRpbmdzKCk7XG4gICAgICAgIFxuICAgICAgICBmaWxsRWZmZWN0ZWREYXRhKGZhbHNlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjeXRvc2NhcGUoJ2NvbGxlY3Rpb24nLCAnY29tcG91bmRSZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZWxlcyA9IHRoaXM7XG4gICAgICB2YXIgY3kgPSB0aGlzLmN5KCk7XG4gICAgICBcbiAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzID0gcmVxdWlyZSgnLi9jb21wb3VuZFJlc2l6ZVV0aWxpdGllcycpKGN5KTtcbiAgICAgIGJpbmRFdmVudHMoY3kpO1xuICAgICAgXG4gICAgICB2YXIgY29tcG91bmRzID0gY3kubm9kZXMoJyRub2RlID4gbm9kZScpO1xuICAgICAgXG4gICAgICBjb21wb3VuZHMuZWFjaChmdW5jdGlvbihpLCBlbGUpe1xuICAgICAgICB2YXIgcGFkZGluZ3MgPSB7XG4gICAgICAgICAgJ3RvcCc6IGVsZS5jc3MoJ3BhZGRpbmctdG9wJyksXG4gICAgICAgICAgJ2JvdHRvbSc6IGVsZS5jc3MoJ3BhZGRpbmctYm90dG9tJyksXG4gICAgICAgICAgJ2xlZnQnOiBlbGUuY3NzKCdwYWRkaW5nLWxlZnQnKSxcbiAgICAgICAgICAncmlnaHQnOiBlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JylcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzLnNldEV4dHJlbWVQYWRkaW5ncyhlbGUsIHBhZGRpbmdzLCAnbWluJyk7XG4gICAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzLnNldEV4dHJlbWVQYWRkaW5ncyhlbGUsIHBhZGRpbmdzLCAnbWF4Jyk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzOyAvLyBQcm92aWRlIEFQSVxuICAgIH0pO1xuXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7IC8vIGV4cG9zZSBhcyBhIGNvbW1vbmpzIG1vZHVsZVxuICAgIG1vZHVsZS5leHBvcnRzID0gcmVnaXN0ZXI7XG4gIH1cblxuICBpZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCkgeyAvLyBleHBvc2UgYXMgYW4gYW1kL3JlcXVpcmVqcyBtb2R1bGVcbiAgICBkZWZpbmUoJ2N5dG9zY2FwZS1jb21wb3VuZC1yZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVnaXN0ZXI7XG4gICAgfSk7XG4gIH1cblxuICBpZiAodHlwZW9mIGN5dG9zY2FwZSAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gZXhwb3NlIHRvIGdsb2JhbCBjeXRvc2NhcGUgKGkuZS4gd2luZG93LmN5dG9zY2FwZSlcbiAgICByZWdpc3RlcihjeXRvc2NhcGUpO1xuICB9XG5cbn0pKCk7XG4iLCJ2YXIgc2NyYXRjaFV0aWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRTY3JhdGNoOiBmdW5jdGlvbiAoY3lPckVsZSkge1xuICAgICAgaWYgKCFjeU9yRWxlLnNjcmF0Y2goJ19jb21wb3VuZFJlc2l6ZScpKSB7XG4gICAgICAgIGN5T3JFbGUuc2NyYXRjaCgnX2NvbXBvdW5kUmVzaXplJywge30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN5T3JFbGUuc2NyYXRjaCgnX2NvbXBvdW5kUmVzaXplJyk7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzY3JhdGNoVXRpbGl0aWVzOyJdfQ==
