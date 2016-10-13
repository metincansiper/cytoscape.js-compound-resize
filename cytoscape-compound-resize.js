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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tcG91bmRSZXNpemVVdGlsaXRpZXMuanMiLCJzcmMvZWxlbWVudFV0aWxpdGllcy5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zY3JhdGNoVXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzID0gZnVuY3Rpb24gKGN5KSB7XG4gIHZhciBzY3JhdGNoVXRpbGl0aWVzID0gcmVxdWlyZShcIi4vc2NyYXRjaFV0aWxpdGllc1wiKSgpO1xuXG4gIHZhciBzZWxmID0ge1xuICAgIHNldFBhZGRpbmdzOiBmdW5jdGlvbiAobm9kZXMsIHBhZGRpbmdzKSB7XG4gICAgICBjeS5zdGFydEJhdGNoKCk7XG5cbiAgICAgIG5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICB2YXIgbWluUGFkZGluZ3MgPSBzZWxmLmdldE1pbmltdW1QYWRkaW5ncyhlbGUpO1xuICAgICAgICB2YXIgbWF4UGFkZGluZ3MgPSBzZWxmLmdldE1heGltdW1QYWRkaW5ncyhlbGUpO1xuXG4gICAgICAgIGlmIChwYWRkaW5ncy5sZWZ0ID49IG1pblBhZGRpbmdzLmxlZnQgJiYgcGFkZGluZ3MubGVmdCA8PSBtYXhQYWRkaW5ncy5sZWZ0KSB7XG4gICAgICAgICAgZWxlLmNzcygncGFkZGluZy1sZWZ0JywgcGFkZGluZ3MubGVmdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MucmlnaHQgPj0gbWluUGFkZGluZ3MucmlnaHQgJiYgcGFkZGluZ3MucmlnaHQgPD0gbWF4UGFkZGluZ3MucmlnaHQpIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLXJpZ2h0JywgcGFkZGluZ3MucmlnaHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhZGRpbmdzLnRvcCA+PSBtaW5QYWRkaW5ncy50b3AgJiYgcGFkZGluZ3MudG9wIDw9IG1heFBhZGRpbmdzLnRvcCkge1xuICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgcGFkZGluZ3MudG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy5ib3R0b20gPj0gbWluUGFkZGluZ3MuYm90dG9tICYmIHBhZGRpbmdzLmJvdHRvbSA8PSBtYXhQYWRkaW5ncy5ib3R0b20pIHtcbiAgICAgICAgICBlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScsIHBhZGRpbmdzLmJvdHRvbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgXG4gICAgICBjeS5lbmRCYXRjaCgpO1xuICAgIH0sXG4gICAgc2V0RXh0cmVtZVBhZGRpbmdzOiBmdW5jdGlvbiAobm9kZXMsIHBhZGRpbmdzLCBtaW5Pck1heCkge1xuICAgICAgY3kuc3RhcnRCYXRjaCgpO1xuXG4gICAgICBub2Rlcy5lYWNoKGZ1bmN0aW9uIChpLCBlbGUpIHtcbiAgICAgICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoZWxlLmNzcygncGFkZGluZy1sZWZ0JykpO1xuICAgICAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoZWxlLmNzcygncGFkZGluZy1yaWdodCcpKTtcbiAgICAgICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUludChlbGUuY3NzKCdwYWRkaW5nLXRvcCcpKTtcbiAgICAgICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUludChlbGUuY3NzKCdwYWRkaW5nLWJvdHRvbScpKTtcblxuICAgICAgICAvLyBHZXQgdGhlIG1pbmltdW0gcGFkZGluZ3MgdG8gc2V0IHRoZW1cbiAgICAgICAgdmFyIGV4dHJlbWVQYWRkaW5ncyA9IG1pbk9yTWF4ID09PSAnbWluJyA/IHNlbGYuZ2V0TWluaW11bVBhZGRpbmdzKGVsZSkgOiBzZWxmLmdldE1heGltdW1QYWRkaW5ncyhlbGUpO1xuXG4gICAgICAgIHZhciBzaWduID0gbWluT3JNYXggPT09ICdtaW4nID8gMSA6IC0xO1xuXG4gICAgICAgIGlmIChwYWRkaW5ncy5sZWZ0KSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdMZWZ0ICogc2lnbiA8IHBhZGRpbmdzLmxlZnQgKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy1sZWZ0JywgcGFkZGluZ3MubGVmdCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZXh0cmVtZVBhZGRpbmdzLmxlZnQgPSBwYXJzZUludChwYWRkaW5ncy5sZWZ0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy5yaWdodCkge1xuICAgICAgICAgIGlmIChwYWRkaW5nUmlnaHQgKiBzaWduIDwgcGFkZGluZ3MucmlnaHQgKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy1yaWdodCcsIHBhZGRpbmdzLnJpZ2h0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MucmlnaHQgPSBwYXJzZUludChwYWRkaW5ncy5yaWdodCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFkZGluZ3MudG9wKSB7XG4gICAgICAgICAgaWYgKHBhZGRpbmdUb3AgKiBzaWduIDwgcGFkZGluZ3MudG9wICogc2lnbikge1xuICAgICAgICAgICAgLy8gUGFkZGluZ3MgY2Fubm90IGJlIHNtYWxsZXIgdGhlbiBtaW4gcGFkZGluZ3MgYW5kIGNhbm5vdCBiZSBiaWdnZXIgdGhlbiBtYXggcGFkZGluZ3NcbiAgICAgICAgICAgIGVsZS5jc3MoJ3BhZGRpbmctdG9wJywgcGFkZGluZ3MudG9wKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBleHRyZW1lUGFkZGluZ3MudG9wID0gcGFyc2VJbnQocGFkZGluZ3MudG9wKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYWRkaW5ncy5ib3R0b20pIHtcbiAgICAgICAgICBpZiAocGFkZGluZ0JvdHRvbSAqIHNpZ24gPCBwYWRkaW5ncy5ib3R0b20gKiBzaWduKSB7XG4gICAgICAgICAgICAvLyBQYWRkaW5ncyBjYW5ub3QgYmUgc21hbGxlciB0aGVuIG1pbiBwYWRkaW5ncyBhbmQgY2Fubm90IGJlIGJpZ2dlciB0aGVuIG1heCBwYWRkaW5nc1xuICAgICAgICAgICAgZWxlLmNzcygncGFkZGluZy1ib3R0b20nLCBwYWRkaW5ncy5ib3R0b20pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGV4dHJlbWVQYWRkaW5ncy5ib3R0b20gPSBwYXJzZUludChwYWRkaW5ncy5ib3R0b20pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY3kuZW5kQmF0Y2goKTtcbiAgICB9LFxuICAgIGdldE1pbmltdW1QYWRkaW5nczogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIHZhciBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5taW5QYWRkaW5ncztcbiAgICAgIGlmICghcGFkZGluZ3MpIHtcbiAgICAgICAgcGFkZGluZ3MgPSBzY3JhdGNoVXRpbGl0aWVzLmdldFNjcmF0Y2gobm9kZSkubWluUGFkZGluZ3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWRkaW5ncztcbiAgICB9LFxuICAgIGdldE1heGltdW1QYWRkaW5nczogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIHZhciBwYWRkaW5ncyA9IHNjcmF0Y2hVdGlsaXRpZXMuZ2V0U2NyYXRjaChub2RlKS5tYXhQYWRkaW5ncztcbiAgICAgIGlmICghcGFkZGluZ3MpIHtcbiAgICAgICAgcGFkZGluZ3MgPSBzY3JhdGNoVXRpbGl0aWVzLmdldFNjcmF0Y2gobm9kZSkubWF4UGFkZGluZ3MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYWRkaW5ncztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHNlbGY7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzOyIsInZhciBlbGVtZW50VXRpbGl0aWVzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIC8vdGhpcyBtZXRob2QgcmV0dXJucyB0aGUgbm9kZXMgbm9uIG9mIHdob3NlIGFuY2VzdG9ycyBpcyBub3QgaW4gZ2l2ZW4gbm9kZXNcbiAgICBnZXRUb3BNb3N0Tm9kZXM6IGZ1bmN0aW9uIChub2Rlcykge1xuICAgICAgdmFyIG5vZGVzTWFwID0ge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5vZGVzTWFwW25vZGVzW2ldLmlkKCldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhciByb290cyA9IG5vZGVzLmZpbHRlcihmdW5jdGlvbiAoaSwgZWxlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbGUucGFyZW50KClbMF07XG4gICAgICAgIHdoaWxlIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChub2Rlc01hcFtwYXJlbnQuaWQoKV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudCgpWzBdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByb290cztcbiAgICB9LFxuICAgIC8vIEdldCB0aGUgY29ybmVyIHBvc2l0aW9ucyBvZiB0aGUgbm9kZVxuICAgIGdldENvcm5lclBvc2l0aW9uczogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIHBvc1ggPSBub2RlLnBvc2l0aW9uKCd4Jyk7XG4gICAgICB2YXIgcG9zWSA9IG5vZGUucG9zaXRpb24oJ3knKTtcbiAgICAgIHZhciBoYWxmV2lkdGggPSBub2RlLndpZHRoKCkgLyAyO1xuICAgICAgdmFyIGhhbGZIZWlnaHQgPSBub2RlLmhlaWdodCgpIC8gMjtcbiAgICAgIFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ3RvcCc6IHBvc1kgLSBoYWxmSGVpZ2h0LFxuICAgICAgICAnYm90dG9tJzogcG9zWSArIGhhbGZIZWlnaHQsXG4gICAgICAgICdsZWZ0JzogcG9zWCAtIGhhbGZXaWR0aCxcbiAgICAgICAgJ3JpZ2h0JzogcG9zWCArIGhhbGZXaWR0aFxuICAgICAgfTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVsZW1lbnRVdGlsaXRpZXM7IiwiO1xuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgZWxlbWVudFV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL2VsZW1lbnRVdGlsaXRpZXNcIikoKTtcbiAgdmFyIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzO1xuXG4gIC8vIHJlZ2lzdGVycyB0aGUgZXh0ZW5zaW9uIG9uIGEgY3l0b3NjYXBlIGxpYiByZWZcbiAgdmFyIHJlZ2lzdGVyID0gZnVuY3Rpb24gKGN5dG9zY2FwZSkge1xuXG4gICAgaWYgKCFjeXRvc2NhcGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IC8vIGNhbid0IHJlZ2lzdGVyIGlmIGN5dG9zY2FwZSB1bnNwZWNpZmllZFxuXG4gICAgdmFyIGJpbmRFdmVudHMgPSBmdW5jdGlvbiAoY3kpIHtcbiAgICAgIHZhciBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnM7XG4gICAgICB2YXIgbW92ZWROb2RlcztcbiAgICAgIHZhciBhbmNlc3Rvck1hcDtcblxuICAgICAgY3kub24oJ3RhcHN0YXJ0JywgJ25vZGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcztcblxuICAgICAgICBpZiAobm9kZS5zZWxlY3RlZCgpKSB7XG4gICAgICAgICAgbW92ZWROb2RlcyA9IGN5LmNvbGxlY3Rpb24oKS5hZGQobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbW92ZWROb2RlcyA9IGN5Lm5vZGVzKCc6c2VsZWN0ZWQnKS51bmlvbihub2RlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIGNhcmUgYWJvdXQgdGhlIG1vdmVtZW50IG9mIHRvcCBtb3N0IG5vZGVzXG4gICAgICAgIG1vdmVkTm9kZXMgPSBlbGVtZW50VXRpbGl0aWVzLmdldFRvcE1vc3ROb2Rlcyhtb3ZlZE5vZGVzKTtcblxuICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgYW5jZXN0b3JNYXAgPSB7fTtcblxuICAgICAgICBtb3ZlZE5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgIHZhciBjb3JuZXJzID0gW107IC8vIEl0IHdpbGwgYmUgdXNlZCBsaWtlIGEgcXVldWVcbiAgICAgICAgICB2YXIgY3VycmVudEFuY2VzdG9yID0gZWxlLnBhcmVudCgpWzBdO1xuXG4gICAgICAgICAgd2hpbGUgKGN1cnJlbnRBbmNlc3Rvcikge1xuICAgICAgICAgICAgdmFyIGlkID0gY3VycmVudEFuY2VzdG9yLmlkKCk7XG5cbiAgICAgICAgICAgIHZhciBjb3JuZXIgPSBlbGVtZW50VXRpbGl0aWVzLmdldENvcm5lclBvc2l0aW9ucyhjdXJyZW50QW5jZXN0b3IpO1xuICAgICAgICAgICAgY29ybmVyLmlkID0gaWQ7XG5cbiAgICAgICAgICAgIGNvcm5lcnMucHVzaChjb3JuZXIpO1xuXG4gICAgICAgICAgICBpZiAoIWFuY2VzdG9yTWFwW2lkXSkge1xuICAgICAgICAgICAgICBhbmNlc3Rvck1hcFtpZF0gPSBjdXJyZW50QW5jZXN0b3I7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGN1cnJlbnRBbmNlc3RvciA9IGN1cnJlbnRBbmNlc3Rvci5wYXJlbnQoKVswXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMucHVzaChjb3JuZXJzKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgY3kub24oJ2RyYWcnLCAnbm9kZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzO1xuXG4gICAgICAgIC8vIEtlZXBzIHRoZSBhbHJlYWR5IHByb2Nlc3NlZCBhbmNlc3RvcnNcbiAgICAgICAgdmFyIHByb2Nlc3NlZEFuY2VzdG9ycyA9IHt9O1xuXG4gICAgICAgIGFuY2VzdG9yc0Nvcm5lclBvc2l0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50LCBpbmRleCwgYXJyYXkpIHtcbiAgICAgICAgICB2YXIgY29ybmVyc1F1ZXVlID0gZWxlbWVudDtcbiAgICAgICAgICB3aGlsZSAoY29ybmVyc1F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBvbGRDb3JuZXJzID0gY29ybmVyc1F1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzZWRBbmNlc3RvcnNbY29ybmVyc1F1ZXVlLmlkXSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvY2Vzc2VkQW5jZXN0b3JzW29sZENvcm5lcnMuaWRdID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBhbmNlc3RvciA9IGFuY2VzdG9yTWFwW29sZENvcm5lcnMuaWRdO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRDb3JuZXJzID0gZWxlbWVudFV0aWxpdGllcy5nZXRDb3JuZXJQb3NpdGlvbnMoYW5jZXN0b3IpO1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudENvcm5lcnMudG9wID09PSBvbGRDb3JuZXJzLnRvcCAmJiBjdXJyZW50Q29ybmVycy5ib3R0b20gPT09IG9sZENvcm5lcnMuYm90dG9tXG4gICAgICAgICAgICAgICAgICAgICYmIGN1cnJlbnRDb3JuZXJzLmxlZnQgPT09IG9sZENvcm5lcnMubGVmdCAmJiBjdXJyZW50Q29ybmVycy5yaWdodCA9PT0gb2xkQ29ybmVycy5yaWdodCkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHBhZGRpbmdUb3AsIHBhZGRpbmdCb3R0b20sIHBhZGRpbmdMZWZ0LCBwYWRkaW5nUmlnaHQ7XG5cbiAgICAgICAgICAgIHZhciB0b3BEaWZmID0gY3VycmVudENvcm5lcnMudG9wIC0gb2xkQ29ybmVycy50b3A7XG5cbiAgICAgICAgICAgIGlmICh0b3BEaWZmICE9IDApIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWRkaW5nID0gcGFyc2VJbnQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLXRvcCcpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ1RvcCA9IGN1cnJlbnRQYWRkaW5nICsgdG9wRGlmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGJvdHRvbURpZmYgPSBjdXJyZW50Q29ybmVycy5ib3R0b20gLSBvbGRDb3JuZXJzLmJvdHRvbTtcblxuICAgICAgICAgICAgaWYgKGJvdHRvbURpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUludChhbmNlc3Rvci5jc3MoJ3BhZGRpbmctYm90dG9tJykpO1xuICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tID0gY3VycmVudFBhZGRpbmcgLSBib3R0b21EaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgbGVmdERpZmYgPSBjdXJyZW50Q29ybmVycy5sZWZ0IC0gb2xkQ29ybmVycy5sZWZ0O1xuXG4gICAgICAgICAgICBpZiAobGVmdERpZmYgIT0gMCkge1xuICAgICAgICAgICAgICB2YXIgY3VycmVudFBhZGRpbmcgPSBwYXJzZUludChhbmNlc3Rvci5jc3MoJ3BhZGRpbmctbGVmdCcpKTtcbiAgICAgICAgICAgICAgcGFkZGluZ0xlZnQgPSBjdXJyZW50UGFkZGluZyArIGxlZnREaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgcmlnaHREaWZmID0gY3VycmVudENvcm5lcnMucmlnaHQgLSBvbGRDb3JuZXJzLnJpZ2h0O1xuXG4gICAgICAgICAgICBpZiAocmlnaHREaWZmICE9IDApIHtcbiAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWRkaW5nID0gcGFyc2VJbnQoYW5jZXN0b3IuY3NzKCdwYWRkaW5nLXJpZ2h0JykpO1xuICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQgPSBjdXJyZW50UGFkZGluZyAtIHJpZ2h0RGlmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYoIXBhZGRpbmdUb3AgJiYgIXBhZGRpbmdCb3R0b20gJiYgIXBhZGRpbmdMZWZ0ICYmICFwYWRkaW5nUmlnaHQpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBwYWRkaW5ncyA9IHt9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihwYWRkaW5nVG9wKSB7XG4gICAgICAgICAgICAgIHBhZGRpbmdzLnRvcCA9IHBhZGRpbmdUb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHBhZGRpbmdCb3R0b20pIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MuYm90dG9tID0gcGFkZGluZ0JvdHRvbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYocGFkZGluZ0xlZnQpIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MubGVmdCA9IHBhZGRpbmdMZWZ0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihwYWRkaW5nUmlnaHQpIHtcbiAgICAgICAgICAgICAgcGFkZGluZ3MucmlnaHQgPSBwYWRkaW5nUmlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbXBvdW5kUmVzaXplVXRpbGl0aWVzLnNldFBhZGRpbmdzKGFuY2VzdG9yLCBwYWRkaW5ncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBhbmNlc3RvcnNDb3JuZXJQb3NpdGlvbnMgPSBbXTtcblxuICAgICAgICBtb3ZlZE5vZGVzLmVhY2goZnVuY3Rpb24gKGksIGVsZSkge1xuICAgICAgICAgIHZhciBjb3JuZXJzID0gW107IC8vIEl0IHdpbGwgYmUgdXNlZCBsaWtlIGEgcXVldWVcbiAgICAgICAgICB2YXIgY3VycmVudEFuY2VzdG9yID0gZWxlLnBhcmVudCgpWzBdO1xuXG4gICAgICAgICAgd2hpbGUgKGN1cnJlbnRBbmNlc3Rvcikge1xuICAgICAgICAgICAgdmFyIGlkID0gY3VycmVudEFuY2VzdG9yLmlkKCk7XG5cbiAgICAgICAgICAgIHZhciBjb3JuZXIgPSBlbGVtZW50VXRpbGl0aWVzLmdldENvcm5lclBvc2l0aW9ucyhjdXJyZW50QW5jZXN0b3IpO1xuICAgICAgICAgICAgY29ybmVyLmlkID0gaWQ7XG5cbiAgICAgICAgICAgIGNvcm5lcnMucHVzaChjb3JuZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjdXJyZW50QW5jZXN0b3IgPSBjdXJyZW50QW5jZXN0b3IucGFyZW50KClbMF07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYW5jZXN0b3JzQ29ybmVyUG9zaXRpb25zLnB1c2goY29ybmVycyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGN5dG9zY2FwZSgnY29sbGVjdGlvbicsICdjb21wb3VuZFJlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlbGVzID0gdGhpcztcbiAgICAgIHZhciBjeSA9IHRoaXMuY3koKTtcbiAgICAgIFxuICAgICAgY29tcG91bmRSZXNpemVVdGlsaXRpZXMgPSByZXF1aXJlKCcuL2NvbXBvdW5kUmVzaXplVXRpbGl0aWVzJykoY3kpO1xuICAgICAgYmluZEV2ZW50cyhjeSk7XG4gICAgICBcbiAgICAgIHZhciBjb21wb3VuZHMgPSBjeS5ub2RlcygnJG5vZGUgPiBub2RlJyk7XG4gICAgICBcbiAgICAgIGNvbXBvdW5kcy5lYWNoKGZ1bmN0aW9uKGksIGVsZSl7XG4gICAgICAgIHZhciBwYWRkaW5ncyA9IHtcbiAgICAgICAgICAndG9wJzogZWxlLmNzcygncGFkZGluZy10b3AnKSxcbiAgICAgICAgICAnYm90dG9tJzogZWxlLmNzcygncGFkZGluZy1ib3R0b20nKSxcbiAgICAgICAgICAnbGVmdCc6IGVsZS5jc3MoJ3BhZGRpbmctbGVmdCcpLFxuICAgICAgICAgICdyaWdodCc6IGVsZS5jc3MoJ3BhZGRpbmctcmlnaHQnKVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgY29tcG91bmRSZXNpemVVdGlsaXRpZXMuc2V0RXh0cmVtZVBhZGRpbmdzKGVsZSwgcGFkZGluZ3MsICdtaW4nKTtcbiAgICAgICAgY29tcG91bmRSZXNpemVVdGlsaXRpZXMuc2V0RXh0cmVtZVBhZGRpbmdzKGVsZSwgcGFkZGluZ3MsICdtYXgnKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY29tcG91bmRSZXNpemVVdGlsaXRpZXM7IC8vIFByb3ZpZGUgQVBJXG4gICAgfSk7XG5cbiAgfTtcblxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHsgLy8gZXhwb3NlIGFzIGEgY29tbW9uanMgbW9kdWxlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSByZWdpc3RlcjtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJyAmJiBkZWZpbmUuYW1kKSB7IC8vIGV4cG9zZSBhcyBhbiBhbWQvcmVxdWlyZWpzIG1vZHVsZVxuICAgIGRlZmluZSgnY3l0b3NjYXBlLWNvbXBvdW5kLXJlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiByZWdpc3RlcjtcbiAgICB9KTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgY3l0b3NjYXBlICE9PSAndW5kZWZpbmVkJykgeyAvLyBleHBvc2UgdG8gZ2xvYmFsIGN5dG9zY2FwZSAoaS5lLiB3aW5kb3cuY3l0b3NjYXBlKVxuICAgIHJlZ2lzdGVyKGN5dG9zY2FwZSk7XG4gIH1cblxufSkoKTtcbiIsInZhciBzY3JhdGNoVXRpbGl0aWVzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIGdldFNjcmF0Y2g6IGZ1bmN0aW9uIChjeU9yRWxlKSB7XG4gICAgICBpZiAoIWN5T3JFbGUuc2NyYXRjaCgnX2NvbXBvdW5kUmVzaXplJykpIHtcbiAgICAgICAgY3lPckVsZS5zY3JhdGNoKCdfY29tcG91bmRSZXNpemUnLCB7fSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY3lPckVsZS5zY3JhdGNoKCdfY29tcG91bmRSZXNpemUnKTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNjcmF0Y2hVdGlsaXRpZXM7Il19
