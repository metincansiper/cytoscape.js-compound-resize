var compoundResizeUtilities = function (cy) {
  var scratchUtilities = require("./scratchUtilities")();

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