var compoundResizeUtilities = function (cy, mode) {
  var scratchUtilities = require("./scratchUtilities")();

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